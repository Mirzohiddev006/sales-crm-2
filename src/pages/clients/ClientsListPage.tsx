import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Users as UsersIcon, Search, Phone, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { clientsService } from "@/services/clientsService";
import { ClientListItem } from "@/types/api";
import { cn, formatDate } from "@/lib/utils";

const getInitials = (name: string) => {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const avatarColors = [
  "bg-red-500/10 text-red-600",
  "bg-orange-500/10 text-orange-600",
  "bg-green-500/10 text-green-600",
  "bg-blue-500/10 text-blue-600",
  "bg-purple-500/10 text-purple-600",
  "bg-pink-500/10 text-pink-600",
];

export function ClientsListPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await clientsService.getAllClients(100, 0);
      setClients(data.items);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Mijozlarni yuklashda xatolik");
      console.error("Error fetching clients:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      client.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.id.toString().includes(searchTerm)
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading fullScreen text="Mijozlar ro'yxati yuklanmoqda..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState message={error} retry={fetchClients} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mijozlar</h1>
          <p className="text-muted-foreground mt-1">Barcha mijozlar ro'yxati va statistika</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Qidirish (Ism, ID, Tel)..."
            className="pl-10 bg-background/50 border-border/50 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredClients.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title={searchTerm ? "Qidiruv bo'yicha natija yo'q" : "Mijozlar ro'yxati bo'sh"}
            description={searchTerm ? "Boshqa so'z bilan qidirib ko'ring" : "Mijozlar hali mavjud emas"}
          />
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Mijoz</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead className="text-center">Buyurtmalar</TableHead>
                  <TableHead className="text-center">Bron</TableHead>
                  <TableHead className="hidden md:table-cell">Sana</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => {
                  const colorClass = avatarColors[client.fullname.length % avatarColors.length];
                  return (
                    <TableRow
                      key={client.id}
                      className="cursor-pointer group"
                      onClick={() => navigate(`/clients/${client.id}`)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{client.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn("h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-background", colorClass)}>
                            {getInitials(client.fullname)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{client.fullname}</span>
                            <span className="md:hidden text-xs text-muted-foreground">#{client.id}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-muted-foreground/80">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          {client.phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200/50">
                          <Package className="h-3 w-3 mr-1" />
                          {client.orders_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200/50">
                          {client.reservations_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {formatDate(client.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
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
