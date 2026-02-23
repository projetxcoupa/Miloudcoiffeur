// FRESHCUT X - Dashboard Overview
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Users,
  Calendar, DollarSign, ArrowRight,
  Activity, Target, Zap
} from 'lucide-react';
import type { ViewType } from '@/types';
import {
  mockQueue, mockAppointments, mockAnalytics,
  mockBarbers
} from '@/data/mockData';
import { useRealtime } from '@/hooks/useRealtime';
import type { QueueItem, Appointment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { toast } from 'sonner';

interface DashboardOverviewProps {
  onNavigate: (view: ViewType) => void;
}

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: 'neon' | 'orange' | 'cyan' | 'purple';
  subtitle?: string;
  onClick?: () => void;
}

const KPICard = ({ title, value, change, icon: Icon, color, subtitle, onClick }: KPICardProps) => {
  const colorClasses = {
    neon: 'from-cyber-neon/20 to-cyber-neon/5 text-cyber-neon',
    orange: 'from-cyber-orange/20 to-cyber-orange/5 text-cyber-orange',
    cyan: 'from-cyber-cyan/20 to-cyber-cyan/5 text-cyber-cyan',
    purple: 'from-cyber-purple/20 to-cyber-purple/5 text-cyber-purple',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`kpi-card cursor-pointer ${onClick ? 'hover:border-cyber-neon/30' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/60 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-cyber-neon' : 'text-red-400'
              }`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(change)}%</span>
              <span className="text-white/40">vs hier</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const queue = useRealtime<QueueItem>('queueItems', mockQueue);
  const appointments = useRealtime<Appointment>('appointments', mockAppointments);

  const [liveRevenue, setLiveRevenue] = useState(mockAnalytics.revenue.daily);
  const [liveClients, setLiveClients] = useState(mockAnalytics.clients.today);

  const nextAppointment = appointments
    .filter(a => new Date(a.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

  useEffect(() => {
    // Analytics would ideally also be realtime via a separate table or function,
    // but for now we'll keep the daily stats updated based on local realtime data.
    const todayRevenue = appointments
      .filter(a => a.status === 'completed')
      .reduce((acc, a) => acc + a.totalPrice, 0);

    setLiveRevenue(mockAnalytics.revenue.daily + todayRevenue);
    setLiveClients(mockAnalytics.clients.today + appointments.length);
  }, [appointments]);

  const handleQuickAction = (action: string) => {
    toast.success(`${action} lancé avec succès`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="relative overflow-hidden">
        <div className="glass-card-strong p-6 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyber-neon/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-cyber-neon" />
              <span className="text-cyber-neon text-sm font-medium">Système en ligne</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Bonjour, {mockBarbers[0].name} !
            </h1>
            <p className="text-white/60 max-w-xl">
              Votre salon est ouvert. {queue.length} clients en attente,
              prochain rendez-vous à {nextAppointment?.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.
            </p>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="CA Aujourd'hui"
          value={`${liveRevenue.toLocaleString()}€`}
          change={12.5}
          icon={DollarSign}
          color="neon"
          onClick={() => onNavigate('analytics')}
        />
        <KPICard
          title="Clients Aujourd'hui"
          value={liveClients}
          change={8.3}
          icon={Users}
          color="cyan"
          onClick={() => onNavigate('clients')}
        />
        <KPICard
          title="File d'attente"
          value={queue.length}
          subtitle={`Temps moyen: ${mockAnalytics.queue.averageWaitTime}min`}
          icon={Activity}
          color="orange"
          onClick={() => onNavigate('queue')}
        />
        <KPICard
          title="Prochains RDV"
          value={mockAppointments.length}
          subtitle="Aujourd'hui"
          icon={Calendar}
          color="purple"
          onClick={() => onNavigate('appointments')}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Queue */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyber-neon" />
                  File d'attente en direct
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-cyber-neon hover:text-cyber-neon hover:bg-cyber-neon/10"
                onClick={() => onNavigate('queue')}
              >
                Voir tout
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {queue.slice(0, 4).map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="queue-item"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${item.status === 'in_progress'
                          ? 'bg-cyber-orange/20 text-cyber-orange'
                          : 'bg-cyber-gray text-white/60'
                        }`}>
                        {item.position}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={item.client.avatar} />
                        <AvatarFallback className="bg-cyber-gray text-white">
                          {item.client.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{item.client.name}</p>
                        <p className="text-sm text-white/50">
                          {item.services.map(s => s.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.barber && (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={item.barber.avatar} />
                            <AvatarFallback className="bg-cyber-gray text-xs">
                              {item.barber.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-white/60 hidden sm:block">{item.barber.name}</span>
                        </div>
                      )}
                      <Badge className={`status-${item.status}`}>
                        {item.status === 'waiting' && 'En attente'}
                        {item.status === 'notified' && 'Notifié'}
                        {item.status === 'in_progress' && 'En cours'}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Side Panel */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Next Appointment */}
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyber-cyan" />
                Prochain RDV
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextAppointment ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 ring-2 ring-cyber-cyan/30">
                      <AvatarImage src={nextAppointment.client.avatar} />
                      <AvatarFallback className="bg-cyber-gray text-white">
                        {nextAppointment.client.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{nextAppointment.client.name}</p>
                      <p className="text-sm text-white/50">
                        {nextAppointment.startTime.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nextAppointment.services.map(service => (
                      <Badge
                        key={service.id}
                        variant="outline"
                        className="border-white/20 text-white/70"
                      >
                        {service.name}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    className="w-full btn-outline-neon"
                    onClick={() => onNavigate('appointments')}
                  >
                    Voir le calendrier
                  </Button>
                </div>
              ) : (
                <p className="text-white/50 text-center py-4">Aucun rendez-vous aujourd'hui</p>
              )}
            </CardContent>
          </Card>

          {/* Barber Performance */}
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-cyber-orange" />
                Performance Barbiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBarbers.filter(b => b.status === 'active').map((barber) => (
                  <div key={barber.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={barber.avatar} />
                          <AvatarFallback className="bg-cyber-gray text-xs">
                            {barber.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white">{barber.name}</span>
                      </div>
                      <span className="text-sm text-cyber-neon">{barber.stats.todayClients} clients</span>
                    </div>
                    <Progress
                      value={(barber.stats.todayClients / 15) * 100}
                      className="h-1.5 bg-cyber-gray"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyber-neon" />
              Revenus des 30 derniers jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockAnalytics.revenueChart}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF9C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00FF9C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="label"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `${value}€`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#00FF9C"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Clients Chart */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyber-cyan" />
              Clients par jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAnalytics.clientsChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="label"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#00D4FF"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                className="btn-neon"
                onClick={() => handleQuickAction('Nouveau client')}
              >
                <Users className="w-4 h-4 mr-2" />
                Nouveau client
              </Button>
              <Button
                className="btn-outline-neon"
                onClick={() => onNavigate('appointments')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Nouveau RDV
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => onNavigate('queue')}
              >
                <Activity className="w-4 h-4 mr-2" />
                Ajouter à la file
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => handleQuickAction('Fermeture caisse')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Fermeture caisse
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
