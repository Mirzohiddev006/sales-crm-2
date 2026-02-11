import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Target, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Calendar, 
  BookOpen, 
  FileText 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";

import { plansService } from "@/services/plansService";
import { Plan as PlanResponse, PlanCreate } from "@/types/api";

const initialFormState: PlanCreate = {
  month: "",
  total_lead: 0,
  pdf: { new_pdf_total: 0, old_pdf_total: 0, pdf_total: 0 },
  book: { new_book_total: 0, old_book_total: 0, book_total: 0 }
};

export function PlansPage() {
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PlanCreate>(initialFormState);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const data = await plansService.getAllPlans();
      setPlans(data);
    } catch (error) {
      toast.error("Rejalarni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleExport = async (planId: number) => {
    try {
      toast.info("Excel fayl tayyorlanmoqda...");
      await plansService.exportPlanExcel(planId);
      toast.success("Excel fayl yuklab olindi");
    } catch (error) {
      toast.error("Eksport qilishda xatolik yuz berdi");
    }
  };

  const handleDelete = async (planId: number) => {
    if (!confirm("Haqiqatan ham ushbu rejani o'chirmoqchimisiz?")) return;
    try {
      await plansService.deletePlan(planId);
      toast.success("Reja o'chirildi");
      fetchPlans();
    } catch (error) {
      toast.error("O'chirishda xatolik");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // Auto-calculate totals before submitting
      const finalData = {
        ...formData,
        pdf: {
          ...formData.pdf,
          pdf_total: Number(formData.pdf.new_pdf_total) + Number(formData.pdf.old_pdf_total)
        },
        book: {
          ...formData.book,
          book_total: Number(formData.book.new_book_total) + Number(formData.book.old_book_total)
        }
      };

      await plansService.createPlan(finalData);
      toast.success("Yangi reja yaratildi");
      setIsDialogOpen(false);
      setFormData(initialFormState);
      fetchPlans();
    } catch (error) {
      toast.error("Saqlashda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading fullScreen text="Rejalar yuklanmoqda..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        <PageHeader
          title="Oylik Rejalar"
          description="Savdo maqsadlari va rejalarni boshqarish"
          action={{
            label: "Yangi reja",
            onClick: () => setIsDialogOpen(true),
            icon: <Plus className="mr-2 h-4 w-4" />,
          }}
        />

        {plans.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Rejalar yo'q"
            description="Hozircha oylik savdo rejalari kiritilmagan"
            action={{
              label: "Reja qo'shish",
              onClick: () => setIsDialogOpen(true),
            }}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="relative overflow-hidden group border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleExport(plan.id)} title="Excelga olish">
                    <FileSpreadsheet className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(plan.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl capitalize">
                    <Calendar className="h-5 w-5 text-primary" />
                    {plan.month}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Kutilayotgan Lidlar (Lead)</span>
                    <span className="text-lg font-bold text-primary">{plan.total_lead} ta</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* PDF Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                        <FileText className="h-4 w-4" /> PDF Reja
                      </div>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <div className="flex justify-between"><span>Yangi:</span> <span>{plan.pdf.new_pdf_total}</span></div>
                        <div className="flex justify-between"><span>Eski:</span> <span>{plan.pdf.old_pdf_total}</span></div>
                        <div className="flex justify-between font-bold border-t border-border/50 pt-1 mt-1">
                          <span>Jami:</span> <span className="text-foreground">{plan.pdf.pdf_total}</span>
                        </div>
                      </div>
                    </div>

                    {/* Book Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-orange-600">
                        <BookOpen className="h-4 w-4" /> Kitob Reja
                      </div>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <div className="flex justify-between"><span>Yangi:</span> <span>{plan.book.new_book_total}</span></div>
                        <div className="flex justify-between"><span>Eski:</span> <span>{plan.book.old_book_total}</span></div>
                        <div className="flex justify-between font-bold border-t border-border/50 pt-1 mt-1">
                          <span>Jami:</span> <span className="text-foreground">{plan.book.book_total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* REJA QO'SHISH DIALOGI */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Yangi oylik reja yaratish</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Oy nomi</Label>
                <Input 
                  placeholder="Masalan: january" 
                  value={formData.month}
                  onChange={(e) => setFormData({...formData, month: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Jami Lead (Mijozlar)</Label>
                <Input 
                  type="number" 
                  min="0"
                  value={formData.total_lead}
                  onChange={(e) => setFormData({...formData, total_lead: Number(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg border border-border/50">
              {/* PDF qismi */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500"/> PDF Maqsadlari</h4>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Yangi PDF sotuvi</Label>
                  <Input 
                    type="number" min="0" 
                    value={formData.pdf.new_pdf_total}
                    onChange={(e) => setFormData({...formData, pdf: {...formData.pdf, new_pdf_total: Number(e.target.value)}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Eski PDF sotuvi</Label>
                  <Input 
                    type="number" min="0" 
                    value={formData.pdf.old_pdf_total}
                    onChange={(e) => setFormData({...formData, pdf: {...formData.pdf, old_pdf_total: Number(e.target.value)}})}
                  />
                </div>
              </div>

              {/* Kitob qismi */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2"><BookOpen className="h-4 w-4 text-orange-500"/> Kitob Maqsadlari</h4>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Yangi kitob sotuvi</Label>
                  <Input 
                    type="number" min="0" 
                    value={formData.book.new_book_total}
                    onChange={(e) => setFormData({...formData, book: {...formData.book, new_book_total: Number(e.target.value)}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Eski kitob sotuvi</Label>
                  <Input 
                    type="number" min="0" 
                    value={formData.book.old_book_total}
                    onChange={(e) => setFormData({...formData, book: {...formData.book, old_book_total: Number(e.target.value)}})}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Bekor qilish</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saqlanmoqda..." : "Rejani saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}