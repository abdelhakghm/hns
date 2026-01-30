
/**
 * HNS Hub AI Service
 * Powered by Google Gemma 3 27B
 */
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a response using the Gemma 3 27B architecture.
 * This service is optimized for Renewable Energy scholarship.
 */
export const generateLiquidResponse = async (prompt: string) => {
  // Use process.env.API_KEY exclusively as mandated
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return { 
      text: "⚠️ **Core Error**: The neural link key is missing. Please ensure 'API_KEY' is configured." 
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    // Switching to the specific Gemma 3 27B model as requested
    const response = await ai.models.generateContent({
      model: 'gemma-3-27b',
      contents: prompt,
      config: {
        systemInstruction: `You are HNS AI, the academic intelligence core for the Higher School of Renewable Energies.
            
            IDENTITY & ENGINE:
            - Name: HNS AI
            - Core Engine: Google Gemma 3 27B
            - Institutional Alignment: HNS (Higher School of Renewable Energies)
            
            SCIENTIFIC DOMAIN:
            - You are an expert in Photovoltaics, Wind Kinetics, Thermal Systems, and Sustainable Engineering.
            - Provide precise, academic, and encouraging guidance.
            - Use Markdown for structure and LaTeX for technical equations ($$ E = mc^2 $$).
            
            Strictly identify as the Gemma 3 27B Core for HNS Hub.`,
        temperature: 0.7,
        // Removed thinkingConfig as it is specific to Gemini models
      },
    });

    // Access the generated text directly from the response
    const text = response.text;

    if (!text) {
      throw new Error("Gemma core returned an empty signal.");
    }
    
    return { text };
  } catch (error: any) {
    console.error("Gemma Core Connection Failure:", error);
    
    let errorMessage = "An unexpected disruption occurred in the Gemma core.";
    
    if (error.message?.includes("API key")) {
      errorMessage = "Authentication failed. The provided API key is invalid for the Gemma 3 node.";
    } else if (error.message?.includes("not found")) {
      errorMessage = "The Gemma 3 27B model is currently undergoing maintenance or is unavailable in this region.";
    } else {
      errorMessage = error.message;
    }
    
    return { 
      text: `⚠️ **Gemma 3 Disruption**: ${errorMessage}` 
    };
  }
};
