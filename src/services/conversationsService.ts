import api from "@/lib/api";

export const conversationsService = {
  async getAllConversations(): Promise<string[]> {
    const response = await api.get<string[]>("/conversations");
    // The page expects an array, so we ensure it's always an array.
    return Array.isArray(response.data) ? response.data : [];
  },

  async getConversationDetail(conversationName: string): Promise<any> {
    // The API has this at the root, so we call it directly.
    const response = await api.get(conversationName);
    return response.data;
  },
};