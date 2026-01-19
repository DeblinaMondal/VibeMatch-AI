import { GoogleGenAI, Type } from "@google/genai";
import { SongRecommendation } from "../types";

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeImageAndSuggestSong = async (imageFiles: File[], excludeSongs: string[] = []): Promise<SongRecommendation[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Convert all files to generative parts
  const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));

  let prompt = `
    Analyze the visual elements, mood, lighting, and context of these ${imageFiles.length} images as a collection. 
    Identify the collective "vibe" or narrative they form together.
    
    Suggest 3 distinct, real, existing songs that perfectly match this collective vibe.
    
    For each song provide:
    1. Artist Name
    2. Song Title
    3. Album Name (if known)
    4. A brief, creative reason why this song matches the images.
    5. The Mood (e.g., "Melancholic", "Upbeat", "Ethereal").
    6. The Genre.
    
    Rank them from best match (1) to good match (3).
  `;

  if (excludeSongs.length > 0) {
    prompt += `
      IMPORTANT: Do NOT suggest the following songs again: ${excludeSongs.join(", ")}.
      Provide completely different suggestions.
    `;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        ...imageParts,
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            artist: { type: Type.STRING },
            title: { type: Type.STRING },
            album: { type: Type.STRING },
            reason: { type: Type.STRING },
            mood: { type: Type.STRING },
            genre: { type: Type.STRING },
          },
          required: ["artist", "title", "reason", "mood", "genre"],
        },
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  try {
    const result = JSON.parse(text);
    // Ensure we always return an array
    return Array.isArray(result) ? result : [result];
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Failed to parse AI response");
  }
};
