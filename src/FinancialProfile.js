import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./FinancialProfile.css";

function FinancialProfile() {
  // State for all form fields
  const [formData, setFormData] = useState({
    // Income
    monthlyIncome: "",
    incomeFrequency: "monthly",
    otherIncomeSources: "",
    
    // Expenses
    housingCost: "",
    utilitiesCost: "",
    foodCost: "",
    transportationCost: "",
    insuranceCost: "",
    subscriptionsCost: "",
    otherExpenses: "",
    
    // Debt
    creditCardDebt: "",
    creditCardPayment: "",
    studentLoanDebt: "",
    studentLoanPayment: "",
    carLoanDebt: "",
    carLoanPayment: "",
    mortgageDebt: "",
    mortgagePayment: "",
    otherDebt: "",
    otherDebtPayment: "",
    
    // Credit
    creditScore: "",
    creditLimit: "",
    currentCreditBalance: "",
    
    // Savings
    checkingSavingsBalance: "",
    emergencyFund: "",
    
    // Investments
    retirementAccounts: "",
    stocksAndBonds: "",
    realEstateValue: "",
    otherInvestments: "",
    
    // Goals
    shortTermGoals: "",
    midTermGoals: "",
    longTermGoals: "",
    
    // Purchase Timing
    purchaseTimeframe: "now",
    
    // Risk
    riskTolerance: "moderate",
    financialPriorities: ""
  });

  // State for tracking which sections are expanded/collapsed
  const [expandedSections, setExpandedSections] = useState({
    income: true,
    expenses: false,
    debt: false,
    credit: false,
    savings: false,
    investments: false,
    goals: false,
    timing: false,
    risk: false
  });
  
  // State for summary metrics
  const [summary, setSummary] = useState({
    monthlyNetIncome: 0,
    debtToIncomeRatio: 0,
    creditUtilization: 0,
    netWorth: 0,
    emergencyFundMonths: 0,
    hasSummary: false
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate summary metrics
  const calculateSummary = () => {
    // Convert strings to numbers
    const income = parseFloat(formData.monthlyIncome) || 0;
    const adjustedIncome = formData.incomeFrequency === "annual" ? income / 12 : income;
    const otherIncome = parseFloat(formData.otherIncomeSources) || 0;
    const totalMonthlyIncome = adjustedIncome + otherIncome;
    
    // Calculate total monthly expenses
    const expenses = [
      parseFloat(formData.housingCost) || 0,
      parseFloat(formData.utilitiesCost) || 0,
      parseFloat(formData.foodCost) || 0,
      parseFloat(formData.transportationCost) || 0,
      parseFloat(formData.insuranceCost) || 0,
      parseFloat(formData.subscriptionsCost) || 0,
      parseFloat(formData.otherExpenses) || 0
    ].reduce((sum, value) => sum + value, 0);
    
    // Calculate monthly debt payments
    const debtPayments = [
      parseFloat(formData.creditCardPayment) || 0,
      parseFloat(formData.studentLoanPayment) || 0,
      parseFloat(formData.carLoanPayment) || 0,
      parseFloat(formData.mortgagePayment) || 0,
      parseFloat(formData.otherDebtPayment) || 0
    ].reduce((sum, value) => sum + value, 0);
    
    // Calculate total debt
    const totalDebt = [
      parseFloat(formData.creditCardDebt) || 0,
      parseFloat(formData.studentLoanDebt) || 0,
      parseFloat(formData.carLoanDebt) || 0,
      parseFloat(formData.mortgageDebt) || 0,
      parseFloat(formData.otherDebt) || 0
    ].reduce((sum, value) => sum + value, 0);
    
    // Calculate debt-to-income ratio
    const debtToIncomeRatio = totalMonthlyIncome > 0 ? (debtPayments / totalMonthlyIncome) * 100 : 0;
    
    // Calculate credit utilization
    const creditLimit = parseFloat(formData.creditLimit) || 0;
    const creditBalance = parseFloat(formData.currentCreditBalance) || 0;
    const creditUtilization = creditLimit > 0 ? (creditBalance / creditLimit) * 100 : 0;
    
    // Calculate net worth
    const assets = [
      parseFloat(formData.checkingSavingsBalance) || 0,
      parseFloat(formData.emergencyFund) || 0,
      parseFloat(formData.retirementAccounts) || 0,
      parseFloat(formData.stocksAndBonds) || 0,
      parseFloat(formData.realEstateValue) || 0,
      parseFloat(formData.otherInvestments) || 0
    ].reduce((sum, value) => sum + value, 0);
    
    const netWorth = assets - totalDebt;
    
    // Calculate emergency fund coverage (in months)
    const monthlyExpensesWithDebt = expenses + debtPayments;
    const emergencyFund = parseFloat(formData.emergencyFund) || 0;
    const emergencyFundMonths = monthlyExpensesWithDebt > 0 ? emergencyFund / monthlyExpensesWithDebt : 0;
    
    // Calculate monthly net income
    const monthlyNetIncome = totalMonthlyIncome - expenses - debtPayments;
    
    setSummary({
      monthlyNetIncome,
      debtToIncomeRatio,
      creditUtilization,
      netWorth,
      emergencyFundMonths,
      hasSummary: true
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    calculateSummary();
    
    // Save to localStorage for use on the purchase advisor page
    localStorage.setItem('financialProfile', JSON.stringify({
      ...formData,
      summary
    }));
  };

  // Reset form data
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all financial information?")) {
      setFormData({
        // Income
        monthlyIncome: "",
        incomeFrequency: "monthly",
        otherIncomeSources: "",
        
        // Expenses
        housingCost: "",
        utilitiesCost: "",
        foodCost: "",
        transportationCost: "",
        insuranceCost: "",
        subscriptionsCost: "",
        otherExpenses: "",
        
        // Debt
        creditCardDebt: "",
        creditCardPayment: "",
        studentLoanDebt: "",
        studentLoanPayment: "",
        carLoanDebt: "",
        carLoanPayment: "",
        mortgageDebt: "",
        mortgagePayment: "",
        otherDebt: "",
        otherDebtPayment: "",
        
        // Credit
        creditScore: "",
        creditLimit: "",
        currentCreditBalance: "",
        
        // Savings
        checkingSavingsBalance: "",
        emergencyFund: "",
        
        // Investments
        retirementAccounts: "",
        stocksAndBonds: "",
        realEstateValue: "",
        otherInvestments: "",
        
        // Goals
        shortTermGoals: "",
        midTermGoals: "",
        longTermGoals: "",
        
        // Purchase Timing
        purchaseTimeframe: "now",
        
        // Risk
        riskTolerance: "moderate",
        financialPriorities: ""
      });
      setSummary({
        monthlyNetIncome: 0,
        debtToIncomeRatio: 0,
        creditUtilization: 0,
        netWorth: 0,
        emergencyFundMonths: 0,
        hasSummary: false
      });
      localStorage.removeItem('financialProfile');
    }
  };

  return (
    <div className="App">
      {/* Header Bar */}
      <header className="top-header">
        <div className="logo">
          <span className="logo-icon">💰</span>
          Munger Financial Profile
        </div>
      </header>

      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">Your Financial Snapshot</h1>
        <p className="hero-subtitle">
          Complete your financial profile to get more accurate purchase advice
        </p>
      </div>

      <div className="profile-container">
        {/* Financial Summary Card (shows after form is submitted) */}
        {summary.hasSummary && (
          <div className="summary-card">
            <h2 className="summary-title">
              <span className="summary-icon">📊</span>
              Financial Summary
            </h2>
            
            <div className="summary-grid">
              <div className="summary-item">
                <h3>Monthly Net Income</h3>
                <p className={`summary-value ${summary.monthlyNetIncome >= 0 ? 'positive' : 'negative'}`}>
                  ${summary.monthlyNetIncome.toFixed(2)}
                </p>
                <p className="summary-description">
                  {summary.monthlyNetIncome > 0 
                    ? "You have positive cash flow each month" 
                    : "Your expenses exceed your income"}
                </p>
              </div>
              
              <div className="summary-item">
                <h3>Debt-to-Income Ratio</h3>
                <p className={`summary-value ${summary.debtToIncomeRatio < 36 ? 'positive' : summary.debtToIncomeRatio < 43 ? 'warning' : 'negative'}`}>
                  {summary.debtToIncomeRatio.toFixed(1)}%
                </p>
                <p className="summary-description">
                  {summary.debtToIncomeRatio < 36 
                    ? "Healthy (below 36%)" 
                    : summary.debtToIncomeRatio < 43 
                    ? "Caution (36-43%)" 
                    : "High risk (above 43%)"}
                </p>
              </div>
              
              <div className="summary-item">
                <h3>Credit Utilization</h3>
                <p className={`summary-value ${summary.creditUtilization < 30 ? 'positive' : summary.creditUtilization < 50 ? 'warning' : 'negative'}`}>
                  {summary.creditUtilization.toFixed(1)}%
                </p>
                <p className="summary-description">
                  {summary.creditUtilization < 30 
                    ? "Good (below 30%)" 
                    : summary.creditUtilization < 50 
                    ? "Moderate (30-50%)" 
                    : "High (above 50%)"}
                </p>
              </div>
              
              <div className="summary-item">
                <h3>Net Worth</h3>
                <p className={`summary-value ${summary.netWorth >= 0 ? 'positive' : 'negative'}`}>
                  ${summary.netWorth.toFixed(2)}
                </p>
                <p className="summary-description">
                  {summary.netWorth > 0 
                    ? "Your assets exceed your debts" 
                    : "Your debts exceed your assets"}
                </p>
              </div>
              
              <div className="summary-item">
                <h3>Emergency Fund</h3>
                <p className={`summary-value ${summary.emergencyFundMonths >= 3 ? 'positive' : summary.emergencyFundMonths >= 1 ? 'warning' : 'negative'}`}>
                  {summary.emergencyFundMonths.toFixed(1)} months
                </p>
                <p className="summary-description">
                  {summary.emergencyFundMonths >= 6 
                    ? "Excellent (6+ months)" 
                    : summary.emergencyFundMonths >= 3 
                    ? "Good (3-6 months)" 
                    : summary.emergencyFundMonths >= 1 
                    ? "Minimal (1-3 months)" 
                    : "Insufficient (< 1 month)"}
                </p>
              </div>
            </div>
            
            <div className="summary-actions">
              <Link to="/" className="action-button primary">
                Get Purchase Advice
              </Link>
              <button 
                type="button" 
                onClick={handleReset} 
                className="action-button secondary"
              >
                Reset Information
              </button>
            </div>
          </div>
        )}

        <form className="financial-form" onSubmit={handleSubmit}>
          {/* Income Section */}
          <div className="form-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('income')}
            >
              <h2>
                <span className="section-icon">💵</span>
                Income
              </h2>
              <span className="toggle-icon">
                {expandedSections.income ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedSections.income && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your total earnings provide the foundation for financial decisions.</p>
                </div>
                
                <div className="input-group">
                  <div className="form-group">
                    <label htmlFor="monthlyIncome">Income Amount:</label>
                    <input
                      type="number"
                      id="monthlyIncome"
                      name="monthlyIncome"
                      value={formData.monthlyIncome}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="incomeFrequency">Frequency:</label>
                    <select
                      id="incomeFrequency"
                      name="incomeFrequency"
                      value={formData.incomeFrequency}
                      onChange={handleInputChange}
                      className="select-field"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="otherIncomeSources">Other Monthly Income (rentals, side gigs, etc.):</label>
                  <input
                    type="number"
                    id="otherIncomeSources"
                    name="otherIncomeSources"
                    value={formData.otherIncomeSources}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    className="input-field"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Expenses Section */}
          <div className="form-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('expenses')}
            >
              <h2>
                <span className="section-icon">📋</span>
                Monthly Expenses
              </h2>
              <span className="toggle-icon">
                {expandedSections.expenses ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedSections.expenses && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your regular monthly obligations determine your baseline financial needs.</p>
                </div>
                
                <div className="expenses-grid">
                  <div className="form-group">
                    <label htmlFor="housingCost">Housing (rent/mortgage):</label>
                    <input
                      type="number"
                      id="housingCost"
                      name="housingCost"
                      value={formData.housingCost}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="utilitiesCost">Utilities:</label>
                    <input
                      type="number"
                      id="utilitiesCost"
                      name="utilitiesCost"
                      value={formData.utilitiesCost}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="foodCost">Groceries & Dining:</label>
                    <input
                      type="number"
                      id="foodCost"
                      name="foodCost"
                      value={formData.foodCost}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="transportationCost">Transportation:</label>
                    <input
                      type="number"
                      id="transportationCost"
                      name="transportationCost"
                      value={formData.transportationCost}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="insuranceCost">Insurance:</label>
                    <input
                      type="number"
                      id="insuranceCost"
                      name="insuranceCost"
                      value={formData.insuranceCost}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subscriptionsCost">Subscriptions:</label>
                    <input
                      type="number"
                      id="subscriptionsCost"
                      name="subscriptionsCost"
                      value={formData.subscriptionsCost}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="otherExpenses">Other Monthly Expenses:</label>
                  <input
                    type="number"
                    id="otherExpenses"
                    name="otherExpenses"
                    value={formData.otherExpenses}
                    onChange={handleInputChange}
                    placeholder="$"
                    className="input-field"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Debt Section */}
          <div className="form-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('debt')}
            >
              <h2>
                <span className="section-icon">🔄</span>
                Debt Obligations
              </h2>
              <span className="toggle-icon">
                {expandedSections.debt ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedSections.debt && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your debt levels and monthly payments impact your ability to take on new purchases.</p>
                </div>
                
                <div className="debt-entry">
                  <h3>Credit Cards</h3>
                  <div className="input-group">
                    <div className="form-group">
                      <label htmlFor="creditCardDebt">Total Balance:</label>
                      <input
                        type="number"
                        id="creditCardDebt"
                        name="creditCardDebt"
                        value={formData.creditCardDebt}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="creditCardPayment">Monthly Payment:</label>
                      <input
                        type="number"
                        id="creditCardPayment"
                        name="creditCardPayment"
                        value={formData.creditCardPayment}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="debt-entry">
                  <h3>Student Loans</h3>
                  <div className="input-group">
                    <div className="form-group">
                      <label htmlFor="studentLoanDebt">Total Balance:</label>
                      <input
                        type="number"
                        id="studentLoanDebt"
                        name="studentLoanDebt"
                        value={formData.studentLoanDebt}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="studentLoanPayment">Monthly Payment:</label>
                      <input
                        type="number"
                        id="studentLoanPayment"
                        name="studentLoanPayment"
                        value={formData.studentLoanPayment}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="debt-entry">
                  <h3>Car Loan</h3>
                  <div className="input-group">
                    <div className="form-group">
                      <label htmlFor="carLoanDebt">Total Balance:</label>
                      <input
                        type="number"
                        id="carLoanDebt"
                        name="carLoanDebt"
                        value={formData.carLoanDebt}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="carLoanPayment">Monthly Payment:</label>
                      <input
                        type="number"
                        id="carLoanPayment"
                        name="carLoanPayment"
                        value={formData.carLoanPayment}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="debt-entry">
                  <h3>Mortgage</h3>
                  <div className="input-group">
                    <div className="form-group">
                      <label htmlFor="mortgageDebt">Total Balance:</label>
                      <input
                        type="number"
                        id="mortgageDebt"
                        name="mortgageDebt"
                        value={formData.mortgageDebt}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="mortgagePayment">Monthly Payment:</label>
                      <input
                        type="number"
                        id="mortgagePayment"
                        name="mortgagePayment"
                        value={formData.mortgagePayment}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="debt-entry">
                  <h3>Other Debts</h3>
                  <div className="input-group">
                    <div className="form-group">
                      <label htmlFor="otherDebt">Total Balance:</label>
                      <input
                        type="number"
                        id="otherDebt"
                        name="otherDebt"
                        value={formData.otherDebt}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="otherDebtPayment">Monthly Payment:</label>
                      <input
                        type="number"
                        id="otherDebtPayment"
                        name="otherDebtPayment"
                        value={formData.otherDebtPayment}
                        onChange={handleInputChange}
                        placeholder="$"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Credit Section */}
          <div className="form-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('credit')}
            >
              <h2>
                <span className="section-icon">💳</span>
                Credit Profile
              </h2>
              <span className="toggle-icon">
                {expandedSections.credit ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedSections.credit && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your credit health affects the cost of financing and borrowing capacity.</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="creditScore">Credit Score:</label>
                  <input
                    type="number"
                    id="creditScore"
                    name="creditScore"
                    value={formData.creditScore}
                    onChange={handleInputChange}
                    placeholder="300-850"
                    min="300"
                    max="850"
                    className="input-field"
                  />
                </div>
                
                <div className="input-group">
                  <div className="form-group">
                    <label htmlFor="creditLimit">Total Credit Limit:</label>
                    <input
                      type="number"
                      id="creditLimit"
                      name="creditLimit"
                      value={formData.creditLimit}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="currentCreditBalance">Current Balance:</label>
                    <input
                      type="number"
                      id="currentCreditBalance"
                      name="currentCreditBalance"
                      value={formData.currentCreditBalance}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Savings Section */}
          <div className="form-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('savings')}
            >
              <h2>
                <span className="section-icon">🏦</span>
                Savings
              </h2>
              <span className="toggle-icon">
                {expandedSections.savings ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedSections.savings && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your liquid assets provide a safety net and flexibility for discretionary purchases.</p>
                </div>
                
                <div className="input-group">
                  <div className="form-group">
                    <label htmlFor="checkingSavingsBalance">Checking/Savings Balance:</label>
                    <input
                      type="number"
                      id="checkingSavingsBalance"
                      name="checkingSavingsBalance"
                      value={formData.checkingSavingsBalance}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="emergencyFund">Emergency Fund:</label>
                    <input
                      type="number"
                      id="emergencyFund"
                      name="emergencyFund"
                      value={formData.emergencyFund}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Investments Section */}
          <div className="form-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('investments')}
            >
              <h2>
                <span className="section-icon">📈</span>
                Investment Portfolio
              </h2>
              <span className="toggle-icon">
                {expandedSections.investments ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedSections.investments && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your long-term assets contribute to wealth building and financial security.</p>
                </div>
                
                <div className="input-group">
                  <div className="form-group">
                    <label htmlFor="retirementAccounts">Retirement Accounts (401k, IRA):</label>
                    <input
                      type="number"
                      id="retirementAccounts"
                      name="retirementAccounts"
                      value={formData.retirementAccounts}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="stocksAndBonds">Stocks, Bonds, Mutual Funds:</label>
                    <input
                      type="number"
                      id="stocksAndBonds"
                      name="stocksAndBonds"
                      value={formData.stocksAndBonds}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div className="input-group">
                  <div className="form-group">
                    <label htmlFor="realEstateValue">Real Estate Value (excluding primary home):</label>
                    <input
                      type="number"
                      id="realEstateValue"
                      name="realEstateValue"
                      value={formData.realEstateValue}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="otherInvestments">Other Investments:</label>
                    <input
                      type="number"
                      id="otherInvestments"
                      name="otherInvestments"
                      value={formData.otherInvestments}
                      onChange={handleInputChange}
                      placeholder="$"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Financial Goals Section */}
          <div className="form-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('goals')}
            >
              <h2>
                <span className="section-icon">🎯</span>
                Financial Goals
              </h2>
              <span className="toggle-icon">
                {expandedSections.goals ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedSections.goals && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your financial goals shape spending priorities and define good purchase decisions.</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="shortTermGoals">Short-Term Goals (1 year):</label>
                  <textarea
                    id="shortTermGoals"
                    name="shortTermGoals"
                    value={formData.shortTermGoals}
                    onChange={handleInputChange}
                    placeholder="e.g., Pay off credit card, save for vacation"
                    className="textarea-field"
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label htmlFor="midTermGoals">Mid-Term Goals (1-5 years):</label>
                  <textarea
                    id="midTermGoals"
                    name="midTermGoals"
                    value={formData.midTermGoals}
                    onChange={handleInputChange}
                    placeholder="e.g., Save for home down payment, start a business"
                    className="textarea-field"
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label htmlFor="longTermGoals">Long-Term Goals (5+ years):</label>
                  <textarea
                    id="longTermGoals"
                    name="longTermGoals"
                    value={formData.longTermGoals}
                    onChange={handleInputChange}
                    placeholder="e.g., Retirement, college fund for children"
                    className="textarea-field"
                  ></textarea>
                </div>
              </div>
            )}
          </div>
          
          {/* Purchase Timing Section */}
          <div className="form-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('timing')}
            >
              <h2>
                <span className="section-icon">⏱️</span>
                Purchase Timing
              </h2>
              <span className="toggle-icon">
                {expandedSections.timing ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedSections.timing && (
              <div className="section-content">
                <div className="section-description">
                  <p>The urgency of a purchase affects its financial impact and alternative options.</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="purchaseTimeframe">When do you typically need to make purchase decisions?</label>
                  <select
                    id="purchaseTimeframe"
                    name="purchaseTimeframe"
                    value={formData.purchaseTimeframe}
                    onChange={handleInputChange}
                    className="select-field"
                  >
                    <option value="now">Immediately (within days)</option>
                    <option value="soon">Soon (within weeks)</option>
                    <option value="planned">Planned (within months)</option>
                    <option value="future">Future (can wait if needed)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* Risk Tolerance Section */}
          <div className="form-section">
            <div 
              className="section-header" 
              onClick={() => toggleSection('risk')}
            >
              <h2>
                <span className="section-icon">⚖️</span>
                Risk Tolerance & Preferences
              </h2>
              <span className="toggle-icon">
                {expandedSections.risk ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedSections.risk && (
              <div className="section-content">
                <div className="section-description">
                  <p>Your comfort with uncertainty and personal values affect purchase satisfaction.</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="riskTolerance">Your financial risk tolerance:</label>
                  <select
                    id="riskTolerance"
                    name="riskTolerance"
                    value={formData.riskTolerance}
                    onChange={handleInputChange}
                    className="select-field"
                  >
                    <option value="conservative">Conservative - I avoid financial risks</option>
                    <option value="moderate">Moderate - I can accept some risks</option>
                    <option value="aggressive">Aggressive - I'm comfortable with financial risks</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="financialPriorities">Your financial priorities and values:</label>
                  <textarea
                    id="financialPriorities"
                    name="financialPriorities"
                    value={formData.financialPriorities}
                    onChange={handleInputChange}
                    placeholder="e.g., Experiences over possessions, security over luxury, etc."
                    className="textarea-field"
                  ></textarea>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-button">
              Calculate Financial Health
            </button>
            <button 
              type="button" 
              onClick={handleReset} 
              className="reset-button"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p>Based on Charlie Munger's principles of financial rationality and opportunity cost</p>
      </footer>
    </div>
  );
}

export default FinancialProfile;
