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
  apiKey: "AIzaSyCswObxYzO5gjurKWnAI387lzoEXJjn24k",
  authDomain: "nrd-ordenes.firebaseapp.com",
  databaseURL: "https://nrd-ordenes-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nrd-ordenes",
  storageBucket: "nrd-ordenes.firebasestorage.app",
  messagingSenderId: "158356819364",
  appId: "1:158356819364:web:c9a87a35706babd4608531"
} as const;