export const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
] as const;

export const DEMO_CONFIG = {
  apiKey: "demo-mode-key",
  authDomain: "demo-mode.firebaseapp.com",
  databaseURL: "https://demo-mode.firebaseio.com",
  projectId: "demo-mode",
  storageBucket: "demo-mode.appspot.com",
  messagingSenderId: "000000000000",
  appId: "demo-mode-app-id"
} as const;