import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  DollarSign, 
  Book, 
  FileText, 
  MessageSquare,
  Target,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { dashboardService } from "@/services/dashboardService";
import { DashboardResponse } from "@/types/api";

// Progress Circle Component
interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

function ProgressCircle({ 
  percentage, 
  size = 120, 
  strokeWidth = 8, 
  color = "hsl(217 91% 60%)",
  label 
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(217 20% 15%)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
        {label && <span className="text-xs text-muted-foreground mt-1">{label}</span>}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await dashboardService.getDashboardData();
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Dashboard ma'lumotlarini yuklashda xatolik");
      console.error("Dashboard error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading fullScreen text="Dashboard yuklanmoqda..." />
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <ErrorState message={error || "Ma'lumot topilmadi"} retry={fetchDashboard} />
      </DashboardLayout>
    );
  }

  const { today, current_month_plan } = data;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bugungi va oylik statistika
          </p>
        </div>

        {/* Today Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bugungi Tushum
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {today.income_sum.toLocaleString()} UZS
              </div>
              <p className="text-xs text-muted-foreground mt-1">Umumiy savdo</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kitoblar</CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{today.book_sales} ta</div>
              <p className="text-xs text-muted-foreground mt-1">Bugun sotildi</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PDF Fayllar</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{today.pdf_sales} ta</div>
              <p className="text-xs text-muted-foreground mt-1">Bugun sotildi</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Xabarlar</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{today.messages_count}</div>
              <p className="text-xs text-muted-foreground mt-1">Bugungi suhbatlar</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Plan Progress */}
        <Card className="border-border/50 bg-card/95 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {current_month_plan.month.charAt(0).toUpperCase() + current_month_plan.month.slice(1)} Oyi Rejasi
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Reja ID: #{current_month_plan.plan_id}
                </p>
              </div>
              <Target className="h-8 w-8 text-primary/30" />
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress Circles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* PDF Progress */}
              <div className="flex flex-col items-center space-y-4">
                <ProgressCircle 
                  percentage={current_month_plan.percents.pdf} 
                  color="hsl(217 91% 60%)"
                  label="PDF"
                />
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">PDF Fayllar</p>
                  <p className="text-xs text-muted-foreground">
                    {current_month_plan.facts.pdf.count} / {current_month_plan.plans.pdf.total.count} ta
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {current_month_plan.facts.pdf.sum.toLocaleString()} / {current_month_plan.plans.pdf.total.sum.toLocaleString()} UZS
                  </p>
                </div>
              </div>

              {/* Book Progress */}
              <div className="flex flex-col items-center space-y-4">
                <ProgressCircle 
                  percentage={current_month_plan.percents.book} 
                  color="hsl(142 71% 45%)"
                  label="Kitob"
                />
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">Kitoblar</p>
                  <p className="text-xs text-muted-foreground">
                    {current_month_plan.facts.book.count} / {current_month_plan.plans.book.total.count} ta
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {current_month_plan.facts.book.sum.toLocaleString()} / {current_month_plan.plans.book.total.sum.toLocaleString()} UZS
                  </p>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="flex flex-col items-center space-y-4">
                <ProgressCircle 
                  percentage={current_month_plan.percents.overall} 
                  color="hsl(38 92% 50%)"
                  label="Umumiy"
                  size={140}
                  strokeWidth={10}
                />
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">Umumiy Reja</p>
                  <p className="text-xs text-muted-foreground">
                    {current_month_plan.facts.overall.count} / {current_month_plan.plans.overall.count} ta
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {current_month_plan.facts.overall.sum.toLocaleString()} / {current_month_plan.plans.overall.sum.toLocaleString()} UZS
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 pt-6 border-t border-border/50">
              {/* PDF Details */}
              <Card className="bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    PDF Tafsilotlar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yangi:</span>
                    <span className="font-medium">
                      {current_month_plan.plans.pdf.new.count} ta ({current_month_plan.plans.pdf.new.sum.toLocaleString()} UZS)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Eski:</span>
                    <span className="font-medium">
                      {current_month_plan.plans.pdf.old.count} ta ({current_month_plan.plans.pdf.old.sum.toLocaleString()} UZS)
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/50">
                    <span className="text-muted-foreground font-semibold">Jami:</span>
                    <span className="font-bold text-primary">
                      {current_month_plan.plans.pdf.total.count} ta
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Book Details */}
              <Card className="bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Book className="h-4 w-4 text-green-500" />
                    Kitob Tafsilotlar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yangi:</span>
                    <span className="font-medium">
                      {current_month_plan.plans.book.new.count} ta ({current_month_plan.plans.book.new.sum.toLocaleString()} UZS)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Eski:</span>
                    <span className="font-medium">
                      {current_month_plan.plans.book.old.count} ta ({current_month_plan.plans.book.old.sum.toLocaleString()} UZS)
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/50">
                    <span className="text-muted-foreground font-semibold">Jami:</span>
                    <span className="font-bold text-green-600">
                      {current_month_plan.plans.book.total.count} ta
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
