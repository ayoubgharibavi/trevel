import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import type { CountryInfo } from '../types';

interface SignupPageProps {
    onSignup: (name: string, username: string, email: string, pass: string, phone: string) => Promise<void>;
    onGoToLogin: () => void;
    countries: CountryInfo[];
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onGoToLogin, countries }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+98');
    const { t, language } = useLocalization();

    const sortedCountries = useMemo(() => {
        return [...countries].sort((a, b) => a.name[language].localeCompare(b.name[language]));
    }, [countries, language]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name && username && email && password && phone) {
            const fullPhoneNumber = `${countryCode}${phone.replace(/^0+/, '')}`; // Remove leading zeros from phone
            await onSignup(name, username, email, password, fullPhoneNumber);
        }
    };

    return (
        <div className="bg-secondary py-12">
            <div className="container mx-auto px-4 flex justify-center">
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border">
                    <h1 className="text-3xl font-bold text-center mb-2 text-primary">{t('signup.title')}</h1>
                    <p className="text-slate-600 text-center mb-8">{t('signup.subtitle')}</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">{t('signup.fullName')}</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                placeholder={t('signup.fullNameHint')}
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="username-signup" className="block text-sm font-medium text-slate-700 mb-1">{t('signup.username')}</label>
                            <input
                                type="text"
                                id="username-signup"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                placeholder={t('signup.usernameHint')}
                                required
                                pattern="[a-zA-Z0-9_]+"
                                title={t('signup.usernameError')}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-signup" className="block text-sm font-medium text-slate-700 mb-1">{t('signup.email')}</label>
                            <input
                                type="email"
                                id="email-signup"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                placeholder={t('signup.emailHint')}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="phone-signup" className="block text-sm font-medium text-slate-700 mb-1">{t('passengerDetails.phoneNumber')}</label>
                            <div className="flex">
                                <select
                                    aria-label="Country code"
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="h-full rounded-l-lg border-t border-b border-l text-gray-800 bg-gray-100 px-3 py-2 focus:ring-accent focus:border-accent"
                                >
                                    {sortedCountries.map(c => <option key={c.id} value={c.dialingCode}>{`${c.name[language]} (${c.dialingCode})`}</option>)}
                                </select>
                                <input
                                    type="tel"
                                    id="phone-signup"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} // Allow only digits
                                    className="w-full px-3 py-2 border border-slate-300 rounded-r-lg focus:ring-accent focus:border-accent ltr"
                                    placeholder="9123456789"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password-signup" className="block text-sm font-medium text-slate-700 mb-1">{t('signup.password')}</label>
                            <input
                                type="password"
                                id="password-signup"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                placeholder={t('signup.passwordHint')}
                                required
                                minLength={8}
                            />
                        </div>
                        <div>
                            <button type="submit" className="w-full bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-hover transition duration-300">
                                {t('signup.signup')}
                            </button>
                        </div>
                    </form>
                    <p className="mt-8 text-center text-sm text-slate-600">
                        {t('signup.hasAccount')}{' '}
                        <button onClick={onGoToLogin} className="font-medium text-primary hover:text-blue-800">
                            {t('signup.login')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
