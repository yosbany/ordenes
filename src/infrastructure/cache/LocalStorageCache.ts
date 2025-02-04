import { ICache } from '@/core/domain/cache/ICache';

interface CacheEntry<T> {
  value: T;
  expiresAt?: number;
}

export class LocalStorageCache implements ICache {
  private prefix = 'cache:';

  private getKey(key: string): string {
    return this.prefix + key;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    if (!entry.expiresAt) return false;
    return Date.now() > entry.expiresAt;
  }

  private cleanup(): void {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        try {
          const entry = JSON.parse(localStorage.getItem(key)!) as CacheEntry<any>;
          if (this.isExpired(entry)) {
            localStorage.removeItem(key);
          }
        } catch {
          // Invalid JSON, remove the entry
          localStorage.removeItem(key);
        }
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const storageKey = this.getKey(key);
    const data = localStorage.getItem(storageKey);
    
    if (!data) return null;
    
    try {
      const entry = JSON.parse(data) as CacheEntry<T>;
      
      if (this.isExpired(entry)) {
        localStorage.removeItem(storageKey);
        return null;
      }
      
      return entry.value;
    } catch {
      localStorage.removeItem(storageKey);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      expiresAt: ttl ? Date.now() + ttl : undefined
    };
    
    localStorage.setItem(this.getKey(key), JSON.stringify(entry));
    this.cleanup();
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.getKey(key));
  }

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    }
  }

  async has(key: string): Promise<boolean> {
    const storageKey = this.getKey(key);
    const data = localStorage.getItem(storageKey);
    
    if (!data) return false;
    
    try {
      const entry = JSON.parse(data) as CacheEntry<any>;
      if (this.isExpired(entry)) {
        localStorage.removeItem(storageKey);
        return false;
      }
      return true;
    } catch {
      localStorage.removeItem(storageKey);
      return false;
    }
  }
}