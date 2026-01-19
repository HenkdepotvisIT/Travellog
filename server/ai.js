const OpenAI = require('openai');
const db = require('./db');

let openaiClient = null;

async function getAIConfig() {
  try {
    const result = await db.query('SELECT * FROM ai_config WHERE id = 1');
    return result.rows[0] || { provider: 'openai', model: 'gpt-4o-mini', auto_generate: false };
  } catch (error) {
    console.error('Failed to get AI config:', error);
    return { provider: 'openai', model: 'gpt-4o-mini', auto_generate: false };
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

async function generateSummary(adventure) {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

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

  try {
    const response = await client.chat.completions.create({
      model: config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a skilled travel writer who creates vivid, concise summaries.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const summary = response.choices[0]?.message?.content?.trim();
    const tokensUsed = response.usage?.total_tokens || 0;

    // Cache the summary
    await db.query(`
      INSERT INTO ai_summaries (adventure_id, summary_type, content, model, tokens_used)
      VALUES ($1, 'summary', $2, $3, $4)
      ON CONFLICT (adventure_id, summary_type) 
      DO UPDATE SET content = $2, model = $3, tokens_used = $4, created_at = NOW()
    `, [adventure.id, summary, config.model, tokensUsed]);

    return { summary, tokensUsed };
  } catch (error) {
    console.error('Failed to generate summary:', error);
    throw error;
  }
}

async function generateHighlights(adventure) {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

  const config = await getAIConfig();
  
  const prompt = `You are a travel writer creating highlight bullet points for a travel adventure.

Adventure Details:
- Title: ${adventure.title}
- Location: ${adventure.location}
- Dates: ${adventure.start_date} to ${adventure.end_date}
- Duration: ${adventure.duration} days
- Distance traveled: ${adventure.distance} km
- Places visited: ${adventure.stop_points?.map(s => `${s.name} (${s.photos} photos)`).join(', ') || 'Various locations'}

Generate 4-6 highlight bullet points for this adventure. Each highlight should:
- Start with an action verb (Explored, Discovered, Witnessed, Experienced, etc.)
- Be specific to the locations visited
- Be concise (under 10 words each)
- Capture memorable moments that might have happened

Return ONLY a JSON array of strings, like: ["Highlight 1", "Highlight 2", "Highlight 3"]`;

  try {
    const response = await client.chat.completions.create({
      model: config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a travel writer. Return only valid JSON arrays.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content?.trim();
    const tokensUsed = response.usage?.total_tokens || 0;
    
    // Parse the JSON array
    let highlights;
    try {
      highlights = JSON.parse(content);
      if (!Array.isArray(highlights)) {
        highlights = [content];
      }
    } catch {
      // If parsing fails, split by newlines
      highlights = content.split('\n').filter(h => h.trim()).map(h => h.replace(/^[-•*]\s*/, '').trim());
    }

    // Cache the highlights
    await db.query(`
      INSERT INTO ai_summaries (adventure_id, summary_type, content, model, tokens_used)
      VALUES ($1, 'highlights', $2, $3, $4)
      ON CONFLICT (adventure_id, summary_type) 
      DO UPDATE SET content = $2, model = $3, tokens_used = $4, created_at = NOW()
    `, [adventure.id, JSON.stringify(highlights), config.model, tokensUsed]);

    return { highlights, tokensUsed };
  } catch (error) {
    console.error('Failed to generate highlights:', error);
    throw error;
  }
}

async function generateStory(adventure, style = 'narrative') {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

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
- Places visited: ${adventure.stop_points?.map(s => `${s.name} (${s.photos} photos)`).join(', ') || 'Various locations'}

${stylePrompts[style] || stylePrompts.narrative}

Write a 3-4 paragraph story (about 200-300 words) about this adventure. Include:
- An engaging opening that sets the scene
- Specific mentions of places visited
- Sensory details and emotions
- A reflective closing

Do not make up specific events that couldn't be inferred from the data. Focus on the journey, places, and general experiences.`;

  try {
    const response = await client.chat.completions.create({
      model: config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a skilled travel writer who creates engaging, authentic travel stories.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 600,
      temperature: 0.8,
    });

    const story = response.choices[0]?.message?.content?.trim();
    const tokensUsed = response.usage?.total_tokens || 0;

    // Cache the story
    await db.query(`
      INSERT INTO ai_summaries (adventure_id, summary_type, content, model, tokens_used)
      VALUES ($1, 'story', $2, $3, $4)
      ON CONFLICT (adventure_id, summary_type) 
      DO UPDATE SET content = $2, model = $3, tokens_used = $4, created_at = NOW()
    `, [adventure.id, story, config.model, tokensUsed]);

    return { story, tokensUsed };
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

module.exports = {
  generateSummary,
  generateHighlights,
  generateStory,
  getCachedSummary,
  regenerateAll,
  getAIConfig,
};