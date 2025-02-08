import { useState, useEffect } from 'react';
import { ref, onValue, push, set, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

interface UnitMeasure {
  id: string;
  name: string;
}

export function useUnitMeasures() {
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const measuresRef = ref(db, 'measures');
    
    const unsubscribe = onValue(measuresRef, (snapshot) => {
      try {
        if (!snapshot.exists()) {
          setUnitMeasures([]);
          setLoading(false);
          return;
        }

        const measures = Object.entries(snapshot.val()).map(([id, name]) => ({
          id,
          name: name as string
        }));

        setUnitMeasures([...measures].sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Error loading measures:', error);
        toast.error('Error al cargar las unidades de medida');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const addUnitMeasure = async (measure: string) => {
    try {
      const normalizedMeasure = measure.trim().toUpperCase();
      
      // Validate measure doesn't already exist
      if (unitMeasures.some(m => m.name === normalizedMeasure)) {
        toast.error('Esta unidad ya existe');
        return;
      }

      const measuresRef = ref(db, 'measures');
      const newMeasureRef = push(measuresRef);
      await set(newMeasureRef, normalizedMeasure);
      
      toast.success('Unidad agregada exitosamente');
    } catch (error) {
      console.error('Error adding measure:', error);
      toast.error('Error al agregar la unidad');
      throw error;
    }
  };

  const updateUnitMeasure = async (id: string, newName: string) => {
    try {
      const normalizedName = newName.trim().toUpperCase();
      
      // Validate new name doesn't already exist
      if (unitMeasures.some(m => m.name === normalizedName && m.id !== id)) {
        toast.error('Ya existe una unidad con este nombre');
        return;
      }

      const measureRef = ref(db, `measures/${id}`);
      await set(measureRef, normalizedName);
      
      toast.success('Unidad actualizada exitosamente');
    } catch (error) {
      console.error('Error updating measure:', error);
      toast.error('Error al actualizar la unidad');
      throw error;
    }
  };

  return {
    unitMeasures,
    loading,
    addUnitMeasure,
    updateUnitMeasure
  };
}