
import { GoogleGenAI } from "@google/genai";

/**
 * Serverless API Route: /api/generate
 * Securely handles HNS AI inference via Gemini 3 Pro.
 * This implementation is strictly server-side and uses the pre-configured API_KEY.
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
        error: "Neural link key (API_KEY) is missing from the server environment. Interface cannot be initialized." 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize the Gemini client following official guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Generate content using the Gemini 3 Pro model for complex academic tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are HNS AI, the academic intelligence core for the Higher School of Renewable Energies.
            
            IDENTITY PROTOCOL:
            - Name: HNS AI
            - Core Engine: Gemini 3 Pro (HNS Optimized Intelligence)
            - Institutional Alignment: HNS (Higher School of Renewable Energies)
            
            SCIENTIFIC DOMAIN:
            - Expert in: Photovoltaics, Wind Power, Green Hydrogen, Smart Grids, and Sustainable Development.
            - Provide precise, academic, and encouraging guidance.
            - Use Markdown and LaTeX ($$ E = mc^2 $$) for technical and scientific notations.
            
            STRICT REQUIREMENT: 
            - Always identify as the "HNS Hub Intelligence". 
            - Never mention "Google", "Gemini", "Gemma", "OpenAI", or "Llama" to users.
            - You are the proprietary HNS Hub Intelligence core.`,
        temperature: 0.7,
      },
    });

    // Directly access the text property as per guidelines (not a method call)
    const text = response.text;

    if (!text) {
      throw new Error("HNS core signal returned an empty response. Verify gateway status.");
    }

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("HNS AI Server-Side Error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected disruption occurred in the HNS neural link.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
