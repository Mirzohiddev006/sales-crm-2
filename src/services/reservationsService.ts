import api from '@/lib/api';
import { ReservationResponse } from '@/types/api';

export const reservationsService = {
  async getAllReservations(params?: {
    status?: string;
    client_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<ReservationResponse[]> {
    const response = await api.get<ReservationResponse[]>('/reservations', { params });
    return response.data;
  },

  async getReservationDetail(reservationId: number): Promise<ReservationResponse> {
    const response = await api.get<ReservationResponse>(`/reservations/${reservationId}`);
    return response.data;
  },
};
