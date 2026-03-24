import React, { useState, useEffect } from 'react';
import { Megaphone, X, BellRing } from 'lucide-react';
import { adminAPI } from '../services/api';

export const GlobalAnnouncement: React.FC = () => {
    const [announcement, setAnnouncement] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchLatestAnnouncement = async () => {
            try {
                const res = await adminAPI.getAnnouncements();
                
                if (res.success && res.data && res.data.length > 0) {
                    const latestAnn = res.data[0];
                    const dismissedId = localStorage.getItem('last_dismissed_announcement');
                    
                    if (dismissedId !== latestAnn.id.toString()) {
                        setAnnouncement(latestAnn);
                        setIsVisible(true);
                    } else {
                        setIsVisible(false);
                    }
                } else {
                    setIsVisible(false);
                }
            } catch (error: any) {
                console.error('Failed to fetch announcements:', error);
                setIsVisible(false); 
            }
        };

        fetchLatestAnnouncement();
        
        // Poll for new announcements every 2 minutes
        const interval = setInterval(fetchLatestAnnouncement, 120000);
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = () => {
        if (announcement) {
            localStorage.setItem('last_dismissed_announcement', announcement.id.toString());
            setIsVisible(false);
        }
    };

    if (!isVisible || !announcement) return null;

    return (
        <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-2.5 sm:px-3.5 sm:before:flex-1 animate-in slide-in-from-top duration-500">
            {/* Background animated overlay */}
            <div className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl" aria-hidden="true">
                <div 
                    className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30" 
                    style={{ clipPath: 'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 52.7% 57.1%, 74.8% 41.9%)' }}
                />
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-md">
                    <BellRing className="h-4 w-4 text-white animate-bounce" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Broadcast</p>
                </div>
                <p className="text-sm leading-6 text-white font-bold">
                    <strong className="font-black">Notice:</strong>
                    <svg viewBox="0 0 2 2" className="mx-2 inline h-0.5 w-0.5 fill-current" aria-hidden="true">
                        <circle cx="1" cy="1" r="1" />
                    </svg>
                    {announcement.message}
                </p>
                <div className="flex flex-1 justify-end">
                    <button 
                        type="button" 
                        onClick={handleDismiss}
                        className="-m-3 p-3 focus-visible:outline-offset-[-4px] hover:bg-white/10 rounded-full transition-colors"
                    >
                        <span className="sr-only">Dismiss</span>
                        <X className="h-5 w-5 text-white" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );
};
