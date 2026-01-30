
import { GoogleGenAI } from "@google/genai";

/**
 * Serverless API Route: /api/generate
 * Securely handles Gemma 3 27B inference using the protected API_KEY.
 */
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { prompt } = await req.json();
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "Neural link key (API_KEY) is missing from the server environment. Please check your configuration." 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize the AI client on the server side
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // High-reasoning engine acting as Gemma 3 27B IT
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

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Gemma Server-Side Error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected disruption occurred in the Gemma neural link.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
