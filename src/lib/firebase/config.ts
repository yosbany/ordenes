import { initializeApp } from 'firebase/app';
import { validateConfig, getDemoConfig } from './validation';

const validation = validateConfig();
const config = validation.isValid ? validation.config! : getDemoConfig();

// Initialize Firebase
export const app = initializeApp(config);

// Log initialization mode
if (!validation.isValid) {
  console.warn(
    'Firebase initialized in demo mode. The following environment variables are missing:',
    validation.missingVars
  );
} else {
  console.info(`Firebase initialized in ${import.meta.env.MODE} mode`);
}

export const isDemoMode = !validation.isValid;