
import { GoogleGenAI } from "@google/genai";

/**
 * Generates academic advice and answers for HNS students.
 */
export const generateStudyAdvice = async (prompt: string) => {
  if (!process.env.API_KEY) {
    return { text: "Assistant offline. Please configure API access." };
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

    return { text: response.text || "I couldn't generate a response." };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "Connection error. Please try again later." };
  }
};
