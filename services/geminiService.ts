
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Generates study advice using Gemini 3 Flash model.
 */
export const generateStudyAdvice = async (prompt: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("HNS Assistant Error: Gemini API Key is missing. Please set it in Vercel Environment Variables.");
    return "The HNS Assistant is currently offline. (Admin: Please configure the API Key in Vercel).";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are the HNS Student Assistant for the Higher School of Renewable Energies (HNS). You specialize in Solar Energy, Wind Power, and Smart Grids. Be professional, technical when needed, and always encouraging. Address the user as an HNS student.",
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response. Please rephrase your question.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my academic core. Please check your connection and try again!";
  }
};