import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  type AdminLocale,
  type AdminTranslations,
  ADMIN_TRANSLATIONS,
  ADMIN_LOCALE_KEY,
  getStoredAdminLocale,
  setStoredAdminLocale,
} from '../locales/adminTranslations';
import { getStoredLocale } from '../lib/session';

export {
  type AdminLocale,
  type AdminTranslations,
  ADMIN_TRANSLATIONS,
  ADMIN_LOCALE_KEY,
  getStoredAdminLocale,
  setStoredAdminLocale,
};

interface AdminLocaleContextType {
  locale: AdminLocale;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  setLocale: (locale: AdminLocale) => void;
  toggleLocale: () => void;
  t: (key: keyof AdminTranslations, replacements?: Record<string, string | number>) => string;
  formatSaudiTime: (isoString: string) => string;
}

const AdminLocaleContext = createContext<AdminLocaleContextType | null>(null);

export const AdminLocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<AdminLocale>(() => getStoredAdminLocale());

  const dir: 'ltr' | 'rtl' = locale === 'ar' ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  // Synchronize document dir & lang for Admin, and restore public app settings on unmount
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;

    return () => {
      // Restore public app's configured locale upon exiting the admin portal
      try {
        const publicLocale = getStoredLocale();
        document.documentElement.dir = publicLocale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = publicLocale;
      } catch {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      }
    };
  }, [locale, dir]);

  const setLocale = useCallback((newLocale: AdminLocale) => {
    setLocaleState(newLocale);
    setStoredAdminLocale(newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next = prev === 'en' ? 'ar' : 'en';
      setStoredAdminLocale(next);
      return next;
    });
  }, []);

  const t = useMemo(() => {
    const dict = ADMIN_TRANSLATIONS[locale] || ADMIN_TRANSLATIONS.en;
    return (key: keyof AdminTranslations, replacements?: Record<string, string | number>): string => {
      const raw = dict[key] ?? ADMIN_TRANSLATIONS.en[key] ?? String(key);
      if (!replacements) {
        return raw;
      }
      let result = raw;
      for (const [rKey, rVal] of Object.entries(replacements)) {
        result = result
          .replaceAll(`{{${rKey}}}`, String(rVal))
          .replaceAll(`{${rKey}}`, String(rVal));
      }
      return result;
    };
  }, [locale]);

  const formatSaudiTime = useCallback((isoString: string): string => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
        timeZone: 'Asia/Riyadh',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return isoString;
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      dir,
      isRTL,
      setLocale,
      toggleLocale,
      t,
      formatSaudiTime,
    }),
    [locale, dir, isRTL, setLocale, toggleLocale, t, formatSaudiTime]
  );

  return (
    <AdminLocaleContext.Provider value={value}>
      {children}
    </AdminLocaleContext.Provider>
  );
};

export const useAdminLocale = (): AdminLocaleContextType => {
  const context = useContext(AdminLocaleContext);
  if (!context) {
    throw new Error('useAdminLocale must be used within an AdminLocaleProvider');
  }
  return context;
};

export const AdminLanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { locale, setLocale, t } = useAdminLocale();

  return (
    <div
      role="group"
      aria-label="Admin language selection"
      className={`inline-flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs font-semibold select-none ${className}`}
    >
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
          locale === 'en'
            ? 'bg-white text-stone-900 shadow-sm font-bold'
            : 'text-stone-500 hover:text-stone-800'
        }`}
        aria-pressed={locale === 'en'}
      >
        {t('langEnglish')}
      </button>
      <button
        type="button"
        onClick={() => setLocale('ar')}
        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
          locale === 'ar'
            ? 'bg-white text-stone-900 shadow-sm font-bold'
            : 'text-stone-500 hover:text-stone-800'
        }`}
        aria-pressed={locale === 'ar'}
      >
        {t('langArabic')}
      </button>
    </div>
  );
};
