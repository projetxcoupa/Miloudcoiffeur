// FRESHCUT X - Settings
import { useState } from 'react';
import {
    User, Shield,
    Bell, Save,
    Store, Phone, MapPin,
    Percent, Clock
} from 'lucide-react';
import { mockShop, mockUser } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export function Settings() {
    const [shopName, setShopName] = useState(mockShop.name);
    const [address, setAddress] = useState(mockShop.address);
    const [phone, setPhone] = useState(mockShop.phone);
    const [isOpen, setIsOpen] = useState(mockShop.isOpen);

    const handleSave = () => {
        toast.success('Paramètres enregistrés', {
            description: 'Les modifications ont été appliquées avec succès.'
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Paramètres</h2>
                    <p className="text-white/60">Gérez la configuration de votre salon et de votre compte.</p>
                </div>
                <Button className="btn-neon" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                </Button>
            </div>

            <Tabs defaultValue="shop" className="space-y-6">
                <TabsList className="bg-cyber-gray border border-white/10">
                    <TabsTrigger value="shop" className="data-[state=active]:bg-white/10 data-[state=active]:text-cyber-neon">
                        <Store className="w-4 h-4 mr-2" />
                        Salon
                    </TabsTrigger>
                    <TabsTrigger value="account" className="data-[state=active]:bg-white/10 data-[state=active]:text-cyber-cyan">
                        <User className="w-4 h-4 mr-2" />
                        Compte
                    </TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-white/10 data-[state=active]:text-cyber-orange">
                        <Shield className="w-4 h-4 mr-2" />
                        Sécurité
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10 data-[state=active]:text-cyber-purple">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="shop">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Card className="glass-card border-0">
                                <CardHeader>
                                    <CardTitle className="text-white">Informations Générales</CardTitle>
                                    <CardDescription className="text-white/50">
                                        Ces informations seront visibles par vos clients sur l'application mobile.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">Nom du salon</label>
                                            <div className="relative">
                                                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                <Input
                                                    value={shopName}
                                                    onChange={(e) => setShopName(e.target.value)}
                                                    className="input-cyber pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">Téléphone</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                                <Input
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="input-cyber pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">Adresse</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                            <Input
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                className="input-cyber pl-10"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass-card border-0">
                                <CardHeader>
                                    <CardTitle className="text-white">Statut du salon</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-4 bg-cyber-dark/50 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isOpen ? 'bg-cyber-neon/20 shadow-[0_0_20px_rgba(0,255,156,0.2)]' : 'bg-red-500/20'}`}>
                                                <Store className={`w-6 h-6 ${isOpen ? 'text-cyber-neon' : 'text-red-400'}`} />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">Etat actuel : {isOpen ? 'Ouvert' : 'Fermé'}</p>
                                                <p className="text-sm text-white/50">Permet aux clients de rejoindre la file</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={isOpen}
                                            onCheckedChange={setIsOpen}
                                            className="data-[state=checked]:bg-cyber-neon"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="glass-card border-0">
                                <CardHeader>
                                    <CardTitle className="text-white text-sm">Plan actuel</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-gradient-to-br from-cyber-purple/20 to-cyber-cyan/20 rounded-xl border border-white/10">
                                        <Badge className="bg-cyber-purple text-white mb-2 capitalize">{mockShop.plan}</Badge>
                                        <p className="text-white font-bold text-lg">Pro Dashboard</p>
                                        <p className="text-xs text-white/60 mt-1">Prochain renouvellement : 12/03/2026</p>
                                    </div>
                                    <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                                        Changer de plan
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="glass-card border-0">
                                <CardHeader>
                                    <CardTitle className="text-white text-sm">Paramètres financiers</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-white/60 flex items-center gap-2">
                                            <Percent className="w-3 h-3" />
                                            TVA par défaut (%)
                                        </label>
                                        <Input defaultValue="20" className="input-cyber h-8 text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-white/60 flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            Intervalle RDV (min)
                                        </label>
                                        <Input defaultValue="30" className="input-cyber h-8 text-sm" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="account">
                    <Card className="glass-card border-0">
                        <CardHeader>
                            <CardTitle className="text-white">Profil Utilisateur</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-cyber-neon/30">
                                        <img src={mockUser.avatar} alt={mockUser.name} className="w-full h-full object-cover" />
                                    </div>
                                    <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                                        Changer
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{mockUser.name}</h3>
                                    <p className="text-cyber-neon capitalize">{mockUser.role}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60">Nom complet</label>
                                    <Input defaultValue={mockUser.name} className="input-cyber" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60">Email</label>
                                    <Input defaultValue={mockUser.email} className="input-cyber" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card className="glass-card border-0">
                        <CardHeader>
                            <CardTitle className="text-white">Sécurité du compte</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-white font-medium text-sm">Changer le mot de passe</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <Input type="password" placeholder="Mot de passe actuel" className="input-cyber" />
                                    <Input type="password" placeholder="Nouveau mot de passe" className="input-cyber" />
                                    <Input type="password" placeholder="Confirmer nouveau mot de passe" className="input-cyber" />
                                    <Button className="w-fit btn-outline-neon">Mettre à jour</Button>
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">Double authentification (2FA)</p>
                                    <p className="text-sm text-white/50">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                                </div>
                                <Switch className="data-[state=checked]:bg-cyber-cyan" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card className="glass-card border-0">
                        <CardHeader>
                            <CardTitle className="text-white">Préférences de notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[
                                { title: 'Nouveaux rendez-vous', desc: 'Recevoir une alerte pour chaque nouvelle réservation.' },
                                { title: 'File d\'attente', desc: 'Alertes lors d\'ajouts ou désistements dans la file.' },
                                { title: 'Rapports quotidiens', desc: 'Résumé financier envoyé tous les soirs.' },
                                { title: 'Alertes stock', desc: 'Notifications quand un produit atteint un seuil bas.' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">{item.title}</p>
                                        <p className="text-sm text-white/50">{item.desc}</p>
                                    </div>
                                    <Switch defaultChecked className="data-[state=checked]:bg-cyber-purple" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
