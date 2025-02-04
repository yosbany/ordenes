import { ref, get, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';

const STANDARD_MEASURES = [
  'UNIDAD',
  'KILOGRAMO',
  'GRAMO',
  'LITRO',
  'CENTÍMETRO',
  'MILILITRO',
  'BOLSA',
  'PLANCHA',
  'CAJON',
  'CAJA',
  'FRACO',
  'BOTELLA',
  'FUNDA',
  'SACHET',
  'ATADO',
  'ROLLO'
].sort();

export async function initializeMeasures(): Promise<void> {
  try {
    // Get reference to measures collection
    const measuresRef = ref(db, 'measures');
    
    // Get current measures
    const snapshot = await get(measuresRef);
    const existingMeasures = snapshot.exists() 
      ? Object.values(snapshot.val()) as string[]
      : [];

    // Filter out measures that already exist (case insensitive)
    const existingMeasuresUpper = existingMeasures.map(m => m.toUpperCase());
    const measuresToAdd = STANDARD_MEASURES.filter(
      measure => !existingMeasuresUpper.includes(measure.toUpperCase())
    );

    // Add new measures
    for (const measure of measuresToAdd) {
      const newMeasureRef = push(measuresRef);
      await set(newMeasureRef, measure);
    }

    console.info(`Initialized ${measuresToAdd.length} standard measures`);
  } catch (error) {
    console.error('Error initializing measures:', error);
  }
}