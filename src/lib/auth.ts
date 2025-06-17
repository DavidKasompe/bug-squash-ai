import api from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login/', credentials);
    const { access, refresh, user } = response.data;
    
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    console.log('Sending registration data:', credentials);
    const response = await api.post<AuthResponse>('/auth/register/', credentials);
    console.log('Registration response:', response.data);
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  async verifyEmail(uid: string, token: string): Promise<void> {
    await api.get(`/auth/verify-email/${uid}/${token}/`);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getCurrentUser(): { id: number; username: string; email: string } | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
}; 