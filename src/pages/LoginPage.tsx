import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';

interface LoginPageProps {
    onLogin: (username: string, pass: string) => Promise<boolean>;
    onGoToSignup: () => void;
    error: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoToSignup, error }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { t } = useLocalization();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username && password) {
            await onLogin(username, password);
        }
    };

    return (
        <div className="bg-secondary py-12">
            <div className="container mx-auto px-4 flex justify-center">
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border">
                    <h1 className="text-3xl font-bold text-center mb-2 text-primary">{t('login.title')}</h1>
                    <p className="text-slate-600 text-center mb-8">{t('login.subtitle')}</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">{t('login.username')}</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                placeholder={t('login.usernameHint')}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">{t('login.password')}</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                placeholder={t('login.passwordHint')}
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 text-sm" role="alert">
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-accent border-slate-300 rounded" />
                                <label htmlFor="remember-me" className="mr-2 block text-sm text-slate-900">{t('login.rememberMe')}</label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary hover:text-blue-800">{t('login.forgotPassword')}</a>
                            </div>
                        </div>
                        <div>
                            <button type="submit" className="w-full bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-hover transition duration-300">
                                {t('login.login')}
                            </button>
                        </div>
                    </form>
                    <p className="mt-8 text-center text-sm text-slate-600">
                        {t('login.noAccount')}{' '}
                        <button onClick={onGoToSignup} className="font-medium text-primary hover:text-blue-800">
                            {t('login.createAccount')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};