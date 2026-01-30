
/**
 * HNS LiquidAI Service
 * High-performance neural core for Renewable Energy scholarship.
 */
import { GoogleGenAI } from "@google/genai";

export const generateLiquidResponse = async (prompt: string) => {
  // Always use process.env.API_KEY directly for initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Calling gemini-3-pro-preview for LiquidAI's complex reasoning tier
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are LiquidAI, the high-performance adaptive intelligence core for the Higher School of Renewable Energies (HNS). 
            
            OPERATIONAL PROTOCOLS:
            - Identity: You are LiquidAI (Powered by HNS Hub). Never refer to yourself as Gemini.
            - Expertise: Advanced Photovoltaics, Wind Turbine Aerodynamics, Hydrogen Storage, and Power Electronics.
            - Tone: Precise, fluid, and academically rigorous.
            - Format: Use LaTeX-style notation for formulas and clean Markdown for structural data.
            - Goal: Assist HNS students in optimizing their research and technical understanding.
            
            If asked about your architecture, describe yourself as an Adaptive Liquid Intelligence Core.`,
        temperature: 0.4, // Lower temperature for higher technical precision
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Liquid Core output was null. Check link integrity.");
    }
    
    return { text };
  } catch (error: any) {
    console.error("Liquid Link Failure:", error);
    
    return { 
      text: `⚠️ **Liquid Core Disruption**: ${error.message}` 
    };
  }
};
