import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'reflect-metadata'; // Add this import
import App from './App';
import './index.css';

// Initialize Firebase before rendering
import './lib/firebase';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);