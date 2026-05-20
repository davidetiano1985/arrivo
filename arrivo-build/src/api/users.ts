import { api } from './client';
import { User } from '../types';

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: User['role'];
  status?: User['status'];
  phone?: string;
}

export const usersApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string }) =>
    api.get<UsersResponse>('/admin/users', params as Record<string, unknown>),

  getById: (id: string) => api.get<User>(`/admin/users/${id}`),

  update: (id: string, data: UpdateUserData) =>
    api.patch<User>(`/admin/users/${id}`, data),

  delete: (id: string) => api.delete<void>(`/admin/users/${id}`),

  suspend: (id: string) => api.post<User>(`/admin/users/${id}/suspend`),

  activate: (id: string) => api.post<User>(`/admin/users/${id}/activate`),
};
