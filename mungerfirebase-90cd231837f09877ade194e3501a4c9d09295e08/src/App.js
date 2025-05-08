import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PurchaseAdvisor from "./PurchaseAdvisor";
import FinancialProfile from "./FinancialProfile";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PurchaseAdvisor />} />
        <Route path="/profile" element={<FinancialProfile />} />
      </Routes>
      
      {/* Navigation Floating Button */}
      <div className="nav-container">
        <Routes>
          <Route 
            path="/" 
            element={
              <Link to="/profile" className="nav-button">
                <span className="nav-icon">👤</span>
                My Financial Profile
              </Link>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <Link to="/" className="nav-button">
                <span className="nav-icon">🛒</span>
                Purchase Advisor
              </Link>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
