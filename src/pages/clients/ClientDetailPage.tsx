import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Calendar, 
  ShoppingBag, 
  MessageSquare, 
  Clock,
  FileText,
  CreditCard,
  Hash,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { SendTelegramDialog } from "@/services/SendTelegramDialog";
import { clientsService } from "@/services/clientsService";
import { ClientDetailResponse } from "@/types/api";
import { formatDate, cn } from "@/lib/utils";

// Avatar ranglari (List dagi kabi)
const avatarColors = [
  "bg-red-500/10 text-red-600 border-red-200",
  "bg-orange-500/10 text-orange-600 border-orange-200",
  "bg-green-500/10 text-green-600 border-green-200",
  "bg-blue-500/10 text-blue-600 border-blue-200",
  "bg-purple-500/10 text-purple-600 border-purple-200",
  "bg-pink-500/10 text-pink-600 border-pink-200",
];

const getInitials = (name: string) => {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

export function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientDetail = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await clientsService.getClientDetail(Number(id));
      setClient(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Mijoz ma'lumotlarini yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetail();
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading fullScreen text="Mijoz ma'lumotlari yuklanmoqda..." />
      </DashboardLayout>
    );
  }

  if (error || !client) {
    return (
      <DashboardLayout>
        <ErrorState message={error || "Mijoz topilmadi"} retry={fetchClientDetail} />
      </DashboardLayout>
    );
  }

  const getStatusVariant = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'active' || s === 'paid') return 'default'; 
    if (s === 'cancelled' || s === 'rejected') return 'destructive';
    if (s === 'pending' || s === 'processing') return 'secondary';
    return 'outline';
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'active') return <CheckCircle2 className="h-3 w-3" />;
    if (s === 'cancelled' || s === 'rejected') return <XCircle className="h-3 w-3" />;
    return <AlertCircle className="h-3 w-3" />;
  };

  // Avatar rangi uchun
  const colorClass = avatarColors[client.id % avatarColors.length];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in-50 duration-500 max-w-7xl mx-auto">
        
        {/* Top Navigation & Header */}
        <div className="flex flex-col gap-6">
          <Button 
            variant="ghost" 
            className="w-fit pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground" 
            onClick={() => navigate("/clients")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> 
            Mijozlar ro'yxatiga qaytish
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 rounded-xl border shadow-sm">
            <div className="flex items-center gap-5">
              <div className={cn(
                "h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-bold border-2 shadow-sm", 
                colorClass
              )}>
                {getInitials(client.fullname)}
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">{client.fullname}</h1>
                <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm font-medium">
                  <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md border">
                    <Hash className="h-3 w-3" /> {client.id}
                  </span>
                  <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md border">
                    <Phone className="h-3 w-3" /> {client.phone}
                  </span>
                  {/* Agar telegram username bo'lsa shu yerga qo'shish mumkin */}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
               <SendTelegramDialog 
                userId={client.id} 
                chatId={(client as any).telegram_id || client.id} 
                fullname={client.fullname} 
              />
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <Card className="bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900">
              <CardContent className="p-4 flex flex-col gap-1">
                 <span className="text-sm font-medium text-blue-600/80">Jami Buyurtmalar</span>
                 <span className="text-2xl font-bold text-blue-700">{client.orders.length} ta</span>
              </CardContent>
           </Card>
           <Card className="bg-orange-50/50 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900">
              <CardContent className="p-4 flex flex-col gap-1">
                 <span className="text-sm font-medium text-orange-600/80">Jami Rezervatsiyalar</span>
                 <span className="text-2xl font-bold text-orange-700">{client.reservations.length} ta</span>
              </CardContent>
           </Card>
           <Card className="bg-green-50/50 dark:bg-green-950/10 border-green-100 dark:border-green-900">
              <CardContent className="p-4 flex flex-col gap-1">
                 <span className="text-sm font-medium text-green-600/80">Muvaffaqiyatli</span>
                 <span className="text-2xl font-bold text-green-700">
                    {client.orders.filter(o => o.status === 'completed').length} ta
                 </span>
              </CardContent>
           </Card>
           <Card>
              <CardContent className="p-4 flex flex-col gap-1">
                 <span className="text-sm font-medium text-muted-foreground">Mijoz bo'lganiga</span>
                 <span className="text-lg font-bold">
                    {formatDate(client.created_at)}
                 </span>
              </CardContent>
           </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* LEFT COLUMN: Personal Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="h-fit sticky top-6 shadow-sm">
              <CardHeader className="border-b bg-muted/30 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" /> 
                  Ma'lumotlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                    <div className="group flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary/20 transition-colors">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Telefon Raqam</p>
                        <p className="font-semibold text-base mt-0.5">{client.phone}</p>
                      </div>
                    </div>
                    
                    <Separator />

                    <div className="group flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary/20 transition-colors">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ro'yxatdan o'tgan</p>
                        <p className="font-semibold text-base mt-0.5">{formatDate(client.created_at)}</p>
                      </div>
                    </div>

                    <Separator />

                    {client.conversation_file && (
                      <div className="group flex items-start gap-4">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-400">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="w-full overflow-hidden">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Suhbat Fayli</p>
                          <a href="#" className="font-mono text-sm mt-0.5 text-blue-600 hover:underline block truncate w-48" title={client.conversation_file}>
                            {client.conversation_file}
                          </a>
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Orders & Reservations */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Orders Section */}
            <Card className="shadow-sm border-t-4 border-t-blue-500 overflow-hidden">
              <CardHeader className="bg-blue-50/30 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                       <ShoppingBag className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Buyurtmalar Tarixi</CardTitle>
                        <CardDescription>Mijozning barcha buyurtmalari ro'yxati</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1 text-sm bg-white shadow-sm border">
                    {client.orders.length} ta
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {client.orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/5">
                    <ShoppingBag className="h-12 w-12 mb-3 opacity-10" />
                    <p className="font-medium">Buyurtmalar mavjud emas</p>
                    <p className="text-sm opacity-70">Mijoz hali hech qanday buyurtma bermagan</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {client.orders.map((order) => (
                      <div key={order.id} className="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                           <div className="mt-1 bg-muted border p-2 rounded-md">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                           </div>
                           <div>
                              <div className="font-semibold text-base flex items-center gap-2">
                                 {order.format || "Fayl"}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                 <Clock className="h-3 w-3" /> {formatDate(order.created_at)}
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 bg-muted/20 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                           <span className="text-sm font-medium sm:hidden">Holati:</span>
                           <Badge variant={getStatusVariant(order.status)} className="capitalize px-3 py-1 flex items-center gap-1.5 h-7">
                             {getStatusIcon(order.status)}
                             {order.status}
                           </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reservations Section */}
            <Card className="shadow-sm border-t-4 border-t-orange-500 overflow-hidden">
              <CardHeader className="bg-orange-50/30 border-b pb-4">
                 <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                       <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Rezervatsiyalar</CardTitle>
                        <CardDescription>Bron qilingan muddatlar tarixi</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1 text-sm bg-white shadow-sm border">
                    {client.reservations.length} ta
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {client.reservations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/5">
                    <Clock className="h-12 w-12 mb-3 opacity-10" />
                    <p className="font-medium">Rezervatsiyalar mavjud emas</p>
                    <p className="text-sm opacity-70">Mijoz hali hech qanday bron qilmagan</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {client.reservations.map((res) => (
                      <div key={res.id} className="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="flex items-start gap-4">
                           <div className="mt-1 bg-orange-50 border border-orange-100 p-2 rounded-md dark:bg-orange-900/10 dark:border-orange-900/30">
                              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                           </div>
                           <div>
                              <div className="text-sm text-muted-foreground mb-1">Bron muddati:</div>
                              <div className="font-bold text-base text-orange-600 dark:text-orange-400">
                                 {formatDate(res.reserved_until)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                 Yaratildi: {formatDate(res.created_at)}
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 bg-muted/20 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                           <span className="text-sm font-medium sm:hidden">Holati:</span>
                           <Badge variant={getStatusVariant(res.status)} className="capitalize px-3 py-1 flex items-center gap-1.5 h-7">
                             {getStatusIcon(res.status)}
                             {res.status}
                           </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}