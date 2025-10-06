import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { translations } from '@/locales';
import type { Language } from '@/types';

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
        const languagesToTry: Language[] = [language, 'en', 'fa', 'ar']; // Define a fallback order
        const uniqueLanguages = [...new Set(languagesToTry)];

        for (const lang of uniqueLanguages) {
            let result: any = translations[lang];
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
                    return result.replace(/\{(\d+)\}/g, (match, number) => 
                        typeof args[number] !== 'undefined' ? String(args[number]) : match
                    );
                }
                return result;
            }
        }
        return key; // Return the key if not found in any language
    }, [language]);

    const locale = useMemo(() => {
        if (language === 'fa') return 'fa-IR';
        if (language === 'ar') return 'ar-EG';
        return 'en-US'; // Default for English
    }, [language]);

    const formatDate = useCallback((dateString: string, options?: Intl.DateTimeFormatOptions) => {
        const defaultOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        
        // Handle empty objects, null, undefined, or invalid inputs
        if (!dateString || typeof dateString !== 'string' || dateString === '{}' || dateString === 'null' || dateString === 'undefined') {
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
        
        if (typeof dateString !== 'string' || !dateString) {
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
        return num.toLocaleString(locale);
    }, [locale]);


    const value = { language, setLanguage, t, formatDate, formatTime, formatNumber };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};