'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation, LANGUAGE_LABELS, LANGUAGES } from '@/lib/i18n';
import type { Language } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { RakshakLogo } from '@/components/ui/RakshakLogo';
import { Menu, X, Globe, ArrowLeft, LayoutDashboard } from 'lucide-react';

const CITIZEN_NAV_LINKS = [
  { key: 'home', href: '/' },
  { key: 'healthCards', href: '/health-cards' },
  { key: 'about', href: '/about' },
];

const AUTHORITY_NAV_LINKS = [
  { key: 'dashboard', href: '/admin', labelKey: 'nav.dashboard' },
  { key: 'map', href: '/admin/map', labelKey: 'nav.map' },
  { key: 'healthCards', href: '/admin/health-cards', labelKey: 'nav.healthCards' },
];

export function Navbar() {
  const { t, language, setLanguage } = useTranslation();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthorityMode = pathname.startsWith('/admin');

  const isActive = (href: string) => {
    if (href === '/' || href === '/admin') {
      return pathname === href;
    }
    if (href === '/admin/health-cards') {
      return pathname === href || pathname.startsWith('/admin/health-card');
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // ------------------------------------------------------------
  // AUTHORITY DASHBOARD NAVBAR
  // ------------------------------------------------------------
  if (isAuthorityMode) {
    return (
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900 text-slate-100 shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand / Title */}
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2 font-bold text-lg text-slate-100">
                <RakshakLogo size="sm" />
                <span className="font-extrabold text-lg text-slate-100">{t('app.name')}</span>
              </Link>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/30">
                {t('nav.authorityPortal')}
              </span>
            </div>

            {/* Authority Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {AUTHORITY_NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(link.href)
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>

            {/* Right side: Exit Button + Language */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer border border-slate-700">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{LANGUAGE_LABELS[language]}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                  {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                      key={lang}
                      onClick={() => setLanguage(lang as Language)}
                      className={language === lang ? 'bg-amber-500/20 text-amber-300 font-medium' : 'hover:bg-slate-800'}
                    >
                      {LANGUAGE_LABELS[lang as Language]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Prominent Return to Citizen Portal Button */}
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-1.5 border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white text-xs font-medium">
                  <ArrowLeft className="h-3.5 w-3.5 text-amber-400" />
                  <span>{t('nav.exitDashboard')}</span>
                </Button>
              </Link>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-slate-300 hover:text-white"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Nav for Authority */}
          {mobileOpen && (
            <div className="md:hidden pb-4 border-t border-slate-800 mt-2 pt-3">
              <div className="flex flex-col gap-1">
                {AUTHORITY_NAV_LINKS.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                      isActive(link.href)
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {t(link.labelKey)}
                  </Link>
                ))}
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium rounded-md bg-amber-500/20 text-amber-300 flex items-center gap-2 mt-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('nav.exitDashboard')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // ------------------------------------------------------------
  // CITIZEN NAVBAR (Requirement 1 & 2)
  // ------------------------------------------------------------
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <RakshakLogo size="md" />
            <span className="text-foreground font-extrabold">{t('app.name')}</span>
          </Link>

          {/* Desktop Nav Links (No Map link as per Requirement #2) */}
          <div className="hidden md:flex items-center gap-1">
            {CITIZEN_NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {t(`nav.${link.key}`)}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border border-border hover:bg-muted transition-colors cursor-pointer">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-semibold">{LANGUAGE_LABELS[language]}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => setLanguage(lang as Language)}
                    className={language === lang ? 'bg-primary/10 text-primary font-semibold' : ''}
                  >
                    {LANGUAGE_LABELS[lang as Language]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Authority Dashboard CTA */}
            <Link href="/admin" className="hidden sm:block">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                {t('nav.dashboard')}
              </Button>
            </Link>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-border mt-2 pt-3">
            <div className="flex flex-col gap-1">
              {CITIZEN_NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {t(`nav.${link.key}`)}
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-md bg-primary/10 text-primary flex items-center gap-2 mt-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                {t('nav.dashboard')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
