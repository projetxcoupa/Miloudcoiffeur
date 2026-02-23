'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Info } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/custom-tooltip';
import type { Appointment } from '@/types';

interface HeatmapAnalyticsProps {
    appointments: Appointment[];
    title?: string;
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 9); // 9h to 20h

export function HeatmapAnalytics({ appointments, title = "Intensité des Réservations" }: HeatmapAnalyticsProps) {
    const heatmapData = useMemo(() => {
        const grid = Array.from({ length: 7 }, () => Array(12).fill(0));

        appointments.forEach(app => {
            if (!app.startTime) return;
            const date = new Date(app.startTime);
            const dayIdx = (date.getDay() + 6) % 7; // Convert 0-6 (Sun-Sat) to 0-6 (Mon-Sun)
            const hour = date.getHours();

            if (hour >= 9 && hour <= 20) {
                grid[dayIdx][hour - 9]++;
            }
        });

        return grid;
    }, [appointments]);

    const maxValue = Math.max(...heatmapData.flat(), 1);

    const getIntensityColor = (value: number) => {
        if (value === 0) return 'bg-white/5';
        const intensity = value / maxValue;
        if (intensity < 0.3) return 'bg-cyber-neon/20';
        if (intensity < 0.6) return 'bg-cyber-neon/40';
        if (intensity < 0.8) return 'bg-cyber-neon/70';
        return 'bg-cyber-neon shadow-[0_0_15px_rgba(0,255,156,0.5)]';
    };

    return (
        <Card className="glass-card border-0 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyber-neon" />
                    {title}
                </CardTitle>
                <TooltipProvider>
                    <UITooltip>
                        <TooltipTrigger asChild>
                            <Info className="w-4 h-4 text-white/30 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Analyse des heures les plus chargées basée sur l'historique.</p>
                        </TooltipContent>
                    </UITooltip>
                </TooltipProvider>
            </CardHeader>
            <CardContent>
                <div className="mt-4">
                    <div className="flex">
                        {/* Day labels */}
                        <div className="w-10 space-y-2 mt-8">
                            {DAYS.map(day => (
                                <div key={day} className="h-4 text-[10px] text-white/40 flex items-center">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Heatmap Grid */}
                        <div className="flex-1 overflow-x-auto pb-2 scrollbar-cyber">
                            <div className="min-w-[400px]">
                                {/* Hour labels */}
                                <div className="flex mb-2">
                                    {HOURS.map(hour => (
                                        <div key={hour} className="flex-1 text-[10px] text-white/40 text-center">
                                            {hour}h
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    {heatmapData.map((dayData, dayIdx) => (
                                        <div key={dayIdx} className="flex gap-2">
                                            {dayData.map((value, hourIdx) => (
                                                <TooltipProvider key={hourIdx}>
                                                    <UITooltip>
                                                        <TooltipTrigger asChild>
                                                            <motion.div
                                                                whileHover={{ scale: 1.2, zIndex: 20 }}
                                                                className={`flex-1 h-4 rounded-sm transition-colors duration-500 ${getIntensityColor(value)}`}
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-xs">
                                                                {DAYS[dayIdx]} {HOURS[hourIdx]}h : {value} RDV
                                                            </p>
                                                        </TooltipContent>
                                                    </UITooltip>
                                                </TooltipProvider>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-end gap-3 mt-4 text-[10px] text-white/40">
                        <span>Moins occupé</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-sm bg-white/5" />
                            <div className="w-3 h-3 rounded-sm bg-cyber-neon/20" />
                            <div className="w-3 h-3 rounded-sm bg-cyber-neon/40" />
                            <div className="w-3 h-3 rounded-sm bg-cyber-neon/70" />
                            <div className="w-3 h-3 rounded-sm bg-cyber-neon" />
                        </div>
                        <span>Plus occupé</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
