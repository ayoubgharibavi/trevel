import React from 'react';
import type { Advertisement } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface AdBannerProps {
    advertisement: Advertisement;
}

export const AdBanner: React.FC<AdBannerProps> = ({ advertisement }) => {
    const { t } = useLocalization();

    return (
        <a 
            href={advertisement.linkUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block relative group rounded-lg overflow-hidden transition-opacity duration-300 opacity-80 hover:opacity-100"
        >
            <img 
                src={advertisement.imageUrl} 
                alt={advertisement.title}
                className="w-full h-16 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute top-2 right-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-md">
                {t('adBanner.label')}
            </span>
        </a>
    );
};
