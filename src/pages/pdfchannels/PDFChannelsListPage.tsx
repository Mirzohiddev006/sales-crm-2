import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2, FileText, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { pdfChannelsService } from "@/services/pdfChannelsService";
import { PDFChannelResponse } from "@/types/api";
import { formatDate, cn } from "@/lib/utils";

export function PDFChannelsListPage() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<PDFChannelResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await pdfChannelsService.getAllChannels();
      setChannels(data.items);
    } catch (err: any) {
      setError(err.response?.data?.detail || "PDF kanallarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham bu kanalni o'chirmoqchimisiz?")) return;
    try {
      await pdfChannelsService.deleteChannel(id);
      toast.success("Kanal muvaffaqiyatli o'chirildi");
      fetchChannels();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "O'chirishda xatolik");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading fullScreen text="Kanallar yuklanmoqda..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState message={error} retry={fetchChannels} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="PDF Kanallar"
          description="Telegram PDF kanal linklar boshqaruvi"
          action={{
            label: "Yangi kanal",
            onClick: () => navigate("/pdf-channels/create"),
            icon: <Plus className="mr-2 h-4 w-4" />,
          }}
        />

        {channels.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Hech qanday kanal topilmadi"
            description="Yangi PDF kanal qo'shish uchun yuqoridagi tugmani bosing"
            action={{ label: "Yangi kanal", onClick: () => navigate("/pdf-channels/create") }}
          />
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Kanal nomi</TableHead>
                  <TableHead>Oy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Yaratilgan</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((channel) => (
                  <TableRow key={channel.id}>
                    <TableCell className="font-mono text-xs">#{channel.id}</TableCell>
                    <TableCell className="font-medium">{channel.channel_name}</TableCell>
                    <TableCell><Badge variant="outline">{channel.channel_month}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(channel.is_active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>
                        {channel.is_active ? <><ToggleRight className="mr-1 h-3 w-3" />Faol</> : <><ToggleLeft className="mr-1 h-3 w-3" />Nofaol</>}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(channel.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/pdf-channels/${channel.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/pdf-channels/${channel.id}/edit`)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(channel.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
