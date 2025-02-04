import { CompositeCache } from '../CompositeCache';
import { ICache } from '@/core/domain/cache/ICache';

class MockCache implements ICache {
  private store = new Map<string, any>();

  async get<T>(key: string): Promise<T | null> {
    return this.store.get(key) || null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async has(key: string): Promise<boolean> {
    return this.store.has(key);
  }
}

describe('CompositeCache', () => {
  let cache1: MockCache;
  let cache2: MockCache;
  let compositeCache: CompositeCache;

  beforeEach(() => {
    cache1 = new MockCache();
    cache2 = new MockCache();
    compositeCache = new CompositeCache([cache1, cache2]);
  });

  it('should get value from first cache that has it', async () => {
    await cache2.set('key', 'value');
    const value = await compositeCache.get('key');
    expect(value).toBe('value');
  });

  it('should propagate values to previous caches', async () => {
    await cache2.set('key', 'value');
    await compositeCache.get('key');
    
    const value1 = await cache1.get('key');
    expect(value1).toBe('value');
  });

  it('should set value in all caches', async () => {
    await compositeCache.set('key', 'value');
    
    const value1 = await cache1.get('key');
    const value2 = await cache2.get('key');
    
    expect(value1).toBe('value');
    expect(value2).toBe('value');
  });

  it('should delete value from all caches', async () => {
    await compositeCache.set('key', 'value');
    await compositeCache.delete('key');
    
    const value1 = await cache1.get('key');
    const value2 = await cache2.get('key');
    
    expect(value1).toBeNull();
    expect(value2).toBeNull();
  });

  it('should clear all caches', async () => {
    await compositeCache.set('key1', 'value1');
    await compositeCache.set('key2', 'value2');
    await compositeCache.clear();
    
    const hasKey1 = await compositeCache.has('key1');
    const hasKey2 = await compositeCache.has('key2');
    
    expect(hasKey1).toBe(false);
    expect(hasKey2).toBe(false);
  });

  it('should check if key exists in any cache', async () => {
    await cache2.set('key', 'value');
    const exists = await compositeCache.has('key');
    expect(exists).toBe(true);
  });

  it('should return false if key does not exist in any cache', async () => {
    const exists = await compositeCache.has('non-existent');
    expect(exists).toBe(false);
  });
});