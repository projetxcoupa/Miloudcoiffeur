import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Hook for logging admin / system activity.
 *
 * Usage:
 *   const { logActivity } = useActivityLog('shop_001');
 *   await logActivity('queue.add', 'queueItems', recordId, { clientName: 'John' });
 */
export function useActivityLog(shopId: string) {
    const logActivity = useCallback(
        async (
            action: string,
            tableName?: string,
            recordId?: string,
            details?: Record<string, any>
        ) => {
            try {
                // Get current user for actor info
                const { data: { user } } = await supabase.auth.getUser();

                const { error } = await supabase.from('activity_logs').insert({
                    shopId,
                    actorId: user?.id ?? null,
                    actorName: user?.user_metadata?.name ?? user?.email ?? 'Système',
                    action,
                    tableName: tableName ?? null,
                    recordId: recordId ?? null,
                    details: details ?? {},
                });

                if (error) {
                    console.error('Activity log insert error:', error);
                }
            } catch (e) {
                console.error('Activity logging failed:', e);
            }
        },
        [shopId]
    );

    return { logActivity };
}
