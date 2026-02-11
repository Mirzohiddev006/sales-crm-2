import api from '@/lib/api';
import { ReservationResponse } from '@/types/api';

export const reservationsService = {
  async getAllReservations(params?: {
    status?: string;
    client_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<ReservationResponse[]> {
    // Boshidagi slesh olib tashlandi
    const response = await api.get('reservations', { params });
    
    // Backenddan object { items: [] } kelsa yoki to'g'ridan-to'g'ri array kelsa, uni to'g'rilab olamiz
    if (response.data && response.data.items) {
      return response.data.items;
    }
    return Array.isArray(response.data) ? response.data : [];
  },

  async getReservationDetail(reservationId: number): Promise<ReservationResponse> {
    const response = await api.get(`reservations/${reservationId}`);
    return response.data;
  },
};