'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Users,
    Calendar, DollarSign, ArrowRight,
    Activity, Target, Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, addDays, isSameDay } from 'date-fns';
import { useRealtime } from '@/hooks/useRealtime';
import { useAuth } from '@/components/providers/supabase-auth-provider';
import { useAIWaitTime } from '@/hooks/useAIWaitTime';
import { HeatmapAnalytics } from './HeatmapAnalytics';
import type { QueueItem, Appointment, Barber, Service } from '@/types';
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

export function DashboardOverview() {
    const router = useRouter();
    const { userName, shopId } = useAuth();
    const queue = useRealtime<QueueItem>('queueItems', [], shopId || undefined);
    const appointments = useRealtime<Appointment>('appointments', [], shopId || undefined);
    const barbers = useRealtime<Barber>('barbers', [], shopId || undefined);
    const services = useRealtime<Service>('services', [], shopId || undefined);

    const { totalShopWaitTime } = useAIWaitTime(queue, barbers, services);

    const [liveRevenue, setLiveRevenue] = useState(0);
    const [liveClients, setLiveClients] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    const nextAppointment = appointments
        .filter(a => a.startTime && new Date(a.startTime) > new Date())
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

    // Helper to format time safely (client-only to avoid hydration mismatch)
    const formatTime = (time: string | Date) => {
        if (!isMounted) return '--:--';
        try {
            return new Date(time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } catch { return '--:--'; }
    };

    const generateRevenueData = () => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = addDays(new Date(), -i);
            const label = format(date, 'dd/MM');
            const dayAppointments = appointments.filter(a => a.startTime && isSameDay(new Date(a.startTime), date));
            const value = dayAppointments.reduce((acc, a) => acc + (a.totalPrice || 0), 0);
            data.push({ label, value });
        }
        return data.length > 0 ? data : [{ label: 'Aujourd\'hui', value: 0 }];
    };

    const generateClientsData = () => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = addDays(new Date(), -i);
            const label = format(date, 'dd/MM');
            const dayAppointments = appointments.filter(a => a.startTime && isSameDay(new Date(a.startTime), date));
            data.push({ label, value: dayAppointments.length });
        }
        return data.length > 0 ? data : [{ label: 'Aujourd\'hui', value: 0 }];
    };

    useEffect(() => {
        const todayAppointments = appointments.filter(a => a.startTime && isSameDay(new Date(a.startTime), new Date()));
        const todayRevenue = todayAppointments
            .filter(a => a.status === 'completed' || a.status === 'confirmed')
            .reduce((acc, a) => acc + (a.totalPrice || 0), 0);

        setLiveRevenue(todayRevenue);
        setLiveClients(todayAppointments.length);
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
                            Bonjour, {userName || 'Alex'} !
                        </h1>
                        <p className="text-white/60 max-w-xl">
                            Votre salon est ouvert. {queue.length} clients en attente,
                            prochain rendez-vous à {nextAppointment ? formatTime(nextAppointment.startTime) : '--:--'}.
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
                    onClick={() => router.push('/dashboard/analytics')}
                />
                <KPICard
                    title="Clients Aujourd'hui"
                    value={liveClients}
                    change={8.3}
                    icon={Users}
                    color="cyan"
                    onClick={() => router.push('/dashboard/clients')}
                />
                <KPICard
                    title="File d'attente"
                    value={queue.length}
                    subtitle={`Attente IA: ${totalShopWaitTime}min`}
                    icon={Activity}
                    color="orange"
                    onClick={() => router.push('/dashboard/queue')}
                />
                <KPICard
                    title="Prochains RDV"
                    value={appointments.length}
                    subtitle="Aujourd'hui"
                    icon={Calendar}
                    color="purple"
                    onClick={() => router.push('/dashboard/appointments')}
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
                                onClick={() => router.push('/dashboard/queue')}
                            >
                                Voir tout
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {queue.slice(0, 4).map((item) => {
                                    const clientName = item.client?.name || 'Client';
                                    const clientAvatar = item.client?.avatar;
                                    const barberName = item.barber?.name;
                                    const barberAvatar = item.barber?.avatar;
                                    const serviceNames = item.services?.map(s => s.name).join(', ') || 'Service';
                                    return (
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
                                                    <AvatarImage src={clientAvatar} />
                                                    <AvatarFallback className="bg-cyber-gray text-white">
                                                        {clientName.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium truncate">{clientName}</p>
                                                    <p className="text-sm text-white/50">
                                                        {serviceNames}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {barberName && (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-6 h-6">
                                                            <AvatarImage src={barberAvatar} />
                                                            <AvatarFallback className="bg-cyber-gray text-xs">
                                                                {barberName.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm text-white/60 hidden sm:block">{barberName}</span>
                                                    </div>
                                                )}
                                                <Badge className={`status-${item.status}`}>
                                                    {item.status === 'waiting' && 'En attente'}
                                                    {item.status === 'notified' && 'Notifié'}
                                                    {item.status === 'in_progress' && 'En cours'}
                                                </Badge>
                                            </div>
                                        </motion.div>
                                    );
                                })}
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
                                            <AvatarImage src={nextAppointment.client?.avatar} />
                                            <AvatarFallback className="bg-cyber-gray text-white">
                                                {(nextAppointment.client?.name || 'C').charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-white font-medium">{nextAppointment.client?.name || 'Client'}</p>
                                            <p className="text-sm text-white/50">
                                                {formatTime(nextAppointment.startTime)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(nextAppointment.services || []).map((service, idx) => (
                                            <Badge
                                                key={service.id || idx}
                                                variant="outline"
                                                className="border-white/20 text-white/70"
                                            >
                                                {service.name}
                                            </Badge>
                                        ))}
                                    </div>
                                    <Button
                                        className="w-full btn-outline-neon"
                                        onClick={() => router.push('/dashboard/appointments')}
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
                                {barbers.filter(b => b.status === 'active').map((barber) => {
                                    const todayClients = appointments.filter(a => a.barberId === barber.id).length;
                                    return (
                                        <div key={barber.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-6 h-6">
                                                        <AvatarImage src={barber.avatar} />
                                                        <AvatarFallback className="bg-cyber-gray text-xs">
                                                            {barber.name?.charAt(0) || 'B'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-white">{barber.name}</span>
                                                </div>
                                                <span className="text-sm text-cyber-neon">{todayClients} clients</span>
                                            </div>
                                            <Progress
                                                value={Math.min((todayClients / 15) * 100, 100)}
                                                className="h-1.5 bg-cyber-gray"
                                            />
                                        </div>
                                    );
                                })}
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
                                <AreaChart data={generateRevenueData()}>
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
                                <BarChart data={generateClientsData()}>
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

            {/* Phase 3: AI Heatmap */}
            <motion.div variants={itemVariants}>
                <HeatmapAnalytics appointments={appointments} />
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
                                onClick={() => router.push('/dashboard/appointments')}
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Nouveau RDV
                            </Button>
                            <Button
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                                onClick={() => router.push('/dashboard/queue')}
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
