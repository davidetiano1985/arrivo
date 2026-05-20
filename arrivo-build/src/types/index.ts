export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  locale?: string;
  phone?: string;
  avatar?: string;
}

export interface Locale {
  id: string;
  name: string;
  address: string;
  city: string;
  status: 'active' | 'inactive' | 'maintenance';
  managerId?: string;
  createdAt: string;
  updatedAt: string;
  capacity?: number;
  type?: string;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'security';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  createdAt: string;
  userId?: string;
  localeId?: string;
  metadata?: Record<string, unknown>;
}

export interface LogEntry {
  id: string;
  action: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  details?: Record<string, unknown>;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalLocali: number;
  activeLocali: number;
  openAlerts: number;
  criticalAlerts: number;
  recentLogs: number;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  Locali: undefined;
  Alerts: undefined;
  Settings: undefined;
};

export type UsersStackParamList = {
  UsersList: undefined;
  UserDetail: { userId: string };
};

export type LocaliStackParamList = {
  LocaliList: undefined;
  LocaleDetail: { localeId: string };
};
