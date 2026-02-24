
/**
 * HNS Hub AI Service - Client Proxy
 * This service communicates with the secure /api/generate serverless route.
 * Optimized for the HNS Hub Intelligence Core (Gemini 3 Pro).
 */

/**
 * Proxies the user prompt to the secure HNS serverless node.
 */
export const generateLiquidResponse = async (prompt: string) => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { text: data.text };
  } catch (error: any) {
    console.error("HNS AI Bridge Connection Failure:", error);
    
    let errorMessage = "An unexpected disruption occurred in the HNS Hub AI neural link.";
    
    if (error.message?.includes("API_KEY") || error.message?.includes("missing from the server")) {
      errorMessage = "The HNS secure gateway is missing its authentication key. Please verify server environment variables.";
    } else if (error.message?.includes("Failed to fetch") || error.message?.includes("network")) {
      errorMessage = "Unable to reach the HNS secure gateway. Check your network or server status.";
    } else {
      errorMessage = error.message || "Unknown error occurred.";
    }
    
    return { 
      text: `⚠️ **HNS Hub AI Disruption**: ${errorMessage}` 
    };
  }
};
