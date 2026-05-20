import { api } from './client';
import { Alert, LogEntry, DashboardStats } from '../types';

interface AlertsResponse {
  alerts: Alert[];
  total: number;
  page: number;
  pageSize: number;
}

interface LogsResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export const alertsApi = {
  list: (params?: { page?: number; pageSize?: number; severity?: string; resolved?: boolean }) =>
    api.get<AlertsResponse>('/admin/alerts', params as Record<string, unknown>),

  resolve: (id: string) => api.post<Alert>(`/admin/alerts/${id}/resolve`),

  delete: (id: string) => api.delete<void>(`/admin/alerts/${id}`),
};

export const logsApi = {
  list: (params?: { page?: number; pageSize?: number; action?: string }) =>
    api.get<LogsResponse>('/admin/logs', params as Record<string, unknown>),
};

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/admin/dashboard/stats'),
};
