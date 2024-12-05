import { getDatabase } from 'firebase/database';
import { app } from './config';

// Initialize Firebase Realtime Database
export const db = getDatabase(app);

// Export database instance as default
export default db;