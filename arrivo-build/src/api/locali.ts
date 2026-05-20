import { api } from './client';
import { Locale } from '../types';

interface LocaliResponse {
  locali: Locale[];
  total: number;
  page: number;
  pageSize: number;
}

interface UpdateLocaleData {
  name?: string;
  address?: string;
  city?: string;
  status?: Locale['status'];
  capacity?: number;
  type?: string;
  managerId?: string;
}

export const localiApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string }) =>
    api.get<LocaliResponse>('/admin/locali', params as Record<string, unknown>),

  getById: (id: string) => api.get<Locale>(`/admin/locali/${id}`),

  update: (id: string, data: UpdateLocaleData) =>
    api.patch<Locale>(`/admin/locali/${id}`, data),

  create: (data: UpdateLocaleData) => api.post<Locale>('/admin/locali', data),

  delete: (id: string) => api.delete<void>(`/admin/locali/${id}`),
};
