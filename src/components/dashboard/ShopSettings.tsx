'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Store, Clock, MapPin, Phone,
    Save, Shield, Info, Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { mockShop } from '@/data/mockData';
import { useRealtime } from '@/hooks/useRealtime';
import type { Shop } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function ShopSettings() {
    const shops = useRealtime<Shop>('shops', [mockShop as any]);
    const shop = shops.find(s => s.id === 'shop_001') || mockShop;

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        status: 'closed' as 'open' | 'break' | 'closed'
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (shop) {
            setFormData({
                name: shop.name,
                address: shop.address,
                phone: shop.phone,
                status: shop.status
            });
        }
    }, [shop]);

    const handleUpdateStatus = async (newStatus: 'open' | 'break' | 'closed') => {
        try {
            const { error } = await supabase
                .from('shops')
                .update({ status: newStatus })
                .eq('id', shop.id);

            if (error) throw error;

            // Local state update for mock consistency if needed
            setFormData(prev => ({ ...prev, status: newStatus }));
            toast.success(`Statut mis à jour: ${newStatus === 'open' ? 'Ouvert' : newStatus === 'break' ? 'En Pause' : 'Fermé'}`);
        } catch (error: any) {
            console.error('Update Status Error:', error);
            toast.error('Erreur lors de la mise à jour du statut');
        }
    };

    const handleSaveInfo = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('shops')
                .update({
                    name: formData.name,
                    address: formData.address,
                    phone: formData.phone
                })
                .eq('id', shop.id);

            if (error) throw error;
            toast.success('Informations du salon enregistrées');
        } catch (error: any) {
            console.error('Save Info Error:', error);
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tighter italic">
                    Paramètres <span className="text-cyber-neon">du Salon</span>
                </h1>
                <p className="text-white/50">Gérez le statut opérationnel et les informations de votre établissement.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Control */}
                <Card className="glass-card md:col-span-1 border-0 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-neon/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-cyber-neon" />
                            Statut de l'activité
                        </CardTitle>
                        <CardDescription className="text-white/40 italic">// Temps réel</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3">
                            {[
                                { id: 'open', label: 'Ouvert', color: 'cyber-neon', desc: 'Prêt à recevoir des clients' },
                                { id: 'break', label: 'En Pause', color: 'yellow-500', desc: 'Pause temporaire' },
                                { id: 'closed', label: 'Fermé', color: 'red-500', desc: 'Salon fermé' }
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => handleUpdateStatus(s.id as any)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${formData.status === s.id
                                            ? `border-${s.color} bg-${s.color}/10 shadow-[0_0_20px_rgba(0,255,156,0.1)]`
                                            : 'border-white/5 bg-white/5 grayscale hover:grayscale-0'
                                        }`}
                                >
                                    <div className={`w-3 h-3 rounded-full bg-${s.color} ${formData.status === s.id ? 'animate-pulse' : ''}`} />
                                    <div>
                                        <p className="text-white font-bold">{s.label}</p>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{s.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* General Information */}
                <Card className="glass-card md:col-span-2 border-0">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Store className="w-5 h-5 text-cyber-cyan" />
                            Informations Générales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs text-white/40 font-bold uppercase tracking-widest block">Nom du salon</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="input-cyber"
                                    placeholder="ex: Miloud Coiffeur"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-white/40 font-bold uppercase tracking-widest block">Téléphone</label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="input-cyber"
                                    placeholder="+213 ..."
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs text-white/40 font-bold uppercase tracking-widest block">Adresse complète</label>
                                <Input
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    className="input-cyber"
                                    placeholder="ex: Ain El-turk, Oran"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-end">
                            <Button
                                onClick={handleSaveInfo}
                                className="btn-neon px-8"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-cyber-dark/30 border-t-cyber-dark rounded-full animate-spin mr-2" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Enregistrer les modifications
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Security Monitor */}
            <Card className="glass-card border-0 bg-cyber-purple/5 border-l-4 border-l-cyber-purple">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyber-purple/20 flex items-center justify-center shrink-0">
                        <Shield className="w-6 h-6 text-cyber-purple" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-1">Accès Sécurisé</h4>
                        <p className="text-sm text-white/50 leading-relaxed">
                            Seuls les administrateurs avec le rôle <span className="text-cyber-purple font-mono">super_admin</span> ou <span className="text-cyber-purple font-mono">manager</span> peuvent modifier ces paramètres critiques. Votre terminal est actuellement synchronisé avec le serveur central.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
