import { makeAutoObservable } from 'mobx';
import { Provider } from '@/core/domain/entities';
import { IProviderRepository } from '@/core/domain/repositories/IProviderRepository';
import { CreateProviderUseCase } from '@/core/application/useCases/providers/CreateProviderUseCase';
import { toast } from 'react-hot-toast';

export class ProviderViewModel {
  providers: Provider[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private providerRepository: IProviderRepository,
    private createProviderUseCase: CreateProviderUseCase
  ) {
    makeAutoObservable(this);
  }

  async loadProviders() {
    try {
      this.loading = true;
      this.error = null;
      const providers = await this.providerRepository.getAll();
      this.providers = providers;
    } catch (error) {
      this.error = 'Error al cargar los proveedores';
      toast.error(this.error);
    } finally {
      this.loading = false;
    }
  }

  async createProvider(provider: Omit<Provider, 'id'>) {
    try {
      this.error = null;
      const providerId = await this.createProviderUseCase.execute(provider);
      toast.success('Proveedor creado exitosamente');
      return providerId;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Error al crear el proveedor';
      toast.error(this.error);
      throw error;
    }
  }

  async updateProvider(id: string, updates: Partial<Provider>) {
    try {
      this.error = null;
      await this.providerRepository.update(id, updates);
      toast.success('Proveedor actualizado exitosamente');
    } catch (error) {
      this.error = 'Error al actualizar el proveedor';
      toast.error(this.error);
      throw error;
    }
  }

  async deleteProvider(id: string) {
    try {
      this.error = null;
      await this.providerRepository.delete(id);
      toast.success('Proveedor eliminado exitosamente');
    } catch (error) {
      this.error = 'Error al eliminar el proveedor';
      toast.error(this.error);
      throw error;
    }
  }
}