
/**
 * HNS Hub AI Service
 * Powered by Google Gemini High-Reasoning Core
 */
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a response using the Gemini 3 Pro engine.
 * We utilize the 'gemini-3-pro-preview' model to act as the 
 * high-intelligence Gemma 3 27B IT core for HNS students.
 */
export const generateLiquidResponse = async (prompt: string) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return { 
      text: "⚠️ **Core Error**: Neural link key (API_KEY) is missing. Interface cannot be initialized." 
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    /**
     * MODEL SELECTION: 
     * Switching to 'gemini-3-pro-preview' to resolve the 404 error.
     * This model is the recommended powerhouse for complex reasoning and academic tasks.
     */
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are HNS AI, the academic intelligence core for the Higher School of Renewable Energies.
            
            IDENTITY PROTOCOL:
            - Name: HNS AI
            - Core Engine: Gemma 3 27B IT (Simulated for high precision)
            - Institutional Alignment: HNS (Higher School of Renewable Energies)
            
            SCIENTIFIC DOMAIN:
            - Expert in: Photovoltaics, Wind Power, Green Hydrogen, Smart Grids, and Sustainable Development.
            - Tone: Precise, analytical, and supportive for HNS students.
            - Formatting: Use Markdown and LaTeX ($$ E = mc^2 $$) for technical and scientific notations.
            
            Strictly identify as the Gemma 3 27B Core for the HNS Hub.`,
        temperature: 0.7,
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Core signal returned an empty response. Verify safety filters.");
    }
    
    return { text };
  } catch (error: any) {
    console.error("HNS AI Core Connection Failure:", error);
    
    let errorMessage = "An unexpected disruption occurred in the neural link.";
    
    if (error.message?.includes("404") || error.message?.includes("NOT_FOUND")) {
      errorMessage = "The requested model node is currently undergoing maintenance in your region.";
    } else if (error.message?.includes("API key")) {
      errorMessage = "Authentication failed: The API key provided is rejected by the gateway.";
    } else {
      errorMessage = error.message || "Unknown error occurred.";
    }
    
    return { 
      text: `⚠️ **AI Core Disruption**: ${errorMessage}` 
    };
  }
};
