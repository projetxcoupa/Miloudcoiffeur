'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, Check,
    Calendar, Clock, User,
    Star, Timer,
    CheckCircle2, Heart
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockServices, mockBarbers } from '@/data/mockData';
import { supabase } from '@/lib/supabaseClient';
import { useRealtime } from '@/hooks/useRealtime';
import { addDays, startOfToday, setHours, setMinutes } from 'date-fns';
import { WheelDateTimePicker } from '@/components/ui/WheelDateTimePicker';
import type { QueueItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type Step = 'age' | 'service' | 'barber' | 'type' | 'details' | 'success';

export function BookingFlowClient() {
    const router = useRouter();
    const onBack = () => router.push('/');

    const [initialQueue] = useState<QueueItem[]>([]);
    const queue = useRealtime<QueueItem>('queueItems', initialQueue);
    const [step, setStep] = useState<Step>('age');
    const [bookingData, setBookingData] = useState({
        ageGroup: '' as 'adult' | 'child' | '',
        selectedServices: [] as string[],
        selectedBarber: '' as string,
        bookingType: '' as 'waitlist' | 'fixed' | '',
        date: '',
        time: '',
        name: '',
        phone: '',
        timeRemaining: null as any
    });

    const availableDates = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));
    const availableTimeSlots = Array.from({ length: 18 }, (_, i) => {
        const hour = 9 + Math.floor(i / 2);
        const minute = i % 2 === 0 ? '00' : '30';
        return `${hour.toString().padStart(2, '0')}:${minute}`;
    });

    const currentServices = mockServices.filter(s => bookingData.selectedServices.includes(s.id));
    const totalAmount = currentServices.reduce((acc, s) => acc + s.price, 0);

    const nextStep = () => {
        if (step === 'age') setStep('service');
        else if (step === 'service') setStep('barber');
        else if (step === 'barber') setStep('type');
        else if (step === 'type') setStep('details');
        else if (step === 'details') handleFinalSubmit();
    };

    const prevStep = () => {
        if (step === 'service') setStep('age');
        else if (step === 'barber') setStep('service');
        else if (step === 'type') setStep('barber');
        else if (step === 'details') setStep('type');
        else if (step === 'age') onBack();
    };

    const handleFinalSubmit = async () => {
        if (bookingData.phone.length !== 10) {
            toast.error('Veuillez entrer un numéro de téléphone valide (10 chiffres)');
            return;
        }

        try {
            // Transactional Booking via RPC
            const { data, error } = await supabase.rpc('book_appointment', {
                p_client_name: bookingData.name, // In a real app, you might want to create the client distinct from the booking
                p_service_id: bookingData.selectedServices[0], // MVP: Pick first service
                p_barber_id: bookingData.selectedBarber === 'any' ? null : bookingData.selectedBarber,
                p_requested_start: bookingData.bookingType === 'fixed' && bookingData.date && bookingData.time
                    ? setMinutes(setHours(new Date(bookingData.date), parseInt(bookingData.time.split(':')[0])), parseInt(bookingData.time.split(':')[1])).toISOString()
                    : new Date().toISOString()
            });

            if (error) throw error;

            if (data.status === 'success') {
                setBookingData(prev => ({ ...prev, timeRemaining: data.timeRemaining }));
                setStep('success');
                toast.success(data.message);
            } else {
                toast.error(data.message || 'Erreur lors de la réservation');
            }

        } catch (error: any) {
            console.error('Booking Error:', error);
            toast.error(error.message || 'Erreur lors de la réservation');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'age':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black uppercase text-center mb-12">Qui est le <br /><span className="text-cyber-neon">prochain client ?</span></h2>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'adult', label: 'Adulte', desc: 'Coupes et soins classiques', icon: User },
                                { id: 'child', label: 'Enfant', desc: 'Pour les moins de 12 ans', icon: Heart }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setBookingData({ ...bookingData, ageGroup: item.id as any });
                                        setStep('service');
                                    }}
                                    className={`flex items-center gap-6 p-6 rounded-2xl border-2 text-left transition-all ${bookingData.ageGroup === item.id ? 'border-cyber-neon bg-cyber-neon/10' : 'border-white/10'}`}
                                >
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${bookingData.ageGroup === item.id ? 'bg-cyber-neon text-cyber-dark' : 'bg-white/5 text-white'}`}>
                                        {<item.icon className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-white">{item.label}</p>
                                        <p className="text-sm text-white/50">{item.desc}</p>
                                    </div>
                                    <ChevronRight className="ml-auto w-6 h-6 text-white/20" />
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'service':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black uppercase text-center mb-8">Choisissez vos <br /><span className="text-cyber-cyan">modules</span></h2>
                        <div className="space-y-3">
                            {mockServices.filter(s => s.isActive).map(service => (
                                <button
                                    key={service.id}
                                    onClick={() => {
                                        const services = bookingData.selectedServices.includes(service.id)
                                            ? bookingData.selectedServices.filter(id => id !== service.id)
                                            : [...bookingData.selectedServices, service.id];
                                        setBookingData({ ...bookingData, selectedServices: services });
                                    }}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${bookingData.selectedServices.includes(service.id) ? 'border-cyber-cyan bg-cyber-cyan/10' : 'border-white/5 bg-white/5'}`}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${bookingData.selectedServices.includes(service.id) ? 'border-cyber-cyan bg-cyber-cyan' : 'border-white/20'}`}>
                                        {bookingData.selectedServices.includes(service.id) && <Check className="w-4 h-4 text-cyber-dark" />}
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-white font-bold">{service.name}</p>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{service.duration} MIN</p>
                                    </div>
                                    <span className="text-xl font-black text-white">{service.price}€</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'barber':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black uppercase text-center mb-8">Sélection du <br /><span className="text-cyber-orange">technicien</span></h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => {
                                    setBookingData({ ...bookingData, selectedBarber: 'any' });
                                    nextStep();
                                }}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${bookingData.selectedBarber === 'any' ? 'border-cyber-orange bg-cyber-orange/10' : 'border-white/5 bg-white/5'}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                    <User className="w-6 h-6 text-white/40" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-bold">Premier disponible</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none">Vitesse optimale</p>
                                </div>
                            </button>

                            {mockBarbers.filter(b => b.status === 'active').map(barber => (
                                <button
                                    key={barber.id}
                                    onClick={() => {
                                        setBookingData({ ...bookingData, selectedBarber: barber.id });
                                        nextStep();
                                    }}
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${bookingData.selectedBarber === barber.id ? 'border-cyber-orange bg-cyber-orange/10' : 'border-white/5 bg-white/5'}`}
                                >
                                    <Avatar className="w-12 h-12 ring-2 ring-white/10">
                                        <AvatarImage src={barber.avatar} />
                                        <AvatarFallback>{barber.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left">
                                        <p className="text-white font-bold">{barber.name}</p>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-[10px] text-white/60">4.9/5 • PRO</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'type':
                const waitlistSlots = 3;
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black uppercase text-center mb-8">Type de <br /><span className="text-cyber-purple">passage</span></h2>
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => setBookingData({ ...bookingData, bookingType: 'waitlist' })}
                                className={`relative p-6 rounded-2xl border-2 text-left transition-all ${bookingData.bookingType === 'waitlist' ? 'border-cyber-neon bg-cyber-neon/10 shadow-[0_0_30px_rgba(0,255,156,0.1)]' : 'border-white/10 bg-white/5'}`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-cyber-neon/20 flex items-center justify-center text-cyber-neon">
                                        <Timer className="w-6 h-6" />
                                    </div>
                                    <Badge className="bg-cyber-neon text-cyber-dark font-black">EN DIRECT</Badge>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Rejoindre la file live</h3>
                                <p className="text-sm text-white/50 mb-4">Passez dès maintenant. Actuellement {waitlistSlots} personnes en attente.</p>
                                <div className="flex items-center gap-2 text-cyber-neon font-mono text-xs">
                                    <Clock className="w-4 h-4" />
                                    TEMPS D'ATTENTE: ~25 MIN
                                </div>
                            </button>

                            <div
                                onClick={(e) => {
                                    // Prevent collapsing if clicking inside the picker
                                    if ((e.target as HTMLElement).closest('.wheel-picker-container')) return;
                                    setBookingData({ ...bookingData, bookingType: 'fixed' });
                                }}
                                className={`relative overflow-hidden rounded-2xl border-2 text-left transition-all duration-500 cursor-pointer ${bookingData.bookingType === 'fixed' ? 'border-cyber-purple bg-cyber-purple/10 shadow-[0_0_30px_rgba(188,19,254,0.1)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                            >
                                <div className="p-6 relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-cyber-purple/20 flex items-center justify-center text-cyber-purple">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <Badge variant="outline" className="border-cyber-purple text-cyber-purple font-black uppercase">Planifié</Badge>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Réserver un créneau</h3>
                                    <p className="text-sm text-white/50 mb-4">Choisissez une date et une heure précise à l'avance.</p>

                                    <AnimatePresence mode="wait">
                                        {bookingData.bookingType !== 'fixed' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex items-center gap-2 text-cyber-purple font-mono text-xs"
                                            >
                                                <Clock className="w-4 h-4" />
                                                DISPONIBLE DEMAIN 09:00
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Integrated Wheel Picker */}
                                <AnimatePresence>
                                    {bookingData.bookingType === 'fixed' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="border-t border-white/10 bg-black/40 backdrop-blur-md relative overflow-hidden wheel-picker-container"
                                        >
                                            <div className="p-4">
                                                <WheelDateTimePicker
                                                    date={bookingData.date || availableDates[0].toISOString()}
                                                    time={bookingData.time || availableTimeSlots[0]}
                                                    onChange={(date, time) => setBookingData({ ...bookingData, date, time })}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>

                );

            case 'details':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black uppercase text-center mb-8">Vos <br /><span className="text-white">coordonnées</span></h2>

                        <div className="glass-card p-6 border-white/5 space-y-4 mb-6">
                            <div>
                                <label className="text-xs text-white/40 uppercase tracking-widest font-bold mb-2 block">Nom complet</label>
                                <Input
                                    placeholder="ex: Jean Dupont"
                                    value={bookingData.name}
                                    onChange={e => setBookingData({ ...bookingData, name: e.target.value })}
                                    className="input-cyber h-12"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-white/40 uppercase tracking-widest font-bold mb-2 block">Mobile (10 chiffres)</label>
                                <Input
                                    type="tel"
                                    placeholder="06 12 34 56 78"
                                    value={bookingData.phone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setBookingData({ ...bookingData, phone: val });
                                    }}
                                    className="input-cyber h-12"
                                />
                            </div>
                        </div>

                        <div className="glass-card p-6 border-cyber-neon/30 bg-cyber-neon/5">
                            <h4 className="text-xs font-black uppercase text-cyber-neon mb-4 tracking-tighter tracking-widest">// RÉCAPITULATIF SYSTEME</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">Modules:</span>
                                    <span className="text-white font-bold">{currentServices.map(s => s.name).join(' + ')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">Opérateur:</span>
                                    <span className="text-white font-bold">
                                        {bookingData.selectedBarber === 'any' ? 'Premier libre' : mockBarbers.find(b => b.id === bookingData.selectedBarber)?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                                    <span className="text-white/40">TOTAL:</span>
                                    <span className="text-xl font-black text-cyber-cyan">{totalAmount}€</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'success':
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                    >
                        <div className="w-24 h-24 bg-cyber-neon/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(0,255,156,0.3)] border-2 border-cyber-neon">
                            <CheckCircle2 className="w-12 h-12 text-cyber-neon" />
                        </div>
                        <h2 className="text-4xl font-black uppercase text-white mb-4 leading-none">Transmission <br /><span className="text-cyber-neon">Réussie</span></h2>
                        <p className="text-white/50 mb-12 max-w-xs mx-auto">Votre demande a été cryptée et envoyée au salon. À tout de suite, {bookingData.name}.</p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="glass-card p-6 border-cyber-neon/30">
                                <p className="text-[10px] text-white/40 uppercase font-black mb-1">Rendez-vous</p>
                                <p className="text-xl font-black text-cyber-neon">
                                    {bookingData.time ? bookingData.time : 'MAINTENANT'}
                                </p>
                            </div>
                            <div className="glass-card p-6 border-cyber-cyan/30">
                                <p className="text-[10px] text-white/40 uppercase font-black mb-1">Dans</p>
                                <p className="text-xl font-black text-cyber-cyan">
                                    {bookingData.timeRemaining
                                        ? `${bookingData.timeRemaining.hours}h ${bookingData.timeRemaining.minutes}min`
                                        : '~'}
                                </p>
                            </div>
                        </div>

                        {/* Push Notification Button */}
                        <div className="mb-12">
                            <Button
                                onClick={async () => {
                                    if (!('serviceWorker' in navigator)) return toast.error('Notifications non supportées');
                                    try {
                                        const permission = await Notification.requestPermission();
                                        if (permission === 'granted') {
                                            const registration = await navigator.serviceWorker.ready;
                                            const sub = await registration.pushManager.subscribe({
                                                userVisibleOnly: true,
                                                applicationServerKey: 'BKoTIVfsJvB-yL5l6B6x5h5Z5z5j5k5l5m5n5o5p5q5r5s5t5u5v5w5x5y5z' // Hardcoded for demo if env missing, but ideal to use import.meta.env
                                            });

                                            // Serialize keys
                                            const p256dh = sub.getKey('p256dh');
                                            const auth = sub.getKey('auth');
                                            const p256dhStr = p256dh ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dh)))) : '';
                                            const authStr = auth ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(auth)))) : '';

                                            await supabase.from('push_subscriptions').insert({
                                                endpoint: sub.endpoint,
                                                p256dh: p256dhStr,
                                                auth: authStr
                                            });
                                            toast.success('Notifications activées !');
                                        } else {
                                            toast.error('Permission refusée');
                                        }
                                    } catch (e: any) {
                                        console.error(e);
                                        toast.error('Erreur: ' + e.message);
                                    }
                                }}
                                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white h-12 rounded-xl flex items-center justify-center gap-2"
                            >
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                Activer les notifications live
                            </Button>
                        </div>

                        <Button onClick={onBack} className="w-full btn-neon h-16 text-lg font-black italic">
                            RETOUR À L'ACCUEIL
                        </Button>
                    </motion.div>
                );
        }
    };

    const isNextDisabled = () => {
        if (step === 'age') return !bookingData.ageGroup;
        if (step === 'service') return bookingData.selectedServices.length === 0;
        if (step === 'barber') return !bookingData.selectedBarber;
        if (step === 'type') {
            if (!bookingData.bookingType) return true;
            if (bookingData.bookingType === 'fixed') {
                return !bookingData.date || !bookingData.time;
            }
            return false;
        }
        if (step === 'details') return !bookingData.name || bookingData.phone.length < 10;
        return false;
    };

    const navLinks = ['age', 'service', 'barber', 'type', 'details'];

    return (
        <div className="min-h-screen bg-cyber-dark flex flex-col pt-24">
            {/* Top Progress Bar */}
            {step !== 'success' && (
                <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-[70]">
                    <motion.div
                        className="h-full bg-cyber-neon shadow-[0_0_10px_#00ff9c]"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(navLinks.indexOf(step) + 1) * 20}%` }}
                    />
                </div>
            )}

            <div className="container max-w-lg mx-auto px-6 flex-1 pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Persistent Navigation */}
            {step !== 'success' && (
                <div className="fixed bottom-0 left-0 w-full p-6 bg-cyber-dark/80 backdrop-blur-xl border-t border-white/10 z-50">
                    <div className="container max-w-lg mx-auto flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="h-14 w-14 rounded-xl border border-white/10 text-white p-0 shrink-0"
                            onClick={prevStep}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>

                        {step !== 'age' && step !== 'barber' && (
                            <Button
                                className="btn-neon h-14 flex-1 text-lg font-bold"
                                onClick={nextStep}
                                disabled={isNextDisabled()}
                            >
                                Continuer
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
