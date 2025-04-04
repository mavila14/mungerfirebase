/* GENERAL RESET & BODY STYLES */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #334155;
  background: #f1f5f9;
  line-height: 1.6;
  overflow-x: hidden;
}

/* GLOBAL VARIABLES */
:root {
  --primary-color: #6366F1;        /* Indigo 500 */
  --primary-dark: #4f46e5;         /* Indigo 600 */
  --primary-hover: #4338ca;        /* Indigo 700 */
  --secondary-color: #3b82f6;      /* Blue 500 */
  --secondary-hover: #2563eb;      /* Blue 600 */
  --accent-color: #10b981;         /* Emerald 500 */
  --accent-hover: #059669;         /* Emerald 600 */
  --danger-color: #ef4444;         /* Red 500 */
  --success-color: #10b981;        /* Emerald 500 */
  --text-dark: #1e293b;            /* Slate 800 */
  --text-medium: #475569;          /* Slate 600 */
  --text-light: #64748b;           /* Slate 500 */
  --text-lighter: #94a3b8;         /* Slate 400 */
  --border-color: #e2e8f0;         /* Slate 200 */
  --background-light: #f8fafc;     /* Slate 50 */
  --background-card: #ffffff;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-focus: 0 0 0 3px rgba(99, 102, 241, 0.25);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
}

/* LAYOUT CONTAINER */
.App {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  padding: 0;
  position: relative;
}

/* TOP HEADER BAR */
.top-header {
  background-color: var(--background-card);
  width: 100%;
  padding: 16px 24px;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

.logo {
  color: var(--primary-color);
  margin: 0 auto;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: fadeIn 0.5s ease-out;
  max-width: 600px;
  width: 100%;
}

.logo-icon {
  font-size: 24px;
}

/* HERO SECTION STYLING */
.hero-section {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  padding: 100px 20px 60px;
  text-align: center;
  border-radius: 0;
  width: 100%;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.8s ease-out;
  margin-bottom: 0;
  box-shadow: var(--shadow-md);
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: white;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: slideInDown 0.7s ease-out;
  text-align: center;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto 30px auto;
  font-weight: 400;
  animation: slideInUp 0.7s ease-out 0.2s;
  animation-fill-mode: both;
  text-align: center;
}

/* PURCHASE FORM */
.purchase-form {
  background-color: var(--background-card);
  padding: 32px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 600px;
  width: calc(100% - 40px);
  margin: -40px auto 30px;
  position: relative;
  z-index: 5;
  animation: slideUp 0.6s ease-out forwards;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.form-title {
  font-size: 1.5rem;
  color: var(--text-dark);
  margin-bottom: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-medium);
  font-size: 0.95rem;
}

/* INPUT STYLING */
.input-field,
.select-field {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  font-size: 16px;
  background-color: var(--background-light);
  color: var(--text-dark);
  box-shadow: var(--shadow-sm);
}

.input-field:focus,
.select-field:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: var(--shadow-focus);
}

.input-field:hover,
.select-field:hover {
  border-color: var(--text-light);
}

.input-field:disabled,
.select-field:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: #f3f4f6;
}

input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.select-field {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
}

/* IMAGE CAPTURE SECTION */
.image-capture-section {
  margin: 30px 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--background-light);
  border: 1px dashed var(--border-color);
  padding: 20px;
  transition: all 0.3s ease;
}

.image-capture-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

.camera-btn,
.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 16px;
  width: 100%;
  max-width: 320px;
}

.camera-btn {
  background-color: var(--accent-color);
  color: white;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
}

.camera-btn:hover {
  background-color: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.3);
}

.camera-icon {
  font-size: 1.2rem;
}

.upload-btn {
  background-color: var(--background-card);
  color: var(--text-medium);
  border: 1px solid var(--border-color);
}

.upload-btn:hover {
  background-color: var(--background-light);
  color: var(--text-dark);
  border-color: var(--text-light);
  transform: translateY(-2px);
}

.or-divider {
  font-size: 0.9rem;
  color: var(--text-light);
  position: relative;
  width: 100%;
  text-align: center;
  max-width: 320px;
}

.or-divider::before,
.or-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 20px);
  height: 1px;
  background-color: var(--border-color);
}

.or-divider::before {
  left: 0;
}

.or-divider::after {
  right: 0;
}

.camera-container {
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.camera-preview {
  width: 100%;
  height: auto;
  max-height: 360px;
  object-fit: cover;
  display: block;
}

.camera-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.5);
  padding: 16px;
}

.capture-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: white;
  color: var(--text-dark);
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.capture-btn:hover {
  transform: scale(1.05);
  background-color: var(--accent-color);
  color: white;
}

.capture-icon {
  font-size: 1.5rem;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  backdrop-filter: blur(4px);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

.image-prev
