import { ref, get, set, push, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from './index';
import { auth } from '@/lib/firebase/auth';
import { DatabaseError } from '../errors';

export async function createDocument<T>(path: string, data: T): Promise<string> {
  if (!auth.currentUser) {
    throw new DatabaseError('User not authenticated');
  }

  try {
    const collectionRef = ref(db, path);
    const newRef = push(collectionRef);
    if (!newRef.key) {
      throw new DatabaseError('Failed to generate document ID');
    }
    await set(newRef, data);
    return newRef.key;
  } catch (error) {
    throw new DatabaseError('Failed to create document', { cause: error });
  }
}

export async function updateDocument<T>(path: string, id: string, data: Partial<T>): Promise<void> {
  if (!auth.currentUser) {
    throw new DatabaseError('User not authenticated');
  }

  try {
    const docRef = ref(db, `${path}/${id}`);
    await set(docRef, data);
  } catch (error) {
    throw new DatabaseError('Failed to update document', { cause: error });
  }
}

export async function deleteDocument(path: string, id: string): Promise<void> {
  if (!auth.currentUser) {
    throw new DatabaseError('User not authenticated');
  }

  try {
    const docRef = ref(db, `${path}/${id}`);
    await remove(docRef);
  } catch (error) {
    throw new DatabaseError('Failed to delete document', { cause: error });
  }
}

export async function getDocument<T>(path: string, id: string): Promise<T | null> {
  if (!auth.currentUser) {
    throw new DatabaseError('User not authenticated');
  }

  try {
    const docRef = ref(db, `${path}/${id}`);
    const snapshot = await get(docRef);
    return snapshot.exists() ? { id: snapshot.key, ...snapshot.val() } as T : null;
  } catch (error) {
    throw new DatabaseError('Failed to get document', { cause: error });
  }
}

export async function getCollection<T>(path: string): Promise<T[]> {
  if (!auth.currentUser) {
    throw new DatabaseError('User not authenticated');
  }

  try {
    const collectionRef = ref(db, path);
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return [];
    
    return Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...(data as any)
    })) as T[];
  } catch (error) {
    throw new DatabaseError('Failed to get collection', { cause: error });
  }
}

export async function queryByField<T>(
  path: string,
  field: string,
  value: string | number | boolean
): Promise<T[]> {
  if (!auth.currentUser) {
    throw new DatabaseError('User not authenticated');
  }

  try {
    const collectionRef = ref(db, path);
    const queryRef = query(collectionRef, orderByChild(field), equalTo(value));
    const snapshot = await get(queryRef);
    
    if (!snapshot.exists()) return [];
    
    return Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...(data as any)
    })) as T[];
  } catch (error) {
    throw new DatabaseError('Failed to query documents', { cause: error });
  }
}