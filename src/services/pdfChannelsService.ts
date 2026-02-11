import api from '@/lib/api';
import { PDFChannelListResponse, PDFChannelResponse, PDFChannelCreate, PDFChannelUpdate } from '@/types/api';

export const pdfChannelsService = {
  async getAllChannels(params?: {
    is_active?: boolean;
    month?: string;
    limit?: number;
    offset?: number;
  }): Promise<PDFChannelListResponse> {
    const response = await api.get<PDFChannelListResponse>('/pdf-channels', { params });
    return response.data;
  },

  async getChannelById(channelId: number): Promise<PDFChannelResponse> {
    const response = await api.get<PDFChannelResponse>(`/pdf-channels/${channelId}`);
    return response.data;
  },

  async createChannel(data: PDFChannelCreate): Promise<PDFChannelResponse> {
    const response = await api.post<PDFChannelResponse>('/pdf-channels', data);
    return response.data;
  },

  async updateChannel(channelId: number, data: PDFChannelUpdate): Promise<PDFChannelResponse> {
    const response = await api.patch<PDFChannelResponse>(`/pdf-channels/${channelId}`, data);
    return response.data;
  },

  async deleteChannel(channelId: number): Promise<void> {
    await api.delete(`/pdf-channels/${channelId}`);
  },
};
