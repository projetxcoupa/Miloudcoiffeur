import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useRealtime<T extends { id: string }>(
    table: string,
    initialData: T[] = []
) {
    const [data, setData] = useState<T[]>(initialData);

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    useEffect(() => {
        const channel = supabase
            .channel(`public:${table}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table },
                (payload: RealtimePostgresChangesPayload<T>) => {
                    console.log(`Change received in ${table}:`, payload);

                    setData((currentData) => {
                        switch (payload.eventType) {
                            case 'INSERT':
                                return [...currentData, payload.new];
                            case 'UPDATE':
                                return currentData.map((item) =>
                                    item.id === payload.new.id ? payload.new : item
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
    }, [table]);

    return data;
}
