import { useState, useEffect, useCallback } from "react";
import { storageService } from "../services/storageService";
import { Adventure } from "../types";

export function useAdventure(id: string | undefined) {
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchAdventure = useCallback(async () => {
    if (!id) {
      setError("No adventure ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get all adventures from storage
      const adventures = await storageService.getAdventures();
      const foundAdventure = adventures.find((a) => a.id === id);

      if (foundAdventure) {
        // Get narrative if saved separately
        const savedNarrative = await storageService.getNarrative(id);
        if (savedNarrative) {
          foundAdventure.narrative = savedNarrative;
        }

        // Get custom data
        const customData = await storageService.getCustomData(id);
        if (customData) {
          Object.assign(foundAdventure, customData);
        }

        // Check favorite status
        const favorite = await storageService.isFavorite(id);
        setIsFavorite(favorite);
        foundAdventure.isFavorite = favorite;

        setAdventure(foundAdventure);
      } else {
        setError("Adventure not found");
      }
    } catch (err) {
      setError("Failed to load adventure");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAdventure();
  }, [fetchAdventure]);

  const updateNarrative = useCallback(
    async (narrative: string) => {
      if (!id || !adventure) return;

      try {
        // Save narrative
        await storageService.saveNarrative(id, narrative);
        
        // Update adventure in storage
        const updatedAdventure = {
          ...adventure,
          narrative,
          updatedAt: new Date().toISOString(),
        };
        await storageService.saveAdventure(updatedAdventure);
        
        setAdventure(updatedAdventure);
      } catch (err) {
        console.error("Failed to save narrative:", err);
        throw err;
      }
    },
    [id, adventure]
  );

  const updateTitle = useCallback(
    async (title: string) => {
      if (!id || !adventure) return;

      try {
        const updatedAdventure = {
          ...adventure,
          title,
          updatedAt: new Date().toISOString(),
        };
        await storageService.saveAdventure(updatedAdventure);
        await storageService.saveCustomData(id, { title });
        
        setAdventure(updatedAdventure);
      } catch (err) {
        console.error("Failed to save title:", err);
        throw err;
      }
    },
    [id, adventure]
  );

  const updateHighlights = useCallback(
    async (highlights: string[]) => {
      if (!id || !adventure) return;

      try {
        const updatedAdventure = {
          ...adventure,
          highlights,
          updatedAt: new Date().toISOString(),
        };
        await storageService.saveAdventure(updatedAdventure);
        await storageService.saveCustomData(id, { highlights });
        
        setAdventure(updatedAdventure);
      } catch (err) {
        console.error("Failed to save highlights:", err);
        throw err;
      }
    },
    [id, adventure]
  );

  const toggleFavorite = useCallback(async () => {
    if (!id) return;

    try {
      if (isFavorite) {
        await storageService.removeFavorite(id);
      } else {
        await storageService.addFavorite(id);
      }
      
      setIsFavorite(!isFavorite);
      if (adventure) {
        setAdventure({ ...adventure, isFavorite: !isFavorite });
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      throw err;
    }
  }, [id, isFavorite, adventure]);

  const updateCoverPhoto = useCallback(
    async (coverPhoto: string) => {
      if (!id || !adventure) return;

      try {
        const updatedAdventure = {
          ...adventure,
          coverPhoto,
          updatedAt: new Date().toISOString(),
        };
        await storageService.saveAdventure(updatedAdventure);
        await storageService.saveCustomData(id, { coverPhoto });
        
        setAdventure(updatedAdventure);
      } catch (err) {
        console.error("Failed to save cover photo:", err);
        throw err;
      }
    },
    [id, adventure]
  );

  return {
    adventure,
    loading,
    error,
    isFavorite,
    refresh: fetchAdventure,
    updateNarrative,
    updateTitle,
    updateHighlights,
    toggleFavorite,
    updateCoverPhoto,
  };
}