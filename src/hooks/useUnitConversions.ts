import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { UnitConversion } from '@/types';
import { addUnitConversion, updateUnitConversion, deleteUnitConversion } from '@/lib/services/database/unitConversions';

export function useUnitConversions() {
  const [conversions, setConversions] = useState<UnitConversion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const conversionsRef = ref(db, 'unitConversions');
    
    const unsubscribe = onValue(conversionsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setConversions([]);
        setLoading(false);
        return;
      }

      const conversionsData = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...(data as Omit<UnitConversion, 'id'>)
      }));

      setConversions(conversionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addConversion = async (conversion: Omit<UnitConversion, 'id' | 'createdAt' | 'updatedAt'>) => {
    return addUnitConversion(conversion);
  };

  const updateConversion = async (id: string, updates: Partial<Omit<UnitConversion, 'id' | 'createdAt' | 'updatedAt'>>) => {
    return updateUnitConversion(id, updates);
  };

  const deleteConversion = async (id: string) => {
    return deleteUnitConversion(id);
  };

  return {
    conversions,
    loading,
    addConversion,
    updateConversion,
    deleteConversion
  };
}