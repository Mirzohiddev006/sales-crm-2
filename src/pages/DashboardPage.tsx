import { useState, useEffect, memo } from "react";
import { 
  DollarSign, 
  Book, 
  FileText, 
  MessageSquare,
  Target,
  Calendar,
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

const ProgressCircle = memo(function ProgressCircle({ 
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(217 20% 15%)"
          strokeWidth={strokeWidth}
          fill="none"
        />
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
});

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
              <CardTitle className="text-sm font-medium">Bugungi Tushum</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{today.income_sum.toLocaleString()} UZS</div>
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

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* 1. PLANS CARD (8/12) */}
          <Card className="xl:col-span-8 border-border/50 bg-card/95 backdrop-blur-xl h-full">
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
            
            <CardContent className="h-full flex flex-col justify-center pb-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative">
                
                {/* 1. UMUMIY NATIJA (Endi 1-chi o'rinda) */}
                <div className="flex flex-col items-center space-y-4 relative z-10 md:border-r border-border/50 pr-0 md:pr-4">
                  <div className="relative">
                     <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                     <ProgressCircle 
                      percentage={current_month_plan.percents.overall} 
                      color="hsl(38 92% 50%)"
                      label="Umumiy"
                      size={160}
                      strokeWidth={12}
                    />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="text-lg font-bold text-primary">Jami Bajarildi</p>
                    <div className="space-y-1">
                       <p className="text-sm font-semibold">
                        {current_month_plan.facts.overall.count} / {current_month_plan.plans.overall.count} ta
                      </p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {current_month_plan.facts.overall.sum.toLocaleString()} UZS
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. PDF Circle */}
                <div className="flex flex-col items-center space-y-4 relative z-10">
                  <ProgressCircle 
                    percentage={current_month_plan.percents.pdf} 
                    color="hsl(217 91% 60%)"
                    label="PDF"
                    size={130}
                  />
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium">PDF Reja</p>
                    <p className="text-xs text-muted-foreground">
                      {current_month_plan.facts.pdf.count} / {current_month_plan.plans.pdf.total.count} ta
                    </p>
                    <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                      {current_month_plan.facts.pdf.sum.toLocaleString()} UZS
                    </p>
                  </div>
                </div>

                {/* 3. Book Circle */}
                <div className="flex flex-col items-center space-y-4 relative z-10">
                  <ProgressCircle 
                    percentage={current_month_plan.percents.book} 
                    color="hsl(142 71% 45%)"
                    label="Kitob"
                    size={130}
                  />
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium">Kitob Reja</p>
                    <p className="text-xs text-muted-foreground">
                      {current_month_plan.facts.book.count} / {current_month_plan.plans.book.total.count} ta
                    </p>
                    <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                      {current_month_plan.facts.book.sum.toLocaleString()} UZS
                    </p>
                  </div>
                </div>

                {/* Orqa fon chizig'i (Dekoratsiya) */}
                <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-px border-t-2 border-dashed border-border/30 -z-0" />

              </div>
            </CardContent>
          </Card>

          {/* 2. DETAILS CARDS (4/12) */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            
            {/* PDF Details */}
            <Card className="flex-1 border-l-4 border-l-blue-500 shadow-sm bg-muted/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    PDF Tafsilotlar
                  </span>
                  <span className="text-xs font-normal text-muted-foreground bg-background border px-2 py-1 rounded-full">
                    {current_month_plan.percents.pdf}% bajarildi
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Yangi mijozlar</p>
                        <p className="font-semibold">{current_month_plan.plans.pdf.new.count} ta</p>
                        <p className="text-[10px] text-muted-foreground">{current_month_plan.plans.pdf.new.sum.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Eski mijozlar</p>
                        <p className="font-semibold">{current_month_plan.plans.pdf.old.count} ta</p>
                        <p className="text-[10px] text-muted-foreground">{current_month_plan.plans.pdf.old.sum.toLocaleString()}</p>
                    </div>
                </div>
                <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                   <span className="font-medium">Jami Reja:</span>
                   <span className="font-bold text-lg text-blue-600">{current_month_plan.plans.pdf.total.count} ta</span>
                </div>
              </CardContent>
            </Card>

            {/* Book Details */}
            <Card className="flex-1 border-l-4 border-l-green-500 shadow-sm bg-muted/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Book className="h-4 w-4 text-green-500" />
                    Kitob Tafsilotlar
                  </span>
                   <span className="text-xs font-normal text-muted-foreground bg-background border px-2 py-1 rounded-full">
                    {current_month_plan.percents.book}% bajarildi
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                 <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Yangi mijozlar</p>
                        <p className="font-semibold">{current_month_plan.plans.book.new.count} ta</p>
                        <p className="text-[10px] text-muted-foreground">{current_month_plan.plans.book.new.sum.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Eski mijozlar</p>
                        <p className="font-semibold">{current_month_plan.plans.book.old.count} ta</p>
                        <p className="text-[10px] text-muted-foreground">{current_month_plan.plans.book.old.sum.toLocaleString()}</p>
                    </div>
                </div>
                <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                   <span className="font-medium">Jami Reja:</span>
                   <span className="font-bold text-lg text-green-600">{current_month_plan.plans.book.total.count} ta</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}