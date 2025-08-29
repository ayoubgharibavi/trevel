import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { TagIcon } from './icons/TagIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { HeadsetIcon } from './icons/HeadsetIcon';

const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
}> = ({ icon, title, description }) => (
    <div className="text-center p-6">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-primary mx-auto mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600">{description}</p>
    </div>
);

export const WhyChooseUs: React.FC = () => {
    const { t } = useLocalization();
    return (
        <section className="bg-white py-16">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('whyChooseUs.title')}</h2>
                    <p className="text-lg text-slate-600">{t('whyChooseUs.subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<TagIcon className="w-8 h-8" />}
                        title={t('whyChooseUs.bestPrices.title')}
                        description={t('whyChooseUs.bestPrices.description')}
                    />
                    <FeatureCard
                        icon={<SparklesIcon className="w-8 h-8" />}
                        title={t('whyChooseUs.aiSearch.title')}
                        description={t('whyChooseUs.aiSearch.description')}
                    />
                    <FeatureCard
                        icon={<HeadsetIcon className="w-8 h-8" />}
                        title={t('whyChooseUs.support.title')}
                        description={t('whyChooseUs.support.description')}
                    />
                </div>
            </div>
        </section>
    );
};