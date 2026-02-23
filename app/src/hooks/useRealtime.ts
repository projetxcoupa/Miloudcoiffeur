import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Real-time subscription hook for Supabase tables.
 *
 * @param table - The table name to subscribe to
 * @param initialData - Fallback data before first fetch
 * @param shopId - Optional shopId to filter subscriptions (multi-tenant isolation)
 */
export function useRealtime<T extends { id: string }>(
    table: string,
    initialData: T[] = [],
    shopId?: string
) {
    const [data, setData] = useState<T[]>(initialData);

    useEffect(() => {
        // Fetch initial data
        const fetchInitialData = async () => {
            let query = supabase.from(table).select('*');

            // Filter by shopId if provided
            if (shopId) {
                const filterColumn = table === 'shops' ? 'id' : 'shopId';
                query = query.eq(filterColumn, shopId);
            }

            const { data: fetchedData, error } = await query;

            if (!error && fetchedData) {
                setData(fetchedData as T[]);
            } else {
                console.error(`Error fetching initial data for ${table}:`, error);
            }
        };

        fetchInitialData();

        // Build filter for realtime subscription
        const filterConfig: Record<string, string> = {
            event: '*',
            schema: 'public',
            table,
        };

        // Add shopId filter to reduce network traffic in multi-tenant
        if (shopId) {
            const filterColumn = table === 'shops' ? 'id' : 'shopId';
            (filterConfig as any).filter = `${filterColumn}=eq.${shopId}`;
        }

        const channel = supabase
            .channel(`public:${table}${shopId ? `:${shopId}` : ''}`)
            .on(
                'postgres_changes',
                filterConfig as any,
                (payload: RealtimePostgresChangesPayload<T>) => {
                    console.log(`Change received in ${table}:`, payload);

                    setData((currentData) => {
                        switch (payload.eventType) {
                            case 'INSERT':
                                return [...currentData, payload.new as T];
                            case 'UPDATE':
                                return currentData.map((item) =>
                                    item.id === payload.new.id ? payload.new as T : item
                                );
                            case 'DELETE':
                                return currentData.filter((item) => item.id !== payload.old.id);
                            default:
                                return currentData;
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table, shopId]);

    return data;
}
