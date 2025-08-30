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

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

removeLoadingSpinner();