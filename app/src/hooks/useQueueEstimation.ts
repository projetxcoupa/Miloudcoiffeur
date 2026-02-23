import { useMemo } from 'react';

interface QueueItem {
    id: string;
    position: number;
    status: string;
    estimatedWaitTime?: number;
}

interface Barber {
    id: string;
    status: string;
}

interface Service {
    id: string;
    duration: number;
    isActive?: boolean;
}

/**
 * Hook to calculate estimated wait time for queue positions.
 *
 * Formula:
 *   estimatedWait = (people_ahead × avg_service_duration) ÷ active_barbers_count
 *
 * Edge case: If queue is empty and client is first → 1 minute.
 *
 * @param queueItems - Current queue items
 * @param barbers - All barbers (need to count active ones)
 * @param services - All services (for average duration)
 * @param currentPosition - The position to estimate wait for (optional, defaults to next)
 */
export function useQueueEstimation(
    queueItems: QueueItem[],
    barbers: Barber[],
    services: Service[],
    currentPosition?: number
) {
    return useMemo(() => {
        // Count active barbers
        const activeBarbers = barbers.filter(b => b.status === 'active').length || 1;

        // Average service duration
        const activeServices = services.filter(s => s.isActive !== false);
        const avgDuration = activeServices.length > 0
            ? activeServices.reduce((sum, s) => sum + s.duration, 0) / activeServices.length
            : 20; // Default 20 min

        // People ahead in queue (waiting or notified)
        const waitingItems = queueItems.filter(
            item => item.status === 'waiting' || item.status === 'notified'
        );

        // Position to calculate for
        const pos = currentPosition ?? (waitingItems.length + 1);

        // People ahead of this position
        const peopleAhead = waitingItems.filter(item => item.position < pos).length;

        // Edge case: first in line
        if (peopleAhead === 0) {
            return {
                estimatedMinutes: 1,
                peopleAhead: 0,
                activeBarbers,
                avgDuration: Math.round(avgDuration),
                formatted: '~1 min',
            };
        }

        // Calculate estimate
        const estimatedMinutes = Math.ceil((peopleAhead * avgDuration) / activeBarbers);

        return {
            estimatedMinutes,
            peopleAhead,
            activeBarbers,
            avgDuration: Math.round(avgDuration),
            formatted: estimatedMinutes >= 60
                ? `~${Math.floor(estimatedMinutes / 60)}h${estimatedMinutes % 60 > 0 ? (estimatedMinutes % 60) + 'min' : ''}`
                : `~${estimatedMinutes} min`,
        };
    }, [queueItems, barbers, services, currentPosition]);
}
