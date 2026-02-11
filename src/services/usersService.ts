import api from "@/lib/api";
import { UserResponse, ImageUploadResponse } from "@/types/api";

interface UserListResponse {
  total: number;
  items: UserResponse[];
}

export const usersService = {
  // SalesListPage uses this. It expects UserResponse[]
  // The API returns { total, items }. We should return items.
  async getAllUsers(status?: string): Promise<UserResponse[]> {
    const response = await api.get<UserListResponse>("/clients/all_clients", {
      // Assuming the API supports status filter and we fetch a large number for the list
      params: { status: status, limit: 1000 },
    });
    return response.data.items || [];
  },

  // SalesDetailPage uses this.
  async getUserById(userId: number): Promise<UserResponse> {
    // The API doc uses {client_id}, but frontend uses a single ID for everything.
    // We assume it's the same.
    const response = await api.get<UserResponse>(`/clients/${userId}`);
    return response.data;
  },

  // SalesDetailPage uses this.
  async sendImage(
    userId: number,
    imageFile: File,
    message: string,
  ): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("message", message);

    // The API doc has this at /{user_id}/send-image
    // The path is corrected to avoid double slashes.
    const response = await api.post<ImageUploadResponse>(
      `${userId}/send-image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },
};