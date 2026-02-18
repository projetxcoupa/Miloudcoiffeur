'use client';

// FRESHCUT X - Reservations
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Plus,
  ChevronLeft, ChevronRight, Check, X,
  MoreHorizontal, Phone
} from 'lucide-react';
import type { Appointment } from '@/types';
import { mockAppointments, mockClients, mockBarbers, mockServices } from '@/data/mockData';
import { supabase } from '@/lib/supabaseClient';
import { useRealtime } from '@/hooks/useRealtime';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Reservations() {
  const realtimeAppointments = useRealtime<Appointment>('appointments', mockAppointments);
  const [appointments, setAppointments] = useState<Appointment[]>(realtimeAppointments);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    setAppointments(realtimeAppointments);
  }, [realtimeAppointments]);

  // New appointment form state
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState('');

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.startTime), date));
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'confirmed': return 'bg-cyber-neon/20 text-cyber-neon border-cyber-neon/30';
      case 'in_progress': return 'bg-cyber-orange/20 text-cyber-orange border-cyber-orange/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'no_show': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'Planifié';
      case 'confirmed': return 'Confirmé';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'no_show': return 'No-show';
      case 'cancelled': return 'Annulé';
    }
  };

  const handleStatusChange = async (aptId: string, newStatus: Appointment['status']) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', aptId);

    if (error) {
      toast.error('Erreur lors de la mise à jour du statut');
      console.error(error);
    } else {
      toast.success(`Statut mis à jour : ${newStatus}`);
    }
  };

  const handleCancel = async (aptId: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', aptId);

    if (error) {
      toast.error('Erreur lors de l\'annulation');
      console.error(error);
    } else {
      toast.success('Réservation annulée');
    }
  };

  const handleAddAppointment = async () => {
    if (!selectedClient || !selectedBarber || selectedServices.length === 0 || !selectedTime) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const client = mockClients.find(c => c.id === selectedClient);
    const barber = mockBarbers.find(b => b.id === selectedBarber);
    const services = mockServices.filter(s => selectedServices.includes(s.id));

    if (!client || !barber) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, minutes);

    const totalDuration = services.reduce((acc, s) => acc + s.duration, 0);
    const endTime = new Date(startTime.getTime() + totalDuration * 60000);

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      shopId: 'shop_001',
      clientId: client.id,
      client,
      barberId: barber.id,
      barber,
      serviceIds: selectedServices,
      services,
      startTime,
      endTime,
      status: 'scheduled',
      totalPrice: services.reduce((acc, s) => acc + s.price, 0),
      isPaid: false,
      createdAt: new Date(),
    };

    setAppointments(prev => [...prev, newAppointment]);
    setIsAddDialogOpen(false);
    toast.success('Rendez-vous créé avec succès');
  };

  const todaysAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-white font-medium min-w-[150px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-neon ml-4">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau RDV
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-cyber-gray border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Nouveau rendez-vous</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Client</label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="input-cyber">
                      <SelectValue placeholder="Choisir un client..." />
                    </SelectTrigger>
                    <SelectContent className="bg-cyber-gray border-white/10">
                      {mockClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={client.avatar} />
                              <AvatarFallback className="text-xs">{client.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {client.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-2 block">Barbier</label>
                  <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                    <SelectTrigger className="input-cyber">
                      <SelectValue placeholder="Choisir un barbier..." />
                    </SelectTrigger>
                    <SelectContent className="bg-cyber-gray border-white/10">
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
                  <label className="text-sm text-white/60 mb-2 block">Heure</label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger className="input-cyber">
                      <SelectValue placeholder="Choisir une heure..." />
                    </SelectTrigger>
                    <SelectContent className="bg-cyber-gray border-white/10 max-h-60">
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full btn-neon"
                  onClick={handleAddAppointment}
                  disabled={!selectedClient || !selectedBarber || selectedServices.length === 0 || !selectedTime}
                >
                  Créer le rendez-vous
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="glass-card border-0">
        <CardContent className="p-0">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {weekDays.map((day, index) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const dayAppointments = getAppointmentsForDate(day);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`p-4 text-center transition-all ${isSelected ? 'bg-cyber-neon/10' : 'hover:bg-white/5'
                    } ${index !== 6 ? 'border-r border-white/10' : ''}`}
                >
                  <p className="text-sm text-white/60 capitalize">
                    {format(day, 'EEE', { locale: fr })}
                  </p>
                  <p className={`text-xl font-bold mt-1 ${isToday ? 'text-cyber-neon' : 'text-white'
                    } ${isSelected ? 'scale-110' : ''}`}>
                    {format(day, 'd')}
                  </p>
                  {dayAppointments.length > 0 && (
                    <div className="flex justify-center gap-1 mt-2">
                      {dayAppointments.slice(0, 3).map((_, i) => (
                        <span key={i} className="w-1.5 h-1.5 bg-cyber-neon rounded-full" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Day View */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
              </h3>
              <Badge variant="outline" className="border-white/20 text-white/60">
                {todaysAppointments.length} rendez-vous
              </Badge>
            </div>

            <div className="space-y-3">
              {todaysAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50">Aucun rendez-vous ce jour</p>
                  <Button
                    variant="ghost"
                    className="text-cyber-neon mt-2"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un RDV
                  </Button>
                </div>
              ) : (
                todaysAppointments.map((apt) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 bg-cyber-dark/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                  >
                    {/* Time */}
                    <div className="text-center min-w-[60px]">
                      <p className="text-white font-medium">
                        {format(new Date(apt.startTime), 'HH:mm')}
                      </p>
                      <p className="text-sm text-white/40">
                        {format(new Date(apt.endTime), 'HH:mm')}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-12 bg-white/10" />

                    {/* Client */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={apt.client.avatar} />
                        <AvatarFallback className="bg-cyber-gray">
                          {apt.client.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">{apt.client.name}</p>
                        <p className="text-sm text-white/50">{apt.client.phone}</p>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="hidden md:flex items-center gap-2">
                      <span className="text-sm text-white/60">
                        {apt.services.map(s => s.name).join(', ')}
                      </span>
                    </div>

                    {/* Barber */}
                    <div className="hidden lg:flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={apt.barber?.avatar} />
                        <AvatarFallback className="text-xs bg-cyber-gray">
                          {apt.barber?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-white/60">{apt.barber?.name}</span>
                    </div>

                    {/* Price */}
                    <div className="text-right min-w-[80px]">
                      <p className="text-white font-medium">{apt.totalPrice}€</p>
                      <p className="text-xs text-white/40">
                        {apt.isPaid ? 'Payé' : 'Non payé'}
                      </p>
                    </div>

                    {/* Status */}
                    <Badge className={getStatusColor(apt.status)}>
                      {getStatusLabel(apt.status)}
                    </Badge>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white/50 hover:text-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-cyber-gray border-white/10">
                        <DropdownMenuItem
                          className="text-white/70 hover:text-white focus:bg-white/10"
                          onClick={() => handleStatusChange(apt.id, 'confirmed')}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Confirmer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-white/70 hover:text-white focus:bg-white/10"
                          onClick={() => toast.info(`Appel ${apt.client.phone}`)}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Appeler
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-white/70 hover:text-white focus:bg-white/10"
                          onClick={() => handleStatusChange(apt.id, 'completed')}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Marquer terminé
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 hover:text-red-400 focus:bg-red-400/10"
                          onClick={() => handleCancel(apt.id)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Annuler
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">RDV aujourd'hui</p>
            <p className="text-2xl font-bold text-white">{todaysAppointments.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Confirmés</p>
            <p className="text-2xl font-bold text-cyber-neon">
              {todaysAppointments.filter(a => a.status === 'confirmed').length}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">CA prévu</p>
            <p className="text-2xl font-bold text-cyber-cyan">
              {todaysAppointments.reduce((acc, a) => acc + a.totalPrice, 0)}€
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">No-shows ce mois</p>
            <p className="text-2xl font-bold text-red-400">2</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
