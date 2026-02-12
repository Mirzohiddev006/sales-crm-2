import api from "@/lib/api";
import { PlanListItem, PlanDetail, PlanCreateUpdate } from "@/types/api";

export const plansService = {
  // Rejalar ro'yxati (Faqat ID, oy va lead qaytadi)
  async getAllPlans(): Promise<PlanListItem[]> {
    const response = await api.get<PlanListItem[]>("/plans");
    // Agar API wrapping (masalan { items: [] }) ishlatsa, shunga moslab o'zgartiring.
    // Hozirgi Swaggeringizga ko'ra to'g'ridan-to'g'ri Array qaytmoqda.
    return response.data;
  },

  // Reja tafsilotlari (To'liq statistika bilan)
  async getPlanById(planId: number): Promise<PlanDetail> {
    const response = await api.get<PlanDetail>(`/plans/${planId}`);
    return response.data;
  },

  // Yangi reja yaratish
  async createPlan(data: PlanCreateUpdate): Promise<any> {
    const response = await api.post("/plans", data);
    return response.data;
  },

  // Rejani tahrirlash (PATCH)
  async updatePlan(planId: number, data: PlanCreateUpdate): Promise<any> {
    const response = await api.patch(`/plans/${planId}`, data);
    return response.data;
  },

  // Rejani o'chirish
  async deletePlan(planId: number): Promise<void> {
    await api.delete(`/plans/${planId}`);
  },

  // Excel yuklash
  async exportPlanExcel(planId: number): Promise<void> {
    const response = await api.get(`/plans/${planId}/export-excel`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `plan-${planId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};