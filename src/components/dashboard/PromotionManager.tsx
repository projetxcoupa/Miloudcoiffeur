'use client';

// FRESHCUT X - Promotions
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Plus, Percent, Tag, Calendar,
  Copy, Trash2, MoreHorizontal,
  Mail, MessageSquare, Bell, Send, Check
} from 'lucide-react';
import type { Promotion } from '@/types';
import { mockPromotions, mockClients } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

import { useRealtime } from '@/hooks/useRealtime';

export function PromotionManager() {
  const realtimePromotions = useRealtime<Promotion>('promotions', []);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    if (realtimePromotions.length > 0) {
      // eslint-disable-next-line
      setPromotions(realtimePromotions);
    }
  }, [realtimePromotions]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('promotions');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    startDate: '',
    endDate: '',
  });

  const handleCreatePromotion = () => {
    if (!formData.name || !formData.discountValue) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newPromotion: Promotion = {
      id: `promo_${Date.now()}`,
      shopId: 'shop_001',
      name: formData.name,
      description: formData.description,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      startDate: new Date(formData.startDate || Date.now()),
      endDate: new Date(formData.endDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      usageCount: 0,
    };

    setPromotions(prev => [...prev, newPromotion]);
    setIsAddDialogOpen(false);
    setFormData({
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      startDate: '',
      endDate: '',
    });
    toast.success('Promotion créée avec succès');
  };

  const handleToggleActive = (promoId: string) => {
    setPromotions(prev => prev.map(promo => {
      if (promo.id === promoId) {
        toast.success(promo.isActive ? 'Promotion désactivée' : 'Promotion activée');
        return { ...promo, isActive: !promo.isActive };
      }
      return promo;
    }));
  };

  const handleDelete = (promoId: string) => {
    setPromotions(prev => prev.filter(p => p.id !== promoId));
    toast.success('Promotion supprimée');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié dans le presse-papier');
  };

  const handleSendCampaign = (type: 'sms' | 'push' | 'email') => {
    toast.success(`Campagne ${type.toUpperCase()} envoyée à ${mockClients.length} clients`);
  };

  const activePromotions = promotions.filter(p => p.isActive);
  const totalUsage = promotions.reduce((acc, p) => acc + p.usageCount, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Promotions actives</p>
            <p className="text-2xl font-bold text-white">{activePromotions.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Utilisations</p>
            <p className="text-2xl font-bold text-cyber-neon">{totalUsage}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">Taux de conversion</p>
            <p className="text-2xl font-bold text-cyber-cyan">24%</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <p className="text-sm text-white/60">CA généré</p>
            <p className="text-2xl font-bold text-cyber-orange">3,240€</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-cyber-gray/50 border border-white/10">
          <TabsTrigger value="promotions" className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark">
            <Tag className="w-4 h-4 mr-2" />
            Promotions
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark">
            <Send className="w-4 h-4 mr-2" />
            Campagnes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="promotions" className="mt-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Promotions actives</h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-neon">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle promo
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-cyber-gray border-white/10 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white">Créer une promotion</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Nom de la promotion</label>
                    <Input
                      placeholder="ex: Pack Weekend"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-cyber"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Description</label>
                    <Input
                      placeholder="Description de l'offre..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-cyber"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/60 mb-1 block">Type</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                          className={`flex-1 p-3 rounded-lg border transition-all ${formData.discountType === 'percentage'
                            ? 'border-cyber-neon bg-cyber-neon/10'
                            : 'border-white/10 hover:border-white/30'
                            }`}
                        >
                          <Percent className="w-4 h-4 mx-auto mb-1" />
                          <span className="text-sm text-white">%</span>
                        </button>
                        <button
                          onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                          className={`flex-1 p-3 rounded-lg border transition-all ${formData.discountType === 'fixed'
                            ? 'border-cyber-neon bg-cyber-neon/10'
                            : 'border-white/10 hover:border-white/30'
                            }`}
                        >
                          <Tag className="w-4 h-4 mx-auto mb-1" />
                          <span className="text-sm text-white">€</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-white/60 mb-1 block">Valeur</label>
                      <Input
                        type="number"
                        placeholder={formData.discountType === 'percentage' ? '20' : '10'}
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        className="input-cyber"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/60 mb-1 block">Date début</label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="input-cyber"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/60 mb-1 block">Date fin</label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="input-cyber"
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full btn-neon"
                    onClick={handleCreatePromotion}
                  >
                    Créer la promotion
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Promotions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions.map((promo) => (
              <motion.div
                key={promo.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass-card p-5 ${!promo.isActive ? 'opacity-50' : ''
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${promo.discountType === 'percentage'
                      ? 'bg-cyber-neon/20'
                      : 'bg-cyber-cyan/20'
                      }`}>
                      {promo.discountType === 'percentage' ? (
                        <Percent className="w-6 h-6 text-cyber-neon" />
                      ) : (
                        <Tag className="w-6 h-6 text-cyber-cyan" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{promo.name}</h3>
                      <p className="text-sm text-white/50">{promo.description}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white/50 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-cyber-gray border-white/10">
                      <DropdownMenuItem
                        className="text-white/70 hover:text-white focus:bg-white/10"
                        onClick={() => handleCopyCode(promo.id)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copier le code
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-white/70 hover:text-white focus:bg-white/10"
                        onClick={() => handleToggleActive(promo.id)}
                      >
                        {promo.isActive ? <Check className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        {promo.isActive ? 'Désactiver' : 'Activer'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-400 hover:text-red-400 focus:bg-red-400/10"
                        onClick={() => handleDelete(promo.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-cyber-neon">
                      {promo.discountValue}{promo.discountType === 'percentage' ? '%' : '€'}
                    </span>
                    <span className="text-white/50">de réduction</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-white/50">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Jusqu'au {new Date(promo.endDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <Badge
                    className={promo.isActive
                      ? 'bg-cyber-neon/20 text-cyber-neon border-cyber-neon/30'
                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }
                  >
                    {promo.usageCount} utilisations
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4 space-y-6">
          {/* Campaign Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                  <MessageSquare className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">SMS</h3>
                <p className="text-white/50 text-sm mb-4">
                  Envoyez des notifications SMS à vos clients pour les rappels et promotions.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">{mockClients.length} contacts</span>
                  <Button
                    variant="outline"
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    onClick={() => handleSendCampaign('sms')}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-xl bg-cyber-neon/20 flex items-center justify-center mb-4">
                  <Bell className="w-7 h-7 text-cyber-neon" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Push Notifications</h3>
                <p className="text-white/50 text-sm mb-4">
                  Notifications push instantanées pour la file d'attente et les rappels.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">{mockClients.length} abonnés</span>
                  <Button
                    variant="outline"
                    className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/10"
                    onClick={() => handleSendCampaign('push')}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-xl bg-cyber-orange/20 flex items-center justify-center mb-4">
                  <Mail className="w-7 h-7 text-cyber-orange" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Email</h3>
                <p className="text-white/50 text-sm mb-4">
                  Campagnes email pour les newsletters et offres spéciales.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">
                    {mockClients.filter(c => c.email).length} emails
                  </span>
                  <Button
                    variant="outline"
                    className="border-cyber-orange/50 text-cyber-orange hover:bg-cyber-orange/10"
                    onClick={() => handleSendCampaign('email')}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign History */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Historique des campagnes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'push', title: 'Rappel weekend', date: 'Il y a 2 jours', sent: 45, opened: 38 },
                  { type: 'sms', title: 'Promo Saint-Valentin', date: 'Il y a 1 semaine', sent: 120, opened: 98 },
                  { type: 'email', title: 'Newsletter mensuelle', date: 'Il y a 2 semaines', sent: 89, opened: 45 },
                ].map((campaign, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-cyber-dark/50 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${campaign.type === 'sms' ? 'bg-blue-500/20' :
                      campaign.type === 'push' ? 'bg-cyber-neon/20' :
                        'bg-cyber-orange/20'
                      }`}>
                      {campaign.type === 'sms' ? <MessageSquare className="w-5 h-5 text-blue-400" /> :
                        campaign.type === 'push' ? <Bell className="w-5 h-5 text-cyber-neon" /> :
                          <Mail className="w-5 h-5 text-cyber-orange" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{campaign.title}</p>
                      <p className="text-sm text-white/50">{campaign.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{campaign.sent} envoyés</p>
                      <p className="text-sm text-cyber-neon">{Math.round((campaign.opened / campaign.sent) * 100)}% ouverts</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
