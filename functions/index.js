const functions = require("firebase-functions");
const axios = require("axios");

exports.chatWithAI = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Please provide a message" });
  }

  try {
    console.log("Sending request to Gemini API with message:", userMessage);
    
    // Determine if this is likely a purchase analysis based on message content
    const isPurchaseAnalysis = userMessage.toLowerCase().includes("act as charlie munger") || 
                              userMessage.toLowerCase().includes("analyze this purchase");
    
    // Set appropriate parameters based on request type
    const generationConfig = {
      temperature: isPurchaseAnalysis ? 0.3 : 0.7, // Lower temperature for purchase analysis
      maxOutputTokens: isPurchaseAnalysis ? 512 : 1024,
      topP: 0.9
    };
    
    // Using the appropriate model
    const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB-RIjhhODp6aPTzqVcwbXD894oebXFCUY",
        {
          contents: [
            {
              parts: [
                { text: userMessage }
              ]
            }
          ],
          generationConfig
        }
    );

    console.log("Received response from Gemini API");
    
    // Check if the response has the expected structure
    if (response.data && 
        response.data.candidates && 
        response.data.candidates.length > 0 &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts.length > 0) {
      
      const aiReply = response.data.candidates[0].content.parts[0].text;
      console.log("AI reply:", aiReply);
      res.status(200).json({ reply: aiReply });
    } else {
      // Log the actual response structure for debugging
      console.error("Unexpected response structure:", JSON.stringify(response.data));
      throw new Error("Invalid response structure from Gemini API");
    }
  } catch (error) {
    console.error("AI Error details:", error.message);
    
    // Add detailed logging of the response if available
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data));
    } else {
      console.error("No response object available");
      console.error("Full error:", error);
    }
    
    res.status(500).json({
      error: "Failed to connect to AI",
      details: error.message || "Unknown error"
    });
  }
});