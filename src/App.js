import React, { useState, useRef } from "react";
import "./App.css";

// The API key is directly included here - this is NOT recommended for production
// Only for local testing purposes
const GEMINI_API_KEY = "AIzaSyB-RIjhhODp6aPTzqVcwbXD894oebXFCUY";

function App() {
  const [messages, setMessages] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [purpose, setPurpose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection for image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      // Reset the item name since we'll get it from image recognition
      setItemName("");
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Clear the selected image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setItemName("");
  };

  // Direct call to Gemini Pro API
  const callGeminiProAPI = async (message) => {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  // Direct call to Gemini Pro Vision API for image analysis
  const callGeminiVisionAPI = async (imageBase64, mimeType) => {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Identify what this object is in a single short phrase (3-5 words maximum). Then on a new line, provide one interesting fact or detail about this type of item that would be relevant when deciding whether to purchase it. Format your response exactly like this: 'Item: [name of item]\\nFact: [one interesting fact]'"
                },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: imageBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  // Purchase analysis function with direct API calls
  const analyzePurchase = async () => {
    if (!itemCost.trim()) {
      alert("Please enter the cost of the item");
      return;
    }

    if (!imageFile && !itemName.trim()) {
      alert("Please either upload an image or enter the item name");
      return;
    }

    setLoading(true);

    try {
      let recognizedItemName = itemName;
      let itemFact = "";

      // If there's an image, process it directly with Gemini Vision API
      if (imageFile) {
        // Convert the image file to base64
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(imageFile);
        });

        // Call the Gemini Vision API directly
        const identificationText = await callGeminiVisionAPI(base64Image, imageFile.type);
        
        // Parse the identification text to extract item name and fact
        const itemMatch = identificationText.match(/Item:\s*(.+)/i);
        const factMatch = identificationText.match(/Fact:\s*(.+)/i);
        
        if (itemMatch) {
          recognizedItemName = itemMatch[1].trim();
          itemFact = factMatch ? factMatch[1].trim() : "No information available";
          
          // Update the displayed item name
          setItemName(recognizedItemName);
          
          // Add the recognition message
          setMessages([
            { 
              sender: "System", 
              text: `Identified: ${recognizedItemName}. ${itemFact}` 
            }
          ]);
        } else {
          setMessages([
            { 
              sender: "System", 
              text: "Couldn't identify the image. Please enter the item name manually." 
            }
          ]);
          setLoading(false);
          return;
        }
      }

      // Format the message about the purchase
      const purchaseMessage = `Should I buy: ${recognizedItemName} for $${itemCost}${
        purpose ? `, Purpose: ${purpose}` : ""
      }${frequency ? `, Frequency of use: ${frequency}` : ""}`;

      const newMessages = [
        ...messages,
        { sender: "You", text: purchaseMessage },
      ];
      setMessages(newMessages);

      // Format the analysis prompt for Munger's advice
      const analysisPrompt = `Act as Charlie Munger, Warren Buffett's business partner, and analyze this purchase decision: 
      Item: ${recognizedItemName}
      Cost: $${itemCost}
      ${purpose ? `Purpose: ${purpose}` : ""}
      ${frequency ? `Frequency of use: ${frequency}` : ""}
      
      Provide only a clear "Buy" or "Don't Buy" recommendation followed by your reasoning in 2-3 short sentences using principles of rational decision-making, opportunity cost, and long-term value. Keep your response concise and direct.`;

      // Call the Gemini Pro API directly
      const reply = await callGeminiProAPI(analysisPrompt);
      
      setMessages([...newMessages, { sender: "Munger", text: reply }]);

      // Reset fields except the recognized item name
      setItemCost("");
      setPurpose("");
      setFrequency("");
      setImageFile(null);
      setImagePreview(null);
      
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...messages,
        {
          sender: "Munger",
          text: "Sorry, I couldn't analyze this purchase right now. Technical error occurred.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">Munger Purchase Advisor</h1>
        <p className="hero-subtitle">
          Should you buy it? Get Charlie Munger's advice on your purchases
        </p>
      </div>

      {/* Purchase Analysis Form */}
      <div className="purchase-form">
        {/* Image Upload Section */}
        <div className="image-upload-section">
          <div className="image-upload-container" onClick={triggerFileInput}>
            {imagePreview ? (
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="Item preview" className="image-preview" />
                <button className="clear-image-btn" onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}>×</button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">📷</div>
                <p>Click to upload an image of the item</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="file-input"
              capture="environment"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Item Name:</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder={imageFile ? "Identifying..." : "What are you considering buying?"}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Cost ($):</label>
          <input
            type="number"
            value={itemCost}
            onChange={(e) => setItemCost(e.target.value)}
            placeholder="How much does it cost?"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Purpose (optional):</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="What will you use it for?"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Frequency of Use (optional):</label>
          <select 
            value={frequency} 
            onChange={(e) => setFrequency(e.target.value)}
            disabled={loading}
          >
            <option value="">Select frequency...</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Rarely">Rarely</option>
            <option value="One-time">One-time use</option>
          </select>
        </div>
        <button 
          onClick={analyzePurchase} 
          disabled={loading} 
          className="analyze-btn"
        >
          {loading ? "Analyzing..." : "Get Munger's Advice"}
        </button>
      </div>

      {/* Results Window */}
      {messages.length > 0 && (
        <div className="results-window">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender.toLowerCase()}`}>
              <strong>{msg.sender === "System" ? "💡" : msg.sender}:</strong> {msg.text}
            </div>
          ))}
          {loading && <div className="loading">Analyzing...</div>}
        </div>
      )}
    </div>
  );
}

export default App;
