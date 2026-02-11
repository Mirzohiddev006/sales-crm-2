import api from '@/lib/api';
import { AdminLogin, Token } from '@/types/api';

export const authService = {
  async login(credentials: AdminLogin): Promise<Token> {
    const response = await api.post<Token>('/auth/login', credentials);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<Token> {
    const response = await api.post<Token>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  },

  getUserId(): string | null {
    return localStorage.getItem('user_id');
  },
};
