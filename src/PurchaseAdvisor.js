import React, { useState, useRef, useEffect } from "react";
import "./App.css";

// API key directly included for local testing
const API_KEY = "AIzaSyB-RIjhhODp6aPTzqVcwbXD894oebXFCUY";

// Define the API endpoints
const GEMINI_PRO_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;
const GEMINI_VISION_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent?key=${API_KEY}`;

function PurchaseAdvisor() {
  const [messages, setMessages] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [purpose, setPurpose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageCapturing, setImageCapturing] = useState(false);
  const [financialProfile, setFinancialProfile] = useState(null);
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Load financial profile from localStorage if available
  useEffect(() => {
    const savedProfile = localStorage.getItem('financialProfile');
    if (savedProfile) {
      setFinancialProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Auto-scroll function
  const scrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll when messages update
  useEffect(() => {
    if (messages.length > 0) {
      scrollToResults();
    }
  }, [messages]);

  // Clean up video stream when component unmounts
  useEffect(() => {
    return (
    <div className="App">
      {/* Header Bar */}
      <header className="top-header">
        <div className="logo">
          <span className="logo-icon">💰</span>
          Munger Purchase Advisor
        </div>
      </header>

      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">Should You Buy It?</h1>
        <p className="hero-subtitle">
          Get Charlie Munger's rational advice on your purchasing decisions
        </p>
      </div>

      {/* Financial Profile Summary (if available) */}
      {financialProfile && financialProfile.summary && (
        <div className="mini-profile">
          <div className="mini-profile-header">
            <h3>
              <span className="profile-icon">👤</span>
              Your Financial Snapshot
            </h3>
          </div>
          <div className="mini-profile-stats">
            <div className="mini-stat">
              <span className="stat-label">Monthly Net:</span>
              <span className={`stat-value ${financialProfile.summary.monthlyNetIncome >= 0 ? 'positive' : 'negative'}`}>
                ${financialProfile.summary.monthlyNetIncome.toFixed(0)}
              </span>
            </div>
            <div className="mini-stat">
              <span className="stat-label">DTI Ratio:</span>
              <span className={`stat-value ${financialProfile.summary.debtToIncomeRatio < 36 ? 'positive' : financialProfile.summary.debtToIncomeRatio < 43 ? 'warning' : 'negative'}`}>
                {financialProfile.summary.debtToIncomeRatio.toFixed(0)}%
              </span>
            </div>
            <div className="mini-stat">
              <span className="stat-label">Emergency:</span>
              <span className={`stat-value ${financialProfile.summary.emergencyFundMonths >= 3 ? 'positive' : financialProfile.summary.emergencyFundMonths >= 1 ? 'warning' : 'negative'}`}>
                {financialProfile.summary.emergencyFundMonths.toFixed(1)}mo
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Analysis Form */}
      <div className="purchase-form">
        <h2 className="form-title">Analyze Your Purchase</h2>
        
        <div className="form-group">
          <label htmlFor="itemName">Item Name:</label>
          <input
            id="itemName"
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder={imageFile ? "Identifying..." : "What are you considering buying?"}
            disabled={loading}
            className="input-field"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="itemCost">Cost ($):</label>
          <input
            id="itemCost"
            type="number"
            value={itemCost}
            onChange={(e) => setItemCost(e.target.value)}
            placeholder="How much does it cost?"
            disabled={loading}
            className="input-field"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="purpose">Purpose (optional):</label>
          <input
            id="purpose"
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="What will you use it for?"
            disabled={loading}
            className="input-field"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="frequency">Frequency of Use (optional):</label>
          <select 
            id="frequency"
            value={frequency} 
            onChange={(e) => setFrequency(e.target.value)}
            disabled={loading}
            className="select-field"
          >
            <option value="">Select frequency...</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Rarely">Rarely</option>
            <option value="One-time">One-time use</option>
          </select>
        </div>

        {/* Image Capture Section - Now positioned above the Analyze button */}
        <div className="image-capture-section">
          {imageCapturing ? (
            <div className="camera-container">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="camera-preview"
              />
              <div className="camera-controls">
                <button 
                  type="button" 
                  onClick={captureImage} 
                  className="capture-btn"
                >
                  <span className="capture-icon">📸</span>
                </button>
                <button 
                  type="button" 
                  onClick={cancelCapture} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : imagePreview ? (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Item preview" className="item-preview" />
              <button 
                type="button" 
                onClick={clearImage} 
                className="clear-btn"
              >
                Remove Image
              </button>
            </div>
          ) : (
            <div className="image-capture-controls">
              <button 
                type="button" 
                onClick={startCamera} 
                className="camera-btn"
              >
                <span className="camera-icon">📷</span>
                Capture Image of Item
              </button>
              <span className="or-divider">or</span>
              <button 
                type="button" 
                className="upload-btn" 
                onClick={triggerFileInput}
              >
                Upload Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="file-input"
                hidden
              />
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <button 
          onClick={analyzePurchase} 
          disabled={loading} 
          className="should-i-buy-btn"
        >
          {loading ? (
            <span className="loading-text">
              <span className="loading-spinner"></span>
              Analyzing
            </span>
          ) : (
            "Should I Buy It?"
          )}
        </button>
      </div>

      {/* Results Window */}
      {messages.length > 0 && (
        <div className="results-window" ref={resultsRef}>
          <h2 className="results-title">
            <span className="results-icon">💡</span> 
            Analysis Results
          </h2>
          
          <div className="analysis-container">
            {messages.map((msg, i) => {
              // Display differently based on sender
              if (msg.sender === "Munger" && msg.formatted) {
                // Format Munger's response as a decision card
                return (
                  <div key={i} className="decision-card">
                    <div className={`decision-header ${msg.formatted.decision === "Buy" ? "buy" : "dont-buy"}`}>
                      <div className="decision-icon">
                        {msg.formatted.decision === "Buy" ? "✅" : 
                         msg.formatted.decision === "Don't Buy" ? "❌" : "⚠️"}
                      </div>
                      <h3 className="decision-title">{msg.formatted.decision}</h3>
                    </div>
                    <div className="decision-body">
                      <p>{msg.formatted.reasoning}</p>
                      <div className="signature">
                        <span className="signature-icon">👨‍💼</span>
                        <span className="signature-text">— Charlie Munger</span>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Standard message display for other senders
                return (
                  <div key={i} className={`message ${msg.sender.toLowerCase()}`}>
                    <div className="message-header">
                      {msg.sender === "System" ? "💡" : 
                       msg.sender === "You" ? "🧑" : ""}
                      <strong>{msg.sender}</strong>
                    </div>
                    <div className="message-body">{msg.text}</div>
                  </div>
                );
              }
            })}
          </div>
          
          {loading && (
            <div className="loading-message">
              <span className="loading-dots"></span>
              Analyzing your purchase...
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>Based on Charlie Munger's investment principles and decision-making framework</p>
      </footer>
    </div>) => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start camera capture
  const startCamera = async () => {
    try {
      setImageCapturing(true);
      
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions or try a different browser.");
      setImageCapturing(false);
    }
  };

  // Stop camera capture
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setImageCapturing(false);
  };

  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      
      // Match canvas dimensions to video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      // Draw the video frame on the canvas
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Convert canvas to image file
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], "captured-image.jpeg", { type: "image/jpeg" });
        setImageFile(file);
        
        // Create image preview
        const imageUrl = URL.createObjectURL(blob);
        setImagePreview(imageUrl);
        
        // Stop the camera
        stopCamera();
        
        // Reset item name since we'll identify from the image
        setItemName("");
      }, 'image/jpeg', 0.95);
    }
  };

  // Cancel camera capture
  const cancelCapture = () => {
    stopCamera();
  };

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

  // Trigger file input click for traditional upload
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Clear the selected image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setItemName("");
  };

  // Function to call Gemini Pro API
  const callGeminiProAPI = async (message) => {
    try {
      const response = await fetch(GEMINI_PRO_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
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
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error calling Gemini Pro API:", error);
      throw error;
    }
  };

  // Function to call Gemini Vision API
  const callGeminiVisionAPI = async (imageBase64) => {
    try {
      const response = await fetch(GEMINI_VISION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
                    mimeType: "image/jpeg",
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
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: { message: "Failed to parse error response." }
        }));
        
        throw new Error(`Vision API Error: ${response.status} ${response.statusText}. ${errorData?.error?.message || ''}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error calling Gemini Vision API:", error);
      throw error;
    }
  };

  // Format Munger's response for better display
  const formatMungerResponse = (text) => {
    // Extract decision and reasoning
    const buyMatch = text.match(/^(Buy|Don't Buy|Don't buy)[\s\:\.\,]+(.*)/i);
    
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
  };

  // Purchase analysis function
  const analyzePurchase = async () => {
    if (!itemCost.trim()) {
      alert("Please enter the cost of the item");
      return;
    }

    if (!imageFile && !itemName.trim()) {
      alert("Please either capture an image or enter the item name");
      return;
    }

    setLoading(true);

    try {
      let recognizedItemName = itemName;
      let itemFact = "";

      // If there's an image, process it with Gemini Vision API
      if (imageFile) {
        // Convert image to base64
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(imageFile);
        });

        // Call the Gemini Vision API
        const identificationText = await callGeminiVisionAPI(base64Image);
        
        // Parse the identification text
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
      const purchaseMessage = `Should I buy: ${recognizedItemName} for ${itemCost}${
        purpose ? `, Purpose: ${purpose}` : ""
      }${frequency ? `, Frequency of use: ${frequency}` : ""}`;

      const newMessages = [
        ...messages,
        { sender: "You", text: purchaseMessage },
      ];
      setMessages(newMessages);

      // Create a prompt that includes financial profile data if available
      let analysisPrompt = `Act as Charlie Munger, Warren Buffett's business partner, and analyze this purchase decision: 
      Item: ${recognizedItemName}
      Cost: ${itemCost}
      ${purpose ? `Purpose: ${purpose}` : ""}
      ${frequency ? `Frequency of use: ${frequency}` : ""}
      `;
      
      // Add financial context if available
      if (financialProfile && financialProfile.summary) {
        const fp = financialProfile;
        const s = fp.summary;
        
        analysisPrompt += `\nFinancial context:
        - Monthly Net Income: ${s.monthlyNetIncome.toFixed(2)}
        - Debt-to-Income Ratio: ${s.debtToIncomeRatio.toFixed(1)}%
        - Credit Utilization: ${s.creditUtilization.toFixed(1)}%
        - Net Worth: ${s.netWorth.toFixed(2)}
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
      const reply = await callGeminiProAPI(analysisPrompt);
      
      setMessages([...newMessages, { 
        sender: "Munger", 
        text: reply,
        formatted: formatMungerResponse(reply)
      }]);

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
          text: "Sorry, I couldn't analyze this purchase right now. Technical error occurred: " + error.message,
          formatted: {
            decision: "Error",
            reasoning: "Technical error occurred: " + error.message
          }
        },
      ]);
    } finally {
      setLoading(false);
    }
