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
    console.log("Sending request to Gemini 2.5 Pro Experimental with message:", userMessage);
    
    // Using gemini-2.5-pro-exp-03-25 model (most advanced experimental model)
    const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent?key=AIzaSyB-RIjhhODp6aPTzqVcwbXD894oebXFCUY",
        {
          contents: [
            {
              parts: [
                { text: userMessage }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.9
          }
        }
    );

    console.log("Received response from Gemini 2.5 Pro Experimental");
    
    const aiReply = response.data.candidates[0].content.parts[0].text;
    
    console.log("AI reply:", aiReply);
    res.status(200).json({ reply: aiReply });
  } catch (error) {
    console.error("AI Error details:", error.response?.data || error.message);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data));
    }
    
    res.status(500).json({
      error: "Failed to connect to AI",
      details: error.message || "Unknown error"
    });
  }
});