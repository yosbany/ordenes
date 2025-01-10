import { FirebaseConfig, ConfigValidationResult } from './types';
import { REQUIRED_ENV_VARS, DEMO_CONFIG } from './constants';

export function validateConfig(): ConfigValidationResult {
  const missingVars = REQUIRED_ENV_VARS.filter(key => !import.meta.env[key]);

  if (missingVars.length > 0) {
    return {
      isValid: false,
      missingVars,
      config: null
    };
  }

  const config: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  return {
    isValid: true,
    missingVars: [],
    config
  };
}

export function getDemoConfig(): FirebaseConfig {
  return { ...DEMO_CONFIG };
}