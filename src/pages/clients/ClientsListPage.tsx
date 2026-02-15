import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Phone, Trash2, FileText, BookOpen, Filter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ClientDialog } from "@/pages/clients/ClientsDialog"; // YANGI IMPORT
import { clientsService } from "@/services/clientsService";
import { ClientListItem } from "@/types/api";
import { cn } from "@/lib/utils";

const avatarColors = [
  "bg-red-500/10 text-red-600 border-red-200",
  "bg-orange-500/10 text-orange-600 border-orange-200",
  "bg-green-500/10 text-green-600 border-green-200",
  "bg-blue-500/10 text-blue-600 border-blue-200",
  "bg-purple-500/10 text-purple-600 border-purple-200",
  "bg-pink-500/10 text-pink-600 border-pink-200",
  "bg-indigo-500/10 text-indigo-600 border-indigo-200",
];

const getInitials = (name: string) => {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const ORDER_STATUSES: Record<string, string> = {
  start_bosdi: "Start bosdi",
  ism_va_raqam_qoldirgan: "Ism va raqam qoldirgan",
  format_tanlab_kart_raqam_olgan: "Format tanlab karta olgan",
  pdf_uchun_tolov_qilingan: "PDF uchun to'lov qilingan",
  kitob_uchun_tolov_qilingan: "Kitob uchun to'lov qilingan",
  bts_ga_berilgan: "BTS ga berilgan",
  kitob_yetib_borgan: "Kitob yetib borgan",
  completed: "Yakunlangan",
  canceled: "Bekor qilingan"
};

export function ClientsListPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Edit states
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchClients = async () => {
    try {
      setError(null);
      const data = await clientsService.getAllClients(100, 0); 
      setClients(data.items);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Mijozlarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchClients();

    const interval = setInterval(fetchClients, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (_id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Haqiqatan ham bu mijozni o'chirmoqchimisiz?")) return;
    toast.info("O'chirish funksiyasi API ga ulanmagan");
  };

  const handleCreate = () => {
    setIsDialogOpen(true);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.fullname.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.includes(search) ||
      client.id.toString().includes(search);
    const matchesStatus = statusFilter ? (client as any).last_order_status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <DashboardLayout><Loading fullScreen text="Mijozlar yuklanmoqda..." /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} retry={fetchClients} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mijozlar</h1>
            <p className="text-muted-foreground mt-1">Barcha mijozlar ro'yxati va statistika</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Qidirish (Ism, ID, Tel)..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Barcha statuslar</option>
                {Object.entries(ORDER_STATUSES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleCreate}>
              <Users className="mr-2 h-4 w-4" /> Mijoz qo'shish
            </Button>
          </div>
        </div>

        {/* Dialog Component (Hidden logic via state) */}
        <ClientDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen}
          onSuccess={fetchClients}
        />

        {/* Content Section */}
        {filteredClients.length === 0 ? (
          <EmptyState 
            icon={Users} 
            title={search ? "Qidiruv natijasi yo'q" : "Mijozlar ro'yxati bo'sh"} 
            description={search ? "Boshqa so'z bilan qidirib ko'ring" : "Mijozlar hali mavjud emas"} 
            action={!search ? { label: "Mijoz qo'shish", onClick: handleCreate } : undefined}
          />
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden shadow-sm bg-card/50 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Mijoz</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead className="text-center">PDF</TableHead>
                  <TableHead className="text-center">Kitob</TableHead>
                  <TableHead className="text-right">Jami Tushum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-[120px]">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client, index) => {
                  const colorClass = avatarColors[index % avatarColors.length];
                  return (
                    <TableRow 
                      key={client.id} 
                      className="cursor-pointer group hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/clients/${client.id}`)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">#{client.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn("h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold border shrink-0", colorClass)}>
                            {getInitials(client.fullname)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{client.fullname}</span>
                            {client.telegram_username && <span className="text-xs text-blue-500 font-medium hidden sm:inline-block">@{client.telegram_username}</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                            <Phone className="h-3.5 w-3.5 opacity-70" /> {client.phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {(client as any).pdf_count > 0 ? (
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-200/50">
                            <FileText className="w-3 h-3 mr-1" /> {(client as any).pdf_count}
                          </Badge>
                        ) : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {(client as any).book_count > 0 ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-200/50">
                            <BookOpen className="w-3 h-3 mr-1" /> {(client as any).book_count}
                          </Badge>
                        ) : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground/80">
                        {(client as any).total_income?.toLocaleString()} UZS
                      </TableCell>
                      <TableCell>
                        {(client as any).last_order_status && (
                          <Badge variant="outline" className="capitalize text-xs font-normal">
                            {ORDER_STATUSES[(client as any).last_order_status] || (client as any).last_order_status.replace(/_/g, " ")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50" onClick={(e) => handleDelete(client.id, e)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}