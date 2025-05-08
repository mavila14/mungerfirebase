const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const axios = require("axios");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const os = require("os");
const fs = require("fs");

admin.initializeApp();

exports.chatWithAI = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "No message provided" });
      }

      // Make request to Gemini API with your API key
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        {
          contents: [{ parts: [{ text: message }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": "AIzaSyB-RIjhhODp6aPTzqVcwbXD894oebXFCUY", // Replace with your actual API key
          },
        }
      );

      // Extract the response text
      const reply = response.data.candidates[0].content.parts[0].text;

      return res.status(200).json({ reply });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Failed to process request" });
    }
  });
});

exports.identifyImage = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      // Check if there's an image in the request
      if (!req.files || !req.files.image) {
        return res.status(400).json({ 
          success: false, 
          error: "No image provided" 
        });
      }

      const imageFile = req.files.image;
      
      // Create a temporary file path
      const tempFilePath = path.join(os.tmpdir(), imageFile.name);
      
      // Write the file buffer to the temporary path
      fs.writeFileSync(tempFilePath, imageFile.data);
      
      // Upload the file to Firebase Storage
      const storage = new Storage();
      const bucket = storage.bucket("mungerfirebase.appspot.com");
      
      const destination = `uploads/${Date.now()}_${imageFile.name}`;
      await bucket.upload(tempFilePath, {
        destination: destination,
        metadata: {
          contentType: imageFile.mimetype,
        },
      });
      
      // Get the public URL
      const file = bucket.file(destination);
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500', // Far future expiration
      });
      
      // Remove the temporary file
      fs.unlinkSync(tempFilePath);
      
      // Make request to Gemini Vision API to identify the image
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent",
        {
          contents: [
            {
              parts: [
                { 
                  text: "Identify what this object is in a single short phrase (3-5 words maximum). Then on a new line, provide one interesting fact or detail about this type of item that would be relevant when deciding whether to purchase it. Format your response exactly like this: 'Item: [name of item]\nFact: [one interesting fact]'" 
                },
                {
                  inlineData: {
                    mimeType: imageFile.mimetype,
                    data: imageFile.data.toString('base64')
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 100,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": "AIzaSyB-RIjhhODp6aPTzqVcwbXD894oebXFCUY", // Replace with your actual API key
          },
        }
      );
      
      // Extract the response text
      const identificationText = response.data.candidates[0].content.parts[0].text;
      
      // Parse the identification text to extract item name and fact
      const itemMatch = identificationText.match(/Item:\s*(.+)/i);
      const factMatch = identificationText.match(/Fact:\s*(.+)/i);
      
      const itemName = itemMatch ? itemMatch[1].trim() : "Unknown item";
      const itemFact = factMatch ? factMatch[1].trim() : "No information available";
      
      return res.status(200).json({
        success: true,
        itemName,
        itemFact,
        imageUrl: url
      });
      
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ 
        success: false,
        error: "Failed to process image" 
      });
    }
  });
});