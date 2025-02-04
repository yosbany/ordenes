import { FirebaseProviderRepository } from '../FirebaseProviderRepository';
import { Provider } from '@/core/domain/entities';
import { ref, get, set, remove } from 'firebase/database';
import { db } from '@/lib/firebase';

describe('FirebaseProviderRepository', () => {
  let repository: FirebaseProviderRepository;
  const COLLECTION = 'providers';

  const mockProvider: Omit<Provider, 'id'> = {
    commercialName: 'Test Provider',
    legalName: 'Test Legal Name',
    rut: '123456789012',
    phone: '93609319',
    deliveryDays: ['monday'],
    orderDays: ['monday']
  };

  beforeEach(async () => {
    repository = new FirebaseProviderRepository();
    // Clear test data
    await remove(ref(db, COLLECTION));
  });

  afterEach(async () => {
    // Cleanup
    await remove(ref(db, COLLECTION));
  });

  describe('getAll', () => {
    it('should return empty array when no providers exist', async () => {
      const providers = await repository.getAll();
      expect(providers).toEqual([]);
    });

    it('should return all providers', async () => {
      const providersRef = ref(db, COLLECTION);
      await set(providersRef, {
        'provider-1': { ...mockProvider },
        'provider-2': { ...mockProvider }
      });

      const providers = await repository.getAll();
      expect(providers).toHaveLength(2);
      expect(providers[0]).toHaveProperty('id');
      expect(providers[0].commercialName).toBe(mockProvider.commercialName);
    });
  });

  describe('getById', () => {
    it('should return null for non-existent provider', async () => {
      const provider = await repository.getById('non-existent');
      expect(provider).toBeNull();
    });

    it('should return provider by id', async () => {
      const providerId = 'test-provider';
      const providerRef = ref(db, `${COLLECTION}/${providerId}`);
      await set(providerRef, mockProvider);

      const provider = await repository.getById(providerId);
      expect(provider).not.toBeNull();
      expect(provider?.id).toBe(providerId);
      expect(provider?.commercialName).toBe(mockProvider.commercialName);
    });
  });

  describe('create', () => {
    it('should create new provider', async () => {
      const providerId = await repository.create(mockProvider);
      expect(providerId).toBeTruthy();

      const providerRef = ref(db, `${COLLECTION}/${providerId}`);
      const snapshot = await get(providerRef);
      expect(snapshot.exists()).toBe(true);
      expect(snapshot.val()).toEqual(mockProvider);
    });

    it('should handle optional fields', async () => {
      const minimalProvider = {
        commercialName: 'Test Provider'
      };

      const providerId = await repository.create(minimalProvider);
      const providerRef = ref(db, `${COLLECTION}/${providerId}`);
      const snapshot = await get(providerRef);
      
      expect(snapshot.exists()).toBe(true);
      expect(snapshot.val().commercialName).toBe(minimalProvider.commercialName);
      expect(snapshot.val().legalName).toBeUndefined();
      expect(snapshot.val().rut).toBeUndefined();
      expect(snapshot.val().phone).toBeUndefined();
      expect(snapshot.val().deliveryDays).toBeUndefined();
      expect(snapshot.val().orderDays).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update existing provider', async () => {
      const providerId = 'test-provider';
      const providerRef = ref(db, `${COLLECTION}/${providerId}`);
      await set(providerRef, mockProvider);

      const updates = { 
        commercialName: 'Updated Name',
        phone: '98765432'
      };
      await repository.update(providerId, updates);

      const snapshot = await get(providerRef);
      expect(snapshot.val().commercialName).toBe(updates.commercialName);
      expect(snapshot.val().phone).toBe(updates.phone);
      // Other fields should remain unchanged
      expect(snapshot.val().legalName).toBe(mockProvider.legalName);
    });

    it('should throw error for non-existent provider', async () => {
      await expect(
        repository.update('non-existent', { commercialName: 'New Name' })
      ).rejects.toThrow();
    });

    it('should handle array updates', async () => {
      const providerId = 'test-provider';
      const providerRef = ref(db, `${COLLECTION}/${providerId}`);
      await set(providerRef, mockProvider);

      const updates = {
        deliveryDays: ['tuesday', 'wednesday'],
        orderDays: ['monday', 'friday']
      };
      await repository.update(providerId, updates);

      const snapshot = await get(providerRef);
      expect(snapshot.val().deliveryDays).toEqual(updates.deliveryDays);
      expect(snapshot.val().orderDays).toEqual(updates.orderDays);
    });
  });

  describe('delete', () => {
    it('should delete existing provider', async () => {
      const providerId = 'test-provider';
      const providerRef = ref(db, `${COLLECTION}/${providerId}`);
      await set(providerRef, mockProvider);

      await repository.delete(providerId);

      const snapshot = await get(providerRef);
      expect(snapshot.exists()).toBe(false);
    });

    it('should not throw error when deleting non-existent provider', async () => {
      await expect(repository.delete('non-existent')).resolves.not.toThrow();
    });
  });

  describe('subscribeToProviders', () => {
    it('should call callback with initial data', (done) => {
      const callback = (providers: Provider[]) => {
        expect(providers).toEqual([]);
        unsubscribe();
        done();
      };

      const unsubscribe = repository.subscribeToProviders(callback);
    });

    it('should call callback when data changes', (done) => {
      let callCount = 0;
      
      const callback = (providers: Provider[]) => {
        callCount++;
        
        if (callCount === 1) {
          // Initial empty data
          expect(providers).toEqual([]);
          
          // Add test data
          const providersRef = ref(db, COLLECTION);
          set(providersRef, {
            'provider-1': mockProvider
          });
        }
        
        if (callCount === 2) {
          // Data after change
          expect(providers).toHaveLength(1);
          expect(providers[0].commercialName).toBe(mockProvider.commercialName);
          unsubscribe();
          done();
        }
      };

      const unsubscribe = repository.subscribeToProviders(callback);
    });

    it('should handle multiple data changes', (done) => {
      let callCount = 0;
      
      const callback = async (providers: Provider[]) => {
        callCount++;
        
        if (callCount === 1) {
          // Initial empty data
          expect(providers).toEqual([]);
          
          // Add first provider
          const providersRef = ref(db, COLLECTION);
          await set(providersRef, {
            'provider-1': mockProvider
          });
        }
        
        if (callCount === 2) {
          // Data after first change
          expect(providers).toHaveLength(1);
          
          // Add second provider
          const providersRef = ref(db, COLLECTION);
          await set(providersRef, {
            'provider-1': mockProvider,
            'provider-2': { ...mockProvider, commercialName: 'Second Provider' }
          });
        }
        
        if (callCount === 3) {
          // Data after second change
          expect(providers).toHaveLength(2);
          expect(providers[1].commercialName).toBe('Second Provider');
          unsubscribe();
          done();
        }
      };

      const unsubscribe = repository.subscribeToProviders(callback);
    });
  });
});