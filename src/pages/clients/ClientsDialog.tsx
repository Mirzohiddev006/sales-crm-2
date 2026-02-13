import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Edit, Plus, FileText, BookOpen } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientsService } from "@/services/clientsService";
import { ClientDetailResponse } from "@/types/api";

interface ClientDialogProps {
  client?: ClientDetailResponse; // Edit rejimi uchun
  trigger?: React.ReactNode;     
  onSuccess?: () => void;         
  open?: boolean;                 
  onOpenChange?: (open: boolean) => void;
}

interface ClientFormData {
  fullname: string;
  phone: string;
  telegram_id?: number | string;
  telegram_username?: string;
  conversation_file?: string;
  pdf_count: number;
  book_count: number;
}

export function ClientDialog({ 
  client, 
  trigger, 
  onSuccess,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: ClientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = setControlledOpen ?? setInternalOpen;

  const { register, handleSubmit, reset, setValue } = useForm<ClientFormData>();

  useEffect(() => {
    if (client && isOpen) {
      setValue("fullname", client.fullname);
      setValue("phone", client.phone);
      setValue("telegram_id", (client as any).telegram_id || "");
      setValue("telegram_username", (client as any).telegram_username || "");
      setValue("conversation_file", client.conversation_file || "");
    } else if (!client && isOpen) {
      reset({
        fullname: "", phone: "", telegram_id: "", telegram_username: "",
        conversation_file: "", pdf_count: 0, book_count: 0
      });
    }
  }, [client, isOpen, setValue, reset]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);
      
      const payload: any = {
        fullname: data.fullname,
        phone: data.phone,
        telegram_id: data.telegram_id ? Number(data.telegram_id) : 0,
        telegram_username: data.telegram_username || "",
        conversation_file: data.conversation_file || ""
      };

      // API talabiga ko'ra Create vaqtida countlar bo'lishi shart
      if (!client) {
        payload.pdf_count = Number(data.pdf_count || 0);
        payload.book_count = Number(data.book_count || 0);
      }

      if (client) {
        // PATCH /clients/{id}
        await (clientsService as any).updateClient(client.id, payload);
        toast.success("Mijoz yangilandi");
      } else {
        // POST /clients/create
        await clientsService.createClient(payload);
        toast.success("Yangi mijoz qo'shildi");
      }

      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      // 400 yoki 422 xatolarini chiroyli ko'rsatish
      const errorMsg = error.response?.data?.detail;
      toast.error(Array.isArray(errorMsg) ? errorMsg[0].msg : (errorMsg || "Xatolik yuz berdi"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "bg-[#0f172a] border-white/10 text-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl h-11 transition-all shadow-inner";
  const labelClass = "text-slate-400 text-[10px] uppercase font-black tracking-widest ml-1";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <div onClick={() => setIsOpen(true)}>{trigger}</div>}
      
      <DialogContent className="sm:max-w-[500px] bg-[#021026] border-white/10 text-slate-200 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-0 overflow-hidden border-none">
        <DialogHeader className="p-8 pb-4 bg-gradient-to-b from-white/5 to-transparent">
          <DialogTitle className="text-2xl font-black flex items-center gap-4 tracking-tight">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 shadow-inner border border-indigo-500/20">
              {client ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <div className="flex flex-col">
                <span>{client ? "Mijozni Tahrirlash" : "Yangi Mijoz Qo'shish"}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold mt-1">Loyiha Boshqaruvi</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-4 space-y-6">
          <div className="grid gap-5">
            {/* Fullname */}
            <div className="space-y-2">
              <Label htmlFor="fullname" className={labelClass}>F.I.O (To'liq Ism) *</Label>
              <Input id="fullname" placeholder="Eshmatov Toshmat" className={inputClass} {...register("fullname", { required: "Ism kiritish shart" })} />
            </div>

            {/* Phone & Username */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className={labelClass}>Telefon *</Label>
                <Input id="phone" placeholder="+998" className={inputClass} {...register("phone", { required: "Raqam shart" })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram_username" className={labelClass}>Username</Label>
                <Input id="telegram_username" placeholder="@username" className={inputClass} {...register("telegram_username")} />
              </div>
            </div>

            {/* Faqat Create rejimida PDF va Book countlar */}
            {!client && (
              <div className="grid grid-cols-2 gap-4 p-5 bg-indigo-500/5 rounded-[1.5rem] border border-indigo-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileText size={40} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pdf_count" className="text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3 h-3" /> PDF Soni
                  </Label>
                  <Input id="pdf_count" type="number" defaultValue={0} className={inputClass} {...register("pdf_count")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book_count" className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Kitob Soni
                  </Label>
                  <Input id="book_count" type="number" defaultValue={0} className={inputClass} {...register("book_count")} />
                </div>
              </div>
            )}

            {/* File & ID */}
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2 col-span-1">
                <Label htmlFor="telegram_id" className={labelClass}>Telegram ID</Label>
                <Input id="telegram_id" placeholder="1234567" className={inputClass} {...register("telegram_id")} />
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="conversation_file" className={labelClass}>Suhbat Fayli</Label>
                <Input id="conversation_file" placeholder="Link..." className={inputClass} {...register("conversation_file")} />
              </div>
            </div>
          </div>

          <DialogFooter className="py-8 gap-3 border-t border-white/5">
            <Button type="button" variant="ghost" className="text-slate-500 hover:text-slate-300 font-bold tracking-widest text-[10px]" onClick={() => setIsOpen(false)}>
              BEKOR QILISH
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-10 rounded-xl shadow-lg shadow-indigo-600/20 h-12 transition-all active:scale-95">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : client ? "O'ZGARISHLARNI SAQLASH" : "MIJOZNI QO'SHISH"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}