import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fa } from '../locales/fa';
import { en } from '../locales/en';
import { ar } from '../locales/ar';
import type { Language } from '../types';

const translations = {
    fa: fa,
    en: en,
    ar: ar,
};

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, ...args: (string | number)[]) => string;
    formatDate: (dateString: string, options?: Intl.DateTimeFormatOptions) => string;
    formatTime: (dateString: string, options?: Intl.DateTimeFormatOptions) => string;
    formatNumber: (num: number) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('fa');

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
    }, [language]);

    const t = useCallback((key: string, ...args: (string | number)[]): string => {
        const keys = key.split('.');
        
        // Try current language first
        let result: any = translations[language];
        let found = true;
        
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                found = false;
                break;
            }
        }
        
        if (found && typeof result === 'string') {
            if (args.length > 0) {
                const finalResult = result.replace(/\{(\d+)\}/g, (match, number) => 
                    typeof args[number] !== 'undefined' ? String(args[number]) : match
                );
                return finalResult;
            }
            return result;
        }
        
        // Fallback to English if not found
        result = translations.en;
        found = true;
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                found = false;
                break;
            }
        }
        
        if (found && typeof result === 'string') {
            if (args.length > 0) {
                const finalResult = result.replace(/\{(\d+)\}/g, (match, number) => 
                    typeof args[number] !== 'undefined' ? String(args[number]) : match
                );
                return finalResult;
            }
            return result;
        }
        
        return key;
    }, [language]);

    const locale = useMemo(() => {
        if (language === 'fa') return 'fa-IR';
        if (language === 'ar') return 'ar-EG';
        return 'en-US'; // Default for English
    }, [language]);

    const formatDate = useCallback((dateString: string, options?: Intl.DateTimeFormatOptions) => {
        const defaultOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        
        // Handle empty objects, null, undefined, or invalid inputs
        if (!dateString || typeof dateString !== 'string' || dateString === '{}' || dateString === 'null' || dateString === 'undefined' || dateString === '[object Object]') {
            console.error("formatDate received invalid input:", dateString);
            return "نامشخص";
        }

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            console.error("Could not parse date string:", dateString);
            return 'نامشخص';
        }

        try {
            // Use toLocaleString which accepts both date and time style options.
            return date.toLocaleString(locale, options || defaultOptions);
        } catch (e) {
            console.error("Error in toLocaleString for locale", locale, "with date", dateString, e);
            // Fallback to a simpler, non-locale format
            const fallbackDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
            
            // If time options were likely intended, add a fallback time
            if (options && (options.timeStyle || options.hour || options.minute || options.second)) {
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${fallbackDate} ${hours}:${minutes}`;
            }
            return fallbackDate;
        }
    }, [locale]);
    
    const formatTime = useCallback((dateString: string, options?: Intl.DateTimeFormatOptions) => {
        const defaultOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
        
        if (typeof dateString !== 'string' || !dateString || dateString === '{}' || dateString === 'null' || dateString === 'undefined' || dateString === '[object Object]') {
            console.error("formatTime received invalid input:", dateString);
            return 'Invalid Time';
        }

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            console.error("Could not parse time string:", dateString);
            return 'Invalid Time';
        }

        try {
            return date.toLocaleTimeString(locale, options || defaultOptions);
        } catch (e) {
            console.error("Error in toLocaleTimeString for locale", locale, "with date", dateString, e);
            // Fallback to a simpler, non-locale format
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        }
    }, [locale]);
    
    const formatNumber = useCallback((num: number) => {
        if (language === 'en') {
            return num.toLocaleString('en-US');
        }
        // For Persian, convert to Persian numbers
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toLocaleString('en-US').replace(/[0-9]/g, (digit) => persianNumbers[parseInt(digit)]);
    }, [language]);


    const value = { language, setLanguage, t, formatDate, formatTime, formatNumber };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLocalization = () => {
    const context = React.useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLocalization must be used within a LanguageProvider');
    }
    return context;
};