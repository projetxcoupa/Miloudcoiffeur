// FRESHCUT X - Main App
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Calendar, Scissors,
  TrendingUp, Settings as SettingsIcon, Bell, Menu, X,
  List, Tag, ChevronRight, LogOut,
  Sparkles, Smartphone
} from 'lucide-react';
import type { ViewType } from '@/types';
import { mockUser, mockShop } from '@/data/mockData';
import { DashboardOverview } from '@/sections/DashboardOverview';
import { QueueManagement } from '@/sections/QueueManagement';
import { ClientCRM } from '@/sections/ClientCRM';
import { Reservations } from '@/sections/Reservations';
import { BarberManagement } from '@/sections/BarberManagement';
import { ServiceCMS } from '@/sections/ServiceCMS';
import { ProductCMS } from '@/sections/ProductCMS';
import { Settings } from '@/sections/Settings';
import { AnalyticsPro } from '@/sections/AnalyticsPro';
import { Promotions } from '@/sections/Promotions';
import { LandingPage } from '@/client/LandingPage';
import { BookingFlow } from '@/client/BookingFlow';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const menuItems = [
  { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'queue' as ViewType, label: 'File d\'attente', icon: List },
  { id: 'appointments' as ViewType, label: 'Réservations', icon: Calendar },
  { id: 'clients' as ViewType, label: 'Clients', icon: Users },
  { id: 'barbers' as ViewType, label: 'Barbiers', icon: Scissors },
  { id: 'services' as ViewType, label: 'Services', icon: Tag },
  { id: 'products' as ViewType, label: 'Produits', icon: List },
  { id: 'analytics' as ViewType, label: 'Analytics', icon: TrendingUp },
  { id: 'promotions' as ViewType, label: 'Promotions', icon: Sparkles },
];

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [appMode, setAppMode] = useState<'admin' | 'client'>('admin');
  const [clientView, setClientView] = useState<'landing' | 'booking'>('landing');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        toast.info('Nouveau client en file d\'attente', {
          description: 'Un client vient de rejoindre la queue',
        });
        setNotifications(prev => prev + 1);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = () => {
    setNotifications(0);
    toast.success('Notifications marquées comme lues');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardOverview onNavigate={setCurrentView} />;
      case 'queue':
        return <QueueManagement />;
      case 'appointments':
        return <Reservations />;
      case 'clients':
        return <ClientCRM />;
      case 'barbers':
        return <BarberManagement />;
      case 'services':
        return <ServiceCMS />;
      case 'products':
        return <ProductCMS />;
      case 'analytics':
        return <AnalyticsPro />;
      case 'promotions':
        return <Promotions />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview onNavigate={setCurrentView} />;
    }
  };

  if (appMode === 'client') {
    return clientView === 'landing' ? (
      <LandingPage onStartBooking={() => setClientView('booking')} />
    ) : (
      <BookingFlow onBack={() => setClientView('landing')} />
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark grid-bg">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 0,
          x: sidebarOpen ? 0 : -280
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed left-0 top-0 h-full z-50 overflow-hidden ${isMobile ? 'w-[280px]' : ''
          }`}
      >
        <div className="h-full bg-cyber-gray/90 backdrop-blur-xl border-r border-white/10 flex flex-col">
          {/* Logo */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-neon to-cyber-cyan flex items-center justify-center">
                <Scissors className="w-5 h-5 text-cyber-dark" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Miloud <span className="text-cyber-neon">Coiffeur</span>
                </h1>
                <p className="text-xs text-white/50">{mockShop.name}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-cyber">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={`sidebar-item w-full ${isActive ? 'active' : ''}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-cyber-neon' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-cyber-neon" />
                  )}
                </button>
              );
            })}
          </nav>

          <Separator className="bg-white/10" />

          {/* User Section */}
          <div className="p-4">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-cyber-neon/30">
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback className="bg-cyber-gray text-cyber-neon">
                    {mockUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {mockUser.name}
                  </p>
                  <p className="text-xs text-white/50 capitalize">
                    {mockUser.role}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/50 hover:text-white hover:bg-white/10"
                  onClick={() => {
                    toast.info('Déconnexion...', { description: 'Vous allez être redirigé vers la page de connexion.' });
                    setTimeout(() => window.location.reload(), 2000);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* App Mode Switcher */}
            <div className="p-4 pt-0">
              <Button
                variant="outline"
                className="w-full border-cyber-neon/30 text-cyber-neon hover:bg-cyber-neon/10"
                onClick={() => setAppMode('client')}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Version Client
              </Button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen && !isMobile ? 'ml-[280px]' : ''
        }`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-cyber-dark/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <div>
                <h2 className="text-sm sm:text-lg font-semibold text-white">
                  {menuItems.find(item => item.id === currentView)?.label || 'Dashboard'}
                </h2>
                <p className="hidden sm:block text-sm text-white/50">
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Shop Status */}
              <Badge
                variant="outline"
                className={`hidden xs:flex ${mockShop.isOpen
                  ? 'border-cyber-neon/50 text-cyber-neon bg-cyber-neon/10'
                  : 'border-red-500/50 text-red-400 bg-red-500/10'
                  }`}
              >
                <span className={`w-2 h-2 rounded-full mr-1 sm:mr-2 ${mockShop.isOpen ? 'bg-cyber-neon animate-pulse' : 'bg-red-400'
                  }`} />
                <span className="hidden sm:inline">{mockShop.isOpen ? 'Ouvert' : 'Fermé'}</span>
                <span className="sm:hidden">{mockShop.isOpen ? 'O' : 'F'}</span>
              </Badge>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white/70 hover:text-white hover:bg-white/10"
                onClick={handleNotificationClick}
              >
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyber-orange text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {notifications}
                  </span>
                )}
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setCurrentView('settings')}
              >
                <SettingsIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
