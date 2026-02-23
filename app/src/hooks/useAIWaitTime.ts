'use client';

import { useMemo } from 'react';
import type { QueueItem, Service, Barber } from '@/types';

export function useAIWaitTime(
    queue: QueueItem[],
    barbers: Barber[],
    services: Service[]
) {
    const estimatedWaitTime = useMemo(() => {
        if (queue.length === 0) return 0;

        const activeBarbers = barbers.filter(b => b.status === 'active').length;
        if (activeBarbers === 0) return queue.length * 15; // Fallback if no barbers active

        // Calculate average duration of services in current queue
        // For simplicity, we'll use the duration from the services table
        const totalDuration = queue.reduce((acc, item) => {
            // Find services for this item
            const itemServices = item.services || [];
            if (itemServices.length > 0) {
                return acc + itemServices.reduce((sum, s) => sum + (s.duration || 15), 0);
            }
            return acc + 15; // Default 15 mins
        }, 0);

        // Basic formula: total work / parallel capacity
        let baseWait = totalDuration / activeBarbers;

        // Traffic weighting based on time of day
        const now = new Date();
        const hour = now.getHours();

        // Boost factor during peak hours (11h-14h and 17h-20h)
        if ((hour >= 11 && hour <= 14) || (hour >= 17 && hour <= 20)) {
            baseWait *= 1.2;
        }

        return Math.round(baseWait);
    }, [queue, barbers, services]);

    /**
     * Get estimate for a specific person at a specific position
     */
    const getEstimateForPosition = (positionInQueue: number) => {
        if (positionInQueue <= 0) return 0;

        const activeBarbers = barbers.filter(b => b.status === 'active').length;
        const avgServiceTime = 25; // Average across all services

        const peopleAhead = positionInQueue - 1;
        const slotsAvailablePerCycle = activeBarbers || 1;

        // Wait time = (peopleAhead / slots) * avgTime
        return Math.max(1, Math.round((peopleAhead / slotsAvailablePerCycle) * avgServiceTime));
    };

    return {
        totalShopWaitTime: estimatedWaitTime,
        getEstimateForPosition
    };
}
