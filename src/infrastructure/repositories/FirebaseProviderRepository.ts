import { ref, push, update, remove, onValue, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Provider } from '@/core/domain/entities';
import { IProviderRepository } from '@/core/domain/repositories/IProviderRepository';
import { DatabaseError } from '@/core/domain/errors';

export class FirebaseProviderRepository implements IProviderRepository {
  private readonly COLLECTION = 'providers';

  async getAll(): Promise<Provider[]> {
    try {
      const providersRef = ref(db, this.COLLECTION);
      const snapshot = await get(providersRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      return Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...(data as Omit<Provider, 'id'>)
      }));
    } catch (error) {
      throw new DatabaseError('Failed to fetch providers', { cause: error });
    }
  }

  async getById(id: string): Promise<Provider | null> {
    try {
      const providerRef = ref(db, `${this.COLLECTION}/${id}`);
      const snapshot = await get(providerRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return {
        id,
        ...snapshot.val()
      } as Provider;
    } catch (error) {
      throw new DatabaseError('Failed to fetch provider', { cause: error });
    }
  }

  async create(provider: Omit<Provider, 'id'>): Promise<string> {
    try {
      const providersRef = ref(db, this.COLLECTION);
      const newProviderRef = push(providersRef);
      
      if (!newProviderRef.key) {
        throw new DatabaseError('Failed to generate provider ID');
      }

      await update(newProviderRef, provider);
      return newProviderRef.key;
    } catch (error) {
      throw new DatabaseError('Failed to create provider', { cause: error });
    }
  }

  async update(id: string, updates: Partial<Provider>): Promise<void> {
    try {
      const providerRef = ref(db, `${this.COLLECTION}/${id}`);
      await update(providerRef, updates);
    } catch (error) {
      throw new DatabaseError('Failed to update provider', { cause: error });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const providerRef = ref(db, `${this.COLLECTION}/${id}`);
      await remove(providerRef);
    } catch (error) {
      throw new DatabaseError('Failed to delete provider', { cause: error });
    }
  }

  subscribeToProviders(callback: (providers: Provider[]) => void): () => void {
    const providersRef = ref(db, this.COLLECTION);

    const unsubscribe = onValue(providersRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const providers = Object.entries(snapshot.val())
        .map(([id, data]) => ({
          id,
          ...(data as Omit<Provider, 'id'>)
        }));

      callback(providers);
    });

    return unsubscribe;
  }
}