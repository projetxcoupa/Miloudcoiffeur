import React, { useRef, useEffect, useState } from 'react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WheelDateTimePickerProps {
    date: string; // ISO string
    time: string; // "HH:mm"
    onChange: (date: string, time: string) => void;
}

const ITEM_HEIGHT = 48; // Height of each scroll item in px

export function WheelDateTimePicker({ date, time, onChange }: WheelDateTimePickerProps) {
    const dates = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i));
    const times = Array.from({ length: 19 }, (_, i) => {
        const hour = 9 + Math.floor(i / 2);
        const minute = i % 2 === 0 ? '00' : '30';
        return `${hour.toString().padStart(2, '0')}:${minute}`;
    });

    const dateScrollRef = useRef<HTMLDivElement>(null);
    const timeScrollRef = useRef<HTMLDivElement>(null);

    // Initial scroll position
    useEffect(() => {
        if (dateScrollRef.current) {
            const dateIndex = dates.findIndex(d => isSameDay(d, new Date(date)));
            if (dateIndex !== -1) {
                dateScrollRef.current.scrollTop = dateIndex * ITEM_HEIGHT;
            }
        }
        if (timeScrollRef.current) {
            const timeIndex = times.indexOf(time);
            if (timeIndex !== -1) {
                timeScrollRef.current.scrollTop = timeIndex * ITEM_HEIGHT;
            }
        }
    }, []); // Run once on mount

    const handleScroll = (type: 'date' | 'time', e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const index = Math.round(target.scrollTop / ITEM_HEIGHT);

        // Debounce simple to avoid too many updates, relying on scroll-snap to settle
        // A better approach for "snap" values is checking scroll end, 
        // but for now let's just update on scroll with a slight check

        if (type === 'date') {
            const selectedDate = dates[index];
            if (selectedDate && !isSameDay(selectedDate, new Date(date))) {
                onChange(selectedDate.toISOString(), time);
            }
        } else {
            const selectedTime = times[index];
            if (selectedTime && selectedTime !== time) {
                onChange(date, selectedTime);
            }
        }
    };

    return (
        <div className="relative h-48 flex gap-4 select-none">
            {/* Center Highlight Bar - The "Lens" */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-12 bg-white/5 border-y border-cyber-neon/30 pointer-events-none z-10" />

            {/* Date Column */}
            <div className="flex-1 relative overflow-hidden" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
                <div
                    ref={dateScrollRef}
                    className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide py-[calc(50%-24px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                    onScroll={(e) => handleScroll('date', e)}
                >
                    {dates.map((d) => (
                        <div
                            key={d.toISOString()}
                            className={`h-12 flex items-center justify-center snap-center transition-all duration-300 ${isSameDay(d, new Date(date))
                                ? 'text-cyber-neon font-black scale-110 opacity-100 blur-0'
                                : 'text-white font-medium scale-90 opacity-30 blur-[2px]'
                                }`}
                        >
                            <span className="mr-2 text-xs uppercase">{format(d, 'EEE', { locale: fr })}</span>
                            <span className="text-lg">{format(d, 'd MMM')}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Time Column */}
            <div className="flex-1 relative overflow-hidden" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
                <div
                    ref={timeScrollRef}
                    className="h-full overflow-y-scroll snap-y snap-mandatory py-[calc(50%-24px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                    onScroll={(e) => handleScroll('time', e)}
                >
                    {times.map((t) => (
                        <div
                            key={t}
                            className={`h-12 flex items-center justify-center snap-center transition-all duration-300 ${t === time
                                ? 'text-cyber-purple font-black scale-110 opacity-100 blur-0'
                                : 'text-white font-medium scale-90 opacity-30 blur-[2px]'
                                }`}
                        >
                            <span className="text-lg">{t}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
