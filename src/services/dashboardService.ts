import api from '@/lib/api';
import { DashboardResponse } from '@/types/api';

export const dashboardService = {
  async getDashboardData(): Promise<DashboardResponse> {
    const response = await api.get<DashboardResponse>('/dashboard');
    return response.data;
  },
};
