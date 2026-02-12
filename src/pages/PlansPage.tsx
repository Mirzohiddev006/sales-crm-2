import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Target, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Calendar, 
  Edit,
  Eye,
  TrendingUp,
  DollarSign,
  FileText,
  BookOpen
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
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";

import { plansService } from "@/services/plansService";
import { PlanListItem, PlanDetail, PlanCreateUpdate } from "@/types/api";

const initialFormState: PlanCreateUpdate = {
  month: "",
  total_lead: 0,
  pdf: { new_pdf_total: 0, old_pdf_total: 0, pdf_total: 0 },
  book: { new_book_total: 0, old_book_total: 0, book_total: 0 }
};

export function PlansPage() {
  const [plans, setPlans] = useState<PlanListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Data states
  const [formData, setFormData] = useState<PlanCreateUpdate>(initialFormState);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<PlanDetail | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const data = await plansService.getAllPlans();
      setPlans(data);
    } catch (error) {
      toast.error("Rejalarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleViewDetails = async (id: number) => {
    try {
      setIsLoadingDetail(true);
      setIsDetailOpen(true);
      const detail = await plansService.getPlanById(id);
      setSelectedPlanDetail(detail);
    } catch (error) {
      toast.error("Tafsilotlarni yuklashda xatolik");
      setIsDetailOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleEditClick = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsSubmitting(true);
      const detail = await plansService.getPlanById(id);
      
      setFormData({
        month: detail.month,
        total_lead: detail.total_lead,
        pdf: {
          new_pdf_total: detail.plans.counts.pdf.new,
          old_pdf_total: detail.plans.counts.pdf.old,
          pdf_total: detail.plans.counts.pdf.total
        },
        book: {
          new_book_total: detail.plans.counts.book.new,
          old_book_total: detail.plans.counts.book.old,
          book_total: detail.plans.counts.book.total
        }
      });
      
      setEditingId(id);
      setIsFormOpen(true);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClick = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const finalData: PlanCreateUpdate = {
        ...formData,
        pdf: {
          ...formData.pdf!,
          pdf_total: Number(formData.pdf?.new_pdf_total || 0) + Number(formData.pdf?.old_pdf_total || 0)
        },
        book: {
          ...formData.book!,
          book_total: Number(formData.book?.new_book_total || 0) + Number(formData.book?.old_book_total || 0)
        }
      };

      if (editingId) {
        await plansService.updatePlan(editingId, finalData);
        toast.success("Reja muvaffaqiyatli yangilandi");
      } else {
        await plansService.createPlan(finalData);
        toast.success("Yangi reja yaratildi");
      }

      setIsFormOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error("Saqlashda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await plansService.deletePlan(id);
      toast.success("Reja o'chirildi");
      fetchPlans();
    } catch (error) {
      toast.error("O'chirishda xatolik");
    }
  };

  const handleExport = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      toast.info("Excel yuklanmoqda...");
      await plansService.exportPlanExcel(id);
    } catch (error) {
      toast.error("Export xatoligi");
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
            onClick: handleCreateClick,
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
              onClick: handleCreateClick,
            }}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                onClick={() => handleViewDetails(plan.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2 text-xl capitalize">
                      <Calendar className="h-5 w-5 text-primary" />
                      {plan.month}
                    </CardTitle>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={(e) => handleEditClick(plan.id, e)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={(e) => handleExport(plan.id, e)}>
                        <FileSpreadsheet className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={(e) => handleDelete(plan.id, e)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/40 p-3 rounded-lg flex items-center justify-between">
                     <span className="text-sm text-muted-foreground">Leadlar rejasi:</span>
                     <span className="font-bold text-lg">{plan.total_lead} ta</span>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                    <Eye className="h-3 w-3" /> Batafsil ko'rish uchun bosing
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Rejani tahrirlash" : "Yangi oylik reja"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Oy nomi</Label>
                <Input 
                  placeholder="ex: february" 
                  value={formData.month}
                  onChange={(e) => setFormData({...formData, month: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Jami Lead (Mijozlar)</Label>
                <Input 
                  type="number" min="0"
                  value={formData.total_lead}
                  onChange={(e) => setFormData({...formData, total_lead: Number(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-blue-600">PDF Maqsadlari</h4>
                <div className="space-y-2">
                  <Label className="text-xs">Yangi PDF</Label>
                  <Input 
                    type="number" min="0" 
                    value={formData.pdf?.new_pdf_total}
                    onChange={(e) => setFormData({...formData, pdf: {...formData.pdf!, new_pdf_total: Number(e.target.value)}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Eski PDF</Label>
                  <Input 
                    type="number" min="0" 
                    value={formData.pdf?.old_pdf_total}
                    onChange={(e) => setFormData({...formData, pdf: {...formData.pdf!, old_pdf_total: Number(e.target.value)}})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-green-600">Kitob Maqsadlari</h4>
                <div className="space-y-2">
                  <Label className="text-xs">Yangi Kitob</Label>
                  <Input 
                    type="number" min="0" 
                    value={formData.book?.new_book_total}
                    onChange={(e) => setFormData({...formData, book: {...formData.book!, new_book_total: Number(e.target.value)}})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Eski Kitob</Label>
                  <Input 
                    type="number" min="0" 
                    value={formData.book?.old_book_total}
                    onChange={(e) => setFormData({...formData, book: {...formData.book!, old_book_total: Number(e.target.value)}})}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Bekor qilish</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saqlanmoqda..." : editingId ? "Yangilash" : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DETAIL VIEW DIALOG - UPDATED */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {/* Card kattalashtirildi: sm:max-w-4xl */}
        <DialogContent className="sm:max-w-4xl w-full">
          <DialogHeader className="mb-4">
            <DialogTitle className="flex items-center gap-2 capitalize text-2xl">
              <TrendingUp className="h-6 w-6 text-primary"/> 
              {selectedPlanDetail?.month} Oyi Tafsilotlari
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingDetail ? (
             <div className="py-20 flex justify-center"><Loading /></div>
          ) : selectedPlanDetail ? (
            <div className="space-y-8">
              
              {/* Top Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-muted/40 p-5 rounded-xl text-center border border-border/50 shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Jami Lead</div>
                    <div className="text-3xl font-bold">{selectedPlanDetail.total_lead}</div>
                 </div>
                 <div className="bg-blue-500/10 p-5 rounded-xl text-center border border-blue-200/20 shadow-sm">
                    <div className="text-sm font-medium text-blue-600/80 uppercase tracking-wide mb-2">PDF Reja</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedPlanDetail.plans.counts.pdf.total}
                    </div>
                 </div>
                 <div className="bg-green-500/10 p-5 rounded-xl text-center border border-green-200/20 shadow-sm">
                    <div className="text-sm font-medium text-green-600/80 uppercase tracking-wide mb-2">Kitob Reja</div>
                    <div className="text-3xl font-bold text-green-600">
                      {selectedPlanDetail.plans.counts.book.total}
                    </div>
                 </div>
              </div>

              <Separator />

              {/* Detailed Breakdown - Grid gap oshirildi */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* PDF Details */}
                <Card className="border-t-4 border-t-blue-500 shadow-sm">
                  <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-blue-600">
                      <FileText className="h-5 w-5" />
                      PDF Tafsilotlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-2">
                    {/* Row 1: Yangi */}
                    <div className="flex justify-between items-center py-3 border-b border-border/50">
                      <span className="text-muted-foreground font-medium">Yangi:</span>
                      <div className="text-right">
                        <span className="font-bold text-lg">{selectedPlanDetail.plans.counts.pdf.new} ta</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          / {selectedPlanDetail.plans.sums.pdf.new.toLocaleString()} UZS
                        </span>
                      </div>
                    </div>
                    {/* Row 2: Eski */}
                    <div className="flex justify-between items-center py-3 border-b border-border/50">
                      <span className="text-muted-foreground font-medium">Eski:</span>
                      <div className="text-right">
                        <span className="font-bold text-lg">{selectedPlanDetail.plans.counts.pdf.old} ta</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          / {selectedPlanDetail.plans.sums.pdf.old.toLocaleString()} UZS
                        </span>
                      </div>
                    </div>
                    {/* Row 3: Total */}
                    <div className="flex justify-between items-center pt-4">
                      <span className="font-bold text-lg">Jami:</span>
                      <div className="text-right text-blue-600">
                         <span className="font-bold text-xl block">
                           {selectedPlanDetail.plans.sums.pdf.total.toLocaleString()} UZS
                         </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Kitob Details - Aynan PDF strukturasi bilan bir xil */}
                <Card className="border-t-4 border-t-green-500 shadow-sm">
                  <CardHeader className="bg-green-50/50 dark:bg-green-900/10 pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-green-600">
                      <BookOpen className="h-5 w-5" />
                      Kitob Tafsilotlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-2">
                    {/* Row 1: Yangi */}
                    <div className="flex justify-between items-center py-3 border-b border-border/50">
                      <span className="text-muted-foreground font-medium">Yangi:</span>
                      <div className="text-right">
                        <span className="font-bold text-lg">{selectedPlanDetail.plans.counts.book.new} ta</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          / {selectedPlanDetail.plans.sums.book.new.toLocaleString()} UZS
                        </span>
                      </div>
                    </div>
                    {/* Row 2: Eski */}
                    <div className="flex justify-between items-center py-3 border-b border-border/50">
                      <span className="text-muted-foreground font-medium">Eski:</span>
                      <div className="text-right">
                        <span className="font-bold text-lg">{selectedPlanDetail.plans.counts.book.old} ta</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          / {selectedPlanDetail.plans.sums.book.old.toLocaleString()} UZS
                        </span>
                      </div>
                    </div>
                    {/* Row 3: Total */}
                    <div className="flex justify-between items-center pt-4">
                      <span className="font-bold text-lg">Jami:</span>
                      <div className="text-right text-green-600">
                         <span className="font-bold text-xl block">
                           {selectedPlanDetail.plans.sums.book.total.toLocaleString()} UZS
                         </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Overall Sum Footer */}
              <div className="bg-primary/10 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center border border-primary/20 shadow-md">
                <div className="flex items-center gap-3 mb-2 md:mb-0">
                  <div className="bg-primary p-2 rounded-full text-white">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-lg">Jami Kutilayotgan Summa</span>
                </div>
                <span className="text-3xl font-bold text-primary tracking-tight">
                  {selectedPlanDetail.plans.sums.overall.total.toLocaleString()} UZS
                </span>
              </div>

            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}