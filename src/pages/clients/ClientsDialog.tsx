import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
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
  client?: ClientDetailResponse; // Agar bu berilsa, Edit rejimida ishlaydi
  trigger?: React.ReactNode;     // Tugma dizayni (ixtiyoriy)
  onSuccess?: () => void;        // Muvaffaqiyatli tugagandan keyin
  open?: boolean;                // Dialog ochiqligini tashqaridan boshqarish uchun
  onOpenChange?: (open: boolean) => void;
}

interface ClientFormData {
  fullname: string;
  phone: string;
  telegram_id?: number | string;
  telegram_username?: string;
  conversation_file?: string;
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

  // Dialog ochiq/yopiqligini boshqarish
  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = setControlledOpen ?? setInternalOpen;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ClientFormData>();

  // Edit rejimida formani to'ldirish
  useEffect(() => {
    if (client && isOpen) {
      setValue("fullname", client.fullname);
      setValue("phone", client.phone);
      // API dagi ba'zi maydonlar client detailda kelmasligi mumkin, 
      // agar ular backendda bor bo'lsa, ularni ham qo'shish kerak.
      // Hozircha mavjudlarini to'ldiramiz.
      if ((client as any).telegram_id) setValue("telegram_id", (client as any).telegram_id);
      if ((client as any).telegram_username) setValue("telegram_username", (client as any).telegram_username);
      if (client.conversation_file) setValue("conversation_file", client.conversation_file);
    } else if (!client && isOpen) {
      reset({
        fullname: "",
        phone: "",
        telegram_id: "",
        telegram_username: "",
        conversation_file: ""
      });
    }
  }, [client, isOpen, setValue, reset]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);
      
      // Ma'lumotlarni tozalash va formatlash
      const payload = {
        fullname: data.fullname,
        phone: data.phone,
        telegram_id: data.telegram_id ? Number(data.telegram_id) : 0,
        telegram_username: data.telegram_username || "",
        conversation_file: data.conversation_file || ""
      };

      if (client) {
        // Update logic
        await clientsService.updateClient(client.id, payload);
        toast.success("Mijoz ma'lumotlari yangilandi");
      } else {
        // Create logic
        await clientsService.createClient(payload);
        toast.success("Yangi mijoz qo'shildi");
      }

      setIsOpen(false);
      reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <div onClick={() => setIsOpen(true)}>{trigger}</div>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{client ? "Mijozni tahrirlash" : "Yangi mijoz qo'shish"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">To'liq ism (F.I.O) *</Label>
            <Input
              id="fullname"
              placeholder="Masalan: Eshmatov Toshmat"
              {...register("fullname", { required: "Ism kiritish shart" })}
            />
            {errors.fullname && <span className="text-xs text-red-500">{errors.fullname.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon raqam *</Label>
            <Input
              id="phone"
              placeholder="+998901234567"
              {...register("phone", { required: "Telefon raqam shart" })}
            />
            {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telegram_id">Telegram ID</Label>
              <Input
                id="telegram_id"
                type="number"
                placeholder="123456789"
                {...register("telegram_id")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegram_username">Username</Label>
              <Input
                id="telegram_username"
                placeholder="@username"
                {...register("telegram_username")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conversation_file">Suhbat fayli (Link)</Label>
            <Input
              id="conversation_file"
              placeholder="https://..."
              {...register("conversation_file")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Bekor qilish</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {client ? "Saqlash" : "Qo'shish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}