import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Remove loading spinner once React loads
const removeLoadingSpinner = () => {
  const loadingElement = document.querySelector('.loading');
  if (loadingElement) {
    loadingElement.remove();
  }
};

// Performance optimization: Use requestIdleCallback if available
const renderApp = () => {
  const root = createRoot(document.getElementById('root'));
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  removeLoadingSpinner();
};

// Render immediately for better perceived performance
if (window.requestIdleCallback) {
  window.requestIdleCallback(renderApp, { timeout: 100 });
} else {
  // Fallback for browsers that don't support requestIdleCallback
  setTimeout(renderApp, 0);
}
