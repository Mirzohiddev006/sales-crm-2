import api from "@/lib/api";
import { DashboardResponse } from "@/types/api";

// This is the structure SalesListPage expects
export interface DashboardStats {
  today_total_amount: number;
  today_book_sales: { count: number; amount: number };
  today_pdf_sales: { count: number; amount: number };
  today_conversations_users: number;
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardResponse> {
    const response = await api.get<DashboardResponse>("/dashboard");
    return response.data;
  },

  // This method will fetch the full dashboard data and transform it for SalesListPage
  async getTodayStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardResponse>("/dashboard");
    const todayData = response.data.today;

    return {
      today_total_amount: todayData.income_sum,
      today_book_sales: {
        count: todayData.book_sales,
        amount: 0, // API does not provide this breakdown, assuming 0
      },
      today_pdf_sales: {
        count: todayData.pdf_sales,
        amount: 0, // API does not provide this breakdown, assuming 0
      },
      today_conversations_users: todayData.messages_count,
    };
  },
};