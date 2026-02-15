import { useState, useEffect, memo } from "react";
import { toast } from "sonner";
import { 
  Target, Plus, Trash2, FileSpreadsheet, Calendar, Edit,
  DollarSign, FileText, BookOpen, X
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
import {
  Select,
} from "@/components/ui/select"; // Custom Select component usually doesn't export SelectTrigger/SelectValue
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";

import { plansService } from "@/services/plansService";
import { PlanListItem, PlanDetail, PlanCreateUpdate } from "@/types/api";
import { cn } from "@/lib/utils";

// --- REUSABLE MINI COMPONENTS ---

const SummaryCard = memo(({ title, value, total, icon, color = "indigo" }: any) => (
  <div className={cn(
    "p-5 rounded-2xl border transition-all duration-300 bg-[#0f172a] border-[#1e293b] hover:border-indigo-500/40 shadow-xl",
    color === "indigo" && "hover:shadow-indigo-500/10",
    color === "emerald" && "hover:shadow-emerald-500/10",
    color === "blue" && "hover:shadow-blue-500/10"
  )}>
    <div className="flex items-center gap-2 mb-3 text-slate-400">
      <div className={cn(
        "p-1.5 rounded-lg",
        color === "indigo" && "bg-indigo-500/10 text-indigo-400",
        color === "emerald" && "bg-emerald-500/10 text-emerald-400",
        color === "blue" && "bg-blue-500/10 text-blue-400"
      )}>
        {icon}
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className={cn(
        "text-3xl font-black tracking-tight",
        color === "indigo" && "text-slate-100",
        color === "emerald" && "text-emerald-400",
        color === "blue" && "text-blue-400"
      )}>{value}</span>
      {total && <span className="text-sm text-slate-500 font-medium">/ {total} ta</span>}
    </div>
  </div>
));

const ProgressDetailCard = memo(({ title, icon, data, type, accentColor }: any) => {
  const isPdf = type === "pdf";
  const counts = isPdf ? data.facts.counts.pdf : data.facts.counts.book;
  const plansCounts = isPdf ? data.plans.counts.pdf : data.plans.counts.book;
  const sums = isPdf ? data.facts.sums.pdf : data.facts.sums.book;
  const plansSums = isPdf ? data.plans.sums.pdf : data.plans.sums.book;
  const percent = isPdf ? data.percents.pdf.total : data.percents.book.total;

  const colorClass = accentColor === "blue" ? "text-blue-400" : "text-emerald-400";
  const bgBarClass = accentColor === "blue" ? "bg-blue-500" : "bg-emerald-500";

  return (
    <Card className="bg-[#0f172a] border-[#1e293b] overflow-hidden border-t-4" style={{ borderTopColor: accentColor === "blue" ? "#3b82f6" : "#10b981" }}>
      <CardHeader className="bg-slate-900/40 pb-3">
        <CardTitle className={cn("text-sm font-bold flex items-center gap-2 uppercase tracking-widest", colorClass)}>
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        {[
          { label: "Yangi", fact: counts.new, plan: plansCounts.new, sum: sums.new, planSum: plansSums.new },
          { label: "Eski", fact: counts.old, plan: plansCounts.old, sum: sums.old, planSum: plansSums.old }
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center pb-4 border-b border-[#1e293b]/50 last:border-0 last:pb-0">
            <span className="text-slate-400 font-semibold text-sm">{item.label}:</span>
            <div className="text-right">
              <div className="font-bold text-slate-100">{item.fact} / {item.plan} ta</div>
              <div className="text-[10px] text-slate-500 font-mono italic">{item.sum.toLocaleString()} UZS</div>
            </div>
          </div>
        ))}
        <div className="pt-2">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Progress</span>
            <span className={cn("text-lg font-black", colorClass)}>{percent}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 border border-[#1e293b]">
            <div className={cn("h-full rounded-full transition-all duration-1000", bgBarClass)} style={{ width: `${percent}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// --- OYLAR RO'YXATI ---
const MONTHS = [
  { value: "january", label: "Yanvar" },
  { value: "february", label: "Fevral" },
  { value: "march", label: "Mart" },
  { value: "april", label: "Aprel" },
  { value: "may", label: "May" },
  { value: "june", label: "Iyun" },
  { value: "july", label: "Iyul" },
  { value: "august", label: "Avgust" },
  { value: "september", label: "Sentabr" },
  { value: "october", label: "Oktabr" },
  { value: "november", label: "Noyabr" },
  { value: "december", label: "Dekabr" },
];

// --- MAIN PAGE ---

const initialFormState: PlanCreateUpdate = {
  month: "",
  total_lead: 0,
  pdf: { new_pdf_total: 0, old_pdf_total: 0, pdf_total: 0 },
  book: { new_book_total: 0, old_book_total: 0, book_total: 0 }
};

export function PlansPage() {
  const [plans, setPlans] = useState<PlanListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [formData, setFormData] = useState<PlanCreateUpdate>(initialFormState);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<PlanDetail | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const data = await plansService.getAllPlans();
      setPlans(data);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
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
        month: detail.month.toLowerCase(),
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
      toast.error("Tahrirlashda xatolik");
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
        pdf: { ...formData.pdf!, pdf_total: Number(formData.pdf?.new_pdf_total || 0) + Number(formData.pdf?.old_pdf_total || 0) },
        book: { ...formData.book!, book_total: Number(formData.book?.new_book_total || 0) + Number(formData.book?.old_book_total || 0) }
      };

      let targetId = editingId;

      if (editingId) {
        await plansService.updatePlan(editingId, finalData);
        toast.success("Muvaffaqiyatli yangilandi");
      } else {
        await plansService.createPlan(finalData);
        toast.success("Yangi reja yaratildi");
      }

      setIsFormOpen(false);

      const updatedPlans = await plansService.getAllPlans();
      setPlans(updatedPlans);

      if (!editingId && updatedPlans.length > plans.length) {
        const newPlan = updatedPlans.reduce((latest, current) => (current.id > latest.id ? current : latest));
        targetId = newPlan.id;
      }

      if (targetId) {
        await handleViewDetails(targetId);
      }
    } catch (error) {
      const errorMessage = (error as any).response?.data?.detail?.[0]?.msg || (error as any).response?.data?.detail || "Saqlashda xatolik";
      toast.error(errorMessage);
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

  if (isLoading && plans.length === 0) {
    return (
      <DashboardLayout>
        <Loading fullScreen text="Rejalar yuklanmoqda..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 bg-[#021026] min-h-[calc(100vh-4rem)] text-slate-200 p-2 animate-in fade-in duration-700">
        <PageHeader
          title="Oylik Rejalar"
          description="Savdo maqsadlari tahlili"
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
            description="Hozircha reja kiritilmagan" 
            action={{ label: "Qo'shish", onClick: handleCreateClick }} 
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className="group cursor-pointer bg-[#0f172a] border-[#1e293b] hover:border-indigo-500/50 transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.1)]"
                onClick={() => handleViewDetails(plan.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2 text-xl capitalize text-slate-100">
                      <Calendar className="h-5 w-5 text-indigo-400" />
                      {plan.month}
                    </CardTitle>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:bg-indigo-500/10" onClick={(e) => handleEditClick(plan.id, e)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10" onClick={(e) => handleExport(plan.id, e)}>
                        <FileSpreadsheet className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10" onClick={(e) => handleDelete(plan.id, e)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-950/50 border border-[#1e293b] p-3 rounded-lg flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Leadlar rejasi:</span>
                      <span className="font-black text-indigo-400 text-lg">{plan.total_lead} ta</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* FORM DIALOG - CREATE / EDIT */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl bg-[#020617] border-[#1e293b] text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-indigo-400">
              {editingId ? "Rejani tahrirlash" : "Yangi oylik reja"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              
              <div className="space-y-2">
                <Label className="text-slate-400">Oy nomi</Label>
                <Select 
                  value={formData.month} 
                  onChange={(e) => setFormData({...formData, month: e.target.value})}
                  required
                  className="bg-[#0f172a] border-[#1e293b] focus:ring-1 focus:ring-indigo-500 text-slate-100"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value} className="bg-[#0f172a] text-slate-200 p-2 hover:bg-indigo-500/20 cursor-pointer">
                      {m.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* AQLLI INPUT: 4 ga bo'linuvchi son kiritilganda pastdagi 4 ta input o'z-o'zidan to'ladi */}
              <div className="space-y-2">
                <Label className="text-slate-400">Jami Lead</Label>
                <Input 
                  type="number" 
                  className="bg-[#0f172a] border-[#1e293b] focus:border-indigo-500 text-slate-100" 
                  value={formData.total_lead || ""} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    
                    // Agar qiymat 4 ga qoldiqsiz bo'linsa, 4 ga bo'lib pastdagi inputlarga solamiz
                    if (val > 0 && val % 4 === 0) {
                      const quarter = val / 4;
                      setFormData({
                        ...formData, 
                        total_lead: val,
                        pdf: { ...formData.pdf!, new_pdf_total: quarter, old_pdf_total: quarter },
                        book: { ...formData.book!, new_book_total: quarter, old_book_total: quarter }
                      });
                    } else {
                      // Bo'linmasa shunchaki o'zini saqlaymiz, foydalanuvchi o'zi kiritadi
                      setFormData({...formData, total_lead: val});
                    }
                  }} 
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 p-4 bg-slate-950/50 rounded-xl border border-[#1e293b]">
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-blue-400 uppercase tracking-widest">PDF Target</h4>
                <Input 
                  type="number" 
                  className="bg-[#0f172a] border-[#1e293b] h-8 text-xs text-slate-200" 
                  placeholder="New PDF" 
                  value={formData.pdf?.new_pdf_total === 0 ? "" : formData.pdf?.new_pdf_total} 
                  onChange={(e) => setFormData({...formData, pdf: {...formData.pdf!, new_pdf_total: Number(e.target.value)}})} 
                />
                <Input 
                  type="number" 
                  className="bg-[#0f172a] border-[#1e293b] h-8 text-xs text-slate-200" 
                  placeholder="Old PDF" 
                  value={formData.pdf?.old_pdf_total === 0 ? "" : formData.pdf?.old_pdf_total} 
                  onChange={(e) => setFormData({...formData, pdf: {...formData.pdf!, old_pdf_total: Number(e.target.value)}})} 
                />
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-widest">Book Target</h4>
                <Input 
                  type="number" 
                  className="bg-[#0f172a] border-[#1e293b] h-8 text-xs text-slate-200" 
                  placeholder="New Book" 
                  value={formData.book?.new_book_total === 0 ? "" : formData.book?.new_book_total} 
                  onChange={(e) => setFormData({...formData, book: {...formData.book!, new_book_total: Number(e.target.value)}})} 
                />
                <Input 
                  type="number" 
                  className="bg-[#0f172a] border-[#1e293b] h-8 text-xs text-slate-200" 
                  placeholder="Old Book" 
                  value={formData.book?.old_book_total === 0 ? "" : formData.book?.old_book_total} 
                  onChange={(e) => setFormData({...formData, book: {...formData.book!, old_book_total: Number(e.target.value)}})} 
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="ghost" className="text-slate-500 hover:text-slate-300" onClick={() => setIsFormOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 text-white font-bold" disabled={isSubmitting}>
                {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-5xl bg-[#020617] border-[#1e293b] text-slate-200 custom-scrollbar overflow-y-auto max-h-[90vh] p-0 border-none shadow-2xl">
          {isLoadingDetail ? (
            <div className="py-24 flex justify-center"><Loading /></div>
          ) : selectedPlanDetail ? (
            <div className="animate-in zoom-in-95 duration-300">
              
              {/* HEADER WITH ACTIONS */}
              <div className="p-8 border-b border-[#1e293b] bg-slate-900/20 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-inner">
                    <Calendar className="h-8 w-8 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black capitalize tracking-tight text-slate-100 leading-none">
                      {selectedPlanDetail.month}
                    </h2>
                    <p className="text-[10px] uppercase font-bold text-indigo-400/60 tracking-[0.3em] mt-3 italic">
                      Oylik Savdo Analitikasi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#0f172a] p-2 rounded-2xl border border-[#1e293b] shadow-lg">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 w-10 text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                    onClick={(e) => {
                      setIsDetailOpen(false); 
                      handleEditClick(selectedPlanDetail.id, e);
                    }}
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 w-10 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                    onClick={(e) => handleExport(selectedPlanDetail.id, e)}
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                  </Button>
                  <div className="w-[1px] h-6 bg-[#1e293b] mx-1" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 w-10 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    onClick={(e) => {
                      handleDelete(selectedPlanDetail.id, e);
                      setIsDetailOpen(false);
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 w-10 text-slate-500 hover:bg-slate-800 rounded-xl transition-all ml-2"
                    onClick={() => setIsDetailOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* DETAILS CONTENT */}
              <div className="p-8 space-y-8 bg-[radial-gradient(circle_at_top_right,#1e293b33,transparent)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SummaryCard 
                    title="Jami Lead" 
                    value={selectedPlanDetail.total_lead} 
                    icon={<Target className="w-5 h-5"/>} 
                    color="indigo" 
                  />
                  <SummaryCard 
                    title="PDF Fact" 
                    value={selectedPlanDetail.facts.counts.pdf.total} 
                    total={selectedPlanDetail.plans.counts.pdf.total} 
                    color="blue" 
                    icon={<FileText className="w-5 h-5"/>} 
                  />
                  <SummaryCard 
                    title="Book Fact" 
                    value={selectedPlanDetail.facts.counts.book.total} 
                    total={selectedPlanDetail.plans.counts.book.total} 
                    color="emerald" 
                    icon={<BookOpen className="w-5 h-5"/>} 
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ProgressDetailCard 
                    title="PDF DETAILS" 
                    icon={<FileText className="w-5 h-5" />} 
                    data={selectedPlanDetail} 
                    type="pdf" 
                    accentColor="blue" 
                  />
                  <ProgressDetailCard 
                    title="BOOK DETAILS" 
                    icon={<BookOpen className="w-5 h-5" />} 
                    data={selectedPlanDetail} 
                    type="book" 
                    accentColor="emerald" 
                  />
                </div>

                {/* OVERALL RESULT FOOTER */}
                <div className="bg-[#0f172a] border border-indigo-500/30 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex items-center gap-5 z-10">
                    <div className="bg-indigo-600 p-4 rounded-2xl shadow-[0_0_25px_rgba(79,70,229,0.4)]">
                      <DollarSign className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <span className="font-black text-xl tracking-[0.2em] uppercase text-indigo-100 block">Umumiy Natija</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Fakt vs Reja (Summa)</span>
                    </div>
                  </div>
                  <div className="text-right z-10 mt-6 md:mt-0">
                    <span className="text-4xl md:text-5xl font-black text-indigo-400 tracking-tighter drop-shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                      {selectedPlanDetail.facts.sums.overall.total.toLocaleString()}
                    </span>
                    <span className="text-base md:text-lg text-slate-500 font-bold ml-2 italic">
                      / {selectedPlanDetail.plans.sums.overall.total.toLocaleString()} UZS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}