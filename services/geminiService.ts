
/**
 * HNS Hub AI Service
 * Powered by Google Gemma 3 27B
 */
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a response using the Gemma 3 27B model.
 * The system is specifically tuned for Renewable Energy students at HNS.
 */
export const generateLiquidResponse = async (prompt: string) => {
  // Use process.env.API_KEY directly as specified for the environment configuration
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Model identifier for Google Gemma 3 27B
    const response = await ai.models.generateContent({
      model: 'gemma-3-27b',
      contents: prompt,
      config: {
        systemInstruction: `You are HNS AI, an advanced research assistant powered by Google's Gemma 3 27B architecture, specifically calibrated for students at the Higher School of Renewable Energies (HNS) Hub.
            
            OPERATIONAL PROTOCOLS:
            - Identity: You are the HNS Hub Intelligence Core.
            - Backbone: You are powered by Google Gemma 3 27B.
            - Expertise: Advanced Renewable Energy (Solar, Wind, Hydro, Geothermal), Electrical Engineering, Power Systems, Thermal Dynamics, and Green Hydrogen.
            - Tone: Academic, professional, precise, and encouraging.
            - Response Style: Use clear Markdown formatting. Use LaTeX for all mathematical and chemical equations (e.g., $$E = mc^2$$). Use structured lists for technical workflows.
            - Constraints: Your primary goal is to assist HNS students in their specialized curriculum. If asked about your architecture, identify as Gemma 3 27B integrated into the HNS Hub ecosystem.`,
        temperature: 0.7,
      },
    });

    // Access the text directly from the response object
    const text = response.text;

    if (!text) {
      throw new Error("HNS AI (Gemma 3) returned an empty response.");
    }
    
    return { text };
  } catch (error: any) {
    console.error("HNS Hub Connection Failure:", error);
    
    let errorMessage = "An unexpected error occurred in the HNS Intelligence Core.";
    
    if (error.message?.includes("API_KEY")) {
      errorMessage = "The 'API_KEY' environment variable is missing or invalid. Please check your Vercel configuration.";
    } else if (error.message?.includes("model not found")) {
      errorMessage = "The specified model (Gemma 3 27B) is currently unavailable in this region.";
    } else {
      errorMessage = error.message;
    }
    
    return { 
      text: `⚠️ **Gemma 3 Core Disruption**: ${errorMessage}` 
    };
  }
};
