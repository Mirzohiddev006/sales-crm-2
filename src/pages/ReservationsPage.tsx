import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BookOpen, RefreshCcw, Filter, Clock, User, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/common/PageHeader";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn, formatDate} from "@/lib/utils";
import api from "@/lib/api";

import { reservationsService } from "@/services/reservationsService";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200/50",
  completed: "bg-green-500/10 text-green-600 border-green-200/50",
  canceled: "bg-red-500/10 text-red-600 border-red-200/50",
};

const RESERVATION_STATUSES: Record<string, string> = {
  pending: "Kutilmoqda",
  completed: "Yakunlangan",
  canceled: "Bekor qilingan"
};

export function ReservationsPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Detail dialog states
  const [selectedUserRes, setSelectedUserRes] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      
      const response: any = await reservationsService.getAllReservations(params);
      
      // API response array formatida keladi
      const data = Array.isArray(response) 
        ? response 
        : (response?.data && Array.isArray(response.data) ? response.data : []);
        
      setReservations(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Reservatsiyalarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchReservations();
      toast.success("Jadval yangilandi");
    } catch (err) {
      toast.error("Yangilashda xatolik");
    }
  };

  const handleViewDetail = async (userId: number) => {
    try {
      setIsLoadingDetail(true);
      setIsDetailOpen(true);
      // Direct API call to ensure correct endpoint usage
      const response = await api.get(`/reservations/user/${userId}`);
      setSelectedUserRes(response.data);
    } catch (err) {
      toast.error("Tafsilotlarni yuklashda xatolik");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading fullScreen text="Reservatsiyalar yuklanmoqda..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState message={error} retry={fetchReservations} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        <PageHeader
          title="Reservatsiyalar"
          description="Kitob band qilish va buyurtmalar tarixi"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-2 bg-[#020617]/60 backdrop-blur-md p-1 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
  <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-400/70 border-r border-[#1e293b]">
    <Filter className="h-3.5 w-3.5" />
    <span>Filter</span>
  </div>
  
  <select
    className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer py-1.5 pl-2 pr-8 outline-none text-slate-200"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    {/* Optionlar oqarib qolmasligi uchun ularga ham background beramiz */}
    <option value="" className="bg-[#020617] text-slate-200">Barchasi</option>
    {Object.entries(RESERVATION_STATUSES).map(([key, label]) => (
      <option key={key} value={key} className="bg-[#020617] text-slate-200">
        {label}
      </option>
    ))}
  </select>
</div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-card backdrop-{#021026}"
          >
            <RefreshCcw className={cn("mr-2 h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            Yangilash
          </Button>
        </div>

        {reservations.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Reservatsiyalar topilmadi"
            description="Ushbu filter bo'yicha ma'lumot mavjud emas"
            action={{
              label: "Filtrni tozalash",
              onClick: () => setStatusFilter(""),
            }}
          />
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/20">
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Mijoz</TableHead>
                  <TableHead>Bron tugashi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Yaratilgan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((res) => (
                  <TableRow 
                    key={res.latest_reservation_id || res.user_id} 
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(res.user_id)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{res.latest_reservation_id}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3 group">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span 
                            className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/clients/${res.user_id}`);
                            }}
                          >
                            {res.client_fullname || "Noma'lum mijoz"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            User ID: {res.user_id}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3.5 w-3.5 text-orange-500" />
                        <span className="font-medium text-foreground/90">
                          {formatDate(res.reserved_until)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize shadow-none",
                          statusStyles[res.status] || statusStyles.pending,
                        )}
                      >
                        {RESERVATION_STATUSES[res.status] || res.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDate(res.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* User Reservations Detail Dialog */}
<Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
  <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col bg-[#020617] border-[#1e293b] text-slate-200 p-0 shadow-2xl rounded-[2rem]">
    
    {/* Header Section with Glassmorphism */}
    <div className="relative p-8 border-b border-[#1e293b] bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-[1.5rem] bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30 shadow-inner">
            <User className="h-8 w-8 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-100 leading-none">
              {selectedUserRes?.client_fullname || "Mijoz ma'lumotlari"}
            </h2>
            <p className="text-[10px] uppercase font-bold text-indigo-400/60 tracking-[0.3em] mt-3 italic">
              Buyurtmalar va Bronlar Tarixi
            </p>
          </div>
        </div>
        
        {/* Real-time Stats Badge */}
        <div className="flex gap-3">
          <div className="px-5 py-2 bg-slate-900/80 border border-[#1e293b] rounded-2xl text-center shadow-lg">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Jami</p>
            <p className="text-xl font-black text-indigo-400 leading-none mt-1">{selectedUserRes?.reservations?.length || 0}</p>
          </div>
          <div className="px-5 py-2 bg-slate-900/80 border border-[#1e293b] rounded-2xl text-center shadow-lg">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Active</p>
            <p className="text-xl font-black text-emerald-400 leading-none mt-1">
              {selectedUserRes?.reservations?.filter((r: any) => r.status === 'pending').length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Content Section with Interactive Cards */}
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(circle_at_top_right,#1e293b33,transparent)]">
      {isLoadingDetail ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <Loading />
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest animate-pulse">Ma'lumotlar tahlil qilinmoqda</p>
        </div>
      ) : selectedUserRes?.reservations?.length === 0 ? (
        <EmptyState 
          icon={BookOpen} 
          title="Tarix mavjud emas" 
          description="Ushbu mijozda hali hech qanday reservatsiyalar amalga oshirilmagan."
        />
      ) : (
        <div className="grid gap-5">
          {selectedUserRes?.reservations?.map((item: any) => (
            <div 
              key={item.id}
              className="group relative bg-[#0f172a]/40 border border-[#1e293b] p-6 rounded-[1.25rem] hover:bg-[#0f172a] hover:border-indigo-500/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-xl bg-slate-950 flex items-center justify-center font-mono text-[10px] font-black text-slate-600 border border-[#1e293b] group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors">
                    #{item.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-100 tracking-tight">
                        {item.order_id ? `Buyurtma #${item.order_id}` : "Bron qilish"}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] h-5 px-2 font-black uppercase tracking-tighter border-none shadow-sm",
                          statusStyles[item.status] || "bg-slate-800 text-slate-400"
                        )}
                      >
                        {RESERVATION_STATUSES[item.status] || item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[11px] font-medium">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(item.created_at)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-800" />
                      <span className="flex items-center gap-1.5 text-amber-500/70 font-bold">
                        <Clock className="h-3.5 w-3.5" />
                        Limit: {formatDate(item.reserved_until)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="bg-indigo-500/5 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-xl px-5 h-9 border border-indigo-500/20 group-hover:border-indigo-500/50 transition-all"
                  onClick={() => navigate(`/reservations/${item.id}`)}
                >
                  Tafsilotlar
                </Button>
              </div>

              {/* Progress Bar for Active Status */}
              {item.status === 'pending' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-950 overflow-hidden rounded-b-[1.25rem]">
                  <div className="h-full bg-indigo-500 shadow-[0_0_10px_#6366f1] animate-progress-glow" style={{ width: '45%' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Footer Section - Minimalist approach */}
    <div className="p-6 bg-slate-950/80 border-t border-[#1e293b] flex justify-end">
      <Button 
        onClick={() => setIsDetailOpen(false)}
        className="bg-slate-900 border border-[#1e293b] hover:bg-slate-800 text-slate-400 hover:text-white font-black px-8 py-6 rounded-2xl text-xs tracking-widest transition-all"
      >
        YOPISH
      </Button>
    </div>
  </DialogContent>
</Dialog>
      </div>
    </DashboardLayout>
  );
}
