import api from '@/lib/api';
import { FeedbackListResponse, FeedbackItem } from '@/types/api';

export const feedbacksService = {
  async getAllFeedbacks(limit = 20, offset = 0): Promise<FeedbackListResponse> {
    const response = await api.get<FeedbackListResponse>('/feedbacks', {
      params: { limit, offset }
    });
    return response.data;
  },

  async getFeedbackById(id: number): Promise<FeedbackItem> {
    const response = await api.get<FeedbackItem>(`/feedbacks/${id}`);
    return response.data;
  }
};