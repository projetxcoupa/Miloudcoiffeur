'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Zap, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message === 'Invalid login credentials'
                    ? 'Email ou mot de passe incorrect'
                    : error.message
                );
                return;
            }

            if (data.user) {
                toast.success('Connexion réussie');
                router.push('/dashboard');
                router.refresh(); // Refresh to update middleware session
            }
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cyber-dark flex items-center justify-center p-4">
            <Card className="glass-card-strong w-full max-w-md border-cyber-neon/30">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-neon to-cyber-cyan flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,156,0.5)]">
                        <Zap className="w-6 h-6 text-cyber-dark" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase text-white">
                        Admin <span className="text-cyber-neon">Access</span>
                    </CardTitle>
                    <p className="text-white/40 text-sm mt-2">
                        Connectez-vous pour accéder au dashboard
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <Input
                                type="email"
                                placeholder="Email"
                                className="bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-cyber-neon/50 pl-10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <Input
                                type="password"
                                placeholder="Mot de passe"
                                className="bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-cyber-neon/50 pl-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <Button
                        className="w-full btn-neon font-bold uppercase tracking-wider h-12"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Connexion...
                            </span>
                        ) : (
                            'Se connecter'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
