
/**
 * Serverless API Route: /api/generate
 * Securely handles HNS AI inference via OpenRouter using openai/gpt-oss-20b:free.
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
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "Neural link key (OPENROUTER_API_KEY) is missing from the server environment." 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "openai/gpt-oss-20b:free",
        "messages": [
          {
            "role": "system",
            "content": `You are HNS AI, the academic intelligence core for the Higher School of Renewable Energies.
            
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
            - Never mention "OpenAI", "GPT", or other underlying model names.
            - You are the proprietary HNS Hub Intelligence.`
          },
          { "role": "user", "content": prompt }
        ],
        "temperature": 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenRouter Gateway Error");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

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
