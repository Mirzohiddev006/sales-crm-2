import api from "@/lib/api";

export interface SendImageResponse {
  success: boolean;
  user_id: number;
  message: string;
}

export const telegramService = {
  // Rasm yuborish (Multipart form-data)
  async sendImage(userId: number, chatId: number | string, file: File, message: string): Promise<SendImageResponse> {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("message", message);

    const response = await api.post<SendImageResponse>(`/telegram/${userId}/send-image`, formData, {
      params: { chat_id: chatId }, // Query param
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Xabar yuborish (Oldingi funksiya, agar kerak bo'lsa)
  async sendMessage(userId: number, chatId: number | string, message: string) {
    // API da oddiy xabar yuborish endpointi bo'lsa shu yerga yoziladi
    // Hozircha faqat rasm yuborish so'ralgan
  }
};