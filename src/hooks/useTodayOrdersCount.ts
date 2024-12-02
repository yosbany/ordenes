import { useState, useEffect, useCallback } from 'react';
import { Provider } from '@/types';
import { getTodayOrdersCount } from '@/lib/services/orders';

export function useTodayOrdersCount(providers: Provider[]) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTodayOrders = useCallback(async () => {
    if (!providers.length) {
      setCount(0);
      setLoading(false);
      return;
    }

    const validProviders = providers.filter(provider => provider.id);
    if (!validProviders.length) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      const counts = await Promise.all(
        validProviders.map(provider => getTodayOrdersCount(provider.id!))
      );
      
      setCount(counts.reduce((sum, count) => sum + count, 0));
    } catch (error) {
      console.error('Error fetching today orders count:', error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [providers]);

  useEffect(() => {
    let mounted = true;

    const execute = async () => {
      if (!mounted) return;
      await fetchTodayOrders();
    };

    execute();

    return () => {
      mounted = false;
    };
  }, [fetchTodayOrders]);

  return { count, loading };
}