import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useRealtime<T extends { id: string }>(
    table: string,
    initialData: T[] = []
) {
    const [data, setData] = useState<T[]>(initialData);


    useEffect(() => {
        // Fetch initial data
        const fetchInitialData = async () => {
            const { data: initialData, error } = await supabase
                .from(table)
                .select('*');

            if (!error && initialData) {
                setData(initialData as T[]);
            } else {
                console.error(`Error fetching initial data for ${table}:`, error);
            }
        };

        fetchInitialData();

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
    }, [table]);

    return data;
}
