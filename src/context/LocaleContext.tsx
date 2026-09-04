import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Locale } from '../types/database';
import { getStoredLocale, setStoredLocale } from '../lib/session';
import arDict from '../locales/ar.json';
import enDict from '../locales/en.json';

type Dictionary = typeof arDict;

interface LocaleContextType {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
  toggleLocale: () => void;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const dictionaries: Record<Locale, Dictionary> = {
  ar: arDict,
  en: enDict,
};

const LocaleContext = createContext<LocaleContextType | null>(null);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => getStoredLocale());

  const dir: 'rtl' | 'ltr' = locale === 'ar' ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
    setStoredLocale(locale);
  }, [locale, dir]);

  const toggleLocale = () => {
    setLocaleState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = useMemo(() => {
    const dict = dictionaries[locale] || dictionaries.ar;

    return (key: string, replacements?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let current: unknown = dict;

      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = (current as Record<string, unknown>)[k];
        } else {
          // Fallback to Arabic dict if key missing
          let fallback: unknown = dictionaries.ar;
          for (const fbK of keys) {
            if (fallback && typeof fallback === 'object' && fbK in fallback) {
              fallback = (fallback as Record<string, unknown>)[fbK];
            } else {
              return key;
            }
          }
          current = fallback;
          break;
        }
      }

      if (typeof current !== 'string') {
        return key;
      }

      let result = current;
      if (replacements) {
        for (const [rKey, rVal] of Object.entries(replacements)) {
          result = result
            .replaceAll(`{{${rKey}}}`, String(rVal))
            .replaceAll(`{${rKey}}`, String(rVal));
        }
      }
      return result;
    };
  }, [locale]);

  return (
    <LocaleContext.Provider
      value={{
        locale,
        dir,
        isRTL,
        toggleLocale,
        setLocale,
        t,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
