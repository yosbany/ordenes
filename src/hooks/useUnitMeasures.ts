import { useState, useEffect } from 'react';
import { ref, onValue, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';

export function useUnitMeasures() {
  const [unitMeasures, setUnitMeasures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unitsRef = ref(db, 'unitMeasures');
    
    const unsubscribe = onValue(unitsRef, (snapshot) => {
      const data = snapshot.val();
      const units = data ? Object.values(data) as string[] : [];
      setUnitMeasures(['UNIDAD', ...units].sort());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addUnitMeasure = async (unit: string) => {
    const unitsRef = ref(db, 'unitMeasures');
    const newUnitRef = push(unitsRef);
    await set(newUnitRef, unit.toUpperCase());
  };

  return {
    unitMeasures,
    loading,
    addUnitMeasure
  };
}