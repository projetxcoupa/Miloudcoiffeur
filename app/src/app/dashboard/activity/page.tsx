'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Filter, Clock, User, Scissors,
    Calendar, Users, ShoppingBag, Tag, TrendingUp,
    RefreshCw, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealtime } from '@/hooks/useRealtime';
import type { ActivityLog } from '@/types';
import { supabase } from '@/lib/supabaseClient';

// Action → icon + color mapping
const actionConfig: Record<string, { icon: any; color: string; label: string }> = {
    'queue.add': { icon: Users, color: 'text-cyber-neon', label: 'File d\'attente' },
    'queue.complete': { icon: Users, color: 'text-cyber-cyan', label: 'File terminée' },
    'queue.cancel': { icon: Users, color: 'text-red-400', label: 'File annulée' },
    'appointment.create': { icon: Calendar, color: 'text-cyber-purple', label: 'Réservation' },
    'appointment.complete': { icon: Calendar, color: 'text-cyber-neon', label: 'RDV terminé' },
    'appointment.cancel': { icon: Calendar, color: 'text-red-400', label: 'RDV annulé' },
    'barber.pause': { icon: Scissors, color: 'text-yellow-400', label: 'Barbier en pause' },
    'barber.active': { icon: Scissors, color: 'text-cyber-neon', label: 'Barbier actif' },
    'client.create': { icon: User, color: 'text-cyber-cyan', label: 'Nouveau client' },
    'service.update': { icon: Tag, color: 'text-cyber-orange', label: 'Service modifié' },
    'payment.received': { icon: ShoppingBag, color: 'text-cyber-neon', label: 'Paiement reçu' },
    'shop.status': { icon: Activity, color: 'text-cyber-orange', label: 'Statut salon' },
};

const defaultConfig = { icon: Activity, color: 'text-white/50', label: 'Activité' };

function getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    return `Il y a ${Math.floor(seconds / 86400)}j`;
}

export default function ActivityPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('activity_logs')
                .select('*')
                .order('createdAt', { ascending: false })
                .limit(50);

            if (filter !== 'all') {
                query = query.like('action', `${filter}.%`);
            }

            const { data, error } = await query;
            if (!error && data) {
                setLogs(data as ActivityLog[]);
            }
        } catch (e) {
            console.error('Error fetching activity logs:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    // Real-time updates
    useEffect(() => {
        const channel = supabase
            .channel('activity_logs_realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'activity_logs' },
                (payload: any) => {
                    setLogs(prev => [payload.new as ActivityLog, ...prev].slice(0, 50));
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const filterOptions = [
        { value: 'all', label: 'Tout' },
        { value: 'queue', label: 'File d\'attente' },
        { value: 'appointment', label: 'Réservations' },
        { value: 'barber', label: 'Barbiers' },
        { value: 'client', label: 'Clients' },
        { value: 'payment', label: 'Paiements' },
        { value: 'shop', label: 'Salon' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase">
                        Journal <span className="text-cyber-neon">d'activité</span>
                    </h1>
                    <p className="text-sm text-white/40 mt-1">
                        {logs.length} activités récentes
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/50 hover:text-white hover:bg-white/10"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/50 hover:text-white hover:bg-white/10"
                        onClick={fetchLogs}
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2"
                    >
                        {filterOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setFilter(opt.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${filter === opt.value
                                    ? 'bg-cyber-neon text-cyber-dark'
                                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Activity Feed */}
            <div className="space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-6 h-6 text-cyber-neon animate-spin" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <Activity className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-sm">Aucune activité enregistrée</p>
                        <p className="text-white/20 text-xs mt-1">
                            Les actions apparaîtront ici en temps réel
                        </p>
                    </div>
                ) : (
                    logs.map((log, i) => {
                        const config = actionConfig[log.action] || defaultConfig;
                        const Icon = config.icon;
                        return (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className="glass-card p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${config.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className={`text-[10px] ${config.color} border-current/30`}>
                                            {config.label}
                                        </Badge>
                                        {log.actorName && (
                                            <span className="text-xs text-white/30 truncate">
                                                par {log.actorName}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-white/70 truncate">
                                        {log.details && typeof log.details === 'object'
                                            ? (log.details as any).message || log.action
                                            : log.action
                                        }
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 text-white/20 text-xs shrink-0">
                                    <Clock className="w-3 h-3" />
                                    {getTimeAgo(log.createdAt)}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
