export const TYPES = {
  // Infrastructure
  Logger: Symbol.for('Logger'),

  // Repositories
  OrderRepository: Symbol.for('OrderRepository'),
  ProductRepository: Symbol.for('ProductRepository'),
  ProviderRepository: Symbol.for('ProviderRepository'),

  // Services
  AnalyticsService: Symbol.for('AnalyticsService'),

  // ViewModels
  DashboardViewModel: Symbol.for('DashboardViewModel'),
} as const;