
/**
 * HNS AI Service Integration
 * Migrated to Google Gemini API for high-quality academic reasoning.
 */
import { GoogleGenAI } from "@google/genai";

export const generateStudyAdvice = async (prompt: string) => {
  // Always use process.env.API_KEY directly for initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Calling gemini-3-pro-preview for complex academic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are the HNS Academic Assistant, an advanced AI tool for the Higher School of Renewable Energies (HNS). 
            Your expertise covers:
            - Solar Energy (Photovoltaics, Thermal)
            - Wind Energy (Aerodynamics, Turbines)
            - Biomass and Hydroelectric systems
            - Power Grid Management & Storage
            
            Provide technical, concise, and academically rigorous responses. 
            Use Markdown for formatting formulas or lists. 
            Identify yourself as being powered by Google Gemini.`,
        temperature: 0.6,
      },
    });

    // Access text directly from the GenerateContentResponse object
    const text = response.text;

    if (!text) {
      throw new Error("Neural output was null. Check model availability.");
    }
    
    return { text };
  } catch (error: any) {
    console.error("Gemini Link Failure:", error);
    
    return { 
      text: `⚠️ **Neural Core Error**: ${error.message}` 
    };
  }
};
