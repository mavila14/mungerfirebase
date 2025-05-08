import React, { useState, useRef, useEffect } from "react";
import { analyzeImageWithGemini, getPurchaseRecommendation, findCheaperAlternative } from "./geminiAPI";
import "./App.css";

function PurchaseAdvisor() {
  const [messages, setMessages] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [purpose, setPurpose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [loading, setLoading] = useState(false);
  const [findingAlternatives, setFindingAlternatives] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageCapturing, setImageCapturing] = useState(false);
  const [financialProfile, setFinancialProfile] = useState(null);
  const [searchForAlternative, setSearchForAlternative] = useState(true);
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Function to create a Google search link
  function createGoogleSearchLink(itemName) {
    // Encode the item name for a search URL
    const encodedSearch = encodeURIComponent(itemName);
    return `https://www.google.com/search?q=${encodedSearch}`;
  }

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
    return () => {
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

    // Reset previous messages when starting a new analysis
    setMessages([]);
    setLoading(true);

    try {
      let recognizedItemName = itemName;
      let itemDetails = null;

      // If there's an image, process it with Gemini Vision API
      if (imageFile) {
        // Convert image to base64
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.readAsDataURL(imageFile);
        });
        
        // Call the updated Gemini Vision API
        itemDetails = await analyzeImageWithGemini(base64Image);
        
        if (itemDetails && itemDetails.name && itemDetails.name !== "Error") {
          recognizedItemName = itemDetails.name;
          
          // Update the displayed item name
          setItemName(recognizedItemName);
          
          // If item cost is not provided by user but is in itemDetails, use that
          if (itemCost === "" && itemDetails.cost > 0) {
            setItemCost(itemDetails.cost.toString());
          }
          
          // Add the recognition message
          setMessages([
            { 
              sender: "System", 
              text: `Identified: ${recognizedItemName}. Estimated cost: $${itemDetails.cost}. ${itemDetails.facts}` 
            }
          ]);
        } else {
          setMessages([
            { 
              sender: "System", 
              text: "Couldn't identify the image clearly. Please enter the item name manually." 
            }
          ]);
          if (loading) setLoading(false);
          return;
        }
      }

      // Only proceed if we have an item name
      if (recognizedItemName) {
        const costValue = parseFloat(itemCost);
        
        // Format the message about the purchase
        const purchaseMessage = `Should I buy: ${recognizedItemName} for $${costValue}${
          purpose ? `, Purpose: ${purpose}` : ""
        }${frequency ? `, Frequency of use: ${frequency}` : ""}`;

        const newMessages = [
          ...(messages || []),
          { sender: "You", text: purchaseMessage }
        ];
        setMessages(newMessages);

        // If search for alternatives is enabled, find cheaper alternatives
        let alternative = null;
        if (searchForAlternative) {
          setFindingAlternatives(true);
          try {
            // Update messages to show we're searching
            setMessages([
              ...newMessages,
              { 
                sender: "System", 
                text: "Searching for cheaper alternatives..." 
              }
            ]);
            
            alternative = await findCheaperAlternative(recognizedItemName, costValue);
            
            // Update messages with alternative found or not
            if (alternative) {
              const savings = costValue - alternative.price;
              const savingsPercent = (savings / costValue) * 100;
              
              // Create Google search link instead of direct URL
              alternative.searchUrl = createGoogleSearchLink(alternative.name);
              
              setMessages([
                ...newMessages,
                { 
                  sender: "System", 
                  text: `Found a cheaper alternative: ${alternative.name} for $${alternative.price} at ${alternative.retailer}. You could save $${savings.toFixed(2)} (${savingsPercent.toFixed(1)}%).` 
                }
              ]);
            } else {
              setMessages([
                ...newMessages,
                { 
                  sender: "System", 
                  text: "No cheaper alternatives found for this item." 
                }
              ]);
            }
          } catch (error) {
            console.error("Error finding alternatives:", error);
            setMessages([
              ...newMessages,
              { 
                sender: "System", 
                text: "Couldn't search for alternatives at this time." 
              }
            ]);
          } finally {
            setFindingAlternatives(false);
          }
        }

        // Get recommendation from Gemini
        const recommendation = await getPurchaseRecommendation(
          recognizedItemName, 
          costValue, 
          purpose,
          frequency,
          financialProfile,
          alternative
        );
        
        // Create the final message with recommendation
        const mungerMessage = {
          sender: "Munger",
          text: recommendation.reasoning,
          formatted: {
            decision: recommendation.decision,
            reasoning: recommendation.reasoning
          }
        };
        
        // Add alternative to message if found
        if (recommendation.alternative) {
          // Ensure we're using the Google search URL instead of the direct product URL
          recommendation.alternative.searchUrl = createGoogleSearchLink(recommendation.alternative.name);
          mungerMessage.alternative = recommendation.alternative;
        }
        
        // Add the message to the list
        setMessages(prevMessages => {
          return [...prevMessages, mungerMessage];
        });

        // Reset fields except the recognized item name
        setItemCost("");
        setPurpose("");
        setFrequency("");
        setImageFile(null);
        setImagePreview(null);
      }
      
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...(messages || []),
        {
          sender: "Munger",
          text: "Sorry, I couldn't analyze this purchase right now. Technical error occurred: " + error.message,
          formatted: {
            decision: "Error",
            reasoning: "Technical error occurred: " + error.message
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Image Capture Section */}
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

        {/* Find Alternatives Option */}
        <div className="alternatives-option">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={searchForAlternative}
              onChange={(e) => setSearchForAlternative(e.target.checked)}
              disabled={loading}
              className="checkbox-input"
            />
            <span className="checkbox-text">Find cheaper alternatives online</span>
          </label>
        </div>

        <button 
          onClick={analyzePurchase} 
          disabled={loading || findingAlternatives} 
          className="should-i-buy-btn"
        >
          {loading ? (
            <span className="loading-text">
              <span className="loading-spinner"></span>
              Analyzing
            </span>
          ) : findingAlternatives ? (
            <span className="loading-text">
              <span className="loading-spinner"></span>
              Finding Alternatives
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
                      
                      {/* Display alternative product if available */}
                      {msg.alternative && (
                        <div className="alternative-product">
                          <h4>Cheaper Alternative Found:</h4>
                          <p><strong>{msg.alternative.name}</strong> - ${msg.alternative.price} at {msg.alternative.retailer}</p>
                          <p>
                            <a 
                              href={msg.alternative.searchUrl || createGoogleSearchLink(msg.alternative.name)} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="view-alternative-btn"
                            >
                              Search for Alternative
                            </a>
                          </p>
                        </div>
                      )}
                      
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
          
          {(loading || findingAlternatives) && (
            <div className="loading-message">
              <span className="loading-dots"></span>
              {loading ? "Analyzing your purchase..." : "Searching for alternatives..."}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>Based on Charlie Munger's investment principles and decision-making framework</p>
      </footer>
    </div>
  );
}

export default PurchaseAdvisor;
