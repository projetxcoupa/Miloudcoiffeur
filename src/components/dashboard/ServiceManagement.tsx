'use client';

// FRESHCUT X - Service CMS
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit, Trash2,
  Eye, EyeOff, Scissors,
  DollarSign, Clock
} from 'lucide-react';
import type { Service } from '@/types';
import { mockServices } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const colorOptions = [
  { value: '#00FF9C', label: 'Néon Vert' },
  { value: '#00D4FF', label: 'Néon Bleu' },
  { value: '#FF4D00', label: 'Orange' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#FF00FF', label: 'Magenta' },
  { value: '#10B981', label: 'Émeraude' },
  { value: '#F59E0B', label: 'Ambre' },
  { value: '#EF4444', label: 'Rouge' },
];

export function ServiceManagement() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    color: '#00FF9C',
  });

  const handleToggleActive = (serviceId: string) => {
    setServices(prev => prev.map(service => {
      if (service.id === serviceId) {
        toast.success(
          service.isActive
            ? `${service.name} désactivé`
            : `${service.name} activé`
        );
        return { ...service, isActive: !service.isActive };
      }
      return service;
    }));
  };

  const handleDelete = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    toast.success('Service supprimé');
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.duration) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingService) {
      setServices(prev => prev.map(s =>
        s.id === editingService.id
          ? {
            ...s,
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            duration: Number(formData.duration),
            category: formData.category,
            color: formData.color,
          }
          : s
      ));
      toast.success('Service mis à jour');
    } else {
      const newService: Service = {
        id: `service_${Date.now()}`,
        shopId: 'shop_001',
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        duration: Number(formData.duration),
        category: formData.category || 'Autre',
        color: formData.color,
        isActive: true,
      };
      setServices(prev => [...prev, newService]);
      toast.success('Service créé avec succès');
    }

    setIsAddDialogOpen(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: '',
      color: '#00FF9C',
    });
  };

  const startEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      color: service.color,
    });
    setIsAddDialogOpen(true);
  };

  const activeServices = services.filter(s => s.isActive);
  const categories = Array.from(new Set(services.map(s => s.category)));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Total services</p>
            <p className="text-2xl font-bold text-white">{services.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Actifs</p>
            <p className="text-2xl font-bold text-cyber-neon">{activeServices.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Catégories</p>
            <p className="text-2xl font-bold text-cyber-cyan">{categories.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Prix moyen</p>
            <p className="text-2xl font-bold text-cyber-orange">
              {Math.round(services.reduce((acc, s) => acc + s.price, 0) / services.length)}€
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Gestion des services</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-neon">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau service
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-cyber-gray border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingService ? 'Modifier le service' : 'Nouveau service'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-white/60 mb-1 block">Nom du service *</label>
                <Input
                  placeholder="ex: Coupe Homme"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-cyber"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-1 block">Description</label>
                <Input
                  placeholder="Description du service..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-cyber"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Prix (€) *</label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-cyber"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Durée (min) *</label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-cyber"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60 mb-1 block">Catégorie</label>
                <Input
                  placeholder="ex: Coupe, Barbe, Pack..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-cyber"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-1 block">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-8 h-8 rounded-lg transition-all ${formData.color === color.value
                        ? 'ring-2 ring-white scale-110'
                        : 'hover:scale-105'
                        }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <Button
                className="w-full btn-neon"
                onClick={handleSubmit}
              >
                {editingService ? 'Mettre à jour' : 'Créer le service'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <motion.div
            key={service.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass-card overflow-hidden ${!service.isActive ? 'opacity-50' : ''
              }`}
          >
            {/* Color Bar */}
            <div
              className="h-2"
              style={{ backgroundColor: service.color }}
            />

            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${service.color}20` }}
                  >
                    <Scissors className="w-6 h-6" style={{ color: service.color }} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{service.name}</h3>
                    <Badge variant="outline" className="border-white/20 text-white/60 text-xs mt-1">
                      {service.category}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white/50 hover:text-white">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-cyber-gray border-white/10">
                    <DropdownMenuItem
                      className="text-white/70 hover:text-white focus:bg-white/10"
                      onClick={() => startEdit(service)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-white/70 hover:text-white focus:bg-white/10"
                      onClick={() => handleToggleActive(service.id)}
                    >
                      {service.isActive ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {service.isActive ? 'Désactiver' : 'Activer'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-400 hover:text-red-400 focus:bg-red-400/10"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {service.description && (
                <p className="text-sm text-white/50 mt-3 line-clamp-2">
                  {service.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-white/60">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium text-white">{service.price}€</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/60">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration}min</span>
                  </div>
                </div>
                <Badge
                  className={service.isActive
                    ? 'bg-cyber-neon/20 text-cyber-neon border-cyber-neon/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }
                >
                  {service.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Categories Summary */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white text-base">Résumé par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const categoryServices = services.filter(s => s.category === category);
              const avgPrice = Math.round(
                categoryServices.reduce((acc, s) => acc + s.price, 0) / categoryServices.length
              );

              return (
                <div key={category} className="p-4 bg-cyber-dark/50 rounded-lg">
                  <p className="text-white font-medium">{category}</p>
                  <p className="text-sm text-white/50">{categoryServices.length} services</p>
                  <p className="text-cyber-neon text-sm mt-1">~{avgPrice}€</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
