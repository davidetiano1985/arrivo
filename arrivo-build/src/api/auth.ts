import { api } from './client';
import { User } from '../types';

interface LoginResponse {
  token: string;
  user: User;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<LoginResponse>('/admin/auth/login', credentials),

  me: () => api.get<User>('/admin/auth/me'),

  logout: () => api.post<void>('/admin/auth/logout'),
};
