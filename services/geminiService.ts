
/**
 * HNS Hub AI Service
 * Powered by Google Gemma 3 27B
 */
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a response using the exact Gemma 3 27B IT (Free) architecture.
 * This service is optimized for Renewable Energy scholarship at HNS.
 */
export const generateLiquidResponse = async (prompt: string) => {
  // Use process.env.API_KEY exclusively as mandated.
  // The provided key 'sk-or-v1-...' suggests an external provider, 
  // but we follow coding guidelines to use it via GoogleGenAI.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return { 
      text: "⚠️ **Core Error**: Neural link key (API_KEY) is missing from the environment." 
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    // Strictly using the requested model identity
    const response = await ai.models.generateContent({
      model: 'google/gemma-3-27b-it:free',
      contents: prompt,
      config: {
        systemInstruction: `You are HNS AI, the academic intelligence core for the Higher School of Renewable Energies.
            
            IDENTITY & ENGINE PROTOCOL:
            - Name: HNS AI
            - Model ID: google/gemma-3-27b-it:free
            - Institutional Alignment: HNS (Higher School of Renewable Energies)
            
            SCIENTIFIC DOMAIN:
            - Expert in: Photovoltaics, Wind Power, Green Hydrogen, Smart Grids, and Sustainable Development.
            - Tone: Precise, analytical, yet encouraging for HNS students.
            - Formatting: Use Markdown and LaTeX for scientific notation.
            
            You MUST strictly identify as the Gemma 3 27B Core for the HNS Hub.`,
        temperature: 0.7,
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemma 3 core signal returned empty. Check model availability.");
    }
    
    return { text };
  } catch (error: any) {
    console.error("Gemma Core Connection Failure:", error);
    
    let errorMessage = "An unexpected disruption occurred in the Gemma 3 27B neural link.";
    
    if (error.message?.includes("API key")) {
      errorMessage = "Authentication failed: The provided API key is rejected by the Gemma gateway.";
    } else if (error.message?.includes("not found")) {
      errorMessage = "The Gemma 3 27B model node (google/gemma-3-27b-it:free) was not located on this route.";
    } else {
      errorMessage = error.message;
    }
    
    return { 
      text: `⚠️ **Gemma 3 Core Disruption**: ${errorMessage}` 
    };
  }
};
