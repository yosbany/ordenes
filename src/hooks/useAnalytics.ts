import { useState, useEffect } from 'react';
import { getAnalytics } from '@/lib/services/analytics';
import type { WeeklyOrdersCount, ProductStats } from '@/lib/services/analytics';

export function useAnalytics() {
  const [data, setData] = useState<{
    weeklyOrders: WeeklyOrdersCount[];
    topProducts: ProductStats[];
    totalProducts: number;
    totalProviders: number;
  }>({
    weeklyOrders: [],
    topProducts: [],
    totalProducts: 0,
    totalProviders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const analyticsData = await getAnalytics();

        if (!mounted) return;

        setData(analyticsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        if (!mounted) return;
        setError('Error al cargar los datos analíticos');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    ...data,
    loading,
    error
  };
}