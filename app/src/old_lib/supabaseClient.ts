import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
    console.warn('Supabase credentials missing. Realtime features will be disabled. Check your .env file or Supabase dashboard.');
}

// Create a real client if configured, otherwise a proxy that prevents crashes
export const supabase = isConfigured
    ? createClient(supabaseUrl!, supabaseAnonKey!)
    : new Proxy({} as any, {
        get: (target, prop) => {
            if (prop === 'channel') {
                return () => ({
                    on: () => ({ subscribe: () => ({ unsubscribe: () => { } }) }),
                    subscribe: () => ({ unsubscribe: () => { } }),
                });
            }
            if (prop === 'from') {
                // Return a recursive proxy that mocks the query builder
                const queryBuilderMock = new Proxy({} as any, {
                    get: (target, prop) => {
                        if (prop === 'then') {
                            // When awaited, resolve with default mock data
                            return (resolve: any) => resolve({ data: [{ id: 'mock-client-id' }], error: null });
                        }
                        // For any other method (select, insert, upsert, eq, etc.), return a function that returns the proxy
                        return () => queryBuilderMock;
                    }
                });
                return () => queryBuilderMock;
            }
            if (prop === 'rpc') {
                return (functionName: string, params: any) => {
                    if (functionName === 'book_appointment') {
                        const { p_requested_start } = params;
                        const startTime = new Date(p_requested_start);
                        const now = new Date();
                        const diffMs = startTime.getTime() - now.getTime();
                        const totalMinutes = Math.floor(diffMs / 60000);

                        return Promise.resolve({
                            data: {
                                status: 'success',
                                appointmentId: 'mock-appointment-id-' + Math.random(),
                                startTime: p_requested_start,
                                endTime: new Date(startTime.getTime() + 30 * 60000).toISOString(), // Assume 30 min
                                timeRemaining: {
                                    days: Math.floor(totalMinutes / 1440),
                                    hours: Math.floor((totalMinutes % 1440) / 60),
                                    minutes: totalMinutes % 60,
                                    totalMinutes
                                },
                                message: 'Rendez-vous enregistré'
                            },
                            error: null
                        });
                    }
                    return Promise.resolve({ data: null, error: null });
                };
            }
            return () => { };
        }
    });

export { isConfigured };
