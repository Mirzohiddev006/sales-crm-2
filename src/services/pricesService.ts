import api from '@/lib/api';
import { PriceResponse } from '@/types/api';

export const pricesService = {
  async getCurrentPrices(): Promise<PriceResponse> {
    const response = await api.get<PriceResponse>('/prices/current');
    return response.data;
  },

  async setPrices(pdfPrice: number, bookPrice: number, pdfOldPrice: number, bookOldPrice: number): Promise<string> {
    // API spetsifikatsiyasiga ko'ra parametrlar query params sifatida yuboriladi
    const response = await api.post<string>('/prices', null, {
      params: {
        pdf_price: pdfPrice,
        book_price: bookPrice,
        pdf_old_price: pdfOldPrice,
        book_old_price: bookOldPrice,
      },
    });
    return response.data;
  },
};