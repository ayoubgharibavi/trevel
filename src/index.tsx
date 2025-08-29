

import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Changed import to a named import as App.tsx does not have a default export.
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import './assets/index.css'; // Import the main stylesheet

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);