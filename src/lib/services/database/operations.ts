import { ref, get, set, push, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from './index';

export async function createDocument<T>(path: string, data: T): Promise<string> {
  const collectionRef = ref(db, path);
  const newRef = push(collectionRef);
  await set(newRef, data);
  return newRef.key!;
}

export async function updateDocument<T>(path: string, id: string, data: Partial<T>): Promise<void> {
  const docRef = ref(db, `${path}/${id}`);
  await set(docRef, data);
}

export async function deleteDocument(path: string, id: string): Promise<void> {
  const docRef = ref(db, `${path}/${id}`);
  await remove(docRef);
}

export async function getDocument<T>(path: string, id: string): Promise<T | null> {
  const docRef = ref(db, `${path}/${id}`);
  const snapshot = await get(docRef);
  return snapshot.exists() ? { id: snapshot.key, ...snapshot.val() } as T : null;
}

export async function getCollection<T>(path: string): Promise<T[]> {
  const collectionRef = ref(db, path);
  const snapshot = await get(collectionRef);
  if (!snapshot.exists()) return [];
  
  return Object.entries(snapshot.val()).map(([id, data]) => ({
    id,
    ...(data as any)
  })) as T[];
}

export async function queryByField<T>(
  path: string,
  field: string,
  value: string | number | boolean
): Promise<T[]> {
  const collectionRef = ref(db, path);
  const queryRef = query(collectionRef, orderByChild(field), equalTo(value));
  const snapshot = await get(queryRef);
  
  if (!snapshot.exists()) return [];
  
  return Object.entries(snapshot.val()).map(([id, data]) => ({
    id,
    ...(data as any)
  })) as T[];
}