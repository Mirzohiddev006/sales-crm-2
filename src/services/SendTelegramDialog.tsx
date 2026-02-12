import { useState } from "react";
import { Send, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { telegramService } from "@/services/telegramService";

interface SendTelegramDialogProps {
  userId: number;
  chatId: number | null;
  fullname: string;
}

export function SendTelegramDialog({ userId, chatId, fullname }: SendTelegramDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId) {
      toast.error("Mijozning Telegram ID si yo'q");
      return;
    }
    if (!message || !image) {
      toast.error("Xabar va rasm tanlanishi shart");
      return;
    }

    try {
      setIsSending(true);
      await telegramService.sendImage(userId, chatId, message, image);
      toast.success("Xabar yuborildi");
      setOpen(false);
      setMessage("");
      setImage(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Yuborishda xatolik");
    } finally {
      setIsSending(false);
    }
  };

  if (!chatId) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setOpen(true)}>
        <Send className="h-4 w-4" />
        Telegramga yuborish
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Telegram orqali yuborish</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Mijoz</Label>
            <Input value={fullname} disabled />
          </div>
          
          <div className="space-y-2">
            <Label>Xabar</Label>
            <Textarea 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Xabar matni..."
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Rasm</Label>
            <div className="border-2 border-dashed border-border/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              {image ? (
                <div className="flex items-center gap-2 text-primary">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-sm font-medium truncate max-w-[200px]">{image.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">Rasm tanlash</span>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSending}>
            {isSending ? "Yuborilmoqda..." : "Yuborish"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}