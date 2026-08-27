'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { getReports, initDemoData } from '@/lib/storage';
import { DEMO_ASSETS } from '@/lib/demoData';
import { ReportCard } from '@/components/ui/ReportCard';
import { Button } from '@/components/ui/button';
import type { Report, RiskLevel } from '@/types';
import { FileText, Plus, Search, X } from 'lucide-react';
import Link from 'next/link';

const FILTERS: Array<{ key: string; value: RiskLevel | 'all' }> = [
  { key: 'filterAll', value: 'all' },
  { key: 'filterLow', value: 'low' },
  { key: 'filterModerate', value: 'moderate' },
  { key: 'filterHigh', value: 'high' },
  { key: 'filterCritical', value: 'critical' },
];

export default function HealthCardsPage() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<RiskLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initDemoData(DEMO_ASSETS);
    setReports(getReports());
  }, []);

  const handleReportDeleted = (deletedId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== deletedId));
  };

  // Only display reports officially submitted to authorities (submittedToAuthority === true)
  const submittedReports = reports.filter((r) => r.submittedToAuthority === true);

  // Search & Risk filter
  const filteredReports = submittedReports.filter((report) => {
    // Risk level filter
    if (filter !== 'all' && report.riskLevel !== filter) {
      return false;
    }

    // Text search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = report.assetName.toLowerCase().includes(q);
      const idMatch = report.id.toLowerCase().includes(q);
      const addressMatch = (report.location.address || '').toLowerCase().includes(q);
      const typeMatch = report.assetType.toLowerCase().includes(q);
      const descMatch = (report.description || '').toLowerCase().includes(q);
      const issuesMatch = (report.additionalIssues || []).some((i) => i.toLowerCase().includes(q));

      return nameMatch || idMatch || addressMatch || typeMatch || descMatch || issuesMatch;
    }

    return true;
  });

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <FileText className="h-6 w-6 text-primary" />
              {t('healthCards.title')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{t('healthCards.subtitle')}</p>
          </div>
          <Link href="/report">
            <Button size="sm" className="font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs">
              <Plus className="h-4 w-4" />
              {t('healthCards.createNew')}
            </Button>
          </Link>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-3 bg-card p-4 rounded-xl border border-border shadow-xs">
          {/* Live Search Input Bar */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('healthCards.searchPlaceholder')}
              className="w-full h-10 pl-9 pr-9 text-sm bg-background border border-input rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Risk Filters */}
          <div className="flex gap-2 flex-wrap items-center pt-1">
            <span className="text-xs text-muted-foreground font-semibold mr-1">Filter by Risk:</span>
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f.value)}
                className="text-xs h-8"
              >
                {t(`healthCards.${f.key}`)}
                {f.value !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-80">
                    ({reports.filter((r) => r.riskLevel === f.value).length})
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Active Filter & Result Count Indicator */}
        {(searchQuery || filter !== 'all') && (
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Showing <strong>{filteredReports.length}</strong> of <strong>{reports.length}</strong> health cards
              {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
            </span>
            {(searchQuery || filter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
                className="text-primary hover:underline font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Reports Grid */}
        {filteredReports.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} onDelete={handleReportDeleted} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <FileText className="h-12 w-12 text-muted-foreground/60 mx-auto mb-3" />
            <p className="text-base font-semibold text-foreground">No matching health cards found</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No structures match "${searchQuery}". Try searching for another term or location.`
                : 'No health cards have been submitted yet.'}
            </p>
            {searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-xs"
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
              >
                Clear Search & Filters
              </Button>
            ) : (
              <Link href="/report">
                <Button size="sm" className="mt-4 text-xs">{t('healthCards.createNew')}</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
