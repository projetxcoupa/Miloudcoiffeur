
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function createClient() {
    if (!isConfigured) {
        console.warn('Supabase credentials missing. Using mock client.');
        return new Proxy({} as any, {
            get: (target, prop) => {
                if (prop === 'auth') {
                    return {
                        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                    }
                }
                if (prop === 'channel') {
                    return () => ({
                        on: () => ({ subscribe: () => ({ unsubscribe: () => { } }) }),
                        subscribe: () => ({ unsubscribe: () => { } }),
                    });
                }
                if (prop === 'rpc') {
                    return (functionName: string, params: any) => {
                        if (functionName === 'book_appointment') {
                            const { p_requested_start } = params;
                            const startTime = new Date(p_requested_start || new Date());
                            const now = new Date();
                            const diffMs = startTime.getTime() - now.getTime();
                            const totalMinutes = Math.floor(diffMs / 60000);

                            return Promise.resolve({
                                data: {
                                    status: 'success',
                                    appointmentId: 'mock-appointment-id-' + Math.random(),
                                    startTime: p_requested_start,
                                    endTime: new Date(startTime.getTime() + 30 * 60000).toISOString(),
                                    timeRemaining: {
                                        days: Math.floor(totalMinutes / 1440),
                                        hours: Math.floor((totalMinutes % 1440) / 60),
                                        minutes: totalMinutes % 60,
                                        totalMinutes
                                    },
                                    message: 'Rendez-vous enregistré (MOCK)'
                                },
                                error: null
                            });
                        }
                        return Promise.resolve({ data: null, error: null });
                    };
                }
                if (prop === 'from') {
                    const queryBuilderMock = new Proxy({} as any, {
                        get: (target, prop) => {
                            if (prop === 'then') {
                                return (resolve: any) => resolve({ data: [], error: null });
                            }
                            return () => queryBuilderMock;
                        }
                    });
                    return () => queryBuilderMock;
                }
                return () => { };
            }
        });
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    )
}
