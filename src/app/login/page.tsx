'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (password === 'admin123') { // Simple mock auth
            // Set cookie (in real app, this happens server-side or via API)
            document.cookie = "admin-session=true; path=/";
            toast.success('Connexion réussie');
            router.push('/dashboard');
        } else {
            toast.error('Mot de passe incorrect');
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
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Mot de passe"
                            className="bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-cyber-neon/50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </div>
                    <Button
                        className="w-full btn-neon font-bold uppercase tracking-wider h-12"
                        onClick={handleLogin}
                    >
                        Se connecter
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
