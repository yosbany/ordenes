import { container } from '../di/container';
import { DashboardViewModel } from '../viewModels/DashboardViewModel';
import { TYPES } from '../di/types';

export function useDashboardViewModel(): DashboardViewModel {
  return container.get<DashboardViewModel>(TYPES.DashboardViewModel);
}