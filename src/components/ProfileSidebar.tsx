

import React from 'react';
import { ProfileIcon } from './icons/ProfileIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { WalletIcon } from './icons/WalletIcon';
import { useLocalization } from '../hooks/useLocalization';
import { MessageSquareIcon } from './icons/MessageSquareIcon';
import { AddressBookIcon } from './icons/AddressBookIcon';

interface ProfileSidebarProps {
    activeSection: string;
    onSelectSection: (section: string) => void;
    onLogout: () => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center p-3 rounded-lg text-right transition-colors ${
            isActive
                ? 'bg-blue-100 text-primary font-bold'
                : 'text-slate-600 hover:bg-slate-100'
        }`}
    >
        <span className="ml-3">{icon}</span>
        <span>{label}</span>
    </button>
);

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeSection, onSelectSection, onLogout }) => {
    const { t } = useLocalization();
    return (
        <div className="bg-white p-4 rounded-lg shadow border space-y-2">
            <NavItem 
                icon={<ProfileIcon className="w-5 h-5" />}
                label={t('profile.sidebar.profile')}
                isActive={activeSection === 'profile'}
                onClick={() => onSelectSection('profile')}
            />
             <NavItem 
                icon={<WalletIcon className="w-5 h-5" />}
                label={t('profile.sidebar.wallet')}
                isActive={activeSection === 'wallet'}
                onClick={() => onSelectSection('wallet')}
            />
             <NavItem 
                icon={<HistoryIcon className="w-5 h-5" />}
                label={t('profile.sidebar.bookings')}
                isActive={activeSection === 'bookings'}
                onClick={() => onSelectSection('bookings')}
            />
             <NavItem 
                icon={<MessageSquareIcon className="w-5 h-5" />}
                label={t('profile.sidebar.tickets')}
                isActive={activeSection === 'tickets'}
                onClick={() => onSelectSection('tickets')}
            />
            <NavItem 
                icon={<AddressBookIcon className="w-5 h-5" />}
                label={t('profile.sidebar.savedPassengers')}
                isActive={activeSection === 'savedPassengers'}
                onClick={() => onSelectSection('savedPassengers')}
            />
            <div className="pt-2">
                 <button
                    onClick={onLogout}
                    className="w-full flex items-center p-3 rounded-lg text-right text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    <LogoutIcon className="w-5 h-5 ml-3" />
                    <span>{t('profile.sidebar.logout')}</span>
                </button>
            </div>
        </div>
    );
};