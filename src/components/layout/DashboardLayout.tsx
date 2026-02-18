'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Calendar, Scissors,
    TrendingUp, Settings as SettingsIcon, Bell, Menu, X,
    List, Tag, ChevronRight, LogOut, Smartphone
} from 'lucide-react';
import { mockUser, mockShop } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'queue', label: 'File d\'attente', icon: List, href: '/dashboard/queue' },
    { id: 'appointments', label: 'Réservations', icon: Calendar, href: '/dashboard/appointments' },
    { id: 'clients', label: 'Clients', icon: Users, href: '/dashboard/clients' },
    { id: 'barbers', label: 'Barbiers', icon: Scissors, href: '/dashboard/barbers' },
    { id: 'services', label: 'Services', icon: Tag, href: '/dashboard/services' },
    { id: 'products', label: 'Produits', icon: List, href: '/dashboard/products' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/dashboard/analytics' },
    { id: 'promotions', label: 'Promotions', icon: Sparkles, href: '/dashboard/promotions' },
];

import { Sparkles } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [notifications, setNotifications] = useState(3);
    const router = useRouter();
    const pathname = usePathname();

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

    const handleNotificationClick = () => {
        setNotifications(0);
        toast.success('Notifications marquées comme lues');
    };

    const currentMenuItem = menuItems.find(item => item.href === pathname) || menuItems[0];

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
                            // Simple active check: strictly equal or generic dashboard match
                            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/dashboard');

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => {
                                        if (isMobile) setSidebarOpen(false);
                                    }}
                                    className={`sidebar-item w-full ${isActive ? 'active' : ''}`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-cyber-neon' : ''}`} />
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && (
                                        <ChevronRight className="w-4 h-4 ml-auto text-cyber-neon" />
                                    )}
                                </Link>
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
                                        setTimeout(() => router.push('/'), 2000);
                                    }}
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
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
                                    {currentMenuItem.label}
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
                                onClick={() => router.push('/dashboard/settings')}
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
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
