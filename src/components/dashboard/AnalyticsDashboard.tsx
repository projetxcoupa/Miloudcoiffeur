// FRESHCUT X - Analytics Pro
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, Users,
  Activity,
  Scissors, Star, ArrowUpRight,
  Download
} from 'lucide-react';
import { mockAnalytics, mockBarbers, mockServices } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#00FF9C', '#00D4FF', '#FF4D00', '#8B5CF6', '#FF00FF', '#10B981'];

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const analytics = mockAnalytics;

  const handleExport = () => {
    // Simulate CSV generation
    const headers = "Date,Revenu,Clients\n";
    const rows = analytics.revenueChart.map(row => {
      const clientCount = analytics.clientsChart.find(c => c.label === row.label)?.value || 0;
      return `${row.label},${row.value},${clientCount}`;
    }).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `freshcut-analytics-${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Rapport exporté en CSV', {
      description: `Le fichier freshcut-analytics-${period}.csv a été téléchargé.`
    });
  };

  // Heatmap data for hours
  const hours = Array.from({ length: 12 }, (_, i) => 9 + i);
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const getHeatmapColor = (value: number) => {
    if (value < 20) return 'rgba(0, 255, 156, 0.1)';
    if (value < 40) return 'rgba(0, 255, 156, 0.25)';
    if (value < 60) return 'rgba(0, 255, 156, 0.4)';
    if (value < 80) return 'rgba(0, 255, 156, 0.6)';
    return 'rgba(0, 255, 156, 0.8)';
  };

  // Service distribution data
  const serviceData = mockServices.map((service, index) => ({
    name: service.name,
    value: Math.floor(Math.random() * 100) + 50,
    color: service.color || COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Analytics Pro</h2>
          <p className="text-white/50">Insights et performance de votre salon</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="input-cyber w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-cyber-gray border-white/10">
              <SelectItem value="day">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-white">{analytics.revenue.monthly.toLocaleString()}€</p>
                <div className="flex items-center gap-1 mt-1 text-cyber-neon">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm">+{analytics.revenue.trend}%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyber-neon/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-cyber-neon" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Clients</p>
                <p className="text-2xl font-bold text-white">{analytics.clients.monthly}</p>
                <div className="flex items-center gap-1 mt-1 text-cyber-cyan">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm">+{analytics.clients.newThisMonth} nouv.</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyber-cyan/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-cyber-cyan" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Service top</p>
                <p className="text-lg font-bold text-white">{analytics.services.topService}</p>
                <p className="text-sm text-white/50">{analytics.services.topServiceCount} ventes</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyber-orange/20 flex items-center justify-center">
                <Scissors className="w-6 h-6 text-cyber-orange" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Taux de retour</p>
                <p className="text-2xl font-bold text-white">{analytics.clients.returningRate}%</p>
                <div className="flex items-center gap-1 mt-1 text-cyber-neon">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm">+5%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="bg-cyber-gray/50 border border-white/10">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark">
            Revenus
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark">
            Clients
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark">
            Services
          </TabsTrigger>
          <TabsTrigger value="barbers" className="data-[state=active]:bg-cyber-neon data-[state=active]:text-cyber-dark">
            Barbiers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Évolution des revenus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.revenueChart}>
                    <defs>
                      <linearGradient id="revenueGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00FF9C" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00FF9C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="label"
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => `${value}€`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                      formatter={(value: number) => [`${value}€`, 'Revenus']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#00FF9C"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#revenueGradient2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="mt-4">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Clients par jour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.clientsChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="label"
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#00D4FF"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Répartition des services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={serviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {serviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-white/70">{value}</span>}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Top services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceData
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map((service, index) => (
                      <div key={service.name} className="flex items-center gap-4">
                        <span className="text-white/40 w-6">#{index + 1}</span>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: service.color }}
                        />
                        <span className="text-white flex-1">{service.name}</span>
                        <span className="text-cyber-neon font-medium">{service.value}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="barbers" className="mt-4">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Performance des barbiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.barbers.map((barber, index) => (
                  <div key={barber.barberId} className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={mockBarbers[index]?.avatar} />
                      <AvatarFallback className="bg-cyber-gray">
                        {barber.barberName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{barber.barberName}</span>
                        <span className="text-cyber-neon">{barber.revenue.toLocaleString()}€</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/50">
                        <span>{barber.clientsCount} clients</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span>{barber.averageRating}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="h-2 bg-cyber-gray rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(barber.revenue / 50000) * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-cyber-neon to-cyber-cyan rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Heatmap */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyber-orange" />
            Heures d'affluence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Days header */}
              <div className="flex">
                <div className="w-12" />
                {days.map(day => (
                  <div key={day} className="flex-1 text-center text-sm text-white/60 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Hours grid */}
              {hours.map(hour => (
                <div key={hour} className="flex items-center">
                  <div className="w-12 text-sm text-white/40 text-right pr-3">
                    {hour}h
                  </div>
                  <div className="flex-1 flex">
                    {days.map((_, dayIndex) => {
                      const value = Math.floor(Math.random() * 100);
                      return (
                        <div
                          key={`${hour}-${dayIndex}`}
                          className="flex-1 h-8 m-0.5 rounded cursor-pointer transition-all hover:scale-110"
                          style={{ backgroundColor: getHeatmapColor(value) }}
                          title={`${days[dayIndex]} ${hour}h: ${value}% d'affluence`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-sm text-white/40">Faible</span>
            <div className="flex gap-1">
              {[0.1, 0.25, 0.4, 0.6, 0.8].map((opacity, i) => (
                <div
                  key={i}
                  className="w-6 h-4 rounded"
                  style={{ backgroundColor: `rgba(0, 255, 156, ${opacity})` }}
                />
              ))}
            </div>
            <span className="text-sm text-white/40">Fort</span>
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white text-base">File d'attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Temps moyen d'attente</span>
                <span className="text-white font-medium">{analytics.queue.averageWaitTime}min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Temps max d'attente</span>
                <span className="text-white font-medium">{analytics.queue.maxWaitTime}min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Taux de completion</span>
                <span className="text-cyber-neon font-medium">{analytics.queue.completionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Taux de no-show</span>
                <span className="text-red-400 font-medium">{analytics.queue.noShowRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white text-base">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Service le plus vendu</span>
                <span className="text-white font-medium">{analytics.services.topService}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Ventes</span>
                <span className="text-cyber-neon font-medium">{analytics.services.topServiceCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Panier moyen</span>
                <span className="text-cyber-cyan font-medium">{analytics.services.averageServiceValue}€</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white text-base">Objectifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60">CA mensuel</span>
                  <span className="text-cyber-neon">75%</span>
                </div>
                <div className="h-2 bg-cyber-gray rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-cyber-neon to-cyber-cyan rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60">Nouveaux clients</span>
                  <span className="text-cyber-cyan">90%</span>
                </div>
                <div className="h-2 bg-cyber-gray rounded-full overflow-hidden">
                  <div className="h-full w-[90%] bg-gradient-to-r from-cyber-cyan to-cyber-neon rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60">Satisfaction</span>
                  <span className="text-cyber-orange">95%</span>
                </div>
                <div className="h-2 bg-cyber-gray rounded-full overflow-hidden">
                  <div className="h-full w-[95%] bg-gradient-to-r from-cyber-orange to-yellow-400 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
