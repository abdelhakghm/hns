
import { GoogleGenAI } from "@google/genai";

/**
 * Generates academic advice and answers for HNS students.
 */
export const generateStudyAdvice = async (prompt: string) => {
  if (!process.env.API_KEY) {
    return { text: "Assistant offline: Missing API Configuration. Please verify environment setup." };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are the HNS Academic Assistant. Your goal is to help students of the Higher School of Renewable Energies (HNS) with their modules (Solar, Wind, Biomass, etc.). Be concise, professional, and encouraging.",
        temperature: 0.7,
      },
    });

    return { text: response.text || "I couldn't generate a response. Neural core returned an empty frame." };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes('Failed to fetch')) {
      return { text: "Network Connection Interrupted: Failed to fetch data from Gemini servers. Check your institutional network status." };
    }
    return { text: `Neural Link Error: ${error.message || "Unknown anomaly detected."}` };
  }
};
