import { useState, useEffect } from 'react';
import { 
  getWeeklyOrdersCount, 
  getTopProducts, 
  getProductFrequency,
  WeeklyOrdersCount,
  TopProduct,
  ProductFrequency
} from '@/lib/services/analytics';

export function useAnalytics() {
  const [weeklyOrders, setWeeklyOrders] = useState<WeeklyOrdersCount[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [productFrequency, setProductFrequency] = useState<ProductFrequency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [weekly, top, frequency] = await Promise.all([
          getWeeklyOrdersCount(),
          getTopProducts(),
          getProductFrequency()
        ]);

        if (!mounted) return;

        setWeeklyOrders(weekly);
        setTopProducts(top);
        setProductFrequency(frequency);
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
    weeklyOrders,
    topProducts,
    productFrequency,
    loading,
    error
  };
}