import api from "@/lib/api";
import { Plan as PlanResponse, PlanCreate } from "@/types/api";

export const plansService = {
  async getAllPlans(): Promise<PlanResponse[]> {
    const response = await api.get("/plans");

    let plans: any[] = [];

    if (response.data && Array.isArray(response.data.items)) {
      plans = response.data.items;
    } else if (Array.isArray(response.data)) {
      plans = response.data;
    }

    return plans.map((plan) => ({
      ...plan,
      pdf: plan.pdf || { new_pdf_total: 0, old_pdf_total: 0, pdf_total: 0 },
      book: plan.book || { new_book_total: 0, old_book_total: 0, book_total: 0 },
    }));
  },

  async createPlan(data: PlanCreate): Promise<PlanResponse> {
    const response = await api.post<PlanResponse>("/plans", data);
    return response.data;
  },

  async deletePlan(planId: number): Promise<void> {
    await api.delete(`/plans/${planId}`);
  },

  async exportPlanExcel(planId: number): Promise<void> {
    const response = await api.get(`/plans/${planId}/export-excel`, {
      responseType: "blob", // Important for file downloads
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    const contentDisposition = response.headers["content-disposition"];
    let filename = `plan-${planId}-export.xlsx`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch.length === 2) {
        filename = filenameMatch[1];
      }
    }
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};