// FRESHCUT X - Queue Management
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Clock, Bell, Check, X,
  Play, Plus, Search,
  MoreVertical, Phone, Timer
} from 'lucide-react';
import type { QueueItem } from '@/types';
import { mockQueue, mockClients, mockBarbers, mockServices } from '@/data/mockData';
import { supabase } from '@/lib/supabaseClient';
import { useRealtime } from '@/hooks/useRealtime';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function QueueManagement() {
  const realtimeQueue = useRealtime<QueueItem>('queueItems', mockQueue);
  const [queue, setQueue] = useState<QueueItem[]>(realtimeQueue);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<(typeof mockClients)[0] | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    setQueue(realtimeQueue);
  }, [realtimeQueue]);

  // Simulate real-time queue updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update wait times
      setQueue(prev => prev.map(item => ({
        ...item,
        estimatedWaitTime: Math.max(0, item.estimatedWaitTime - 1)
      })));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleReorder = async (newOrder: QueueItem[]) => {
    const updatedOrder = newOrder.map((item, index) => ({ ...item, position: index + 1 }));
    setQueue(updatedOrder);

    // Persist to Supabase
    const { error } = await supabase
      .from('queueItems')
      .upsert(updatedOrder);

    if (error) {
      toast.error('Erreur lors de la réorganisation');
      console.error(error);
    } else {
      toast.success('File d\'attente réorganisée');
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: QueueItem['status']) => {
    const item = queue.find(i => i.id === itemId);
    if (!item) return;

    const updates: Partial<QueueItem> = { status: newStatus };
    if (newStatus === 'in_progress') {
      updates.startedAt = new Date();
    } else if (newStatus === 'done') {
      updates.completedAt = new Date();
    } else if (newStatus === 'notified') {
      updates.notifiedAt = new Date();
    }

    const { error } = await supabase
      .from('queueItems')
      .update(updates)
      .eq('id', itemId);

    if (error) {
      toast.error('Erreur lors de la mise à jour du statut');
      console.error(error);
    } else {
      if (newStatus === 'in_progress') toast.info(`${item.client.name} - Service démarré`);
      if (newStatus === 'done') toast.success(`${item.client.name} - Service terminé`);
      if (newStatus === 'notified') toast.success(`Notification envoyée à ${item.client.name}`);
    }
  };

  const handleRemove = async (itemId: string) => {
    const { error } = await supabase
      .from('queueItems')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    } else {
      toast.success('Client retiré de la file');
    }
  };

  const handleAddToQueue = async () => {
    if (!selectedClient || selectedServices.length === 0) {
      toast.error('Veuillez sélectionner un client et au moins un service');
      return;
    }

    const services = mockServices.filter(s => selectedServices.includes(s.id));

    const newItem: any = {
      shopId: 'shop_001',
      clientId: selectedClient.id,
      barberId: selectedBarber || null,
      serviceIds: selectedServices,
      position: queue.length + 1,
      status: 'waiting',
      estimatedWaitTime: queue.length * 25 + services.reduce((acc, s) => acc + s.duration, 0),
      joinedAt: new Date(),
    };

    const { error } = await supabase
      .from('queueItems')
      .insert([newItem]);

    if (error) {
      toast.error('Erreur lors de l\'ajout à la file');
      console.error(error);
    } else {
      setIsAddDialogOpen(false);
      setSelectedClient(null);
      setSelectedServices([]);
      setSelectedBarber('');
      toast.success(`${selectedClient.name} ajouté à la file d'attente`);
    }
  };

  const getStatusColor = (status: QueueItem['status']) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'notified': return 'bg-cyber-neon/20 text-cyber-neon border-cyber-neon/30';
      case 'in_progress': return 'bg-cyber-orange/20 text-cyber-orange border-cyber-orange/30';
      case 'done': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getStatusLabel = (status: QueueItem['status']) => {
    switch (status) {
      case 'waiting': return 'En attente';
      case 'notified': return 'Notifié';
      case 'in_progress': return 'En cours';
      case 'done': return 'Terminé';
      case 'cancelled': return 'Annulé';
    }
  };

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  const activeQueue = queue.filter(item => item.status !== 'done' && item.status !== 'cancelled');
  const completedToday = queue.filter(item => item.status === 'done').length;

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">En attente</p>
            <p className="text-2xl font-bold text-white">{activeQueue.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Temps moyen</p>
            <p className="text-2xl font-bold text-cyber-neon">25min</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Terminés aujourd'hui</p>
            <p className="text-2xl font-bold text-cyber-cyan">{completedToday}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-sm text-white/60">Barbiers actifs</p>
            <p className="text-lg sm:text-2xl font-bold text-cyber-orange">
              {mockBarbers.filter(b => b.status === 'active').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Queue Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">File d'attente live</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyber-neon rounded-full animate-pulse" />
            <span className="text-sm text-cyber-neon">Temps réel</span>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-neon">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un client
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-cyber-gray border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">Ajouter à la file d'attente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Rechercher un client</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    placeholder="Nom ou téléphone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-cyber pl-10"
                  />
                </div>
                {searchQuery && (
                  <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                    {filteredClients.map(client => (
                      <button
                        key={client.id}
                        onClick={() => {
                          setSelectedClient(client);
                          setSearchQuery('');
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${selectedClient?.id === client.id
                          ? 'bg-cyber-neon/20 border border-cyber-neon/50'
                          : 'hover:bg-white/5'
                          }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={client.avatar} />
                          <AvatarFallback className="bg-cyber-gray text-xs">
                            {client.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="text-sm text-white">{client.name}</p>
                          <p className="text-xs text-white/50">{client.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedClient && (
                <div className="p-3 bg-cyber-neon/10 border border-cyber-neon/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedClient.avatar} />
                      <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{selectedClient.name}</p>
                      <p className="text-sm text-white/60">{selectedClient.phone}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-white/50 hover:text-white"
                      onClick={() => setSelectedClient(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-white/60 mb-2 block">Services</label>
                <div className="grid grid-cols-2 gap-2">
                  {mockServices.filter(s => s.isActive).map(service => (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSelectedServices(prev =>
                          prev.includes(service.id)
                            ? prev.filter(id => id !== service.id)
                            : [...prev, service.id]
                        );
                      }}
                      className={`p-3 rounded-lg border text-left transition-all ${selectedServices.includes(service.id)
                        ? 'border-cyber-neon bg-cyber-neon/10'
                        : 'border-white/10 hover:border-white/30'
                        }`}
                    >
                      <p className="text-sm text-white">{service.name}</p>
                      <p className="text-xs text-white/50">{service.duration}min • {service.price}€</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">Barbier (optionnel)</label>
                <Select value={selectedBarber || "none"} onValueChange={(val) => setSelectedBarber(val === "none" ? "" : val)}>
                  <SelectTrigger className="input-cyber">
                    <SelectValue placeholder="Choisir un barbier..." />
                  </SelectTrigger>
                  <SelectContent className="bg-cyber-gray border-white/10">
                    <SelectItem value="none">Premier disponible</SelectItem>
                    {mockBarbers.filter(b => b.status === 'active').map(barber => (
                      <SelectItem key={barber.id} value={barber.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={barber.avatar} />
                            <AvatarFallback className="text-xs">{barber.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {barber.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full btn-neon"
                onClick={handleAddToQueue}
                disabled={!selectedClient || selectedServices.length === 0}
              >
                Ajouter à la file
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Queue List */}
      <Card className="glass-card border-0">
        <CardContent className="p-0">
          <Reorder.Group axis="y" values={activeQueue} onReorder={handleReorder} className="space-y-0">
            <AnimatePresence>
              {activeQueue.map((item) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  className="border-b border-white/5 last:border-0"
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`p-4 ${item.status === 'in_progress' ? 'bg-cyber-orange/5' : ''
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Position */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${item.status === 'in_progress'
                        ? 'bg-cyber-orange/20 text-cyber-orange'
                        : item.position === 1
                          ? 'bg-cyber-neon/20 text-cyber-neon'
                          : 'bg-cyber-gray text-white/60'
                        }`}>
                        {item.position}
                      </div>

                      {/* Client Info */}
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 sm:w-12 h-12 ring-2 ring-white/10">
                          <AvatarImage src={item.client.avatar} />
                          <AvatarFallback className="bg-cyber-gray">
                            {item.client.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <p className="text-white font-medium truncate text-sm sm:text-base">{item.client.name}</p>
                            {/* Mobile status badge */}
                            <Badge className={`sm:hidden w-fit py-0 text-[10px] ${getStatusColor(item.status)}`}>
                              {getStatusLabel(item.status)}
                            </Badge>
                            {item.client.isVip && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] w-fit">
                                VIP
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] sm:text-sm text-white/50">
                            <span className="truncate">
                              {item.services.map(s => s.name).join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Wait Time */}
                      <div className="hidden sm:flex items-center gap-2 text-white/60">
                        <Timer className="w-4 h-4" />
                        <span className="text-sm">
                          {item.status === 'in_progress'
                            ? 'En cours'
                            : `~${item.estimatedWaitTime}min`
                          }
                        </span>
                      </div>

                      {/* Barber */}
                      {item.barber && (
                        <div className="hidden md:flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={item.barber.avatar} />
                            <AvatarFallback className="text-xs">{item.barber.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-white/60">{item.barber.name}</span>
                        </div>
                      )}

                      {/* Status - Hidden on Mobile */}
                      <Badge className={`hidden sm:inline-flex ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </Badge>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {item.status === 'waiting' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-cyber-neon hover:text-cyber-neon hover:bg-cyber-neon/10"
                            onClick={() => handleStatusChange(item.id, 'notified')}
                          >
                            <Bell className="w-4 h-4" />
                          </Button>
                        )}
                        {item.status === 'notified' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-cyber-orange hover:text-cyber-orange hover:bg-cyber-orange/10"
                            onClick={() => handleStatusChange(item.id, 'in_progress')}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        {item.status === 'in_progress' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-400 hover:text-green-400 hover:bg-green-400/10"
                            onClick={() => handleStatusChange(item.id, 'done')}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-cyber-gray border-white/10">
                            <DropdownMenuItem
                              className="text-white/70 hover:text-white focus:bg-white/10"
                              onClick={() => toast.info(`Appel ${item.client.phone}`)}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Appeler
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-400 hover:text-red-400 focus:bg-red-400/10"
                              onClick={() => handleRemove(item.id)}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Retirer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>

          {activeQueue.length === 0 && (
            <div className="p-12 text-center">
              <Clock className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">La file d'attente est vide</p>
              <p className="text-white/30 text-sm mt-1">Ajoutez des clients pour commencer</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto Notifications Info */}
      <Card className="glass-card border-0 border-l-4 border-l-cyber-neon">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-cyber-neon mt-0.5" />
            <div>
              <p className="text-white font-medium">Notifications automatiques</p>
              <p className="text-sm text-white/60">
                Les clients reçoivent une notification quand il reste 2 personnes avant eux
                et quand c'est leur tour.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
