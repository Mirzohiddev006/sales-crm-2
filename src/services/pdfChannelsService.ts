import api from '@/lib/api';
import { PDFChannelListResponse, PDFChannelResponse, PDFChannelCreate, PDFChannelUpdate } from '@/types/api';

export const pdfChannelsService = {
  async getAllChannels(params?: {
    is_active?: boolean;
    month?: string;
    limit?: number;
    offset?: number;
  }): Promise<PDFChannelListResponse> {
    // Boshidagi slesh olib tashlandi
    const response = await api.get('pdf-channels', { params });
    return response.data;
  },

  async getChannelById(channelId: number): Promise<PDFChannelResponse> {
    const response = await api.get(`pdf-channels/${channelId}`);
    return response.data;
  },

  async createChannel(data: PDFChannelCreate): Promise<PDFChannelResponse> {
    const response = await api.post('pdf-channels', data);
    return response.data;
  },

  async updateChannel(channelId: number, data: PDFChannelUpdate): Promise<PDFChannelResponse> {
    const response = await api.patch(`pdf-channels/${channelId}`, data);
    return response.data;
  },

  async deleteChannel(channelId: number): Promise<void> {
    await api.delete(`pdf-channels/${channelId}`);
  },
};