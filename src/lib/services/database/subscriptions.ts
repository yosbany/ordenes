import { ref, onValue } from 'firebase/database';
import { db } from './index';

export function subscribeToCollection<T>(
  path: string,
  callback: (data: T[]) => void
): () => void {
  const collectionRef = ref(db, path);
  
  const unsubscribe = onValue(collectionRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const data = Object.entries(snapshot.val()).map(([id, value]) => ({
      id,
      ...(value as any)
    })) as T[];
    
    callback(data);
  });

  return unsubscribe;
}

export function subscribeToDocument<T>(
  path: string,
  id: string,
  callback: (data: T | null) => void
): () => void {
  const docRef = ref(db, `${path}/${id}`);
  
  const unsubscribe = onValue(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    
    callback({ id: snapshot.key, ...snapshot.val() } as T);
  });

  return unsubscribe;
}