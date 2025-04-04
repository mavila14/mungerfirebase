const functions = require("firebase-functions");
const axios = require("axios");

exports.chatWithAI = functions.https.onRequest(async (req, res) => {
  // Set CORS headers for cross-origin requests
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS request (preflight)
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const userMessage = req.body.message;

  if (!userMessage || typeof userMessage !== "string") {
    console.error("Invalid or missing message in request body");
    return res.status(400).json({ error: "Please provide a valid message" });
  }

  try {
    console.log("Sending request to Gemini API with message:", userMessage);
    
    const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/chat-bison-001:generateContent?key=AIzaSyB-RIjhhODp6aPTzqVcwbXD894oebXFCUY",
        {
          contents: [
            { parts: [{ text: userMessage }] }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        }
    );

    console.log("Received response from Gemini API");
    
    // Extract the text from the response
    const aiReply = response.data.candidates[0].content.parts[0].text;
    
    console.log("AI reply:", aiReply);
    res.status(200).json({ reply: aiReply });
  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    
    // Log more detailed error info
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data));
    }
    
    res.status(500).json({
      error: "Failed to connect to AI",
      details: error.message
    });
  }
});