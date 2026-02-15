import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Save, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
Dialog,
DialogContent,
DialogHeader,
DialogTitle,
DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateOrder, UpdateOrderPayload } from "@/lib/orders";
import { OrderItem, PDFChannelResponse } from "@/types/api";
import { pdfChannelsService } from "@/services/pdfChannelsService";

interface EditOrderDialogProps {
order: OrderItem;
onSuccess?: () => void;
}

const ORDER_STATUSES = [
  { value: "start_bosdi", label: "Start bosdi" },
  { value: "ism_va_raqam_qoldirgan", label: "Ism va raqam qoldirgan" },
  { value: "format_tanlab_kart_raqam_olgan", label: "Format tanlab karta olgan" },
  { value: "pdf_uchun_tolov_qilingan", label: "PDF uchun to'lov qilingan" },
  { value: "kitob_uchun_tolov_qilingan", label: "Kitob uchun to'lov qilingan" },
  { value: "bts_ga_berilgan", label: "BTS ga berilgan" },
  { value: "kitob_yetib_borgan", label: "Kitob yetib borgan" },
  { value: "completed", label: "Yakunlangan" },
  { value: "canceled", label: "Bekor qilingan" },
];

export function EditOrderDialog({ order, onSuccess }: EditOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [channels, setChannels] = useState<PDFChannelResponse[]>([]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await pdfChannelsService.getAllChannels();
        setChannels(response.items);
      } catch (error) {
        console.error("Failed to fetch channels:", error);
      }
    };
    fetchChannels();
  }, []);

  const { register, handleSubmit, setValue, watch } = useForm<UpdateOrderPayload>({
    defaultValues: {
      status: order.status,
      format: order.format || "",
      purchase_month: order.purchase_month || "",
      shipping_info: order.shipping_info || "",
      order_count: order.order_count || 0,
      delivery_days: order.delivery_days || 0,
      bts_branch_id: order.bts_branch_id || 0,
      pdf_month_id: order.pdf_month_id || 0,
    },
  });

  const format = watch("format");
  const isPdf = format?.toUpperCase() === "PDF";

  const onSubmit = async (data: UpdateOrderPayload) => {
    try {
      setIsLoading(true);
      await updateOrder(order.id, data);
      toast.success("Buyurtma muvaffaqiyatli yangilandi");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Yangilashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "bg-[#0f172a] border-white/10 text-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl h-10 transition-all shadow-inner placeholder:text-slate-500";
  const labelClass = "text-slate-400 text-[10px] uppercase font-black tracking-widest ml-1";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-[#021026] border-white/10 text-slate-200 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-0">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
          <DialogTitle className="text-xl font-black flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <Edit className="w-5 h-5" />
              </div>
              Buyurtmani tahrirlash #{order.id}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          
          <div className="space-y-2">
            <Label className={labelClass}>Status</Label>
            <Select 
              defaultValue={order.status} 
              onValueChange={(val) => setValue("status", val)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Status tanlang" />
              </SelectTrigger>
              <SelectContent className="bg-[#021026] border-white/10 text-slate-200">
                {ORDER_STATUSES.map((st) => (
                  <SelectItem key={st.value} value={st.value} className="focus:bg-white/10 focus:text-slate-200 cursor-pointer">
                    {st.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={labelClass}>Format</Label>
              <Input {...register("format")} placeholder="A4, A5..." className={inputClass} />
            </div>
            {isPdf ? (
              <div className="space-y-2">
                <Label className={labelClass}>PDF Kanal (Oy)</Label>
                <Select 
                  value={watch("pdf_month_id")?.toString() || "0"} 
                  onValueChange={(val) => setValue("pdf_month_id", Number(val))}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Kanalni tanlang" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#021026] border-white/10 text-slate-200">
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id.toString()} className="focus:bg-white/10 focus:text-slate-200 cursor-pointer">
                        {channel.channel_name} ({channel.channel_month})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className={labelClass}>Buyurtma soni</Label>
                <Input 
                  type="number" 
                  {...register("order_count", { valueAsNumber: true })} 
                  className={inputClass}
                />
              </div>
            )}
          </div>

          {isPdf && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={labelClass}>Buyurtma soni</Label>
                <Input 
                  type="number" 
                  {...register("order_count", { valueAsNumber: true })} 
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {!isPdf && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={labelClass}>Yetkazish kunlari</Label>
                <Input 
                  type="number" 
                  {...register("delivery_days", { valueAsNumber: true })} 
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>BTS Branch ID</Label>
                <Input 
                  type="number" 
                  {...register("bts_branch_id", { valueAsNumber: true })} 
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {!isPdf && (
          <div className="space-y-2">
            <Label className={labelClass}>Yetkazib berish ma'lumotlari</Label>
            <Textarea 
              {...register("shipping_info")} 
              placeholder="Manzil, mo'ljal va h.k."
              className={`${inputClass} min-h-[80px] py-2`}
            />
          </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 font-bold tracking-widest text-[10px]">
              BEKOR QILISH
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20">
              {isLoading ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saqlanmoqda...
                </>
              ) : (
                <>
                <Save className="mr-2 h-4 w-4" /> Saqlash
                </>
              )}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
