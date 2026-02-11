import api from '@/lib/api';
import { ClientListResponse, ClientDetailResponse, ImageUploadResponse } from '@/types/api';

export const clientsService = {
  async getAllClients(limit: number = 20, offset: number = 0): Promise<ClientListResponse> {
    const response = await api.get<ClientListResponse>('/clients/all_clients', {
      params: { limit, offset },
    });
    return response.data;
  },

  async getClientDetail(clientId: number): Promise<ClientDetailResponse> {
    const response = await api.get<ClientDetailResponse>(`/clients/${clientId}`);
    return response.data;
  },

  async sendImage(userId: number, imageFile: File, message: string): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('message', message);
    
    const response = await api.post<ImageUploadResponse>(
      `/${userId}/send-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
