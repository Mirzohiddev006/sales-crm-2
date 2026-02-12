import { useState, useRef } from "react";
import { Send, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { telegramService } from "@/services/telegramService";

interface SendTelegramDialogProps {
  userId: number;
  chatId: number | string | null; // chatId null bo'lishi mumkin
  fullname: string;
}

export function SendTelegramDialog({ userId, chatId, fullname }: SendTelegramDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Fayl hajmini tekshirish (masalan 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Fayl hajmi 5MB dan oshmasligi kerak");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!chatId) {
      toast.error("Mijozning Telegram ID si mavjud emas!");
      return;
    }

    if (!selectedFile) {
      toast.error("Iltimos, rasm tanlang");
      return;
    }

    if (!message.trim()) {
      toast.error("Xabar matnini kiriting");
      return;
    }

    try {
      setIsSending(true);
      await telegramService.sendImage(userId, chatId, selectedFile, message);
      
      toast.success("Rasm va xabar muvaffaqiyatli yuborildi");
      setOpen(false);
      
      // Reset form
      setMessage("");
      handleRemoveFile();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Yuborishda xatolik yuz berdi");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button 
        className="bg-blue-600 text-white hover:bg-blue-700 border-none shadow-md font-semibold transition-colors" 
        onClick={() => setOpen(true)}
      >
        <Send className="h-4 w-4 mr-2" /> Telegram
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Telegram orqali rasm yuborish</DialogTitle>
          <DialogDescription>
            {fullname} ga rasm va xabar yuboring.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          
          {/* File Input */}
          <div className="space-y-2">
            <Label>Rasm yuklash</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                previewUrl ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onClick={() => !previewUrl && fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="relative w-full">
                  <img src={previewUrl} alt="Preview" className="max-h-[200px] w-full object-contain rounded-md" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm">Rasm tanlash uchun bosing</span>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message">Xabar matni</Label>
            <Textarea
              id="message"
              placeholder="Xabaringizni yozing..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Warning if no Chat ID */}
          {!chatId && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              Diqqat: Ushbu mijozda Telegram ID mavjud emas. Yuborib bo'lmaydi.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Bekor qilish</Button>
          <Button onClick={handleSend} disabled={isSending || !chatId || !selectedFile}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Yuborilmoqda...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Yuborish
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}