import { useState, useEffect } from 'react';
import { MonthlyFixedCosts } from '@/types/recipe';
import { 
  saveMonthlyFixedCosts, 
  getCurrentMonthFixedCosts,
  getFixedCostsHistory 
} from '@/lib/services/database/fixedCosts';
import { toast } from 'react-hot-toast';

export function useFixedCosts() {
  const [currentCosts, setCurrentCosts] = useState<MonthlyFixedCosts | null>(null);
  const [history, setHistory] = useState<MonthlyFixedCosts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load current month's costs and history in parallel
      const [costs, historyData] = await Promise.all([
        getCurrentMonthFixedCosts(),
        getFixedCostsHistory()
      ]);
      
      setCurrentCosts(costs);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading fixed costs:', error);
      setError('Error al cargar los costos fijos');
    } finally {
      setLoading(false);
    }
  };

  const updateFixedCosts = async (data: Omit<MonthlyFixedCosts, 'id'>) => {
    try {
      setError(null);
      await saveMonthlyFixedCosts(data);
      await loadData(); // Reload both current costs and history
      toast.success('Costos fijos actualizados exitosamente');
    } catch (error) {
      console.error('Error updating fixed costs:', error);
      setError('Error al actualizar los costos fijos');
      throw error;
    }
  };

  return {
    currentCosts,
    history,
    loading,
    error,
    updateFixedCosts,
    loadData
  };
}