import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Infrastructure
import { ILogger } from '@/core/domain/logging/ILogger';
import { ConsoleLogger } from '@/infrastructure/logging/ConsoleLogger';

// Repositories
import { IOrderRepository } from '@/core/domain/repositories/IOrderRepository';
import { IProductRepository } from '@/core/domain/repositories/IProductRepository';
import { IProviderRepository } from '@/core/domain/repositories/IProviderRepository';
import { FirebaseOrderRepository } from '@/infrastructure/repositories/FirebaseOrderRepository';
import { FirebaseProductRepository } from '@/infrastructure/repositories/FirebaseProductRepository';
import { FirebaseProviderRepository } from '@/infrastructure/repositories/FirebaseProviderRepository';

// Services
import { AnalyticsService } from '@/core/application/services/AnalyticsService';

// ViewModels
import { DashboardViewModel } from '@/presentation/viewModels/DashboardViewModel';

const container = new Container();

// Infrastructure
container.bind<ILogger>(TYPES.Logger).to(ConsoleLogger).inSingletonScope();

// Repositories
container.bind<IOrderRepository>(TYPES.OrderRepository)
  .to(FirebaseOrderRepository)
  .inSingletonScope();

container.bind<IProductRepository>(TYPES.ProductRepository)
  .to(FirebaseProductRepository)
  .inSingletonScope();

container.bind<IProviderRepository>(TYPES.ProviderRepository)
  .to(FirebaseProviderRepository)
  .inSingletonScope();

// Services
container.bind<AnalyticsService>(TYPES.AnalyticsService)
  .toDynamicValue((context) => {
    const orderRepo = context.container.get<IOrderRepository>(TYPES.OrderRepository);
    const productRepo = context.container.get<IProductRepository>(TYPES.ProductRepository);
    const providerRepo = context.container.get<IProviderRepository>(TYPES.ProviderRepository);
    const logger = context.container.get<ILogger>(TYPES.Logger);
    return new AnalyticsService(orderRepo, productRepo, providerRepo, logger);
  })
  .inSingletonScope();

// ViewModels
container.bind<DashboardViewModel>(TYPES.DashboardViewModel)
  .toDynamicValue((context) => {
    const analyticsService = context.container.get<AnalyticsService>(TYPES.AnalyticsService);
    const logger = context.container.get<ILogger>(TYPES.Logger);
    return new DashboardViewModel(analyticsService, logger);
  })
  .inSingletonScope();

export { container };