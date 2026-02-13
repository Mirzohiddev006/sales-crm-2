import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, User, Phone, Calendar, ShoppingBag, MessageSquare, Clock, FileText, Hash, Pencil, BookOpen, DollarSign, MapPin, Truck, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { SendTelegramDialog } from "@/services/SendTelegramDialog";
import { ClientDialog } from "@/pages/clients/ClientsDialog"; 
import { clientsService } from "@/services/clientsService";
import { ClientDetailResponse } from "@/types/api";
import { formatDate, cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

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

  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false);
  const [ordersType, setOrdersType] = useState<"PDF" | "KITOB" | null>(null);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Yangi state: Tanlangan buyurtma tafsilotlari uchun
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  
  const [apiStats, setApiStats] = useState<{
    pdf_count: number;
    book_count: number;
    total_income: number;
  } | null>(null);

  const fetchClientDetail = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await clientsService.getClientDetail(Number(id));
      setClient(data);
      
      try {
        const ordersRes = await api.get(`/clients/${id}/orders`);
        setApiStats({
            pdf_count: ordersRes.data.pdf_count,
            book_count: ordersRes.data.book_count,
            total_income: ordersRes.data.total_income
        });
      } catch (e) {
        console.error("Failed to fetch stats", e);
      }
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

  const fetchOrders = async (type: "PDF" | "KITOB") => {
    if (!id) return;
    setOrdersType(type);
    setIsOrdersDialogOpen(true);
    setIsLoadingOrders(true);
    try {
      const response = await api.get(`/clients/${id}/orders`);
      const allOrders = response.data.orders || [];
      setApiStats({
        pdf_count: response.data.pdf_count,
        book_count: response.data.book_count,
        total_income: response.data.total_income
      });
      const filtered = allOrders.filter((o: any) => o.format === type);
      setOrdersList(filtered);
    } catch (err) {
      toast.error("Buyurtmalarni yuklashda xatolik");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Buyurtma ustiga bosilganda tafsilotlarni ochish
  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const cardBaseClass = "bg-[#111e33] border-white/5 shadow-lg"; 
  const textMutedClass = "text-slate-400"; 
  const textWhiteClass = "text-white"; 
  const iconBoxClass = "bg-white/5 p-2.5 rounded-xl text-white shrink-0 border border-white/10";
  const sectionHeaderClass = "bg-white/5 border-b border-white/5 py-4 px-6";

  const displayStats = apiStats || (client as any).statistics || { pdf_count: 0, book_count: 0, total_sum: 0 };
  const totalIncome = apiStats ? apiStats.total_income : ((client as any).statistics?.total_sum || 0);

  return (
    <DashboardLayout>
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

            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-3xl border ${cardBaseClass}`}>
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-bold border-2 border-white/10 bg-white/5 text-white">
                  {getInitials(client.fullname)}
                </div>
                <div className="space-y-1">
                  <h1 className={`text-3xl font-bold tracking-tight ${textWhiteClass}`}>{client.fullname}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                    <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-lg border border-white/10 text-slate-300 text-xs text-nowrap">
                      <Hash className="h-3 w-3" /> ID: {client.id}
                    </span>
                    <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-lg border border-white/10 text-slate-300 text-xs text-nowrap">
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
                <SendTelegramDialog 
                    userId={client.id} 
                    chatId={client.telegram_id || client.id} 
                    fullname={client.fullname} 
                />
              </div>
            </div>
          </div>

          <ClientDialog 
            open={isDialogOpen} 
            onOpenChange={setIsDialogOpen}
            client={client}
            onSuccess={fetchClientDetail}
          />

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              onClick={() => fetchOrders("PDF")}
              className={`rounded-2xl p-5 flex flex-col gap-1 border ${cardBaseClass} cursor-pointer hover:border-blue-500/50 transition-all hover:bg-blue-500/5 group`}
            >
              <span className={`text-xs uppercase tracking-wider font-bold ${textMutedClass}`}>PDF Xaridlar</span>
              <span className={`text-3xl font-bold ${textWhiteClass} group-hover:text-blue-400 transition-colors`}>{displayStats.pdf_count} ta</span>
            </div>
            
            <div 
              onClick={() => fetchOrders("KITOB")}
              className={`rounded-2xl p-5 flex flex-col gap-1 border ${cardBaseClass} cursor-pointer hover:border-emerald-500/50 transition-all hover:bg-emerald-500/5 group`}
            >
              <span className={`text-xs uppercase tracking-wider font-bold ${textMutedClass}`}>Kitob Xaridlar</span>
              <span className={`text-3xl font-bold ${textWhiteClass} group-hover:text-emerald-400 transition-colors`}>{displayStats.book_count} ta</span>
            </div>
            
            <div className={`rounded-2xl p-5 flex flex-col gap-1 border ${cardBaseClass}`}>
              <span className={`text-xs uppercase tracking-wider font-bold ${textMutedClass}`}>Jami Tushum</span>
              <span className={`text-2xl font-bold ${textWhiteClass} truncate`} title={`${totalIncome} UZS`}>
                {totalIncome?.toLocaleString()}
              </span>
            </div>
            
            <div className={`rounded-2xl p-5 flex flex-col gap-1 border ${cardBaseClass}`}>
              <span className={`text-xs uppercase tracking-wider font-bold ${textMutedClass}`}>Ro'yxatdan o'tdi</span>
              <span className={`text-xl font-bold ${textWhiteClass}`}>{formatDate(client.created_at)}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
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
                            <div className={iconBoxClass}><MessageSquare className="h-5 w-5" /></div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-[10px] font-bold ${textMutedClass} uppercase tracking-wider`}>Suhbat Fayli</p>
                              <div 
                                onClick={() => navigate(`/conversations?file=${encodeURIComponent(client.conversation_file || "")}`)}
                                className="text-sm font-medium mt-0.5 text-blue-400 hover:text-blue-300 hover:underline block truncate cursor-pointer" 
                                title={client.conversation_file}
                              >
                                {client.conversation_file}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <Card className={cn("overflow-hidden rounded-2xl border-none", cardBaseClass)}>
                <CardHeader className={sectionHeaderClass}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 p-1.5 rounded-lg text-white">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <CardTitle className={`text-base font-bold ${textWhiteClass}`}>Buyurtmalar Tarixi</CardTitle>
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
                        <div 
                          key={order.id} 
                          onClick={() => handleOrderClick(order)}
                          className="p-4 sm:px-6 hover:bg-white/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="mt-1 bg-white/5 border border-white/10 p-2 rounded-lg text-white group-hover:border-blue-500/50 transition-colors">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <div className={`font-bold text-sm ${textWhiteClass} group-hover:text-blue-400 transition-colors`}>{order.format || "PDF Fayl"}</div>
                                <div className={`text-xs ${textMutedClass} flex items-center gap-1.5 mt-1 font-medium`}>
                                  <Clock className="h-3 w-3" /> {formatDate(order.created_at)}
                                </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "px-3 py-1 rounded-md text-xs font-bold border capitalize tracking-wide",
                              order.status === 'completed' ? "bg-green-500/20 text-green-400 border-green-500/20" :
                              order.status === 'cancelled' ? "bg-red-500/20 text-red-400 border-red-500/20" :
                              "bg-white/10 text-slate-300 border-white/10"
                            )}>
                              {order.status}
                            </div>
                            <Eye className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={cn("overflow-hidden rounded-2xl border-none", cardBaseClass)}>
                <CardHeader className={sectionHeaderClass}>
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 p-1.5 rounded-lg text-white">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <CardTitle className={`text-base font-bold ${textWhiteClass}`}>Rezervatsiyalar</CardTitle>
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

        {/* 1. Oylik/Guruhlangan Buyurtmalar Dialogi */}
        <Dialog open={isOrdersDialogOpen} onOpenChange={setIsOrdersDialogOpen}>
          <DialogContent className="sm:max-w-3xl bg-[#020617] border-[#1e293b] text-slate-200 rounded-3xl shadow-2xl overflow-hidden p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                {ordersType === "PDF" ? <FileText className="text-blue-400"/> : <BookOpen className="text-emerald-400"/>}
                {ordersType === "PDF" ? "PDF Buyurtmalar" : "Kitob Buyurtmalar"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-6">
              {isLoadingOrders ? (
                <div className="py-10 flex justify-center"><Loading /></div>
              ) : ordersList.length === 0 ? (
                <div className="py-10 text-center text-slate-500">Buyurtmalar topilmadi</div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {ordersList.map(order => (
                      <div 
                        key={order.id} 
                        onClick={() => handleOrderClick(order)}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3 hover:bg-white/10 transition-all cursor-pointer border-l-4"
                        style={{ borderLeftColor: ordersType === "PDF" ? "#60a5fa" : "#10b981" }}
                      >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-sm text-white flex items-center gap-2">
                                Buyurtma #{order.id}
                                {order.bts_branch_id && <Badge variant="outline" className="text-[10px] border-white/20 text-slate-400">BTS ID: {order.bts_branch_id}</Badge>}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-1 flex gap-3 font-medium uppercase tracking-tight">
                                 <span>Sana: {formatDate(order.created_at)}</span>
                                 {order.purchase_month && <span>Oy: {order.purchase_month}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn(
                                    "capitalize text-[10px] font-bold",
                                    order.status === 'completed' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-slate-300"
                                )}>{order.status}</Badge>
                                <Eye className="h-3.5 w-3.5 text-slate-500" />
                            </div>
                          </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* 2. Buyurtma Tafsilotlari (Order Details) Dialogi */}
        <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
          <DialogContent className="sm:max-w-xl bg-[#020617] border-[#1e293b] text-slate-200 rounded-3xl shadow-2xl p-0 overflow-hidden animate-in zoom-in-95 duration-200">
            {selectedOrder && (
              <>
                <div className={cn(
                  "p-8 flex items-center justify-between border-b border-white/5",
                  selectedOrder.format === "PDF" ? "bg-blue-500/10" : "bg-emerald-500/10"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-3 rounded-2xl",
                        selectedOrder.format === "PDF" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"
                    )}>
                      {selectedOrder.format === "PDF" ? <FileText size={28} /> : <BookOpen size={28} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Buyurtma #{selectedOrder.id}</h3>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">{selectedOrder.format} Buyurtma</p>
                    </div>
                  </div>
                  <Badge className={cn(
                      "h-8 px-4 font-bold border-none capitalize rounded-full",
                      selectedOrder.status === 'completed' ? "bg-green-500 text-white" : "bg-white/10 text-slate-200"
                  )}>
                    {selectedOrder.status}
                  </Badge>
                </div>

                <div className="p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sana va vaqt</span>
                         <p className="text-sm font-semibold flex items-center gap-2"><Clock size={14}/> {formatDate(selectedOrder.created_at)}</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sotuv oyi</span>
                         <p className="text-sm font-semibold capitalize flex items-center gap-2"><Calendar size={14}/> {selectedOrder.purchase_month || "Belgilanmagan"}</p>
                      </div>
                   </div>

                   <Separator className="bg-white/5" />

                   {selectedOrder.format === "KITOB" && (
                     <>
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                <Truck size={14} /> Yetkazib berish ma'lumotlari
                            </h4>
                            <div className="grid gap-4">
                               <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                                  <div className="flex items-start gap-3">
                                     <MapPin className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                                     <p className="text-sm font-medium text-slate-200">{selectedOrder.shipping_info || "Manzil kiritilmagan"}</p>
                                  </div>
                                  <div className="flex items-center gap-3 border-t border-white/5 pt-3 mt-3">
                                     <Hash className="h-4 w-4 text-slate-400 shrink-0" />
                                     <p className="text-sm font-mono text-slate-300">BTS ID: <span className="text-white font-bold">{selectedOrder.bts_branch_id || "Yo'q"}</span></p>
                                  </div>
                               </div>
                               <div className="flex items-center justify-between px-2">
                                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Yetkazib berish vaqti</span>
                                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-none font-bold">
                                    {selectedOrder.delivery_days ? `${selectedOrder.delivery_days} kun` : "Aniqlanmagan"}
                                  </Badge>
                               </div>
                            </div>
                        </div>
                        <Separator className="bg-white/5" />
                     </>
                   )}

                   <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><DollarSign size={18}/></div>
                         <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">To'lov miqdori</span>
                      </div>
                      <span className="text-xl font-black text-white">{selectedOrder.total_sum?.toLocaleString() || 0} UZS</span>
                   </div>
                </div>

                <div className="p-6 bg-slate-900/40 border-t border-white/5 flex justify-end">
                  <Button 
                    onClick={() => setIsOrderDetailOpen(false)}
                    className="bg-white text-[#021026] hover:bg-slate-200 rounded-xl font-bold px-8"
                  >
                    Yopish
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}