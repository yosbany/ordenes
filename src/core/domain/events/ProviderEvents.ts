import { Provider } from '../entities';

export class ProviderCreatedEvent {
  constructor(public readonly provider: Provider) {}
}

export class ProviderUpdatedEvent {
  constructor(
    public readonly providerId: string,
    public readonly updates: Partial<Provider>
  ) {}
}

export class ProviderDeletedEvent {
  constructor(public readonly providerId: string) {}
}