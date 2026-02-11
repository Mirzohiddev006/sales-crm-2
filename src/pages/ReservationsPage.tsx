import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BookOpen, RefreshCcw, Filter, Clock, Phone, User } from "lucide-react";

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
import { PageHeader } from "@/components/common/PageHeader";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";

import { reservationsService } from "@/services/reservationsService";
import { ReservationResponse } from "@/types/api";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200/50",
  completed: "bg-green-500/10 text-green-600 border-green-200/50",
  canceled: "bg-red-500/10 text-red-600 border-red-200/50",
};

export function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      
      const data = await reservationsService.getAllReservations(params);
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

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}-${month}-${year}`;
  };

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
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm p-1 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border-r border-border/50">
              <Filter className="h-4 w-4" />
              <span>Filter:</span>
            </div>
            <select
              className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer py-1.5 pl-2 pr-8 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Barchasi</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-card/50 backdrop-blur-sm"
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
                  <TableHead>Telefon</TableHead>
                  <TableHead>Bron tugashi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Yaratilgan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((res) => (
                  <TableRow key={res.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{res.id}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{res.fullname}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            User ID: {res.user_id}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground/90">
                        <Phone className="h-3.5 w-3.5 opacity-70" />
                        {res.phone}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3.5 w-3.5 text-orange-500" />
                        <span className="font-medium text-foreground/90">
                          {formatDateTime(res.reserved_until)}
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
                        {res.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDateTime(res.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
