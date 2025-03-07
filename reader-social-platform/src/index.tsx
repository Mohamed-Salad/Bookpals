/**
 * Application Entry Point
 * This is where React mounts our app to the DOM
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

// Import global styles
import './styles/globals.css';

// Import our main App component
import App from './App';

// Create a root element for React to render into
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render our app wrapped in StrictMode for development checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
