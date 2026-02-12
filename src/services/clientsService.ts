import api from "@/lib/api";
import { 
  ClientListItem, 
  ClientDetailResponse, 
  ClientCreate, 
  ClientCreate as ClientUpdate 
} from "@/types/api";

interface ClientsListResponse {
  total: number;
  items: ClientListItem[];
}

export const clientsService = {
  async getAllClients(limit: number = 20, offset: number = 0): Promise<ClientsListResponse> {
    const response = await api.get<ClientsListResponse>("/clients/all_clients", {
      params: { limit, offset },
    });
    return response.data;
  },

  async getClientDetail(clientId: number): Promise<ClientDetailResponse> {
    const response = await api.get<ClientDetailResponse>(`/clients/${clientId}`);
    return response.data;
  },

  async createClient(data: ClientCreate): Promise<ClientDetailResponse> {
    const response = await api.post<ClientDetailResponse>("/clients/create", data);
    return response.data;
  },

  async updateClient(clientId: number, data: ClientUpdate): Promise<ClientDetailResponse> {
    const response = await api.patch<ClientDetailResponse>(`/clients/${clientId}`, data);
    return response.data;
  },

  // Hozircha API da delete yo'q, lekin qo'shilsa shunday bo'ladi
  /*
  async deleteClient(clientId: number): Promise<void> {
    await api.delete(`/clients/${clientId}`);
  },
  */
};