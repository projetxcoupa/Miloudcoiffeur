import { mockClients } from '@/data/mockData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, Calendar, CreditCard } from 'lucide-react';

export default function ClientPage({ params }: { params: { id: string } }) {
    const client = mockClients.find(c => c.id === params.id) || mockClients[0]; // Fallback to first if not found for demo

    if (!client) return <div>Client non trouvé</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/clients">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold text-white">Détails Client</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="glass-card border-0 md:col-span-1">
                    <CardHeader className="text-center">
                        <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-cyber-neon">
                            <AvatarImage src={client.avatar} />
                            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-xl text-white">{client.name}</CardTitle>
                        <div className="flex justify-center gap-2 mt-2">
                            {client.isVip && <Badge className="bg-cyber-neon text-cyber-dark">VIP</Badge>}
                            {client.isBlocked ? (
                                <Badge variant="destructive">Bloqué</Badge>
                            ) : (
                                <Badge variant="outline" className="text-green-400 border-green-400">Actif</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-white/70">
                            <Phone className="w-4 h-4 text-cyber-cyan" />
                            <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/70">
                            <Mail className="w-4 h-4 text-cyber-cyan" />
                            <span>{client.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/70">
                            <Calendar className="w-4 h-4 text-cyber-cyan" />
                            <span>Inscrit le {client.createdAt.toLocaleDateString()}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats & Notes */}
                <Card className="glass-card border-0 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white">Statistiques & Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-lg bg-white/5">
                                <p className="text-sm text-white/50 mb-1">Total Visites</p>
                                <p className="text-2xl font-bold text-cyber-neon">{client.totalVisits}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5">
                                <p className="text-sm text-white/50 mb-1">Dépenses</p>
                                <p className="text-2xl font-bold text-cyber-orange">{client.totalSpent}€</p>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5">
                                <p className="text-sm text-white/50 mb-1">Fidélité</p>
                                <p className="text-2xl font-bold text-cyber-purple">{client.loyaltyScore}pts</p>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5">
                                <p className="text-sm text-white/50 mb-1">Dernière visite</p>
                                <p className="text-sm font-bold text-white mt-2">{client.lastVisit?.toLocaleDateString() || 'N/A'}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-white font-medium mb-2">Notes</h3>
                            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm">
                                {client.notes || "Aucune note particulière."}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
