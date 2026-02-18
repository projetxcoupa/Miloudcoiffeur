
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

    if (!isConfigured) {
        console.warn('Supabase credentials missing. using mock server client.');
        // Return a basic mock for server context
        return new Proxy({} as any, {
            get: (target, prop) => {
                if (prop === 'auth') {
                    return {
                        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                    }
                }
                return () => ({
                    select: () => ({ data: [], error: null }),
                    insert: () => ({ data: [], error: null }),
                    update: () => ({ data: [], error: null }),
                    delete: () => ({ data: [], error: null }),
                });
            }
        });
    }

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
