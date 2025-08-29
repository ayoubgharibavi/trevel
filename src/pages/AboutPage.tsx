
import React from 'react';
import type { SiteContent } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface AboutPageProps {
    siteContent: SiteContent['about'];
}

export const AboutPage: React.FC<AboutPageProps> = ({ siteContent }) => {
    const { t, language } = useLocalization();
    return (
        <div className="bg-white">
            <div className="relative h-96">
                <img src={siteContent.imageUrl} alt={t('about.heroAlt')} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <h1 className="text-5xl font-bold text-white text-center px-4">{siteContent.title[language]}</h1>
                </div>
            </div>
            <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
                <p className="text-lg text-slate-700 leading-relaxed">
                    {siteContent.body[language]}
                </p>
            </div>
        </div>
    );
};
