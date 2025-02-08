import { ref, push, get, update, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { UnitConversion } from '@/types';
import { DatabaseError } from '../errors';

const COLLECTION = 'unitConversions';

export async function addUnitConversion(conversion: Omit<UnitConversion, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const conversionsRef = ref(db, COLLECTION);
    const newConversionRef = push(conversionsRef);
    
    if (!newConversionRef.key) {
      throw new DatabaseError('Failed to generate conversion ID');
    }

    const timestamp = Date.now();
    await update(newConversionRef, {
      ...conversion,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    return newConversionRef.key;
  } catch (error) {
    throw new DatabaseError('Failed to add unit conversion', { cause: error });
  }
}

export async function getUnitConversions(): Promise<UnitConversion[]> {
  try {
    const conversionsRef = ref(db, COLLECTION);
    const snapshot = await get(conversionsRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    return Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...(data as Omit<UnitConversion, 'id'>)
    }));
  } catch (error) {
    throw new DatabaseError('Failed to get unit conversions', { cause: error });
  }
}

export async function updateUnitConversion(id: string, updates: Partial<Omit<UnitConversion, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  try {
    const conversionRef = ref(db, `${COLLECTION}/${id}`);
    await update(conversionRef, {
      ...updates,
      updatedAt: Date.now()
    });
  } catch (error) {
    throw new DatabaseError('Failed to update unit conversion', { cause: error });
  }
}

export async function deleteUnitConversion(id: string): Promise<void> {
  try {
    const conversionRef = ref(db, `${COLLECTION}/${id}`);
    await remove(conversionRef);
  } catch (error) {
    throw new DatabaseError('Failed to delete unit conversion', { cause: error });
  }
}