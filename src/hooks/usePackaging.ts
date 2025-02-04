import { useState, useEffect } from 'react';
import { ref, onValue, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';

export function usePackaging() {
  const [packagingTypes, setPackagingTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const packagingRef = ref(db, 'packaging');
    
    const unsubscribe = onValue(packagingRef, (snapshot) => {
      const data = snapshot.val();
      const types = data ? Object.values(data) as string[] : [];
      setPackagingTypes(['UNIDAD', ...types].sort());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addPackaging = async (packaging: string) => {
    const packagingRef = ref(db, 'packaging');
    const newPackagingRef = push(packagingRef);
    await set(newPackagingRef, packaging.toUpperCase());
  };

  return {
    packagingTypes,
    loading,
    addPackaging
  };
}