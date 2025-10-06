
import React, { useState } from 'react';
import { KeyIcon } from '../components/icons/KeyIcon';
import { PlaneIcon } from '../components/icons/PlaneIcon';
import { useLocalization } from '../hooks/useLocalization';

interface AdminLoginPageProps {
    onLogin: (username: string, pass: string) => Promise<boolean>;
    onGoToSearch: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, onGoToSearch }) => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin123'); // Pre-fill for demo
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLocalization();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const success = await onLogin(username, password);
            if (!success) {
                setError(t('adminLogin.error'));
            }
        } catch (error) {
            setError(t('adminLogin.error'));
        }
        
        setIsLoading(false);
    };

    return (
        <div className="flex min-h-[calc(100vh-64px)] bg-slate-50">
            <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-primary text-white p-12 text-center">
                 <PlaneIcon className="w-24 h-24 mb-6" />
                <h1 className="text-4xl font-bold mb-2">{t('adminLogin.brand')}</h1>
                <p className="text-xl text-sky-200">{t('adminLogin.panel')}</p>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-10">
                         <KeyIcon className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-slate-800">{t('adminLogin.title')}</h2>
                        <p className="text-slate-500 mt-2">{t('adminLogin.subtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username-admin" className="block text-sm font-medium text-slate-700 mb-1">{t('adminLogin.username')}</label>
                            <input
                                type="text"
                                id="username-admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                placeholder={t('adminLogin.usernameHint')}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password-admin" className="block text-sm font-medium text-slate-700 mb-1">{t('adminLogin.password')}</label>
                            <input
                                type="password"
                                id="password-admin"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                placeholder="********"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-hover transition duration-300 flex items-center justify-center disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : t('adminLogin.login')}
                            </button>
                        </div>
                    </form>

                     <p className="mt-8 text-center text-sm text-slate-600">
                        <button onClick={onGoToSearch} className="font-medium text-primary hover:text-blue-800">
                            &rarr; {t('adminLogin.backToSite')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};