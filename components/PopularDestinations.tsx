
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import type { SiteContent } from '../types';

interface DestinationCardProps {
    imageUrl: string;
    name: string;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ imageUrl, name }) => (
    <a href="#" className="group block overflow-hidden rounded-xl shadow-lg relative">
        <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6">
            <h3 className="text-2xl font-bold text-white">{name}</h3>
        </div>
    </a>
);

interface PopularDestinationsProps {
    content: SiteContent['home']['popularDestinations'];
}

export const PopularDestinations: React.FC<PopularDestinationsProps> = ({ content }) => {
    const { language } = useLocalization();
    
    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{content.title[language]}</h2>
                    <p className="text-lg text-slate-600">{content.subtitle[language]}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {content.destinations.map(dest => 
                        <DestinationCard 
                            key={dest.id} 
                            imageUrl={dest.imageUrl} 
                            name={dest.name[language]} 
                        />
                    )}
                </div>
            </div>
        </section>
    );
};
