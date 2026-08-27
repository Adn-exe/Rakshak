'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deleteReport } from '@/lib/storage';
import type { Report } from '@/types';
import { Calendar, MapPin, Trash2 } from 'lucide-react';

interface ReportCardProps {
  report: Report;
  onDelete?: (id: string) => void;
}

export function ReportCard({ report, onDelete }: ReportCardProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Remove report ${report.id} (${report.assetName})?`)) {
      deleteReport(report.id);
      if (onDelete) {
        onDelete(report.id);
      } else {
        window.location.reload();
      }
    }
  };

  const mainIssues: string[] = [];
  if (report.observations.erosion && report.observations.erosion !== 'none')
    mainIssues.push(`${t('healthCard.erosion')}: ${t(`severity.${report.observations.erosion}`)}`);
  if (report.observations.seepage && report.observations.seepage !== 'none')
    mainIssues.push(`${t('healthCard.seepage')}: ${t(`severity.${report.observations.seepage}`)}`);
  if (report.observations.cracks && report.observations.cracks !== 'none')
    mainIssues.push(`${t('healthCard.cracks')}: ${t(`severity.${report.observations.cracks}`)}`);

  const cardLink = isAdmin ? `/admin/health-card/${report.id}` : `/health-card/${report.id}`;

  return (
    <Card className="hover:shadow-md transition-shadow relative group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{report.assetName}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3" />
              <span>{report.location.address || `${report.location.latitude.toFixed(2)}, ${report.location.longitude.toFixed(2)}`}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <RiskBadge level={report.riskLevel} size="sm" />
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                title="Remove Report"
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">{t('risk.score')}</p>
            <p className="text-lg font-bold">{report.riskScore} <span className="text-xs text-muted-foreground font-normal">/ 100</span></p>
          </div>
        </div>

        {mainIssues.length > 0 && (
          <div className="space-y-1 mb-3">
            {mainIssues.slice(0, 2).map((issue, i) => (
              <p key={i} className="text-xs text-muted-foreground">{issue}</p>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {t('healthCards.reported')}{' '}
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link href={isAdmin ? `/admin/map?id=${report.id}` : `/map?id=${report.id}`}>
              <Button variant="outline" size="sm" className="text-xs h-7 px-2 gap-1 border-primary/30 text-primary hover:bg-primary/10">
                <MapPin className="h-3 w-3" />
                <span>Map</span>
              </Button>
            </Link>
            <Link href={cardLink}>
              <Button size="sm" className="text-xs h-7 px-2.5">
                {t('healthCards.viewCard')}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
