
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Generates study advice using Gemini 3 Flash model.
 * Adheres to the latest @google/genai guidelines for initialization and text extraction.
 */
export const generateStudyAdvice = async (prompt: string): Promise<string> => {
  // Always initialize with the key from process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // For text-based study advice, gemini-3-flash-preview is the recommended model.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are the HNS Student Assistant. You help students of the Higher School of Renewable Energies (HNS) with study organization, technical concepts in renewable energy (solar, wind, smart grids), and app-related questions. Be professional, encouraging, and concise.",
        temperature: 0.7,
      },
    });

    // Access the .text property directly to retrieve the generated string.
    return response.text || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later!";
  }
};
