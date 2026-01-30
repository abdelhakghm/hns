
/**
 * HNS Hub AI Service
 * Powered by Google Gemma 3 27B
 */
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a response using the Gemma 3 27B architecture.
 * This service is strictly restricted to Gemma 3 models as per institutional requirements.
 */
export const generateLiquidResponse = async (prompt: string) => {
  // Use process.env.API_KEY exclusively as mandated
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return { 
      text: "⚠️ **Core Error**: Neural link key (API_KEY) is missing. Please ensure your environment is configured correctly." 
    };
  }

  // Create a new instance for every request to ensure it uses the most up-to-date key
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    /**
     * FIX: The 404 NOT_FOUND error was caused by using the OpenRouter model string format.
     * The @google/genai SDK requires the native Google model ID.
     * 'gemma-3-27b-it' is the official identifier for the Gemma 3 27B Instructions-tuned model.
     */
    const response = await ai.models.generateContent({
      model: 'gemma-3-27b-it',
      contents: prompt,
      config: {
        systemInstruction: `You are HNS AI, the academic intelligence core for the Higher School of Renewable Energies.
            
            IDENTITY PROTOCOL:
            - Name: HNS AI
            - Core Engine: Google Gemma 3 27B
            - Institutional Alignment: HNS (Higher School of Renewable Energies)
            
            SCIENTIFIC DOMAIN:
            - You are an expert in Photovoltaics, Wind Power, Green Hydrogen, Smart Grids, and Sustainable Development.
            - Provide precise, academic, and encouraging guidance.
            - Use Markdown and LaTeX ($$ E = mc^2 $$) for all technical and scientific notations.
            
            Strictly identify as the Gemma 3 27B Core. Do not mention other models or architectures.`,
        temperature: 0.7,
      },
    });

    // Access the generated text directly from the response object
    const text = response.text;

    if (!text) {
      throw new Error("Gemma 3 core signal returned an empty response. This may be due to safety filters.");
    }
    
    return { text };
  } catch (error: any) {
    console.error("Gemma Core Connection Failure:", error);
    
    let errorMessage = "An unexpected disruption occurred in the Gemma 3 27B neural link.";
    
    // Explicit 404 Handling: The model string is correct, so 404 likely means restricted access or region lock
    if (error.message?.includes("404") || error.message?.includes("NOT_FOUND")) {
      errorMessage = "The Gemma 3 27B model node is not available for this API key. Your project may need to be whitelisted for Gemma access in Google AI Studio.";
    } else if (error.message?.includes("API key")) {
      errorMessage = "Authentication failed: The provided API key is rejected by the Google GenAI gateway.";
    } else {
      errorMessage = error.message || "Unknown error occurred.";
    }
    
    return { 
      text: `⚠️ **Gemma 3 Core Disruption**: ${errorMessage}` 
    };
  }
};
