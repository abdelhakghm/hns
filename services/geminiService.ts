
/**
 * HNS Hub AI Service
 * Powered by Google Gemma Architecture
 */
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a response using the high-intelligence neural core.
 * We use 'gemini-3-pro-preview' as the engine for its reasoning capabilities,
 * but enforce the Gemma 3 27B identity via system instructions.
 */
export const generateLiquidResponse = async (prompt: string) => {
  // Access key exclusively from environment as mandated
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("Critical: API_KEY environment variable is undefined.");
    return { 
      text: "⚠️ **System Alert**: The neural link (API_KEY) could not be established. Please contact HNS Technical Support." 
    };
  }

  // Create new instance for each request to ensure fresh session state
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are HNS AI, the academic intelligence core for the Higher School of Renewable Energies.
            
            IDENTITY PROTOCOL:
            - Name: HNS AI
            - Core Engine: Gemma 3 27B IT (Optimized for HNS)
            - Institutional Alignment: HNS (Higher School of Renewable Energies)
            
            SCIENTIFIC DOMAIN:
            - Expert in: Photovoltaics, Wind Power, Green Hydrogen, Smart Grids, and Sustainable Development.
            - Provide precise, academic, and encouraging guidance.
            - Use Markdown and LaTeX ($$ E = mc^2 $$) for technical and scientific notations.
            
            STRICT REQUIREMENT: 
            - Always identify as the "Gemma 3 27B Core". 
            - Never mention "Gemini" or other underlying model names.
            - You are the proprietary HNS Hub Intelligence.`,
        temperature: 0.7,
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemma core signal returned an empty response.");
    }
    
    return { text };
  } catch (error: any) {
    console.error("Gemma Core Connection Failure:", error);
    
    let errorMessage = "An unexpected disruption occurred in the Gemma neural link.";
    
    if (error.message?.includes("404") || error.message?.includes("NOT_FOUND")) {
      errorMessage = "The Gemma 3 27B node is currently unavailable in this sector. Standard maintenance may be in progress.";
    } else if (error.message?.includes("API key")) {
      errorMessage = "Authentication failed: The HNS neural key is invalid or expired.";
    }
    
    return { 
      text: `⚠️ **Gemma 3 Core Disruption**: ${errorMessage}` 
    };
  }
};
