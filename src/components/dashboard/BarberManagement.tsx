// FRESHCUT X - Barber Management
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Star, TrendingUp, Users,
  DollarSign, Edit, Pause,
  Play
} from 'lucide-react';
import type { Barber } from '@/types';
import { mockBarbers } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export function BarberManagement() {
  const [barbers, setBarbers] = useState<Barber[]>(mockBarbers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBarber, setNewBarber] = useState({
    name: '',
    email: '',
    phone: '',
    commission: '40',
  });

  const handleStatusChange = (barberId: string, newStatus: Barber['status']) => {
    setBarbers(prev => prev.map(barber => {
      if (barber.id === barberId) {
        toast.success(`${barber.name} est maintenant ${newStatus === 'active' ? 'actif' : newStatus === 'pause' ? 'en pause' : 'hors ligne'}`);
        return { ...barber, status: newStatus };
      }
      return barber;
    }));
  };

  const getStatusColor = (status: Barber['status']) => {
    switch (status) {
      case 'active': return 'bg-cyber-neon/20 text-cyber-neon border-cyber-neon/30';
      case 'pause': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'off': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: Barber['status']) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pause': return 'En pause';
      case 'off': return 'Hors ligne';
    }
  };

  const activeBarbers = barbers.filter(b => b.status === 'active');
  const totalRevenue = barbers.reduce((acc, b) => acc + b.stats.totalRevenue, 0);
  const totalClients = barbers.reduce((acc, b) => acc + b.stats.totalClients, 0);

  const handleAddBarber = () => {
    if (!newBarber.name) {
      toast.error('Le nom est obligatoire');
      return;
    }

    const addedBarber: Barber = {
      id: `barber_${Date.now()}`,
      shopId: 'shop_001',
      name: newBarber.name,
      avatar: `https://i.pravatar.cc/150?u=${newBarber.name}`,
      status: 'active',
      commissionRate: Number(newBarber.commission),
      specialties: ['Coupe classique'],
      schedule: {
        monday: { start: '09:00', end: '19:00', isWorking: true },
        tuesday: { start: '09:00', end: '19:00', isWorking: true },
        wednesday: { start: '09:00', end: '19:00', isWorking: true },
        thursday: { start: '09:00', end: '19:00', isWorking: true },
        friday: { start: '09:00', end: '20:00', isWorking: true },
        saturday: { start: '10:00', end: '18:00', isWorking: true },
        sunday: { start: '', end: '', isWorking: false },
      },
      stats: {
        totalClients: 0,
        totalRevenue: 0,
        averageCutTime: 30,
        rating: 5.0,
        todayClients: 0,
        todayRevenue: 0,
      },
      isActive: true,
    };

    setBarbers(prev => [...prev, addedBarber]);
    setIsAddDialogOpen(false);
    setNewBarber({ name: '', email: '', phone: '', commission: '40' });
    toast.success(`${newBarber.name} a été ajouté avec succès`);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Barbiers actifs</p>
            <p className="text-2xl font-bold text-white">{activeBarbers.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Total clients</p>
            <p className="text-2xl font-bold text-cyber-neon">{totalClients.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">CA total</p>
            <p className="text-2xl font-bold text-cyber-cyan">{totalRevenue.toLocaleString()}€</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Note moyenne</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-cyber-orange">
                {(barbers.reduce((acc, b) => acc + b.stats.rating, 0) / barbers.length).toFixed(1)}
              </p>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barbers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {barbers.map((barber) => (
          <Dialog key={barber.id}>
            <DialogTrigger asChild>
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="glass-card p-6 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16 ring-2 ring-white/10">
                        <AvatarImage src={barber.avatar} />
                        <AvatarFallback className="bg-cyber-gray text-xl">
                          {barber.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-cyber-gray ${barber.status === 'active' ? 'bg-cyber-neon' :
                          barber.status === 'pause' ? 'bg-yellow-400' : 'bg-gray-400'
                        }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{barber.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(barber.status)}>
                          {getStatusLabel(barber.status)}
                        </Badge>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-3 h-3 fill-yellow-400" />
                          <span className="text-sm">{barber.stats.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyber-neon">{barber.stats.todayRevenue}€</p>
                    <p className="text-sm text-white/50">Aujourd'hui</p>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {barber.specialties.map(specialty => (
                    <Badge
                      key={specialty}
                      variant="outline"
                      className="border-white/20 text-white/70"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-white/40 mb-1">
                      <Users className="w-3 h-3" />
                    </div>
                    <p className="text-lg font-bold text-white">{barber.stats.todayClients}</p>
                    <p className="text-xs text-white/40">Clients</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-white/40 mb-1">
                      <TrendingUp className="w-3 h-3" />
                    </div>
                    <p className="text-lg font-bold text-cyber-cyan">{barber.stats.totalClients}</p>
                    <p className="text-xs text-white/40">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-cyber-orange">{barber.stats.averageCutTime}</p>
                    <p className="text-xs text-white/40">Min/coupe</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-cyber-neon">{barber.commissionRate}%</p>
                    <p className="text-xs text-white/40">Commission</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/60">Objectif journalier</span>
                    <span className="text-cyber-neon">{barber.stats.todayClients}/15</span>
                  </div>
                  <Progress
                    value={(barber.stats.todayClients / 15) * 100}
                    className="h-2 bg-cyber-gray"
                  />
                </div>
              </motion.div>
            </DialogTrigger>

            <DialogContent className="bg-cyber-gray border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={barber.avatar} />
                    <AvatarFallback className="text-lg">{barber.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{barber.name}</p>
                    <Badge className={getStatusColor(barber.status)}>
                      {getStatusLabel(barber.status)}
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="stats" className="mt-4">
                <TabsList className="bg-cyber-dark border border-white/10">
                  <TabsTrigger value="stats" className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark">
                    Statistiques
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark">
                    Planning
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark">
                    Paramètres
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="stats" className="space-y-4 mt-4">
                  {/* Performance Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="glass-card border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyber-neon/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-cyber-neon" />
                          </div>
                          <div>
                            <p className="text-sm text-white/60">CA Total</p>
                            <p className="text-xl font-bold text-white">{barber.stats.totalRevenue.toLocaleString()}€</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="glass-card border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyber-cyan/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-cyber-cyan" />
                          </div>
                          <div>
                            <p className="text-sm text-white/60">Clients totals</p>
                            <p className="text-xl font-bold text-white">{barber.stats.totalClients}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="glass-card border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyber-orange/20 flex items-center justify-center">
                            <Star className="w-5 h-5 text-cyber-orange" />
                          </div>
                          <div>
                            <p className="text-sm text-white/60">Note moyenne</p>
                            <p className="text-xl font-bold text-white">{barber.stats.rating}/5</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Today's Performance */}
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Performance aujourd'hui</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Clients servis</span>
                          <span className="text-white font-medium">{barber.stats.todayClients}</span>
                        </div>
                        <Progress value={(barber.stats.todayClients / 15) * 100} className="h-2 bg-cyber-gray" />
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Revenus</span>
                          <span className="text-cyber-neon font-medium">{barber.stats.todayRevenue}€</span>
                        </div>
                        <Progress value={(barber.stats.todayRevenue / 500) * 100} className="h-2 bg-cyber-gray" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4 mt-4">
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Horaires hebdomadaires</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(barber.schedule).map(([day, schedule]) => {
                          const dayNames: Record<string, string> = {
                            monday: 'Lundi',
                            tuesday: 'Mardi',
                            wednesday: 'Mercredi',
                            thursday: 'Jeudi',
                            friday: 'Vendredi',
                            saturday: 'Samedi',
                            sunday: 'Dimanche',
                          };
                          return (
                            <div key={day} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                              <span className="text-white capitalize">{dayNames[day]}</span>
                              {schedule.isWorking ? (
                                <span className="text-cyber-neon">
                                  {schedule.start} - {schedule.end}
                                </span>
                              ) : (
                                <span className="text-white/40">Fermé</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Actions rapides</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          className={`${barber.status === 'active'
                              ? 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10'
                              : 'border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/10'
                            }`}
                          onClick={() => handleStatusChange(barber.id, barber.status === 'active' ? 'pause' : 'active')}
                        >
                          {barber.status === 'active' ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                          {barber.status === 'active' ? 'Mettre en pause' : 'Activer'}
                        </Button>
                        <Button
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Add Barber Button */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full btn-outline-neon py-8 border-dashed">
            <Plus className="w-6 h-6 mr-2" />
            Ajouter un barbier
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-cyber-gray border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Nouveau barbier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Nom complet"
              className="input-cyber"
              value={newBarber.name}
              onChange={(e) => setNewBarber({ ...newBarber, name: e.target.value })}
            />
            <Input
              placeholder="Email"
              className="input-cyber"
              value={newBarber.email}
              onChange={(e) => setNewBarber({ ...newBarber, email: e.target.value })}
            />
            <Input
              placeholder="Téléphone"
              className="input-cyber"
              value={newBarber.phone}
              onChange={(e) => setNewBarber({ ...newBarber, phone: e.target.value })}
            />
            <Input
              placeholder="Taux de commission (%)"
              type="number"
              className="input-cyber"
              value={newBarber.commission}
              onChange={(e) => setNewBarber({ ...newBarber, commission: e.target.value })}
            />
            <Button className="w-full btn-neon" onClick={handleAddBarber}>
              Ajouter le barbier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
