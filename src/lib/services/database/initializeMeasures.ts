import { ref, get, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase/auth';

const STANDARD_MEASURES = [
  'UNIDAD',
  'KILOGRAMO',
  'GRAMO',
  'FUNDA X 4',
  'FUNDA X 6', 
  'FUNDA X 12'
].sort();

export async function initializeMeasures(): Promise<void> {
  try {
    // Skip if not authenticated
    if (!auth.currentUser) {
      console.warn('Skipping measures initialization - user not authenticated');
      return;
    }

    console.info('Initializing standard measures...');

    // Get reference to measures collection
    const measuresRef = ref(db, 'measures');
    
    // Get current measures
    const snapshot = await get(measuresRef);
    
    // If collection doesn't exist, create it with initial data
    if (!snapshot.exists()) {
      console.info('Measures collection does not exist, creating with standard measures...');
      const initialData = STANDARD_MEASURES.reduce((acc, measure) => {
        acc[push(measuresRef).key!] = measure;
        return acc;
      }, {} as Record<string, string>);
      
      await set(measuresRef, initialData);
      console.info('Standard measures initialized successfully');
      return;
    }

    // Get existing measures
    const existingMeasures = Object.values(snapshot.val()) as string[];
    const existingMeasuresUpper = existingMeasures.map(m => m.toUpperCase());

    // Add missing standard measures
    const measuresToAdd = STANDARD_MEASURES.filter(
      measure => !existingMeasuresUpper.includes(measure)
    );

    if (measuresToAdd.length > 0) {
      console.info(`Adding ${measuresToAdd.length} missing standard measures...`);
      
      for (const measure of measuresToAdd) {
        const newMeasureRef = push(measuresRef);
        await set(newMeasureRef, measure);
      }
      
      console.info('Missing standard measures added successfully');
    } else {
      console.info('All standard measures already exist');
    }
  } catch (error) {
    console.error('Error initializing measures:', error);
    throw error;
  }
}

// Initialize measures when module is loaded
if (auth.currentUser) {
  initializeMeasures().catch(console.error);
}

// Also initialize when auth state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    initializeMeasures().catch(console.error);
  }
});