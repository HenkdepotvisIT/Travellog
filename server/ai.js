const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('./db');

let openaiClient = null;
let anthropicClient = null;
let geminiClient = null;

async function getAIConfig() {
  try {
    const result = await db.query('SELECT * FROM ai_config WHERE id = 1');
    return result.rows[0] || {
      provider: 'anthropic',
      model: 'claude-haiku-4-5-20251001',
      auto_generate: false,
    };
  } catch (error) {
    console.error('Failed to get AI config:', error);
    return {
      provider: 'anthropic',
      model: 'claude-haiku-4-5-20251001',
      auto_generate: false,
    };
  }
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

async function generateWithGemini(prompt, systemPrompt, config) {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY environment variable.');
  }

  const modelName = config.model || 'gemini-1.5-flash';
  const model = client.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  });

  // Combine system prompt and user prompt for Gemini
  const fullPrompt = systemPrompt 
    ? `${systemPrompt}\n\n${prompt}` 
    : prompt;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  const text = response.text();
  
  // Estimate tokens (Gemini doesn't always return token counts)
  const estimatedTokens = Math.ceil(text.length / 4);

  return {
    content: text.trim(),
    tokensUsed: estimatedTokens,
  };
}

async function generateWithAnthropic(prompt, systemPrompt, config) {
  const client = getAnthropicClient();
  if (!client) {
    throw new Error('Anthropic API key not configured. Set ANTHROPIC_API_KEY environment variable.');
  }

  const response = await client.messages.create({
    model: config.model || 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      { role: 'user', content: prompt },
    ],
  });

  const text = response.content[0]?.text || '';
  const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

  return {
    content: text.trim(),
    tokensUsed,
  };
}

async function generateWithOpenAI(prompt, systemPrompt, config) {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await client.chat.completions.create({
    model: config.model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    max_tokens: 600,
    temperature: 0.7,
  });

  return {
    content: response.choices[0]?.message?.content?.trim() || '',
    tokensUsed: response.usage?.total_tokens || 0,
  };
}

async function generateContent(prompt, systemPrompt, config) {
  if (config.provider === 'anthropic') {
    return generateWithAnthropic(prompt, systemPrompt, config);
  } else if (config.provider === 'gemini' || config.provider === 'google') {
    return generateWithGemini(prompt, systemPrompt, config);
  } else {
    return generateWithOpenAI(prompt, systemPrompt, config);
  }
}

async function generateSummary(adventure) {
  const config = await getAIConfig();
  
  const prompt = `You are a travel writer creating a brief, engaging summary of a travel adventure.

Adventure Details:
- Title: ${adventure.title}
- Location: ${adventure.location}
- Dates: ${adventure.start_date} to ${adventure.end_date}
- Duration: ${adventure.duration} days
- Distance traveled: ${adventure.distance} km
- Number of stops: ${adventure.stops}
- Photos taken: ${adventure.media_count}
- Places visited: ${adventure.stop_points?.map(s => s.name).join(', ') || 'Various locations'}

Write a 2-3 sentence summary that captures the essence of this adventure. Be descriptive and evocative, mentioning specific places when available. Do not use generic phrases like "unforgettable journey" - be specific and creative.`;

  const systemPrompt = 'You are a skilled travel writer who creates vivid, concise summaries.';

  try {
    const result = await generateContent(prompt, systemPrompt, config);

    // Cache the summary
    await db.query(`
      INSERT INTO ai_summaries (adventure_id, summary_type, content, model, tokens_used)
      VALUES ($1, 'summary', $2, $3, $4)
      ON CONFLICT (adventure_id, summary_type) 
      DO UPDATE SET content = $2, model = $3, tokens_used = $4, created_at = NOW()
    `, [adventure.id, result.content, config.model, result.tokensUsed]);

    return { summary: result.content, tokensUsed: result.tokensUsed };
  } catch (error) {
    console.error('Failed to generate summary:', error);
    throw error;
  }
}

async function generateHighlights(adventure) {
  const config = await getAIConfig();
  
  const prompt = `You are a travel writer creating highlight bullet points for a travel adventure.

Adventure Details:
- Title: ${adventure.title}
- Location: ${adventure.location}
- Dates: ${adventure.start_date} to ${adventure.end_date}
- Duration: ${adventure.duration} days
- Distance traveled: ${adventure.distance} km
- Places visited: ${adventure.stop_points?.map(s => s.name + ' (' + s.photos + ' photos)').join(', ') || 'Various locations'}

Generate 4-6 highlight bullet points for this adventure. Each highlight should:
- Start with an action verb (Explored, Discovered, Witnessed, Experienced, etc.)
- Be specific to the locations visited
- Be concise (under 10 words each)
- Capture memorable moments that might have happened

Return ONLY a JSON array of strings, like: ["Highlight 1", "Highlight 2", "Highlight 3"]`;

  const systemPrompt = 'You are a travel writer. Return only valid JSON arrays.';

  try {
    const result = await generateContent(prompt, systemPrompt, config);
    
    // Parse the JSON array
    let highlights;
    try {
      // Try to extract JSON from the response
      const jsonMatch = result.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        highlights = JSON.parse(jsonMatch[0]);
      } else {
        highlights = JSON.parse(result.content);
      }
      if (!Array.isArray(highlights)) {
        highlights = [result.content];
      }
    } catch {
      // If parsing fails, split by newlines
      highlights = result.content.split('\n').filter(h => h.trim()).map(h => h.replace(/^[-•*]\s*/, '').trim());
    }

    // Cache the highlights
    await db.query(`
      INSERT INTO ai_summaries (adventure_id, summary_type, content, model, tokens_used)
      VALUES ($1, 'highlights', $2, $3, $4)
      ON CONFLICT (adventure_id, summary_type) 
      DO UPDATE SET content = $2, model = $3, tokens_used = $4, created_at = NOW()
    `, [adventure.id, JSON.stringify(highlights), config.model, result.tokensUsed]);

    return { highlights, tokensUsed: result.tokensUsed };
  } catch (error) {
    console.error('Failed to generate highlights:', error);
    throw error;
  }
}

async function generateStory(adventure, style = 'narrative') {
  const config = await getAIConfig();
  
  const stylePrompts = {
    narrative: 'Write in first person, as if recounting the journey to a friend. Be warm and personal.',
    blog: 'Write as a travel blog post with an engaging hook and practical insights.',
    poetic: 'Write in a more literary, evocative style with vivid imagery.',
    factual: 'Write in a straightforward, informative style focusing on facts and experiences.',
  };

  const prompt = `You are a travel writer creating a story for a travel adventure.

Adventure Details:
- Title: ${adventure.title}
- Location: ${adventure.location}
- Dates: ${adventure.start_date} to ${adventure.end_date}
- Duration: ${adventure.duration} days
- Distance traveled: ${adventure.distance} km
- Number of stops: ${adventure.stops}
- Photos taken: ${adventure.media_count}
- Places visited: ${adventure.stop_points?.map(s => s.name + ' (' + s.photos + ' photos)').join(', ') || 'Various locations'}

${stylePrompts[style] || stylePrompts.narrative}

Write a 3-4 paragraph story (about 200-300 words) about this adventure. Include:
- An engaging opening that sets the scene
- Specific mentions of places visited
- Sensory details and emotions
- A reflective closing

Do not make up specific events that couldn't be inferred from the data. Focus on the journey, places, and general experiences.`;

  const systemPrompt = 'You are a skilled travel writer who creates engaging, authentic travel stories.';

  try {
    const result = await generateContent(prompt, systemPrompt, config);

    // Cache the story
    await db.query(`
      INSERT INTO ai_summaries (adventure_id, summary_type, content, model, tokens_used)
      VALUES ($1, 'story', $2, $3, $4)
      ON CONFLICT (adventure_id, summary_type) 
      DO UPDATE SET content = $2, model = $3, tokens_used = $4, created_at = NOW()
    `, [adventure.id, result.content, config.model, result.tokensUsed]);

    return { story: result.content, tokensUsed: result.tokensUsed };
  } catch (error) {
    console.error('Failed to generate story:', error);
    throw error;
  }
}

async function getCachedSummary(adventureId, summaryType) {
  try {
    const result = await db.query(
      'SELECT content, model, tokens_used, created_at FROM ai_summaries WHERE adventure_id = $1 AND summary_type = $2',
      [adventureId, summaryType]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Failed to get cached summary:', error);
    return null;
  }
}

async function regenerateAll(adventure) {
  const results = {
    summary: null,
    highlights: null,
    tokensUsed: 0,
  };

  try {
    const summaryResult = await generateSummary(adventure);
    results.summary = summaryResult.summary;
    results.tokensUsed += summaryResult.tokensUsed;
  } catch (error) {
    console.error('Failed to generate summary:', error);
  }

  try {
    const highlightsResult = await generateHighlights(adventure);
    results.highlights = highlightsResult.highlights;
    results.tokensUsed += highlightsResult.tokensUsed;
  } catch (error) {
    console.error('Failed to generate highlights:', error);
  }

  return results;
}

function isConfigured() {
  return {
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
  };
}

module.exports = {
  generateSummary,
  generateHighlights,
  generateStory,
  getCachedSummary,
  regenerateAll,
  getAIConfig,
  isConfigured,
};