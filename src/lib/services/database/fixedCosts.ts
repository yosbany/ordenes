import { ref, push, get, query, orderByChild, equalTo, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase/auth';
import { MonthlyFixedCosts } from '@/types/recipe';
import { DatabaseError } from '../errors';

const COLLECTION = 'monthlyFixedCosts';

// Initialize collection if it doesn't exist
async function initializeCollection() {
  try {
    if (!auth.currentUser) {
      throw new DatabaseError('User not authenticated');
    }

    const collectionRef = ref(db, COLLECTION);
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) {
      await set(collectionRef, {});
    }
  } catch (error) {
    throw new DatabaseError('Failed to initialize fixed costs collection', { cause: error });
  }
}

export async function saveMonthlyFixedCosts(data: Omit<MonthlyFixedCosts, 'id'>): Promise<string> {
  try {
    if (!auth.currentUser) {
      throw new DatabaseError('User not authenticated');
    }

    await initializeCollection();
    
    // Check if there's already an entry for this month/year
    const existingCosts = await getMonthlyFixedCosts(data.month, data.year);
    
    if (existingCosts) {
      // Update existing entry
      const costsRef = ref(db, `${COLLECTION}/${existingCosts.id}`);
      await set(costsRef, {
        ...data,
        lastUpdated: Date.now()
      });
      return existingCosts.id;
    }

    // Create new entry
    const fixedCostsRef = ref(db, COLLECTION);
    const newRef = push(fixedCostsRef);
    
    if (!newRef.key) {
      throw new DatabaseError('Failed to generate document ID');
    }

    await set(newRef, {
      ...data,
      lastUpdated: Date.now()
    });

    return newRef.key;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to save monthly fixed costs', { cause: error });
  }
}

export async function getMonthlyFixedCosts(month: number, year: number): Promise<MonthlyFixedCosts | null> {
  try {
    if (!auth.currentUser) {
      throw new DatabaseError('User not authenticated');
    }

    await initializeCollection();
    
    const fixedCostsRef = ref(db, COLLECTION);
    const monthQuery = query(
      fixedCostsRef,
      orderByChild('month'),
      equalTo(month)
    );

    const snapshot = await get(monthQuery);
    if (!snapshot.exists()) return null;

    // Find entry for specified year
    const entries = Object.entries(snapshot.val());
    const entry = entries.find(([_, data]) => (data as MonthlyFixedCosts).year === year);

    if (!entry) return null;

    return {
      id: entry[0],
      ...(entry[1] as Omit<MonthlyFixedCosts, 'id'>)
    };
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to get monthly fixed costs', { cause: error });
  }
}

export async function getCurrentMonthFixedCosts(): Promise<MonthlyFixedCosts | null> {
  try {
    if (!auth.currentUser) {
      throw new DatabaseError('User not authenticated');
    }

    const now = new Date();
    return getMonthlyFixedCosts(now.getMonth() + 1, now.getFullYear());
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to get current month fixed costs', { cause: error });
  }
}

export async function getFixedCostsHistory(): Promise<MonthlyFixedCosts[]> {
  try {
    if (!auth.currentUser) {
      throw new DatabaseError('User not authenticated');
    }

    await initializeCollection();
    
    const fixedCostsRef = ref(db, COLLECTION);
    const snapshot = await get(fixedCostsRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    return Object.entries(snapshot.val())
      .map(([id, data]) => ({
        id,
        ...(data as Omit<MonthlyFixedCosts, 'id'>)
      }))
      .sort((a, b) => b.lastUpdated - a.lastUpdated);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to get fixed costs history', { cause: error });
  }
}