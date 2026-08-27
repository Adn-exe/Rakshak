'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Language } from '@/types';

import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import kn from '@/locales/kn.json';
import te from '@/locales/te.json';
import ta from '@/locales/ta.json';

// Translation dictionaries indexed by language code
const dictionaries: Record<Language, Record<string, unknown>> = { en, hi, kn, te, ta };

// Language display labels
export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'EN',
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
  te: 'తెలుగు',
  ta: 'தமிழ்',
};

export const LANGUAGES: Language[] = ['en', 'hi', 'kn', 'te', 'ta'];

// ============================================================
// Context
// ============================================================

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

// ============================================================
// Nested key lookup: t('nav.home') → dictionaries[lang].nav.home
// ============================================================

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      // Return the key itself as fallback (makes missing translations visible)
      return path;
    }
  }

  return typeof current === 'string' ? current : path;
}

// ============================================================
// Provider
// ============================================================

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load persisted language preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rakshak_preferences') || localStorage.getItem('jalraksha_preferences');
      if (stored) {
        try {
          const prefs = JSON.parse(stored);
          if (prefs.language && LANGUAGES.includes(prefs.language)) {
            setLanguageState(prefs.language);
          }
        } catch {
          // Ignore invalid stored preference
        }
      }
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rakshak_preferences') || localStorage.getItem('jalraksha_preferences');
      const prefs = stored ? JSON.parse(stored) : {};
      prefs.language = lang;
      localStorage.setItem('rakshak_preferences', JSON.stringify(prefs));
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const dict = dictionaries[language] || dictionaries.en;
      const result = getNestedValue(dict as Record<string, unknown>, key);
      // Fallback to English if key not found in current language
      if (result === key && language !== 'en') {
        return getNestedValue(dictionaries.en as Record<string, unknown>, key);
      }
      return result;
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
