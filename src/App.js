import React, { useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [purpose, setPurpose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // "chat" or "purchase"

  // Regular chat function (existing functionality)
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "You", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://us-central1-mungerfirebase.cloudfunctions.net/chatWithAI",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        }
      );

      const data = await res.json();
      setMessages([...newMessages, { sender: "AI", text: data.reply }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { sender: "AI", text: "Sorry, something went wrong 😞" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Purchase analysis function (new functionality)
  const analyzePurchase = async () => {
    if (!itemName.trim() || !itemCost.trim()) {
      alert("Please enter both item name and cost");
      return;
    }

    setLoading(true);

    // Create a message about the purchase analysis
    const purchaseMessage = `Should I buy: ${itemName} for $${itemCost}${
      purpose ? `, Purpose: ${purpose}` : ""
    }${frequency ? `, Frequency of use: ${frequency}` : ""}`;

    const newMessages = [
      ...messages,
      { sender: "You", text: purchaseMessage },
    ];
    setMessages(newMessages);

    try {
      // Format the message as if Charlie Munger were analyzing this purchase
      const analysisPrompt = `Act as Charlie Munger, Warren Buffett's business partner, and analyze this purchase decision: 
      Item: ${itemName}
      Cost: $${itemCost}
      ${purpose ? `Purpose: ${purpose}` : ""}
      ${frequency ? `Frequency of use: ${frequency}` : ""}
      
      Provide a clear "Buy" or "Don't Buy" recommendation based on principles of rational decision-making, opportunity cost, and long-term value. Explain your reasoning in 2-3 sentences.`;

      const res = await fetch(
        "https://us-central1-mungerfirebase.cloudfunctions.net/chatWithAI",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: analysisPrompt }),
        }
      );

      const data = await res.json();
      setMessages([...newMessages, { sender: "Munger", text: data.reply }]);

      // Reset input fields
      setItemName("");
      setItemCost("");
      setPurpose("");
      setFrequency("");
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          sender: "Munger",
          text: "Sorry, I couldn't analyze this purchase right now 😞",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && activeTab === "chat") sendMessage();
  };

  return (
    <div className="App">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-badge">Powered by Gemini 2.5 Pro</div>
        <h1 className="hero-title">MungerFirebase AI</h1>
        <p className="hero-subtitle">
          Get financial advice from AI trained on Charlie Munger's principles
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-container">
        <button 
          className={`tab ${activeTab === "chat" ? "active" : ""}`} 
          onClick={() => setActiveTab("chat")}>
          Chat
        </button>
        <button 
          className={`tab ${activeTab === "purchase" ? "active" : ""}`} 
          onClick={() => setActiveTab("purchase")}>
          Purchase Analysis
        </button>
      </div>

      {/* Main Content Based on Selected Tab */}
      {activeTab === "chat" ? (
        <>
          {/* Chat Window */}
          <div className="chat-window">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.sender.toLowerCase()}`}>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
            {loading && <div className="loading">Thinking...</div>}
          </div>

          {/* Chat Input */}
          <div className="input-area">
            <input
              type="text"
              value={input}
              placeholder="Type your question..."
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={sendMessage} disabled={loading}>
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>
        </>
      ) : (
        /* Purchase Analysis Form */
        <div className="purchase-form">
          <div className="form-group">
            <label>Item Name:</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="What are you considering buying?"
            />
          </div>
          <div className="form-group">
            <label>Cost ($):</label>
            <input
              type="number"
              value={itemCost}
              onChange={(e) => setItemCost(e.target.value)}
              placeholder="How much does it cost?"
            />
          </div>
          <div className="form-group">
            <label>Purpose (optional):</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="What will you use it for?"
            />
          </div>
          <div className="form-group">
            <label>Frequency of Use (optional):</label>
            <select 
              value={frequency} 
              onChange={(e) => setFrequency(e.target.value)}
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
      )}
    </div>
  );
}

export default App;