import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { pdfChannelsService } from "@/services/pdfChannelsService";
import { PDFChannelResponse } from "@/types/api";
import { formatDate, cn } from "@/lib/utils";

export function PDFChannelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<PDFChannelResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannel = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await pdfChannelsService.getChannelById(Number(id));
      setChannel(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Kanalni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChannel();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm("Haqiqatan ham bu kanalni o'chirmoqchimisiz?")) return;
    try {
      await pdfChannelsService.deleteChannel(Number(id));
      toast.success("Kanal o'chirildi");
      navigate("/pdf-channels");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "O'chirishda xatolik");
    }
  };

  if (isLoading) return <DashboardLayout><Loading fullScreen /></DashboardLayout>;
  if (error || !channel) return <DashboardLayout><ErrorState message={error || "Kanal topilmadi"} retry={fetchChannel} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title={channel.channel_name} description={`Kanal #${channel.id}`} backButton />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Asosiy ma'lumotlar</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><p className="text-sm text-muted-foreground">Kanal nomi</p><p className="font-medium">{channel.channel_name}</p></div>
              <div><p className="text-sm text-muted-foreground">Oy</p><p className="font-medium">{channel.channel_month}</p></div>
              <div><p className="text-sm text-muted-foreground">Link</p><a href={channel.channel_link} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1"><span className="truncate">{channel.channel_link}</span><ExternalLink className="h-3 w-3" /></a></div>
              <div><p className="text-sm text-muted-foreground">Status</p><Badge className={cn(channel.is_active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>{channel.is_active ? "Faol" : "Nofaol"}</Badge></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Tizim ma'lumotlari</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><p className="text-sm text-muted-foreground">Yaratilgan</p><p>{formatDate(channel.created_at)}</p></div>
            </CardContent>
          </Card>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => navigate(`/pdf-channels/${id}/edit`)}><Pencil className="mr-2 h-4 w-4" />Tahrirlash</Button>
          <Button variant="destructive" onClick={handleDelete}><Trash2 className="mr-2 h-4 w-4" />O'chirish</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
