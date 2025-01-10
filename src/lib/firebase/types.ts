export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface ConfigValidationResult {
  isValid: boolean;
  missingVars: string[];
  config: FirebaseConfig | null;
}