// API key (same as your original one)
const API_KEY = "AIzaSyB-RIjhhODp6aPTzqVcwbXD894oebXFCUY";

// Updated API endpoints
const GEMINI_PRO_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;
const GEMINI_PRO_VISION_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

// Function to analyze image using Gemini API
async function analyzeImageWithGemini(imageBase64) {
  try {
    const instructions = `
      You are shown a single consumer item.
      1. Identify it with brand/model if visible
      2. Estimate cost in USD
      3. Provide 1-2 sentences of interesting facts
      Return only valid JSON in this format:
      {
        "name": "...",
        "cost": 123.45,
        "facts": "..."
      }
    `;

    const response = await fetch(GEMINI_PRO_VISION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: instructions },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: { message: "Failed to parse error response." }
      }));
      
      throw new Error(`Vision API Error: ${response.status} ${response.statusText}. ${errorData?.error?.message || ''}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    
    // Extract the JSON from the response
    return extractJsonFromText(resultText);
  } catch (error) {
    console.error("Error calling Gemini Vision API:", error);
    throw error;
  }
}

// Helper function to extract JSON from text response
function extractJsonFromText(text) {
  try {
    // Find JSON within the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      const result = JSON.parse(jsonStr);
      return result;
    }
    
    // If no JSON found, return error
    return {
      name: "Error",
      cost: 0,
      facts: "Could not extract item information from API response."
    };
  } catch (error) {
    console.error("Error parsing JSON from text:", error);
    return {
      name: "Error",
      cost: 0,
      facts: "Error parsing result: " + error.message
    };
  }
}

// Function to get purchase recommendation
async function getPurchaseRecommendation(itemName, itemCost, purpose, frequency, financialProfile) {
  try {
    // Format the message about the purchase
    let analysisPrompt = `Act as Charlie Munger, Warren Buffett's business partner, and analyze this purchase decision: 
    Item: ${itemName}
    Cost: $${itemCost}
    ${purpose ? `Purpose: ${purpose}` : ""}
    ${frequency ? `Frequency of use: ${frequency}` : ""}
    `;
    
    // Add financial context if available
    if (financialProfile && financialProfile.summary) {
      const fp = financialProfile;
      const s = fp.summary;
      
      analysisPrompt += `\nFinancial context:
      - Monthly Net Income: $${s.monthlyNetIncome.toFixed(2)}
      - Debt-to-Income Ratio: ${s.debtToIncomeRatio.toFixed(1)}%
      - Credit Utilization: ${s.creditUtilization.toFixed(1)}%
      - Net Worth: $${s.netWorth.toFixed(2)}
      - Emergency Fund: ${s.emergencyFundMonths.toFixed(1)} months
      - Risk Tolerance: ${fp.riskTolerance}
      - Purchase Timeframe: ${fp.purchaseTimeframe}
      `;
      
      if (fp.shortTermGoals || fp.midTermGoals || fp.longTermGoals) {
        analysisPrompt += "\nFinancial Goals:";
        if (fp.shortTermGoals) analysisPrompt += `\n- Short-term: ${fp.shortTermGoals}`;
        if (fp.midTermGoals) analysisPrompt += `\n- Mid-term: ${fp.midTermGoals}`;
        if (fp.longTermGoals) analysisPrompt += `\n- Long-term: ${fp.longTermGoals}`;
      }
    }
    
    analysisPrompt += `\nProvide only a clear "Buy" or "Don't Buy" recommendation followed by your reasoning in 2-3 short sentences using principles of rational decision-making, opportunity cost, and long-term value. Keep your response concise and direct.`;

    // Call the Gemini Pro API
    const response = await fetch(GEMINI_PRO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: analysisPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: { message: "Failed to parse error response." }
      }));
      
      throw new Error(`API Error: ${response.status} ${response.statusText}. ${errorData?.error?.message || ''}`);
    }

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    
    // Format the response
    return formatMungerResponse(reply);
  } catch (error) {
    console.error("Error getting purchase recommendation:", error);
    throw error;
  }
}

// Format Munger's response for better display
function formatMungerResponse(text) {
  // Extract decision and reasoning
  const buyMatch = text.match(/^(Buy|Don't Buy|Don't buy)[\s:.,]+(.*)/i);
  
  if (buyMatch) {
    const decision = buyMatch[1].trim();
    const reasoning = buyMatch[2].trim();
    
    return {
      decision: decision.toLowerCase() === "buy" ? "Buy" : "Don't Buy",
      reasoning: reasoning
    };
  }
  
  // If pattern doesn't match, return the original text
  return {
    decision: "",
    reasoning: text
  };
}

export { analyzeImageWithGemini, getPurchaseRecommendation };
