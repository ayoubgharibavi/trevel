
import React, { useState, useRef, useEffect } from 'react';
import { PlaneIcon } from './icons/PlaneIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { ProfileIcon } from './icons/ProfileIcon';
import { MenuIcon } from './icons/MenuIcon';
import { XIcon } from './icons/XIcon';
import type { User, Language, Tenant } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface HeaderProps {
    user: User | null;
    tenant?: Tenant;
    onLoginClick: () => void;
    onLogout: () => void;
    onProfileClick: () => void;
    onLogoClick: () => void;
    onCurrencyConverterClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, tenant, onLoginClick, onLogout, onProfileClick, onLogoClick, onCurrencyConverterClick }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const { t, language, setLanguage } = useLocalization();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProfileClick = () => {
        onProfileClick();
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
    };

    const handleLogoutClick = () => {
        onLogout();
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
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

    const navItems = [
        { key: 'domestic', label: t('header.nav.domestic') },
        { key: 'international', label: t('header.nav.international') },
        { key: 'hotels', label: t('header.nav.hotels') },
        { key: 'tours', label: t('header.nav.tours') },
        { key: 'currency', label: 'تبدیل ارز', onClick: onCurrencyConverterClick },
    ];

    return (
        <header className="bg-gradient-to-r from-primary-600 to-primary-800 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo and Brand */}
                    <button 
                        onClick={onLogoClick} 
                        className="flex items-center space-x-3 space-x-reverse cursor-pointer group"
                    >
                        <div className="group-hover:scale-110 transition-transform duration-200">
                            {siteLogo}
                        </div>
                        <span className="text-xl sm:text-2xl font-bold text-white font-sans">
                            {siteName}
                        </span>
                    </button>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-6 space-x-reverse">
                        {navItems.map((item) => (
                            item.onClick ? (
                                <button
                                    key={item.key}
                                    onClick={item.onClick}
                                    className="text-slate-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-white/10"
                                >
                                    {item.label}
                                </button>
                            ) : (
                                <a
                                    key={item.key}
                                    href="#"
                                    className="text-slate-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-white/10"
                                >
                                    {item.label}
                                </a>
                            )
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center space-x-4 space-x-reverse">
                        <div className="w-px h-6 bg-blue-300"></div>
                        
                        <button 
                            onClick={toggleLanguage} 
                            className="text-slate-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-white/10"
                        >
                            {getNextLanguageLabel()}
                        </button>

                        {user ? (
                            <div ref={dropdownRef} className="relative">
                                <button 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                                    className="flex items-center space-x-2 space-x-reverse text-slate-200 hover:text-white transition-colors duration-200 hover:bg-white/10 px-3 py-2 rounded-md"
                                >
                                    <UserCircleIcon className="w-6 h-6" />
                                    <span className="text-sm font-medium">{user.name}</span>
                                </button>
                                {isDropdownOpen && (
                                    <div className={`absolute mt-2 w-48 bg-white rounded-lg shadow-soft ring-1 ring-black/5 z-20 animate-fade-in ${language === 'en' ? 'left-0' : 'right-0'}`}>
                                        <div className="py-1" role="menu" aria-orientation="vertical">
                                            <button 
                                                onClick={handleProfileClick} 
                                                className={`w-full flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200 ${language === 'en' ? 'text-left' : 'text-right'}`} 
                                                role="menuitem"
                                            >
                                                <ProfileIcon className={`w-4 h-4 text-slate-500 ${language === 'en' ? 'mr-3' : 'ml-3'}`} />
                                                <span>{user.role !== 'USER' ? t('header.userMenu.dashboard') : t('header.userMenu.profile')}</span>
                                            </button>
                                            <div className="border-t border-gray-200 my-1"></div>
                                            <button 
                                                onClick={handleLogoutClick} 
                                                className={`w-full flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200 ${language === 'en' ? 'text-left' : 'text-right'}`} 
                                                role="menuitem"
                                            >
                                                <LogoutIcon className={`w-4 h-4 text-slate-500 ${language === 'en' ? 'mr-3' : 'ml-3'}`} />
                                                <span>{t('header.userMenu.logout')}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button 
                                onClick={onLoginClick} 
                                className="flex items-center space-x-2 space-x-reverse text-slate-200 hover:text-white transition-colors duration-200 hover:bg-white/10 px-3 py-2 rounded-md"
                            >
                                <UserCircleIcon className="w-6 h-6" />
                                <span className="text-sm font-medium">{t('header.userMenu.login')}</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="lg:hidden flex items-center space-x-2 space-x-reverse">
                        <button 
                            onClick={toggleLanguage} 
                            className="text-slate-200 hover:text-white px-2 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                            {getNextLanguageLabel()}
                        </button>
                        
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-slate-200 hover:text-white p-2 rounded-md transition-colors duration-200"
                        >
                            {isMobileMenuOpen ? (
                                <XIcon className="w-6 h-6" />
                            ) : (
                                <MenuIcon className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div ref={mobileMenuRef} className="lg:hidden animate-slide-down">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-white/10 backdrop-blur-sm rounded-lg mt-2">
                            {navItems.map((item) => (
                                <a
                                    key={item.key}
                                    href="#"
                                    className="text-slate-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 hover:bg-white/10"
                                >
                                    {item.label}
                                </a>
                            ))}
                            
                            <div className="border-t border-blue-300 my-2"></div>
                            
                            {user ? (
                                <>
                                    <button 
                                        onClick={handleProfileClick} 
                                        className="w-full flex items-center px-3 py-2 text-slate-200 hover:text-white text-base font-medium transition-colors duration-200 hover:bg-white/10 rounded-md"
                                    >
                                        <ProfileIcon className={`w-5 h-5 ${language === 'en' ? 'mr-3' : 'ml-3'}`} />
                                        <span>{user.role !== 'USER' ? t('header.userMenu.dashboard') : t('header.userMenu.profile')}</span>
                                    </button>
                                    <button 
                                        onClick={handleLogoutClick} 
                                        className="w-full flex items-center px-3 py-2 text-slate-200 hover:text-white text-base font-medium transition-colors duration-200 hover:bg-white/10 rounded-md"
                                    >
                                        <LogoutIcon className={`w-5 h-5 ${language === 'en' ? 'mr-3' : 'ml-3'}`} />
                                        <span>{t('header.userMenu.logout')}</span>
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={onLoginClick} 
                                    className="w-full flex items-center px-3 py-2 text-slate-200 hover:text-white text-base font-medium transition-colors duration-200 hover:bg-white/10 rounded-md"
                                >
                                    <UserCircleIcon className={`w-5 h-5 ${language === 'en' ? 'mr-3' : 'ml-3'}`} />
                                    <span>{t('header.userMenu.login')}</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};