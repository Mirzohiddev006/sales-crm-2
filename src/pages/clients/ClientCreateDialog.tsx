import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clientsService } from "@/services/clientsService";
import { ClientCreate } from "@/types/api";

interface ClientCreateDialogProps {
  onSuccess: () => void;
}

export function ClientCreateDialog({ onSuccess }: ClientCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ClientCreate>({
    fullname: "",
    phone: "",
    telegram_id: 0,
    telegram_username: "",
    conversation_file: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await clientsService.createClient(formData);
      toast.success("Mijoz muvaffaqiyatli qo'shildi");
      setOpen(false);
      setFormData({ fullname: "", phone: "", telegram_id: 0, telegram_username: "", conversation_file: "" });
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Yangi mijoz
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yangi mijoz qo'shish</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">F.I.O</Label>
            <Input
              id="fullname"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegram_id">Telegram ID (ixtiyoriy)</Label>
            <Input
              id="telegram_id"
              type="number"
              value={formData.telegram_id || ""}
              onChange={(e) => setFormData({ ...formData, telegram_id: Number(e.target.value) })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}