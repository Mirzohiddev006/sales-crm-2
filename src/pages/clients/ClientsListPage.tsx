import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Phone, Package, Calendar, Eye, Pencil, Trash2 } from "lucide-react";
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
import { ClientListItem, ClientDetailResponse } from "@/types/api";
import { formatDate, cn } from "@/lib/utils";

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

export function ClientsListPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Edit states
  const [editingClient, setEditingClient] = useState<ClientDetailResponse | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
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
    fetchClients();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Haqiqatan ham bu mijozni o'chirmoqchimisiz?")) return;
    toast.info("O'chirish funksiyasi API ga ulanmagan");
  };

  const handleEdit = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Ro'yxatda to'liq ma'lumot bo'lmasligi mumkin, shuning uchun detail olamiz
      const detail = await clientsService.getClientDetail(id);
      setEditingClient(detail);
      setIsDialogOpen(true);
    } catch (error) {
      toast.error("Mijoz ma'lumotlarini yuklashda xatolik");
    }
  };

  const handleCreate = () => {
    setEditingClient(undefined);
    setIsDialogOpen(true);
  };

  const filteredClients = clients.filter(client => 
    client.fullname.toLowerCase().includes(search.toLowerCase()) ||
    client.phone.includes(search) ||
    client.id.toString().includes(search)
  );

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
            
            <Button onClick={handleCreate}>
              <Users className="mr-2 h-4 w-4" /> Mijoz qo'shish
            </Button>
          </div>
        </div>

        {/* Dialog Component (Hidden logic via state) */}
        <ClientDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen}
          client={editingClient}
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
                  <TableHead className="text-center">Buyurtmalar</TableHead>
                  <TableHead className="text-center">Bron</TableHead>
                  <TableHead className="hidden md:table-cell">Sana</TableHead>
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
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200/50">
                          <Package className="h-3 w-3 mr-1" /> {client.orders_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200/50">
                          {client.reservations_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 opacity-70" /> {formatDate(client.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                           <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600 hover:bg-blue-50" onClick={(e) => handleEdit(client.id, e)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
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