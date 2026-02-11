import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/common/Loading";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { pdfChannelsService } from "@/services/pdfChannelsService";

const schema = z.object({
  channel_name: z.string().min(1, "Kanal nomi kiritish majburiy"),
  channel_month: z.string().min(1, "Oy kiritish majburiy"),
  channel_link: z.string().url("To'g'ri link kiriting").min(1, "Link kiritish majburiy"),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function PDFChannelFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);

  const { register, handleSubmit, control, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true },
  });

  useEffect(() => {
    if (isEditMode && id) {
      (async () => {
        try {
          setIsFetching(true);
          const data = await pdfChannelsService.getChannelById(Number(id));
          setValue("channel_name", data.channel_name);
          setValue("channel_month", data.channel_month);
          setValue("channel_link", data.channel_link);
          setValue("is_active", data.is_active);
        } catch (err) {
          toast.error("Kanalni yuklashda xatolik");
          navigate("/pdf-channels");
        } finally {
          setIsFetching(false);
        }
      })();
    }
  }, [id, isEditMode]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      if (isEditMode && id) {
        await pdfChannelsService.updateChannel(Number(id), data);
        toast.success("Kanal yangilandi");
      } else {
        await pdfChannelsService.createChannel(data);
        toast.success("Kanal yaratildi");
      }
      navigate("/pdf-channels");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <DashboardLayout><Loading fullScreen /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader title={isEditMode ? "Kanalni tahrirlash" : "Yangi kanal"} backButton />
        <Card>
          <CardHeader><CardTitle>Kanal ma'lumotlari</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2"><Label htmlFor="channel_name">Kanal nomi *</Label><Input id="channel_name" {...register("channel_name")} />{errors.channel_name && <p className="text-xs text-destructive">{errors.channel_name.message}</p>}</div>
              <div className="space-y-2"><Label htmlFor="channel_month">Oy *</Label><Input id="channel_month" placeholder="2024-01" {...register("channel_month")} />{errors.channel_month && <p className="text-xs text-destructive">{errors.channel_month.message}</p>}</div>
              <div className="space-y-2"><Label htmlFor="channel_link">Telegram link *</Label><Input id="channel_link" placeholder="https://t.me/..." {...register("channel_link")} />{errors.channel_link && <p className="text-xs text-destructive">{errors.channel_link.message}</p>}</div>
              <div className="flex items-center gap-2"><Controller control={control} name="is_active" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} /><Label>Faol</Label></div>
              <div className="flex gap-4"><Button type="submit" disabled={isLoading}>{isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saqlanmoqda...</> : <><Save className="mr-2 h-4 w-4" />{isEditMode ? "Yangilash" : "Yaratish"}</>}</Button><Button type="button" variant="outline" onClick={() => navigate("/pdf-channels")}>Bekor qilish</Button></div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
