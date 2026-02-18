
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

    if (!isConfigured) {
        // If not configured, just pass through or handle as needed
        return response;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
        // Also check for our mock cookie for dev mode
        const mockSession = request.cookies.get('admin-session')
        if (!mockSession) {
            // return NextResponse.redirect(new URL('/login', request.url))
            // Log for now
            console.log(`[Middleware] No Supabase user or mock session for ${request.nextUrl.pathname}`);
        }
    }

    return response
}
