import { ref, get, set } from 'firebase/database';
import { db } from './index';
import { auth } from '@/lib/firebase/auth';

const COLLECTIONS = [
  'orders', 
  'products', 
  'providers', 
  'measures',
  'monthlyFixedCosts',
  'unitConversions'
] as const;

type Collection = typeof COLLECTIONS[number];

interface CollectionStatus {
  name: Collection;
  exists: boolean;
  error?: string;
}

async function checkCollection(collection: Collection): Promise<CollectionStatus> {
  try {
    // Only check collections if user is authenticated
    if (!auth.currentUser) {
      return {
        name: collection,
        exists: false
      };
    }

    const collectionRef = ref(db, collection);
    const snapshot = await get(collectionRef);
    
    return {
      name: collection,
      exists: snapshot.exists()
    };
  } catch (error) {
    return {
      name: collection,
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function createCollection(collection: Collection): Promise<void> {
  // Only create collections if user is authenticated
  if (!auth.currentUser) {
    console.warn(`Skipping collection creation for "${collection}" - user not authenticated`);
    return;
  }

  const collectionRef = ref(db, collection);
  await set(collectionRef, {});
}

export async function initializeCollections(): Promise<void> {
  try {
    // Skip initialization if user is not authenticated
    if (!auth.currentUser) {
      console.info('Skipping collections initialization - user not authenticated');
      return;
    }

    console.info('Starting collections initialization...');
    
    // Check all collections first
    const statuses = await Promise.all(
      COLLECTIONS.map(collection => checkCollection(collection))
    );

    // Create missing collections
    const createPromises = statuses
      .filter(status => !status.exists)
      .map(async ({ name }) => {
        try {
          await createCollection(name);
          console.info(`Collection "${name}" created successfully`);
        } catch (error) {
          // Log error but don't throw to allow other collections to be created
          console.error(`Failed to create collection "${name}":`, error);
        }
      });

    await Promise.all(createPromises);

    console.info('Collections initialization completed');
  } catch (error) {
    console.error('Failed to initialize collections:', error);
    // Don't throw error to prevent app from crashing
  }
}

// Initialize collections when user signs in
auth.onAuthStateChanged((user) => {
  if (user) {
    initializeCollections().catch(error => {
      console.error('Critical error during collections initialization:', error);
    });
  }
});