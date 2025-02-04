import { Provider } from '@/core/domain/entities';
import { IProviderRepository } from '@/core/domain/repositories/IProviderRepository';
import { ProviderValidator } from '@/core/domain/validators/ProviderValidator';

export class CreateProviderUseCase {
  constructor(private providerRepository: IProviderRepository) {}

  async execute(provider: Omit<Provider, 'id'>): Promise<string> {
    // Validate provider
    const validationError = ProviderValidator.validate(provider);
    if (validationError) {
      throw validationError;
    }

    // Create provider
    return await this.providerRepository.create(provider);
  }
}