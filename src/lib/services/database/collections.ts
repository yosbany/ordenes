import { ref, get, set } from 'firebase/database';
import { db } from './index';

const COLLECTIONS = ['orders', 'products', 'providers', 'packaging'] as const;
type Collection = typeof COLLECTIONS[number];

interface CollectionStatus {
  name: Collection;
  exists: boolean;
  error?: string;
}

async function checkCollection(collection: Collection): Promise<CollectionStatus> {
  try {
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
  const collectionRef = ref(db, collection);
  await set(collectionRef, {});
}

export async function initializeCollections(): Promise<void> {
  try {
    console.log('Starting collections initialization...');
    
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
          console.log(`Collection "${name}" created successfully`);
        } catch (error) {
          console.error(`Failed to create collection "${name}":`, error);
        }
      });

    await Promise.all(createPromises);
    console.log('Collections initialization completed');
  } catch (error) {
    console.error('Failed to initialize collections:', error);
    throw error;
  }
}

// Initialize collections when the module is imported
initializeCollections().catch(error => {
  console.error('Critical error during collections initialization:', error);
});