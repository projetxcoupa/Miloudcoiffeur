
import { createBrowserClient } from '@supabase/ssr'

// Public keys — safe to hardcode as defaults (these are meant for client-side use)
const DEFAULT_SUPABASE_URL = 'https://lyynzwjmfkeceknpomgq.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5eW56d2ptZmtlY2VrbnBvbWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjcwODEsImV4cCI6MjA4Njk0MzA4MX0.nxudGoG963o8eAUqUJQK916zf83POsXWJJZWYx7BTuI'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

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
