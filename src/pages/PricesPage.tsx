import { useState, useEffect } from "react";
import { DollarSign, Save, Tag, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { pricesService } from "@/services/pricesService";
import { PriceResponse } from "@/types/api";

export function PricesPage() {
  const [prices, setPrices] = useState<PriceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [pdfPrice, setPdfPrice] = useState<string>("");
  const [bookPrice, setBookPrice] = useState<string>("");
  const [pdfOldPrice, setPdfOldPrice] = useState<string>("");
  const [bookOldPrice, setBookOldPrice] = useState<string>("");

  const fetchPrices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await pricesService.getCurrentPrices();
      setPrices(data);
      setPdfPrice(data.pdf_price.toString());
      setBookPrice(data.book_price.toString());
      setPdfOldPrice(data.pdf_old_price?.toString() || "");
      setBookOldPrice(data.book_old_price?.toString() || "");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Narxlarni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfPrice || !bookPrice) return;

    try {
      setIsSaving(true);
      await pricesService.setPrices(
        Number(pdfPrice), 
        Number(bookPrice),
        Number(pdfOldPrice),
        Number(bookOldPrice)
      );
      // Muvaffaqiyatli saqlangandan so'ng ma'lumotlarni yangilaymiz
      await fetchPrices();
      alert("Narxlar muvaffaqiyatli yangilandi!");
    } catch (err: any) {
      alert("Xatolik: " + (err.response?.data?.detail || "Narxlarni saqlashda xatolik"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading fullScreen text="Narxlar yuklanmoqda..." />
      </DashboardLayout>
    );
  }

  if (error || !prices) {
    return (
      <DashboardLayout>
        <ErrorState message={error || "Ma'lumot topilmadi"} retry={fetchPrices} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Narxlar</h1>
          <p className="text-muted-foreground mt-1">
            Mahsulot narxlarini boshqarish
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Joriy Narxlar */}
          <Card className="border-border/50 bg-card/95 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Joriy Holat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">PDF Narxi</span>
                  <div className="text-2xl font-bold">{prices.pdf_price.toLocaleString()} UZS</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <History className="h-3 w-3" /> Eski: {prices.pdf_old_price?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Kitob Narxi</span>
                  <div className="text-2xl font-bold">{prices.book_price.toLocaleString()} UZS</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <History className="h-3 w-3" /> Eski: {prices.book_old_price?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Narxlarni O'zgartirish */}
          <Card className="border-border/50 bg-card/95 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Narxlarni Yangilash
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Yangi PDF Narxi</label>
                    <input
                      type="number"
                      value={pdfPrice}
                      onChange={(e) => setPdfPrice(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Eski PDF Narxi</label>
                    <input
                      type="number"
                      value={pdfOldPrice}
                      onChange={(e) => setPdfOldPrice(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Yangi Kitob Narxi</label>
                    <input
                      type="number"
                      value={bookPrice}
                      onChange={(e) => setBookPrice(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Eski Kitob Narxi</label>
                    <input
                      type="number"
                      value={bookOldPrice}
                      onChange={(e) => setBookOldPrice(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                >
                  {isSaving ? (
                    <>Saqlanmoqda...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Saqlash
                    </>
                  )}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}