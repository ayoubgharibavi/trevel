

import React from 'react';
import type { User, SiteContent } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface FooterProps {
    user: User | null;
    siteContent: SiteContent;
    onAdminLoginClick: () => void;
    onGoToAbout: () => void;
    onGoToContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ user, siteContent, onAdminLoginClick, onGoToAbout, onGoToContact }) => {
    const { t, language } = useLocalization();
    const footerContent = siteContent.footer;
    const contactContent = siteContent.contact;

    const handleLinkClick = (url: string) => {
        if (url.startsWith('/')) {
            switch (url) {
                case '/about':
                    onGoToAbout();
                    break;
                case '/contact':
                    onGoToContact();
                    break;
                // Add more cases for future internal links
                default:
                    // For now, do nothing or navigate with a router if implemented
                    break;
            }
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <footer className="bg-primary text-slate-300">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-right">
                    <div className="md:col-span-2">
                        <h3 className="font-bold text-white text-lg mb-2">{t('header.title')}</h3>
                        <p className="text-sm">{footerContent.description[language]}</p>
                    </div>

                    {footerContent.columns.map(column => (
                       <div key={column.id}>
                           <h3 className="font-bold text-white text-lg mb-2">{column.title[language]}</h3>
                           <ul className="space-y-1">
                               {column.links.map(link => (
                                   <li key={link.id}>
                                       {link.url.startsWith('/') ? (
                                           <button onClick={() => handleLinkClick(link.url)} className="text-sm hover:text-white transition-colors">{link.text[language]}</button>
                                       ) : (
                                           <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">{link.text[language]}</a>
                                       )}
                                   </li>
                               ))}
                           </ul>
                       </div>
                    ))}

                    <div>
                        <h3 className="font-bold text-white text-lg mb-2">{t('footer.contactInfo')}</h3>
                        <p className="text-sm">{contactContent.email}</p>
                        <p className="text-sm">{contactContent.phone}</p>
                    </div>
                </div>
            </div>
            <div className="bg-sky-950">
                <div className="container mx-auto px-4 py-4 text-center text-sm flex flex-col sm:flex-row justify-between items-center">
                    <p>
                        {t('footer.copyright', new Date().getFullYear())}
                    </p>
                    {!user && (
                        <button onClick={onAdminLoginClick} className="text-sm text-slate-400 hover:text-white transition-colors mt-2 sm:mt-0">
                            {t('footer.adminLogin')}
                        </button>
                    )}
                </div>
            </div>
        </footer>
    );
};
