import { useState, useEffect } from "react";
import { MessageSquare, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { conversationsService } from "@/services/conversationsService";

export function ConversationsPage() {
  const [conversations, setConversations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await conversationsService.getAllConversations();
      setConversations(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Suhbatlarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleRefresh = async () => {
    try {
      await fetchConversations();
      toast.success("Ro'yxat yangilandi");
    } catch (err) {
      toast.error("Yangilashda xatolik");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading fullScreen text="Suhbatlar yuklanmoqda..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState message={error} retry={fetchConversations} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Suhbatlar</h1>
            <p className="text-muted-foreground mt-1">
              Barcha conversation fayllar ro'yxati
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="bg-card/50 backdrop-blur-sm"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Yangilash
          </Button>
        </div>

        {conversations.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Suhbatlar topilmadi"
            description="Hozircha conversation fayllar mavjud emas"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {conversations.map((conv, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    Conversation #{index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground truncate font-mono">
                    {conv}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
