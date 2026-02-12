import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, User, Phone, Calendar, ShoppingBag, MessageSquare, Clock, FileText, Hash, Pencil 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { SendTelegramDialog } from "@/services/SendTelegramDialog";
import { ClientDialog } from "@/pages/clients/ClientsDialog"; 
import { clientsService } from "@/services/clientsService";
import { ClientDetailResponse } from "@/types/api";
import { formatDate, cn } from "@/lib/utils";

// LOYIHA RANGI: #021026 (DARK MODE)
const getInitials = (name: string) => {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

export function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  if (isLoading) return <DashboardLayout><Loading fullScreen text="Mijoz ma'lumotlari yuklanmoqda..." /></DashboardLayout>;
  if (error || !client) return <DashboardLayout><ErrorState message={error || "Mijoz topilmadi"} retry={fetchClientDetail} /></DashboardLayout>;

  // DARK MODE STYLES
  // Sahifa foni #021026 bo'lgani uchun, kartalar biroz ochroq (#111e33) yoki shaffof bo'lishi kerak.
  const cardBaseClass = "bg-[#111e33] border-white/5 shadow-lg"; 
  const textMutedClass = "text-slate-400"; // Oqish kulrang
  const textWhiteClass = "text-white"; // Toza oq
  const iconBoxClass = "bg-white/5 p-2.5 rounded-xl text-white shrink-0 border border-white/10";
  const sectionHeaderClass = "bg-white/5 border-b border-white/5 py-4 px-6";

  return (
    <DashboardLayout>
      {/* ASOSIY FON: bg-[#021026] 
        Matnlar avtomatik oq bo'lishi uchun text-slate-200 qo'shildi.
      */}
      <div className="min-h-[calc(100vh-4rem)] -m-6 p-6 bg-[#021026] text-slate-200">
        <div className="space-y-8 animate-in fade-in-50 duration-500 max-w-7xl mx-auto pb-10">
          
          {/* Header Section */}
          <div className="flex flex-col gap-6">
            <Button 
              variant="ghost" 
              className={`w-fit pl-0 hover:pl-2 transition-all ${textMutedClass} hover:text-white hover:bg-transparent`}
              onClick={() => navigate("/clients")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Mijozlar ro'yxati
            </Button>

            {/* Main Info Card */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-3xl border ${cardBaseClass}`}>
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-bold border-2 border-white/10 bg-white/5 text-white">
                  {getInitials(client.fullname)}
                </div>
                <div className="space-y-1">
                  <h1 className={`text-3xl font-bold tracking-tight ${textWhiteClass}`}>{client.fullname}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                    <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-lg border border-white/10 text-slate-300 text-xs">
                      <Hash className="h-3 w-3" /> ID: {client.id}
                    </span>
                    <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-lg border border-white/10 text-slate-300 text-xs">
                      <Phone className="h-3 w-3" /> {client.phone}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                <Button 
                  className="bg-white text-[#021026] hover:bg-slate-200 border-none shadow-md font-semibold transition-colors" 
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Tahrirlash
                </Button>
                {/* Telegram Dialog */}
                <SendTelegramDialog 
                    userId={client.id} 
                    chatId={client.telegram_id || client.id} 
                    fullname={client.fullname} 
                />
              </div>
            </div>
          </div>

          {/* Edit Dialog */}
          <ClientDialog 
            open={isDialogOpen} 
            onOpenChange={setIsDialogOpen}
            client={client}
            onSuccess={fetchClientDetail}
          />

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Jami Buyurtmalar */}
            <div className={`rounded-2xl p-5 flex flex-col gap-1 border ${cardBaseClass}`}>
              <span className={`text-xs uppercase tracking-wider font-bold ${textMutedClass}`}>Jami Buyurtmalar</span>
              <span className={`text-3xl font-bold ${textWhiteClass}`}>{client.orders?.length || 0}</span>
            </div>
            
            {/* Muvaffaqiyatli */}
            <div className={`rounded-2xl p-5 flex flex-col gap-1 border ${cardBaseClass}`}>
              <span className={`text-xs uppercase tracking-wider font-bold ${textMutedClass}`}>Muvaffaqiyatli</span>
              <span className={`text-3xl font-bold ${textWhiteClass}`}>
                  {client.orders?.filter(o => o.status === 'completed').length || 0}
              </span>
            </div>
            
            {/* Rezervatsiyalar */}
            <div className={`rounded-2xl p-5 flex flex-col gap-1 border ${cardBaseClass}`}>
              <span className={`text-xs uppercase tracking-wider font-bold ${textMutedClass}`}>Rezervatsiyalar</span>
              <span className={`text-3xl font-bold ${textWhiteClass}`}>{client.reservations?.length || 0}</span>
            </div>
            
            {/* Ro'yxatdan o'tdi */}
            <div className={`rounded-2xl p-5 flex flex-col gap-1 border ${cardBaseClass}`}>
              <span className={`text-xs uppercase tracking-wider font-bold ${textMutedClass}`}>Ro'yxatdan o'tdi</span>
              <span className={`text-xl font-bold ${textWhiteClass}`}>{formatDate(client.created_at)}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Left Column: Personal Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className={cn("overflow-hidden rounded-2xl border-none", cardBaseClass)}>
                <CardHeader className={sectionHeaderClass}>
                  <CardTitle className={`flex items-center gap-2 text-base font-bold ${textWhiteClass}`}>
                    <User className="h-4 w-4" /> Shaxsiy Ma'lumotlar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 px-5 pb-6">
                  <div className="space-y-5">
                      <div className="flex items-center gap-4">
                        <div className={iconBoxClass}><Phone className="h-5 w-5" /></div>
                        <div>
                          <p className={`text-[10px] font-bold ${textMutedClass} uppercase tracking-wider`}>Telefon Raqam</p>
                          <p className={`font-bold text-sm mt-0.5 ${textWhiteClass}`}>{client.phone}</p>
                        </div>
                      </div>
                      
                      <Separator className="bg-white/10" />
                      
                      <div className="flex items-center gap-4">
                        <div className={iconBoxClass}><Calendar className="h-5 w-5" /></div>
                        <div>
                          <p className={`text-[10px] font-bold ${textMutedClass} uppercase tracking-wider`}>Ro'yxatdan o'tgan</p>
                          <p className={`font-bold text-sm mt-0.5 ${textWhiteClass}`}>{formatDate(client.created_at)}</p>
                        </div>
                      </div>

                      {client.conversation_file && (
                        <>
                          <Separator className="bg-white/10" />
                          <div className="flex items-center gap-4">
                            <div className={iconBoxClass}>
                              <MessageSquare className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-[10px] font-bold ${textMutedClass} uppercase tracking-wider`}>Suhbat Fayli</p>
                              <a 
                                href="#" 
                                className="text-sm font-medium mt-0.5 text-blue-400 hover:text-blue-300 hover:underline block truncate" 
                                title={client.conversation_file}
                              >
                                {client.conversation_file}
                              </a>
                            </div>
                          </div>
                        </>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column: Orders & Reservations */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Orders Section */}
              <Card className={cn("overflow-hidden rounded-2xl border-none", cardBaseClass)}>
                <CardHeader className={sectionHeaderClass}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 p-1.5 rounded-lg text-white">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className={`text-base font-bold ${textWhiteClass}`}>Buyurtmalar Tarixi</CardTitle>
                      </div>
                    </div>
                    <Badge className="bg-white/10 text-white hover:bg-white/20 border-none px-2.5">
                      {client.orders?.length || 0} ta
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {(!client.orders || client.orders.length === 0) ? (
                    <div className="text-center py-12">
                      <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShoppingBag className="h-8 w-8 text-white/20" />
                      </div>
                      <p className={`font-medium ${textMutedClass}`}>Buyurtmalar mavjud emas</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {client.orders.map((order) => (
                        <div key={order.id} className="p-4 sm:px-6 hover:bg-white/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="mt-1 bg-white/5 border border-white/10 p-2 rounded-lg text-white">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <div className={`font-bold text-sm ${textWhiteClass}`}>{order.format || "PDF Fayl"}</div>
                                <div className={`text-xs ${textMutedClass} flex items-center gap-1.5 mt-1 font-medium`}>
                                  <Clock className="h-3 w-3" /> {formatDate(order.created_at)}
                                </div>
                            </div>
                          </div>
                          
                          <div className={cn(
                            "px-3 py-1 rounded-md text-xs font-bold border capitalize tracking-wide",
                            order.status === 'completed' ? "bg-green-500/20 text-green-400 border-green-500/20" :
                            order.status === 'cancelled' ? "bg-red-500/20 text-red-400 border-red-500/20" :
                            "bg-white/10 text-slate-300 border-white/10"
                          )}>
                            {order.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reservations Section */}
              <Card className={cn("overflow-hidden rounded-2xl border-none", cardBaseClass)}>
                <CardHeader className={sectionHeaderClass}>
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 p-1.5 rounded-lg text-white">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className={`text-base font-bold ${textWhiteClass}`}>Rezervatsiyalar</CardTitle>
                      </div>
                    </div>
                    <Badge className="bg-white/10 text-white hover:bg-white/20 border-none px-2.5">
                      {client.reservations?.length || 0} ta
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {(!client.reservations || client.reservations.length === 0) ? (
                    <div className="text-center py-12">
                      <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="h-8 w-8 text-white/20" />
                      </div>
                      <p className={`font-medium ${textMutedClass}`}>Rezervatsiyalar mavjud emas</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {client.reservations.map((res) => (
                        <div key={res.id} className="p-4 sm:px-6 hover:bg-white/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="mt-1 bg-white/5 border border-white/10 p-2 rounded-lg text-white">
                                <Clock className="h-5 w-5" />
                              </div>
                              <div>
                                <div className={`text-[10px] font-bold ${textMutedClass} uppercase tracking-wide mb-0.5`}>Bron muddati</div>
                                <div className={`font-bold text-sm ${textWhiteClass}`}>
                                  {formatDate(res.reserved_until)}
                                </div>
                              </div>
                            </div>
                            <div className={cn(
                              "px-3 py-1 rounded-md text-xs font-bold border capitalize tracking-wide",
                              res.status === 'completed' ? "bg-green-500/20 text-green-400 border-green-500/20" :
                              res.status === 'cancelled' ? "bg-red-500/20 text-red-400 border-red-500/20" :
                              "bg-white/10 text-slate-300 border-white/10"
                            )}>
                              {res.status}
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
      </div>
    </DashboardLayout>
  );
}