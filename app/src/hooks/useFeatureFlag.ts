import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Hook to check if a feature flag is enabled for a shop.
 *
 * @param flag - The feature flag name (e.g. 'push_notifications', 'activity_logs')
 * @param shopId - The shop ID to check flags for
 * @returns { enabled, loading } — whether the flag is enabled + loading state
 */
export function useFeatureFlag(flag: string, shopId?: string) {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!shopId || !flag) {
            setLoading(false);
            return;
        }

        const fetchFlag = async () => {
            try {
                const { data, error } = await supabase
                    .from('feature_flags')
                    .select('enabled')
                    .eq('shopId', shopId)
                    .eq('flag', flag)
                    .single();

                if (!error && data) {
                    setEnabled(data.enabled);
                }
            } catch (e) {
                console.error(`Error fetching feature flag "${flag}":`, e);
            } finally {
                setLoading(false);
            }
        };

        fetchFlag();
    }, [flag, shopId]);

    return { enabled, loading };
}
