import api from '@/lib/api';
import { TelegramSendImageResponse } from '@/types/api';

export const telegramService = {
  async sendImage(userId: number, chatId: number, message: string, imageFile: File): Promise<TelegramSendImageResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('message', message);

    const response = await api.post<TelegramSendImageResponse>(`/telegram/${userId}/send-image`, formData, {
      params: { chat_id: chatId },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};