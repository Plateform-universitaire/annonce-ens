// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import MainApp from './MainApp';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found. Please ensure there is a <div id="root"> in your index.html.');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <MainApp />
    </React.StrictMode>
  );
}