import { useState, useEffect } from 'react';
import { ref, onValue, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';

export function useMeasures() {
  const [measures, setMeasures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const measuresRef = ref(db, 'measures');
    
    const unsubscribe = onValue(measuresRef, (snapshot) => {
      const data = snapshot.val();
      const units = data ? Object.values(data) as string[] : [];
      // Sort measures alphabetically
      setMeasures([...units].sort());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addMeasure = async (measure: string) => {
    const measuresRef = ref(db, 'measures');
    const newMeasureRef = push(measuresRef);
    await set(newMeasureRef, measure.toUpperCase());
  };

  return {
    measures,
    loading,
    addMeasure
  };
}