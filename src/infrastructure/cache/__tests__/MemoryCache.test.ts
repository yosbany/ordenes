import { MemoryCache } from '../MemoryCache';

describe('MemoryCache', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache();
  });

  it('should store and retrieve values', async () => {
    await cache.set('key', 'value');
    const value = await cache.get('key');
    expect(value).toBe('value');
  });

  it('should return null for non-existent keys', async () => {
    const value = await cache.get('non-existent');
    expect(value).toBeNull();
  });

  it('should respect TTL', async () => {
    await cache.set('key', 'value', 100); // 100ms TTL
    
    let value = await cache.get('key');
    expect(value).toBe('value');
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    value = await cache.get('key');
    expect(value).toBeNull();
  });

  it('should delete values', async () => {
    await cache.set('key', 'value');
    await cache.delete('key');
    const value = await cache.get('key');
    expect(value).toBeNull();
  });

  it('should clear all values', async () => {
    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');
    await cache.clear();
    
    const value1 = await cache.get('key1');
    const value2 = await cache.get('key2');
    
    expect(value1).toBeNull();
    expect(value2).toBeNull();
  });

  it('should check if key exists', async () => {
    await cache.set('key', 'value');
    
    let exists = await cache.has('key');
    expect(exists).toBe(true);
    
    exists = await cache.has('non-existent');
    expect(exists).toBe(false);
  });

  it('should handle expired keys in has check', async () => {
    await cache.set('key', 'value', 100);
    
    let exists = await cache.has('key');
    expect(exists).toBe(true);
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    exists = await cache.has('key');
    expect(exists).toBe(false);
  });
});