import { useState, useEffect } from 'react';
import { ref, push, update, remove, onValue, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Provider } from '@/types';

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const providersRef = ref(db, 'providers');
    const unsubscribe = onValue(providersRef, (snapshot) => {
      const data = snapshot.val();
      const providersList = data ? Object.entries(data).map(([id, provider]) => ({
        id,
        ...(provider as Omit<Provider, 'id'>)
      })) : [];
      setProviders(providersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProvider = async (provider: Omit<Provider, 'id'>) => {
    const providersRef = ref(db, 'providers');
    await push(providersRef, provider);
  };

  const updateProvider = async (id: string, provider: Partial<Provider>) => {
    const providerRef = ref(db, `providers/${id}`);
    await update(providerRef, provider);
  };

  const deleteProvider = async (id: string) => {
    const providerRef = ref(db, `providers/${id}`);
    await remove(providerRef);
  };

  const getProvider = async (id: string) => {
    const providerRef = ref(db, `providers/${id}`);
    const snapshot = await get(providerRef);
    if (snapshot.exists()) {
      return { id, ...snapshot.val() } as Provider;
    }
    return null;
  };

  return {
    providers,
    loading,
    addProvider,
    updateProvider,
    deleteProvider,
    getProvider
  };
}