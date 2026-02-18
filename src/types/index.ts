// FRESHCUT X - Types

export interface Shop {
  id: string;
  name: string;
  plan: 'starter' | 'pro' | 'elite';
  address: string;
  phone: string;
  isOpen: boolean;
  createdAt: Date;
}

export interface User {
  id: string;
  shopId: string;
  name: string;
  email: string;
  role: 'super_admin' | 'manager' | 'barber';
  avatar?: string;
  isActive: boolean;
}

export interface Client {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: Date;
  loyaltyScore: number;
  isVip: boolean;
  isBlocked: boolean;
  notes?: string;
  createdAt: Date;
}

export interface Barber {
  id: string;
  shopId: string;
  name: string;
  avatar?: string;
  status: 'active' | 'pause' | 'off';
  commissionRate: number;
  specialties: string[];
  schedule: WorkSchedule;
  stats: BarberStats;
  isActive: boolean;
}

export interface WorkSchedule {
  monday: { start: string; end: string; isWorking: boolean };
  tuesday: { start: string; end: string; isWorking: boolean };
  wednesday: { start: string; end: string; isWorking: boolean };
  thursday: { start: string; end: string; isWorking: boolean };
  friday: { start: string; end: string; isWorking: boolean };
  saturday: { start: string; end: string; isWorking: boolean };
  sunday: { start: string; end: string; isWorking: boolean };
}

export interface BarberStats {
  totalClients: number;
  totalRevenue: number;
  averageCutTime: number;
  rating: number;
  todayClients: number;
  todayRevenue: number;
}

export interface Service {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  image?: string;
  isActive: boolean;
  color: string;
}

export interface Appointment {
  id: string;
  shopId: string;
  clientId: string;
  client: Client;
  barberId: string;
  barber: Barber;
  serviceIds: string[];
  services: Service[];
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'no_show' | 'cancelled';
  notes?: string;
  totalPrice: number;
  isPaid: boolean;
  paymentMethod?: 'cash' | 'card' | 'other';
  createdAt: Date;
}

export interface QueueItem {
  id: string;
  shopId: string;
  clientId: string;
  client: Client;
  barberId?: string;
  barber?: Barber;
  serviceIds: string[];
  services: Service[];
  position: number;
  status: 'waiting' | 'notified' | 'in_progress' | 'done' | 'cancelled';
  estimatedWaitTime: number;
  actualWaitTime?: number;
  joinedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  notifiedAt?: Date;
}

export interface AnalyticsData {
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    trend: number;
  };
  clients: {
    today: number;
    weekly: number;
    monthly: number;
    newThisMonth: number;
    returningRate: number;
  };
  queue: {
    averageWaitTime: number;
    maxWaitTime: number;
    completionRate: number;
    noShowRate: number;
  };
  services: {
    topService: string;
    topServiceCount: number;
    averageServiceValue: number;
  };
  barbers: BarberPerformance[];
  heatmap: HeatmapData[];
  revenueChart: ChartDataPoint[];
  clientsChart: ChartDataPoint[];
}

export interface BarberPerformance {
  barberId: string;
  barberName: string;
  clientsCount: number;
  revenue: number;
  averageRating: number;
}

export interface HeatmapData {
  hour: number;
  day: number;
  value: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date: Date;
}

export interface Notification {
  id: string;
  shopId: string;
  type: 'queue_update' | 'appointment_reminder' | 'promotion' | 'system';
  title: string;
  message: string;
  recipientId?: string;
  isRead: boolean;
  sentAt: Date;
}

export interface Promotion {
  id: string;
  shopId: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageCount: number;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  isActive: boolean;
}

export type ViewType =
  | 'dashboard'
  | 'queue'
  | 'appointments'
  | 'clients'
  | 'barbers'
  | 'services'
  | 'products'
  | 'analytics'
  | 'promotions'
  | 'settings';
