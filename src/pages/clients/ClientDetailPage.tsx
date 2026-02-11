import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { User, Phone, FileText, BookOpen, Calendar, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { clientsService } from "@/services/clientsService";
import { ClientDetailResponse } from "@/types/api";
import { formatDate } from "@/lib/utils";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await clientsService.getClientDetail(Number(id));
      setClient(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Mijoz ma'lumotlarini yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading fullScreen text="Mijoz ma'lumotlari yuklanmoqda..." />
      </DashboardLayout>
    );
  }

  if (error || !client) {
    return (
      <DashboardLayout>
        <ErrorState message={error || "Mijoz topilmadi"} retry={fetchClient} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title={client.fullname} description={`Mijoz ID: #${client.id}`} backButton />

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Asosiy ma'lumotlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{client.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Qo'shildi: {formatDate(client.created_at)}</span>
              </div>
              {client.conversation_file && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">{client.conversation_file}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistika</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Buyurtmalar:</span>
                <Badge>{client.orders.length} ta</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bron qilingan:</span>
                <Badge>{client.reservations.length} ta</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Follow-up:</span>
                <Badge>{client.followups.length} ta</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fikrlar:</span>
                <Badge>{client.feedbacks.length} ta</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders */}
        {client.orders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Buyurtmalar ({client.orders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {client.orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
                    <div>
                      <p className="font-medium">Buyurtma #{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.format || "Format ko'rsatilmagan"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                    <Badge>{order.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feedbacks */}
        {client.feedbacks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Fikrlar ({client.feedbacks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {client.feedbacks.map((feedback) => (
                  <div key={feedback.id} className="p-3 rounded-lg border border-border/50 bg-muted/20">
                    <p className="text-sm">{feedback.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(feedback.created_at)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
