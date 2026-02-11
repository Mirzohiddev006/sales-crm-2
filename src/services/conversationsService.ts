import api from '@/lib/api';

export const conversationsService = {
  async getAllConversations(): Promise<string[]> {
    const response = await api.get<string[]>('/conversations');
    return response.data;
  },

  async getConversation(conversationName: string): Promise<any> {
    const response = await api.get(`/${conversationName}`);
    return response.data;
  },
};
