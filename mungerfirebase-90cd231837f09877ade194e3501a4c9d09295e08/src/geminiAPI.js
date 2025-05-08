// API key (same as your original one)
const API_KEY = "AIzaSyB-RIjhhODp6aPTzqVcwbXD894oebXFCUY";

// Updated API endpoints
const GEMINI_PRO_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;
const GEMINI_PRO_VISION_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;
const GEMINI_SEARCH_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

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

// Function to find cheaper alternatives using Google Search
async function findCheaperAlternative(itemName, itemCost) {
  try {
    console.log(`Searching for alternatives to ${itemName} (under $${itemCost})`);
    
    const prompt = `
    Find a cheaper alternative to "${itemName}" that costs less than $${itemCost}.
    
    I want you to use Google Search to find real alternatives available for purchase NOW from reputable online retailers.
    
    For the selected alternative:
    1. Provide the exact product name 
    2. Provide the exact price (must be lower than $${itemCost})
    3. Provide the DIRECT PRODUCT URL that goes to the product page on the retailer's website, not a search results page
       - The URL must be a complete, clickable link that takes users directly to the product page
       - Verify the URL is accessible and goes to the actual product listing
       - Do NOT provide shortened URLs or affiliate links
    4. Provide the retailer name
    
    Return the information ONLY as a JSON object with this exact structure:
    {
      "name": "Alternative Product Name",
      "price": 123.45,
      "url": "https://retailer.com/product-page",
      "retailer": "Retailer Name"
    }
    
    If you can't find a real alternative that's cheaper, return null.
    `;

    const response = await fetch(GEMINI_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        tools: [
          {
            google_search: {}
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          topP: 0.8
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: { message: "Failed to parse error response." }
      }));
      
      throw new Error(`Search API Error: ${response.status} ${response.statusText}. ${errorData?.error?.message || ''}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    
    // Extract the JSON from the response
    const result = extractJsonFromText(resultText);
    
    // Validate the result
    if (result && 
        result.name && 
        result.price && 
        result.url && 
        result.retailer &&
        parseFloat(result.price) < parseFloat(itemCost)) {
      
      console.log(`Found alternative: ${result.name} for $${result.price} at ${result.retailer}`);
      return result;
    }
    
    console.log("No suitable alternative found");
    return null;
  } catch (error) {
    console.error("Error searching for alternatives:", error);
    return null;
  }
}

// Function to get purchase recommendation
async function getPurchaseRecommendation(itemName, itemCost, purpose, frequency, financialProfile, alternative = null) {
  try {
    // Format the message about the purchase
    let analysisPrompt = `
    As Charlie Munger, the legendary investor and business partner of Warren Buffett, analyze the following purchase decision:

    Item: ${itemName}
    Cost: $${itemCost}
    `;
    
    // Add purpose and frequency if available
    if (purpose) {
      analysisPrompt += `\nPurpose of purchase: ${purpose}`;
    }
    
    if (frequency) {
      analysisPrompt += `\nFrequency of use: ${frequency}`;
    }
    
    // Add financial profile context if available
    if (financialProfile && financialProfile.summary) {
      const fp = financialProfile;
      const s = fp.summary;
      
      analysisPrompt += `\n\nFinancial context:
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
    
    // Add alternative product information if available
    if (alternative) {
      const savings = itemCost - alternative.price;
      const savingsPercent = (savings / itemCost) * 100;
      
      analysisPrompt += `\n\nCheaper alternative found:
      - Name: ${alternative.name}
      - Price: $${alternative.price}
      - Retailer: ${alternative.retailer}
      - Savings: $${savings.toFixed(2)} (${savingsPercent.toFixed(1)}%)
      - URL: ${alternative.url}
      `;
    }
    
    analysisPrompt += `\nProvide a clear "Buy" or "Don't Buy" recommendation based on your principles of rational decision-making, opportunity cost, and long-term value.
    
    Consider these factors in your analysis:
    - Whether this item is a necessity or a luxury
    - The frequency of use and utility derived
    - The expected lifespan of the item
    - The opportunity cost of the money spent
    - Whether cheaper alternatives exist that may provide similar utility (especially consider the alternative provided if available)
    - The long-term impact of this purchase on financial goals

    Return ONLY a JSON object with this structure:
    {
      "decision": "Buy" or "Don't Buy",
      "explanation": "2-3 sentences explaining your recommendation using Charlie Munger's mental models and investment principles"
    }`;

    // Call the Gemini Pro API
    const response = await fetch(GEMINI_PRO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: analysisPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
          topP: 0.8
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
    
    // Extract the JSON from the response
    const result = extractJsonFromText(reply);
    
    // Ensure we have the expected fields
    if (!result || !result.decision || !result.explanation) {
      // Fallback to parsing the text directly
      return formatMungerResponse(reply);
    }
    
    return {
      decision: result.decision,
      reasoning: result.explanation,
      alternative: alternative
    };
  } catch (error) {
    console.error("Error getting purchase recommendation:", error);
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
      return JSON.parse(jsonStr);
    }
    
    // If no JSON found, return null
    return null;
  } catch (error) {
    console.error("Error parsing JSON from text:", error);
    return null;
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
  
  // If pattern doesn't match, return a generic response
  return {
    decision: "Consider carefully",
    reasoning: "Consider the value of this purchase against your financial goals and needs."
  };
}

export { analyzeImageWithGemini, getPurchaseRecommendation, findCheaperAlternative };
