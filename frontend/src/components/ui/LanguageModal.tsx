'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation, LANGUAGES } from '@/lib/i18n';
import type { Language } from '@/types';
import { RakshakLogo } from '@/components/ui/RakshakLogo';
import { Check, Globe } from 'lucide-react';

const LANGUAGE_DETAILS: Record<Language, { name: string; native: string; subtitle: string }> = {
  en: { name: 'English', native: 'English', subtitle: 'Select for English' },
  hi: { name: 'Hindi', native: 'हिंदी', subtitle: 'हिंदी के लिए चुनें' },
  kn: { name: 'Kannada', native: 'ಕನ್ನಡ', subtitle: 'ಕನ್ನಡಕ್ಕಾಗಿ ಆಯ್ಕೆಮಾಡಿ' },
  te: { name: 'Telugu', native: 'తెలుగు', subtitle: 'తెలుగు కోసం ఎంచుకోండి' },
  ta: { name: 'Tamil', native: 'தமிழ்', subtitle: 'தமிழுக்கு தேர்ந்தெடுக்கவும்' },
};

export function LanguageModal() {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Language>(language);

  // Trigger modal on every page load / hard refresh
  useEffect(() => {
    setIsOpen(true);
  }, []);

  // Keep selected state in sync with current language
  useEffect(() => {
    setSelected(language);
  }, [language]);

  const handleConfirm = (lang: Language) => {
    setSelected(lang);
    setLanguage(lang);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-card border border-border/80 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="flex justify-center mb-1">
            <RakshakLogo size="xl" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <Globe className="h-3.5 w-3.5" />
            <span>Welcome to Rakshak</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Select Preferred Language
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            कृपया अपनी पसंदीदा भाषा चुनें / Select your preferred language to proceed.
          </p>
        </div>

        {/* Language Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
          {LANGUAGES.map((lang) => {
            const detail = LANGUAGE_DETAILS[lang];
            const isSelected = selected === lang;

            return (
              <button
                key={lang}
                type="button"
                onClick={() => handleConfirm(lang)}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                    : 'border-border/80 bg-card hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-base text-foreground leading-none">
                    {detail.native}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {detail.name}
                  </p>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-transparent'
                  }`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-muted-foreground pt-2 border-t border-border/60 relative z-10">
          <span>You can change your language anytime from the top navigation bar.</span>
        </div>
      </div>
    </div>
  );
}
