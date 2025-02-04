import { Provider } from '../entities';

export interface IProviderRepository {
  getAll(): Promise<Provider[]>;
  getById(id: string): Promise<Provider | null>;
  create(provider: Omit<Provider, 'id'>): Promise<string>;
  update(id: string, provider: Partial<Provider>): Promise<void>;
  delete(id: string): Promise<void>;
  subscribeToProviders(callback: (providers: Provider[]) => void): () => void;
}