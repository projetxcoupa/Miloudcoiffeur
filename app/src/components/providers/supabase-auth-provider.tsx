'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    shopId: string | null;
    role: string | null;
    userName: string | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    shopId: null,
    role: null,
    userName: null,
    isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [shopId, setShopId] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUser(user);
                // Extract metadata from Supabase Auth
                setShopId(user.user_metadata?.shopId || null);
                setRole(user.user_metadata?.role || null);
                setUserName(user.user_metadata?.name || null);
            }

            setIsLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
            const newUser = session?.user || null;
            setUser(newUser);
            if (newUser) {
                setShopId(newUser.user_metadata?.shopId || null);
                setRole(newUser.user_metadata?.role || null);
                setUserName(newUser.user_metadata?.name || null);
            } else {
                setShopId(null);
                setRole(null);
                setUserName(null);
            }
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, shopId, role, userName, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
