import { LocalStorageCache } from '../LocalStorageCache';

describe('LocalStorageCache', () => {
  let cache: LocalStorageCache;

  beforeEach(() => {
    localStorage.clear();
    cache = new LocalStorageCache();
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

  it('should handle invalid JSON', async () => {
    localStorage.setItem('cache:key', 'invalid json');
    const value = await cache.get('key');
    expect(value).toBeNull();
  });

  it('should cleanup expired entries', async () => {
    await cache.set('key1', 'value1', 100);
    await cache.set('key2', 'value2');
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Trigger cleanup by setting a new value
    await cache.set('key3', 'value3');
    
    const value1 = await cache.get('key1');
    const value2 = await cache.get('key2');
    const value3 = await cache.get('key3');
    
    expect(value1).toBeNull();
    expect(value2).toBe('value2');
    expect(value3).toBe('value3');
  });

  it('should handle complex objects', async () => {
    const obj = { foo: 'bar', num: 42, arr: [1, 2, 3] };
    await cache.set('key', obj);
    const value = await cache.get('key');
    expect(value).toEqual(obj);
  });
});