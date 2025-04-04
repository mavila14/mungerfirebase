const functions = require("firebase-functions");
const axios = require("axios");

exports.chatWithAI = functions.https.onRequest(async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=AIzaSyB-RIjhhODp6aPTzqVcwbXD894oebXFCUY",
        {
          prompt: {
            messages: [{author: "user", content: userMessage}],
          },
        },
    );

    const aiReply = response.data.candidates[0].content;
    res.status(200).json({reply: aiReply});
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({error: "Failed to connect to AI"});
  }
});
