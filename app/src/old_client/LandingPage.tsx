// FRESHCUT X - Landing Page
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Scissors, Clock, MapPin, Phone,
    Menu, X, Calendar, ChevronRight,
    ShoppingBag,
    Heart, User as UserIcon, Droplets
} from 'lucide-react';
import { mockProducts, mockShop } from '@/data/mockData';
import { useRealtime } from '@/hooks/useRealtime';
import type { Shop } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LandingPageProps {
    onStartBooking: () => void;
}

export function LandingPage({ onStartBooking }: LandingPageProps) {
    const shops = useRealtime<Shop>('shops', [mockShop as any]);

    const shop = shops.find(s => s.id === 'shop_001') || mockShop;

    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Services', href: '#services' },
        { name: 'Produits', href: '#products' },
        { name: 'À Propos', href: '#about' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <div className="min-h-screen bg-cyber-dark text-white selection:bg-cyber-neon selection:text-cyber-dark">
            {/* Navbar */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-cyber-dark/80 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-neon to-cyber-cyan flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,255,156,0.5)] transition-shadow">
                            <Scissors className="w-5 h-5 text-cyber-dark" />
                        </div>
                        <span className="text-xl font-black uppercase tracking-tighter">
                            Miloud <span className="text-cyber-neon">Coiffeur</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map(link => (
                            <a key={link.name} href={link.href} className="text-sm font-medium text-white/70 hover:text-cyber-neon transition-colors">
                                {link.name}
                            </a>
                        ))}
                        <Button onClick={onStartBooking} className="btn-neon px-6">
                            <Calendar className="w-4 h-4 mr-2" />
                            Réserver
                        </Button>
                    </div>

                    <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <motion.div
                initial={false}
                animate={{ x: mobileMenuOpen ? 0 : '100%' }}
                className="fixed inset-0 z-[60] bg-cyber-dark md:hidden"
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-12">
                        <span className="text-xl font-black uppercase tracking-tighter">
                            Miloud <span className="text-cyber-neon">Coiffeur</span>
                        </span>
                        <button onClick={() => setMobileMenuOpen(false)}>
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-6">
                        {navLinks.map(link => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-2xl font-bold hover:text-cyber-neon transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                        <Button onClick={onStartBooking} className="btn-neon w-full py-6 text-lg mt-4">
                            <Calendar className="w-5 h-5 mr-2" />
                            Prendre RDV
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-cyber-dark/70 z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-transparent to-cyber-dark/50 z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2000"
                        alt="Barber Shop Interior"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Badge className="bg-cyber-neon/20 text-cyber-neon border-cyber-neon/30 mb-6 px-4 py-1.5 text-sm uppercase tracking-widest font-bold">
                                <span className="w-2 h-2 bg-cyber-neon rounded-full mr-2 inline-block animate-pulse" />
                                {shop.isOpen ? 'Salon Ouvert' : 'Salon Fermé'}
                            </Badge>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight mb-8 leading-[0.9]">
                                Dominez votre <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon to-cyber-cyan italic">style</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/60 mb-10 max-w-xl leading-relaxed">
                                Le futur de la coiffure est ici. Une expérience immersive, des coupes de précision et une gestion en temps réel. Pas d'attente, que de la performance.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button onClick={onStartBooking} className="btn-neon h-14 px-10 text-lg group">
                                    Prendre un rendez-vous
                                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                {/* Removed Estimated Wait Time as requested */}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-24 bg-cyber-dark relative">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <p className="text-cyber-neon font-mono text-sm uppercase tracking-widest mb-2">// NOS TARIFS</p>
                        <h2 className="text-4xl md:text-5xl font-black uppercase">Services & Tarifs</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                        {/* Column 1: Hair */}
                        <div className="space-y-12">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto rounded-full border-2 border-orange-400/20 flex items-center justify-center mb-6">
                                    <Scissors className="w-8 h-8 text-orange-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-wider">Coupes</h3>
                                <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mt-1">Adulte & Enfant</p>
                            </div>
                            <div className="space-y-8">
                                {[
                                    { name: 'COUPE CLASSIQUE', price: '1000 DZD', desc: 'Coupe de précision et finitions soignées.' },
                                    { name: 'COUPE PRESTIGE', price: '2000 DZD', desc: 'Soin complet, coupe et coiffage premium.' },
                                    { name: 'COUPE ENFANT', price: '800 DZD', desc: 'Style adapté pour les moins de 12 ans.' }
                                ].map((item, i) => (
                                    <div key={i} className="group">
                                        <div className="flex items-end justify-between mb-2">
                                            <h4 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors uppercase">{item.name}</h4>
                                            <div className="flex-1 mx-4 border-b border-white/10 mb-1.5" />
                                            <span className="text-xl font-bold text-orange-400">{item.price}</span>
                                        </div>
                                        <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column 2: Beard */}
                        <div className="space-y-12">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto rounded-full border-2 border-orange-400/20 flex items-center justify-center mb-6">
                                    <UserIcon className="w-8 h-8 text-orange-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-wider">Barbe</h3>
                                <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mt-1">Entretien & Style</p>
                            </div>
                            <div className="space-y-8">
                                {[
                                    { name: 'TAILLE DE BARBE', price: '500 DZD', desc: 'Traçage des contours et égalisation.' },
                                    { name: 'RASAGE À L\'ANCIENNE', price: '1000 DZD', desc: 'Rituel serviette chaude et coupe-chou.' },
                                    { name: 'TAILLE MOUSTACHE', price: '300 DZD', desc: 'Entretien précis pour un look soigné.' }
                                ].map((item, i) => (
                                    <div key={i} className="group">
                                        <div className="flex items-end justify-between mb-2">
                                            <h4 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors uppercase">{item.name}</h4>
                                            <div className="flex-1 mx-4 border-b border-white/10 mb-1.5" />
                                            <span className="text-xl font-bold text-orange-400">{item.price}</span>
                                        </div>
                                        <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column 3: Face/Wash */}
                        <div className="space-y-12">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto rounded-full border-2 border-orange-400/20 flex items-center justify-center mb-6">
                                    <Droplets className="w-8 h-8 text-orange-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-wider">Soins</h3>
                                <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mt-1">Visage & Cheveux</p>
                            </div>
                            <div className="space-y-8">
                                {[
                                    { name: 'COLORATION', price: '1500 DZD', desc: 'Camouflage naturel des cheveux blancs.' },
                                    { name: 'SOIN VISAGE', price: '1200 DZD', desc: 'Nettoyage profond et hydratation.' },
                                    { name: 'SHAMPOING', price: '200 DZD', desc: 'Lavage relaxant avec massage crânien.' }
                                ].map((item, i) => (
                                    <div key={i} className="group">
                                        <div className="flex items-end justify-between mb-2">
                                            <h4 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors uppercase">{item.name}</h4>
                                            <div className="flex-1 mx-4 border-b border-white/10 mb-1.5" />
                                            <span className="text-xl font-bold text-orange-400">{item.price}</span>
                                        </div>
                                        <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section - Premium Visual Upgrade */}
            <section className="py-24 overflow-hidden bg-cyber-dark relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="container mx-auto px-6 mb-12 relative z-10">
                    <p className="text-cyber-neon font-mono text-sm uppercase tracking-widest mb-2 text-center">// EXCELLENCE VISUELLE</p>
                    <h2 className="text-4xl md:text-5xl font-black uppercase text-center mb-16">
                        Notre <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Savoir Faire</span>
                    </h2>

                    {/* Infinite Marquee Container */}
                    <div className="flex overflow-hidden relative w-full group">
                        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-cyber-dark to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-cyber-dark to-transparent z-10 pointer-events-none" />

                        <motion.div
                            className="flex gap-6"
                            animate={{ x: "-50%" }}
                            transition={{
                                repeat: Infinity,
                                ease: "linear",
                                duration: 40
                            }}
                            whileHover={{ animationPlayState: "paused" }}
                        >
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex gap-6 shrink-0">
                                    {[
                                        { id: 1, title: "Fades & Dégradés", category: "Précision", img: "1621605815971-fbc98d665033" },
                                        { id: 2, title: "Barbe Sculptée", category: "Entretien", img: "1503951914875-452162b0f3f1" },
                                        { id: 3, title: "Coupes Classiques", category: "Style", img: "1585747860715-2ba37e788b70" },
                                        { id: 4, title: "Soin Visage", category: "Bien-être", img: "1622286343696-3615f8d50e92" },
                                        { id: 5, title: "Coloration", category: "Technique", img: "1605497787865-1862fa8a8167" }
                                    ].map((item) => (
                                        <motion.div
                                            key={item.id}
                                            className="w-80 md:w-[400px] aspect-[3/4] shrink-0 rounded-3xl overflow-hidden relative group snap-center cursor-pointer border border-white/5 hover:border-cyber-neon/50 transition-colors duration-500"
                                            initial={{ opacity: 0, x: 50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1, duration: 0.5 }}
                                            viewport={{ once: true }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500 z-10" />

                                            <img
                                                src={`https://images.unsplash.com/photo-${item.img}?auto=format&fit=crop&q=80&w=600`}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                                            />

                                            <div className="absolute bottom-0 left-0 right-0 p-8 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                <p className="text-cyber-neon text-xs font-bold uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                                    {item.category}
                                                </p>
                                                <h3 className="text-3xl font-black text-white uppercase italic leading-none mb-2">
                                                    {item.title}
                                                </h3>
                                                <div className="w-12 h-1 bg-cyber-neon transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section id="products" className="py-24 bg-white/[0.02]">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between mb-16">
                        <h2 className="text-4xl font-black uppercase">Produits</h2>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 hidden md:flex">
                            Voir tout le catalogue
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {mockProducts.slice(0, 4).map(product => (
                            <div key={product.id} className="group cursor-pointer">
                                <div className="aspect-square rounded-2xl overflow-hidden glass-card mb-4 relative">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-cyber-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button size="icon" className="w-12 h-12 rounded-full btn-neon">
                                            <ShoppingBag className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                                <h4 className="text-white font-bold mb-1 truncate">{product.name}</h4>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/40 uppercase tracking-wider">{product.category}</span>
                                    <span className="text-cyber-neon font-bold">{product.price * 100} DZD</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About & Location */}
            <section id="about" className="py-24">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="relative">
                            <div className="aspect-square rounded-3xl overflow-hidden glass-card">
                                <img src="https://images.unsplash.com/photo-1599351474299-48f5822c3633?auto=format&fit=crop&q=80&w=800" alt="About" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-10 -right-10 hidden md:block w-64 glass-card p-6 border-cyber-cyan/30">
                                <div className="flex items-center gap-3 mb-4">
                                    <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                                    <p className="text-white font-bold italic">99% Satisfait</p>
                                </div>
                                <p className="text-xs text-white/50 leading-relaxed">Rejoignez les 5000+ clients qui nous font confiance pour leur identité visuelle.</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-cyber-purple font-mono text-sm uppercase tracking-widest mb-2">// QUI SOMMES-NOUS</p>
                            <h2 className="text-4xl md:text-5xl font-black uppercase mb-8 leading-none">Redéfinir <br />la tradition</h2>
                            <p className="text-white/60 mb-8 leading-relaxed">
                                Né dans les ruelles du futur, Miloud Coiffeur n'est pas qu'un salon. C'est un laboratoire de style où l'art de la barberie classique rencontre les technologies de demain. Nos barbiers sont des artisans formés à la perfection millimétrée.
                            </p>

                            <div className="space-y-6 mb-10 text-sm">
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-5 h-5 text-cyber-neon mt-1" />
                                    <div>
                                        <p className="text-white font-bold">rue n° .. ,Paradis</p>
                                        <p className="text-white/50">Ain El-turk – Oran</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Phone className="w-5 h-5 text-cyber-cyan mt-1" />
                                    <div>
                                        <p className="text-white font-bold">+213 771 54 60 88</p>
                                        <p className="text-white/50">Assistance client 24/7</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Clock className="w-5 h-5 text-cyber-purple mt-1" />
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                        <div>
                                            <p className="text-white font-bold">Dimanche</p>
                                            <p className="text-white/50">08:00 - 20:00</p>
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">Lundi</p>
                                            <p className="text-red-400">Fermé</p>
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">Mardi - Jeudi</p>
                                            <p className="text-white/50">08:00 - 20:00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="h-[400px] md:h-[500px] w-full bg-cyber-dark relative overflow-hidden">
                {/* Placeholder for Google Map Embed */}
                <div className="absolute inset-0 bg-cyber-gray flex items-center justify-center group cursor-pointer">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
                    <div className="relative z-10 text-center">
                        <MapPin className="w-12 h-12 text-cyber-neon mx-auto mb-4 animate-bounce" />
                        <h3 className="text-2xl font-black uppercase text-white mb-2">Google Maps</h3>
                        <p className="text-white/60">P6QW+R74, Ain El Turk - Cliquez pour l'itinéraire</p>
                    </div>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d!3d!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zUDZRVytSNzQsIEFpbiBFbCBUdXJr!5e0!3m2!1sfr!2sfr!4v1"
                        className="absolute inset-0 w-full h-full border-0 grayscale invert contrast-125 opacity-30"
                        loading="lazy"
                    />
                </div>
            </section>

            {/* CTA Footer Section */}
            <section className="py-24 border-t border-white/5">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-6xl font-black uppercase mb-10 leading-tight">
                        Prêt pour votre <br /><span className="text-cyber-neon">prochaine mise à jour ?</span>
                    </h2>
                    <Button onClick={onStartBooking} className="btn-neon h-20 px-16 text-2xl font-black group">
                        RÉSERVER MAINTENANT
                        <ChevronRight className="w-8 h-8 ml-4 group-hover:translate-x-2 transition-transform" />
                    </Button>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-12 bg-black/40 border-t border-white/10">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <Scissors className="w-6 h-6 text-cyber-neon" />
                        <span className="text-lg font-black uppercase tracking-tighter">
                            Miloud <span className="text-cyber-neon">Coiffeur</span>
                        </span>
                    </div>

                    <p className="text-white/30 text-xs text-center md:text-left">
                        © 2026 Miloud Coiffeur INDUSTRIES. TOUS DROITS RÉSERVÉS. <br />
                        CONÇU POUR L'ÉLITE DU FUTUR.
                    </p>

                    <div className="flex gap-8 text-[10px] items-center text-white/30 font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Cookies</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
