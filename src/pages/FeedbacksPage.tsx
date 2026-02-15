import { useState, useEffect } from "react";
import { MessageSquare, RefreshCcw, Calendar } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { feedbacksService } from "@/services/feedbacksService";
import { FeedbackItem } from "@/types/api";
import { formatDate } from "@/lib/utils";

export function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      setError(null);
      const response = await feedbacksService.getAllFeedbacks();
      setFeedbacks(response.items || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Fikr-mulohazalarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFeedbacks();
    toast.success("Yangilandi");
  };

  useEffect(() => {
    setIsLoading(true);
    fetchFeedbacks();

    const interval = setInterval(fetchFeedbacks, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <DashboardLayout><Loading fullScreen text="Fikrlar yuklanmoqda..." /></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout><ErrorState message={error} retry={fetchFeedbacks} /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        <PageHeader
          title="Fikr-mulohazalar"
          description="Mijozlardan kelgan barcha fikrlar"
          action={{
            label: "Yangilash",
            onClick: handleRefresh,
            icon: <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          }}
        />

        {feedbacks.length === 0 ? (
          <EmptyState icon={MessageSquare} title="Fikrlar mavjud emas" description="Hozircha hech kim fikr qoldirmagan" />
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/20"><TableHead className="w-[80px]">ID</TableHead><TableHead>Mazmuni</TableHead><TableHead className="w-[200px] text-right">Sana</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors"><TableCell className="font-mono text-xs text-muted-foreground">#{item.id}</TableCell><TableCell><p className="text-sm leading-relaxed">{item.content}</p></TableCell><TableCell className="text-right"><div className="flex items-center justify-end gap-2 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(item.created_at)}</div></TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}