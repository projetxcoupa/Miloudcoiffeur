// FRESHCUT X - Client CRM
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, User, Phone, Mail, Calendar, DollarSign, 
  Ban, MoreHorizontal, Plus, Download,
  Crown
} from 'lucide-react';
import type { Client } from '@/types';
import { mockClients } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export function ClientCRM() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'vip' | 'blocked' | 'new'>('all');

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'vip' ? client.isVip :
      filter === 'blocked' ? client.isBlocked :
      filter === 'new' ? client.totalVisits <= 3 : true;
    
    return matchesSearch && matchesFilter;
  });

  const handleBlockClient = (clientId: string) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        const updated = { ...client, isBlocked: !client.isBlocked };
        toast.success(
          updated.isBlocked 
            ? `${client.name} a été bloqué` 
            : `${client.name} a été débloqué`
        );
        return updated;
      }
      return client;
    }));
  };

  const handleExport = () => {
    toast.success('Export CSV en cours de téléchargement...');
  };

  const getLoyaltyTier = (score: number) => {
    if (score >= 90) return { label: 'Platine', color: 'text-purple-400' };
    if (score >= 70) return { label: 'Or', color: 'text-yellow-400' };
    if (score >= 50) return { label: 'Argent', color: 'text-gray-400' };
    return { label: 'Bronze', color: 'text-orange-400' };
  };

  const stats = {
    total: clients.length,
    vip: clients.filter(c => c.isVip).length,
    blocked: clients.filter(c => c.isBlocked).length,
    newThisMonth: clients.filter(c => c.totalVisits <= 3).length,
    totalRevenue: clients.reduce((acc, c) => acc + c.totalSpent, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Total clients</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">VIP</p>
            <p className="text-2xl font-bold text-cyber-neon">{stats.vip}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Bloqués</p>
            <p className="text-2xl font-bold text-red-400">{stats.blocked}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Nouveaux</p>
            <p className="text-2xl font-bold text-cyber-cyan">{stats.newThisMonth}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">CA total</p>
            <p className="text-2xl font-bold text-cyber-orange">{stats.totalRevenue.toLocaleString()}€</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="bg-cyber-gray/50 border border-white/10">
              <TabsTrigger value="all" className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark">
                Tous
              </TabsTrigger>
              <TabsTrigger value="vip" className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark">
                VIP
              </TabsTrigger>
              <TabsTrigger value="new" className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark">
                Nouveaux
              </TabsTrigger>
              <TabsTrigger value="blocked" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                Bloqués
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-cyber pl-10 w-full sm:w-64"
            />
          </div>
          <Button 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="btn-neon">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-cyber-gray border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Nouveau client</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input placeholder="Nom complet" className="input-cyber" />
                <Input placeholder="Téléphone" className="input-cyber" />
                <Input placeholder="Email (optionnel)" className="input-cyber" />
                <Button className="w-full btn-neon" onClick={() => toast.success('Client créé avec succès')}>
                  Créer le client
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const tier = getLoyaltyTier(client.loyaltyScore);
          
          return (
            <Dialog key={client.id}>
              <DialogTrigger asChild>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`glass-card p-4 cursor-pointer transition-all ${
                    client.isBlocked ? 'opacity-50' : ''
                  } ${client.isVip ? 'ring-1 ring-yellow-500/30' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className={`w-14 h-14 ${client.isVip ? 'ring-2 ring-yellow-500' : ''}`}>
                      <AvatarImage src={client.avatar} />
                      <AvatarFallback className="bg-cyber-gray text-lg">
                        {client.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium truncate">{client.name}</p>
                        {client.isVip && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-sm text-white/50">{client.phone}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className={`text-xs ${tier.color} border-current`}>
                          {tier.label}
                        </Badge>
                        <span className="text-xs text-white/40">
                          {client.totalVisits} visites
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="text-white/50 hover:text-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-cyber-gray border-white/10">
                        <DropdownMenuItem 
                          className="text-white/70 hover:text-white focus:bg-white/10"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Voir profil
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={`${client.isBlocked ? 'text-green-400' : 'text-red-400'} focus:bg-white/10`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBlockClient(client.id);
                          }}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          {client.isBlocked ? 'Débloquer' : 'Bloquer'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{client.totalVisits}</p>
                      <p className="text-xs text-white/40">Visites</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-cyber-neon">{client.totalSpent}€</p>
                      <p className="text-xs text-white/40">Dépensé</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-cyber-cyan">
                        {client.lastVisit ? new Date(client.lastVisit).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '-'}
                      </p>
                      <p className="text-xs text-white/40">Dernière</p>
                    </div>
                  </div>
                </motion.div>
              </DialogTrigger>

              <DialogContent className="bg-cyber-gray border-white/10 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={client.avatar} />
                      <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{client.name}</p>
                      {client.isVip && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Crown className="w-3 h-3 mr-1" />
                          Client VIP
                        </Badge>
                      )}
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <p className="text-sm text-white/60 font-medium">Contact</p>
                    <div className="flex items-center gap-3 text-white/80">
                      <Phone className="w-4 h-4 text-cyber-neon" />
                      <span>{client.phone}</span>
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-3 text-white/80">
                        <Mail className="w-4 h-4 text-cyber-cyan" />
                        <span>{client.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Loyalty */}
                  <div className="space-y-3">
                    <p className="text-sm text-white/60 font-medium">Fidélité</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Score de fidélité</span>
                      <span className={`font-bold ${tier.color}`}>{client.loyaltyScore}/100</span>
                    </div>
                    <Progress value={client.loyaltyScore} className="h-2 bg-cyber-gray" />
                    <p className="text-sm text-white/50">Niveau: {tier.label}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-cyber-dark rounded-lg">
                      <div className="flex items-center gap-2 text-white/60 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Visites totales</span>
                      </div>
                      <p className="text-xl font-bold text-white">{client.totalVisits}</p>
                    </div>
                    <div className="p-3 bg-cyber-dark rounded-lg">
                      <div className="flex items-center gap-2 text-white/60 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">Total dépensé</span>
                      </div>
                      <p className="text-xl font-bold text-cyber-neon">{client.totalSpent}€</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {client.notes && (
                    <div className="p-3 bg-cyber-dark rounded-lg">
                      <p className="text-sm text-white/60 mb-1">Notes</p>
                      <p className="text-white/80">{client.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button className="flex-1 btn-neon">
                      <Calendar className="w-4 h-4 mr-2" />
                      Prendre RDV
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`${
                        client.isBlocked 
                          ? 'border-green-500/50 text-green-400 hover:bg-green-500/10' 
                          : 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                      }`}
                      onClick={() => handleBlockClient(client.id)}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      {client.isBlocked ? 'Débloquer' : 'Bloquer'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Aucun client trouvé</p>
          <p className="text-white/30 text-sm mt-1">Essayez une autre recherche</p>
        </div>
      )}
    </div>
  );
}
