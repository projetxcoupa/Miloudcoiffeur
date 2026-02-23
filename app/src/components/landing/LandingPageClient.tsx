'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Scissors, Clock, MapPin, Phone,
    Menu, X, Calendar, ChevronRight,
    ShoppingBag,
    Heart, User as UserIcon, Droplets
} from 'lucide-react';
import { useRealtime } from '@/hooks/useRealtime';
import type { Shop, Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export function LandingPageClient() {
    const router = useRouter();
    const shops = useRealtime<Shop>('shops', []);
    const shop = shops.find(s => s.id === 'shop_001') || shops[0] || { id: 'shop_001', name: 'FRESHCUT X', status: 'open', plan: 'pro', address: '', phone: '', createdAt: new Date() };
    const products = useRealtime<Product>('products', []);

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
        <div className="min-h-screen bg-cyber-dark text-white selection:bg-cyber-neon selection:text-cyber-dark font-sans grid-bg">
            {/* Navbar */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/40 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-neon to-cyber-cyan flex items-center justify-center shadow-neon group-hover:scale-105 transition-transform">
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
                        <Button asChild className="btn-neon px-6 rounded-lg font-bold uppercase shadow-neon hover:bg-white hover:text-cyber-dark border-0">
                            <Link href="/book">
                                Réserver
                            </Link>
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
                                className="text-3xl font-black uppercase hover:text-cyber-neon transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                        <Button asChild className="btn-neon w-full py-6 text-xl font-black uppercase mt-4">
                            <Link href="/book" onClick={() => setMobileMenuOpen(false)}>
                                Prendre RDV
                            </Link>
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Hero Section */}
            <section className="min-h-screen flex items-center relative overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyber-dark z-10" />
                    {/* Decorative Glows */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-neon/20 rounded-full blur-[128px] animate-pulse-slow" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-cyan/20 rounded-full blur-[128px] animate-pulse-slow delay-1000" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest mb-8 ${shop.status === 'open' ? 'bg-cyber-neon/10 border-cyber-neon/20 text-cyber-neon' :
                                shop.status === 'break' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                    'bg-red-500/10 border-red-500/20 text-red-500'
                                }`}>
                                <span className={`w-2 h-2 rounded-full animate-pulse-fast ${shop.status === 'open' ? 'bg-cyber-neon' :
                                    shop.status === 'break' ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`} />
                                {shop.status === 'open' ? 'Salon Ouvert' :
                                    shop.status === 'break' ? 'En Pause' :
                                        'Salon Fermé'}
                            </div>

                            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.9] mb-8 tracking-tighter">
                                Dominez <br />
                                <span className="text-gradient">Votre Style</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl leading-relaxed">
                                Le futur de la coiffure est ici. Une expérience immersive, des coupes de précision et une gestion en temps réel.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6">
                                <Button asChild className="btn-neon h-16 px-12 rounded-xl font-black uppercase text-xl hover:scale-105 transition-transform shadow-neon border-0">
                                    <Link href="/book">
                                        Prendre RDV
                                        <ChevronRight className="w-6 h-6 ml-2" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="h-16 px-12 rounded-xl font-bold uppercase text-lg border-white/10 text-white hover:bg-white/10 hover:text-white hover:border-white/30 transition-colors bg-transparent">
                                    <Link href="#services">
                                        Voir les Tarifs
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <div className="border-y border-white/5 bg-black/40 backdrop-blur-sm relative z-20">
                <div className="container mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { val: "4.9/5", label: "Note Clients" },
                        { val: "5k+", label: "Coupes Réalisées" },
                        { val: "3", label: "Barbiers Pro" },
                        { val: "0min", label: "Attente Actuelle" }
                    ].map((stat, i) => (
                        <div key={i} className="text-center md:text-left">
                            <p className="text-3xl font-black text-white">{stat.val}</p>
                            <p className="text-xs text-white/40 uppercase tracking-widest font-bold">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Services Section */}
            <section id="services" className="py-32 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex items-end justify-between mb-20">
                        <div>
                            <p className="text-cyber-neon font-mono text-sm uppercase tracking-widest mb-2">// CATALOGUE</p>
                            <h2 className="text-5xl font-black uppercase leading-none">Nos Services</h2>
                        </div>
                        <div className="hidden md:block w-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="glass-card p-10 rounded-[2rem] hover:border-cyber-neon/50 group cursor-pointer hover:bg-white/[0.02]">
                            <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform bg-black/50">
                                <Scissors className="w-8 h-8 text-white group-hover:text-cyber-neon transition-colors" />
                            </div>
                            <h3 className="text-3xl font-bold uppercase mb-4 font-mono tracking-tighter">Coupe Homme</h3>
                            <p className="text-white/50 mb-8 leading-relaxed">Précision chirurgicale. Comprend le shampoing, le soin du cuir chevelu et le coiffage.</p>
                            <div className="flex items-center justify-between border-t border-white/5 pt-6">
                                <span className="text-xl font-black text-cyber-neon">1000 DZD</span>
                                <span className="text-xs font-bold uppercase bg-white/10 px-3 py-1 rounded-full text-white/70">30 MIN</span>
                            </div>
                        </div>

                        {/* Card 2 - Featured */}
                        <div className="glass-card p-10 rounded-[2rem] border-cyber-neon/30 bg-cyber-neon/5 relative overflow-hidden group cursor-pointer hover:shadow-neon transition-all duration-500 hover:-translate-y-2">
                            <div className="absolute top-0 right-0 bg-cyber-neon text-black text-xs font-bold px-4 py-2 uppercase rounded-bl-xl">Best Seller</div>
                            <div className="w-16 h-16 rounded-2xl border border-cyber-neon/50 flex items-center justify-center mb-8 bg-cyber-neon text-black group-hover:scale-110 transition-transform shadow-neon">
                                <UserIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-bold uppercase mb-4 font-mono tracking-tighter text-white">Coupe + Barbe</h3>
                            <p className="text-white/70 mb-8 leading-relaxed">Le rituel complet. Taille de barbe à l'ancienne avec serviette chaude et coupe moderne.</p>
                            <div className="flex items-center justify-between border-t border-cyber-neon/20 pt-6">
                                <span className="text-xl font-black text-cyber-neon">1500 DZD</span>
                                <span className="text-xs font-bold uppercase bg-cyber-neon/20 text-cyber-neon px-3 py-1 rounded-full">50 MIN</span>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="glass-card p-10 rounded-[2rem] hover:border-cyber-orange/50 group cursor-pointer hover:bg-white/[0.02]">
                            <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform bg-black/50">
                                <Droplets className="w-8 h-8 text-white group-hover:text-cyber-orange transition-colors" />
                            </div>
                            <h3 className="text-3xl font-bold uppercase mb-4 font-mono tracking-tighter">Soin Visage</h3>
                            <p className="text-white/50 mb-8 leading-relaxed">Remise à neuf totale. Nettoyage profond, vapeur et hydratation intense.</p>
                            <div className="flex items-center justify-between border-t border-white/5 pt-6">
                                <span className="text-xl font-black text-cyber-orange">1200 DZD</span>
                                <span className="text-xs font-bold uppercase bg-white/10 px-3 py-1 rounded-full text-white/70">40 MIN</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="py-24 overflow-hidden bg-cyber-dark relative">
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
                                            whileHover={{ scale: 0.98 }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500 z-10" />

                                            <Image
                                                src={`https://images.unsplash.com/photo-${item.img}?auto=format&fit=crop&q=80&w=600`}
                                                alt={item.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 hidden md:flex bg-transparent">
                            Voir tout le catalogue
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {(products.length > 0 ? products : []).slice(0, 4).map(product => (
                            <div key={product.id} className="group cursor-pointer">
                                <div className="aspect-square rounded-2xl overflow-hidden glass-card mb-4 relative">
                                    <Image
                                        src={product.image || "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=200"}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                    <div className="absolute inset-0 bg-cyber-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button size="icon" className="w-12 h-12 rounded-full btn-neon border-0">
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
                        <div className="relative order-2 lg:order-1">
                            <div className="aspect-square rounded-[2.5rem] overflow-hidden glass-card relative rotate-2 group hover:rotate-0 transition-transform duration-500">
                                <Image
                                    src="https://images.unsplash.com/photo-1599351474299-48f5822c3633?auto=format&fit=crop&q=80&w=800"
                                    alt="About"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 hidden md:block w-72 glass-card-strong p-8 animate-pulse-slow">
                                <div className="flex items-center gap-3 mb-4">
                                    <Heart className="w-8 h-8 text-red-500 fill-red-500 drop-shadow-lg" />
                                    <p className="text-2xl font-black italic">99% Satisfait</p>
                                </div>
                                <p className="text-xs text-white/50 leading-relaxed uppercase tracking-wider">Rejoignez les 5000+ clients qui nous font confiance pour leur identité visuelle.</p>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <p className="text-cyber-purple font-mono text-sm uppercase tracking-widest mb-2">// QUI SOMMES-NOUS</p>
                            <h2 className="text-5xl md:text-6xl font-black uppercase mb-8 leading-[0.9]">Redéfinir <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-purple to-purple-400">la tradition</span></h2>
                            <p className="text-white/60 mb-10 leading-relaxed text-lg">
                                Né dans les ruelles du futur, Miloud Coiffeur n'est pas qu'un salon. C'est un laboratoire de style où l'art de la barberie classique rencontre les technologies de demain.
                            </p>

                            <div className="space-y-8 mb-10">
                                <div className="flex items-start gap-6 group">
                                    <div className="w-12 h-12 rounded-xl bg-cyber-neon/10 flex items-center justify-center group-hover:bg-cyber-neon/20 transition-colors">
                                        <MapPin className="w-6 h-6 text-cyber-neon" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-white mb-1">P6QW+R74</p>
                                        <p className="text-white/50">Ain El Turk – Oran</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6 group">
                                    <div className="w-12 h-12 rounded-xl bg-cyber-cyan/10 flex items-center justify-center group-hover:bg-cyber-cyan/20 transition-colors">
                                        <Phone className="w-6 h-6 text-cyber-cyan" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-white mb-1">+213 771 54 60 88</p>
                                        <p className="text-white/50">Assistance client 24/7</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6 group">
                                    <div className="w-12 h-12 rounded-xl bg-cyber-purple/10 flex items-center justify-center group-hover:bg-cyber-purple/20 transition-colors">
                                        <Clock className="w-6 h-6 text-cyber-purple" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                        <div>
                                            <p className="text-white font-bold">Dimanche</p>
                                            <p className="text-white/50">08:00 - 20:00</p>
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">Lundi</p>
                                            <p className="text-red-400 font-bold uppercase text-xs mt-1">Fermé</p>
                                        </div>
                                        <div className="col-span-2 mt-2">
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
                <div className="absolute inset-0 bg-cyber-gray flex items-center justify-center group cursor-pointer overflow-hidden">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500 z-10" />
                    <div className="relative z-20 text-center transform group-hover:scale-110 transition-transform duration-500">
                        <MapPin className="w-16 h-16 text-cyber-neon mx-auto mb-6 animate-bounce drop-shadow-[0_0_15px_rgba(0,255,156,0.5)]" />
                        <h3 className="text-4xl font-black uppercase text-white mb-2 tracking-tighter shadow-black drop-shadow-lg">Google Maps</h3>
                        <p className="text-white/80 font-bold tracking-widest uppercase bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md">P6QW+R74, Ain El Turk - Cliquez pour l'itinéraire</p>
                    </div>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d!3d!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zUDZRVytSNzQsIEFpbiBFbCBUdXJr!5e0!3m2!1sfr!2sfr!4v1"
                        className="absolute inset-0 w-full h-full border-0 grayscale invert contrast-125 opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                        loading="lazy"
                    />
                </div>
            </section>

            {/* CTA Footer Section */}
            <section className="py-24 border-t border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-cyber-neon/5 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="text-5xl md:text-7xl font-black uppercase mb-12 leading-[0.9]">
                        Prêt pour votre <br /><span className="text-cyber-neon">prochaine mise à jour ?</span>
                    </h2>
                    <Button asChild className="btn-neon h-24 px-16 text-2xl font-black group rounded-2xl shadow-[0_0_30px_rgba(0,255,156,0.3)] hover:shadow-[0_0_50px_rgba(0,255,156,0.5)] border-0">
                        <Link href="/book">
                            RÉSERVER MAINTENANT
                            <ChevronRight className="w-10 h-10 ml-4 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-12 bg-black border-t border-white/10">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyber-neon flex items-center justify-center">
                            <Scissors className="w-4 h-4 text-black" />
                        </div>
                        <span className="text-lg font-black uppercase tracking-tighter">
                            Miloud <span className="text-cyber-neon">Coiffeur</span>
                        </span>
                    </div>

                    <p className="text-white/30 text-xs text-center md:text-left font-mono uppercase tracking-wider">
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
