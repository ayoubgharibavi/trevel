
import React, { useState, useRef, useEffect } from 'react';
import { PlaneIcon } from './icons/PlaneIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { ProfileIcon } from './icons/ProfileIcon';
import type { User, Language, Tenant } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface HeaderProps {
    user: User | null;
    tenant?: Tenant;
    onLoginClick: () => void;
    onLogout: () => void;
    onProfileClick: () => void;
    onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, tenant, onLoginClick, onLogout, onProfileClick, onLogoClick }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { t, language, setLanguage } = useLocalization();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProfileClick = () => {
        onProfileClick();
        setIsDropdownOpen(false);
    };

    const handleLogoutClick = () => {
        onLogout();
        setIsDropdownOpen(false);
    }
    
    const toggleLanguage = () => {
        const languages: Language[] = ['ar', 'fa', 'en'];
        const currentIndex = languages.indexOf(language);
        const nextIndex = (currentIndex + 1) % languages.length;
        setLanguage(languages[nextIndex]);
    };
    
    const getNextLanguageLabel = () => {
        if (language === 'ar') return 'فارسی';
        if (language === 'fa') return 'English';
        if (language === 'en') return 'العربية';
        return '';
    };

    const siteName = tenant?.name || t('header.title');
    const siteLogo = tenant?.logoUrl ? <img src={tenant.logoUrl} alt={siteName} className="w-8 h-8 rounded-full" /> : <PlaneIcon className="w-8 h-8 text-white" />;


  return (
    <header className="bg-primary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={onLogoClick} className="flex items-center space-x-3 space-x-reverse cursor-pointer">
            {siteLogo}
            <span className="text-2xl font-bold text-white">{siteName}</span>
          </button>
          <div className="flex items-center space-x-2 sm:space-x-6 space-x-reverse">
            <nav className="hidden md:flex items-center space-x-5 space-x-reverse">
              <a href="#" className="text-slate-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">{t('header.nav.domestic')}</a>
              <a href="#" className="text-slate-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">{t('header.nav.international')}</a>
              <a href="#" className="text-slate-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">{t('header.nav.hotels')}</a>
              <a href="#" className="text-slate-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">{t('header.nav.tours')}</a>
            </nav>
            <div className="w-px h-6 bg-blue-300 hidden md:block"></div>
            
            <button onClick={toggleLanguage} className="text-slate-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                {getNextLanguageLabel()}
            </button>

            {user ? (
                <div ref={dropdownRef} className="relative">
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 space-x-reverse text-slate-200 hover:text-white transition-colors">
                        <UserCircleIcon className="w-6 h-6" />
                        <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                    </button>
                    {isDropdownOpen && (
                        <div className={`absolute mt-2 w-48 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5 ${language === 'en' ? 'left-0' : 'right-0'}`}>
                            <div className="py-1" role="menu" aria-orientation="vertical">
                                <button onClick={handleProfileClick} className={`w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 ${language === 'en' ? 'text-left' : 'text-right'}`} role="menuitem">
                                    <ProfileIcon className={`w-4 h-4 text-slate-500 ${language === 'en' ? 'mr-2' : 'ml-2'}`} />
                                    <span>{user.role !== 'USER' ? t('header.userMenu.dashboard') : t('header.userMenu.profile')}</span>
                                </button>
                                <div className="border-t my-1"></div>
                                <button onClick={handleLogoutClick} className={`w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 ${language === 'en' ? 'text-left' : 'text-right'}`} role="menuitem">
                                    <LogoutIcon className={`w-4 h-4 text-slate-500 ${language === 'en' ? 'mr-2' : 'ml-2'}`} />
                                    <span>{t('header.userMenu.logout')}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <button onClick={onLoginClick} className="flex items-center space-x-2 space-x-reverse text-slate-200 hover:text-white transition-colors">
                    <UserCircleIcon className="w-6 h-6" />
                    <span className="text-sm font-medium">{t('header.userMenu.login')}</span>
                </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};