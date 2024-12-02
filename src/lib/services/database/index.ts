import { ref, get, set, push, remove, query, orderByChild, equalTo, onValue } from 'firebase/database';
import db from '@/lib/firebase/database';

export { db };

// Re-export all database operations
export * from './operations';
export * from './collections';
export * from './subscriptions';