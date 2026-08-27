'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/upload/ImageUpload';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { validateImage, analyzeInfrastructure } from '@/lib/api';
import { compressImageForStorage } from '@/lib/image';
import { getCurrentLocation } from '@/lib/location';
import { saveReport, generateReportId } from '@/lib/storage';
import { getCommunityData, getEngineerReports } from '@/lib/demoData';
import type { Report, AssetType, Location, UserObservations } from '@/types';
import {
  MapPin, Mic, MicOff, Loader2, CheckCircle2, AlertTriangle, XCircle,
  Navigation, ChevronRight, Waves, Droplets, Landmark, ShieldAlert, Square, Sparkles,
  Scan, Eye, Focus, ShieldCheck
} from 'lucide-react';

type Stage = 'upload' | 'quality' | 'relevance' | 'form' | 'processing' | 'complete';

const ASSET_TYPES: AssetType[] = [
  'river_embankment', 'canal_embankment', 'road_embankment', 'railway_embankment', 'dam_reservoir',
];

const ASSET_TYPE_CONFIG: Record<AssetType, { icon: React.ReactNode; labelKey: string; color: string }> = {
  river_embankment: {
    icon: <Waves className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
    labelKey: 'assetTypes.river_embankment',
    color: 'border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200',
  },
  canal_embankment: {
    icon: <Droplets className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />,
    labelKey: 'assetTypes.canal_embankment',
    color: 'border-cyan-500/40 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-900 dark:text-cyan-200',
  },
  road_embankment: {
    icon: <Landmark className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    labelKey: 'assetTypes.road_embankment',
    color: 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200',
  },
  railway_embankment: {
    icon: <ShieldAlert className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
    labelKey: 'assetTypes.railway_embankment',
    color: 'border-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200',
  },
  dam_reservoir: {
    icon: <Square className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    labelKey: 'assetTypes.dam_reservoir',
    color: 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200',
  },
};

// Asset-specific damage observation chips
const ASSET_OBSERVATION_CHIPS: Record<AssetType, string[]> = {
  river_embankment: ['toeErosion', 'slopeSlumping', 'seepagePiping', 'longitudinalCracks', 'scouring', 'crestSettlement'],
  canal_embankment: ['liningCracks', 'bermErosion', 'wallSeepage', 'bedSiltation', 'sluiceDamage', 'embankmentBreach'],
  road_embankment: ['shoulderErosion', 'guardrailUndermining', 'pavementSinkhole', 'culvertFracture', 'retainingWallBulge', 'sideSlopeFailure'],
  railway_embankment: ['ballastLoss', 'trackMisalignment', 'slopeWashout', 'drainageBlockage', 'toeHeave', 'cuttingInstability'],
  dam_reservoir: ['spillwayCracks', 'abutmentSeepage', 'upstreamRiprapDisplacement', 'crestSettlementDam', 'sinkholeFormation', 'downstreamBoil'],
};

const ASSET_SPECIFIC_OBSERVATIONS: Record<AssetType, Array<{ id: string; labelKey: string }>> = {
  river_embankment: [
    { id: 'toe_erosion', labelKey: 'obs.river.toeErosion' },
    { id: 'seepage_piping', labelKey: 'obs.river.seepagePiping' },
    { id: 'slope_slumping', labelKey: 'obs.river.slopeSlumping' },
    { id: 'longitudinal_cracks', labelKey: 'obs.river.longitudinalCracks' },
    { id: 'vegetation', labelKey: 'obs.river.vegetation' },
  ],
  canal_embankment: [
    { id: 'wall_seepage', labelKey: 'obs.canal.wallSeepage' },
    { id: 'lining_cracks', labelKey: 'obs.canal.liningCracks' },
    { id: 'berm_erosion', labelKey: 'obs.canal.bermErosion' },
    { id: 'bed_siltation', labelKey: 'obs.canal.bedSiltation' },
    { id: 'sluice_damage', labelKey: 'obs.canal.sluiceDamage' },
  ],
  road_embankment: [
    { id: 'pavement_sinkhole', labelKey: 'obs.road.pavementSinkhole' },
    { id: 'shoulder_erosion', labelKey: 'obs.road.shoulderErosion' },
    { id: 'retaining_wall', labelKey: 'obs.road.retainingWall' },
    { id: 'slope_landslide', labelKey: 'obs.road.slopeLandslide' },
    { id: 'culvert_blockage', labelKey: 'obs.road.culvertBlockage' },
  ],
  railway_embankment: [
    { id: 'ballast_shift', labelKey: 'obs.railway.ballastShift' },
    { id: 'subgrade_slump', labelKey: 'obs.railway.subgradeSlump' },
    { id: 'gully_washout', labelKey: 'obs.railway.gullyWashout' },
    { id: 'trackbed_cracks', labelKey: 'obs.railway.trackbedCracks' },
    { id: 'hillside_rockfall', labelKey: 'obs.railway.hillsideRockfall' },
  ],
  dam_reservoir: [
    { id: 'spillway_seepage', labelKey: 'obs.dam.spillwaySeepage' },
    { id: 'abutment_cracks', labelKey: 'obs.dam.abutmentCracks' },
    { id: 'crest_settlement', labelKey: 'obs.dam.crestSettlement' },
    { id: 'downstream_wetspots', labelKey: 'obs.dam.downstreamWetspots' },
    { id: 'gate_damage', labelKey: 'obs.dam.gateDamage' },
  ],
};

export default function ReportPage() {
  const { t, language } = useTranslation();
  const router = useRouter();

  // Stage management
  const [stage, setStage] = useState<Stage>('upload');

  // Image state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Validation state
  const [blurStatus, setBlurStatus] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  // Form state
  const [location, setLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [assetType, setAssetType] = useState<AssetType | ''>('');
  const [assetName, setAssetName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedObs, setSelectedObs] = useState<string[]>([]);

  // Voice state
  const [isListening, setIsListening] = useState(false);

  // Processing state
  const [processingSteps, setProcessingSteps] = useState<Array<{ key: string; label: string; status: 'done' | 'active' | 'pending' }>>([
    { key: 'photoVerified', label: 'Photo Verified', status: 'pending' },
    { key: 'locationAdded', label: 'Location Attached', status: 'pending' },
    { key: 'assetIdentified', label: 'Asset Identified', status: 'pending' },
    { key: 'assessingConditions', label: 'Assessing Structural Risk', status: 'pending' },
    { key: 'preparingCard', label: 'Generating Health Card', status: 'pending' },
  ]);

  // Result state
  const [createdReportId, setCreatedReportId] = useState<string>('');

  const validateImageFile = async (file: File) => {
    setStage('quality');

    try {
      const result = await validateImage(file);

      if (result.blurStatus === 'blurry') {
        setBlurStatus('blurry');
        setValidationError(t('quality.blurry'));
        setStage('upload');
        return;
      }

      if (result.blurStatus === 'borderline') {
        setBlurStatus('borderline');
      } else {
        setBlurStatus('good');
      }

      if (result.relevant === false) {
        setValidationError(result.message || t('relevance.irrelevant'));
        setStage('relevance');
        return;
      }

      await sleep(400);
      setStage('form');
      handleGetLocation();
    } catch {
      setStage('form');
      handleGetLocation();
    }
  };

  const handleImageSelected = useCallback((file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setValidationError('');
    validateImageFile(file);
  }, []);

  // Check for pending file from homepage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pending = (window as unknown as Record<string, File>).__rakshak_pending_file || (window as unknown as Record<string, File>).__jalraksha_pending_file;
      if (pending) {
        handleImageSelected(pending);
        delete (window as unknown as Record<string, File>).__rakshak_pending_file;
        delete (window as unknown as Record<string, File>).__jalraksha_pending_file;
      }
    }
  }, [handleImageSelected]);

  // Auto-redirect timer when stage reaches 'complete'
  useEffect(() => {
    if (stage === 'complete' && createdReportId) {
      const timer = setTimeout(() => {
        router.push(`/health-card/${createdReportId}`);
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [stage, createdReportId, router]);

  const handleGetLocation = async () => {
    setLocationLoading(true);
    setLocationError('');
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch {
      setLocationError(t('errors.locationUnavailable'));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setStage('upload');
    setBlurStatus('');
    setValidationError('');
    setSelectedObs([]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const handleStartVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as Record<string, unknown>;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRec as any)();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : language === 'te' ? 'te-IN' : language === 'ta' ? 'ta-IN' : 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };
      recognition.onerror = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript) {
          setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleStopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop error if already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const updateStep = (index: number, status: 'done' | 'active' | 'pending') => {
    setProcessingSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, status } : step))
    );
  };

  const handleSubmit = async () => {
    if (!selectedFile || !assetType || !assetName || !location) return;

    setStage('processing');

    try {
      updateStep(0, 'done');
      updateStep(1, 'done');
      updateStep(2, 'active');
      await sleep(600);

      updateStep(2, 'done');
      updateStep(3, 'active');

      const userObsObj: UserObservations = {
        cracks: selectedObs.some((o) => o.includes('crack')) ? 'yes' : 'no',
        erosion: selectedObs.some((o) => o.includes('erosion') || o.includes('scouring')) ? 'yes' : 'no',
        seepage: selectedObs.some((o) => o.includes('seepage') || o.includes('piping')) ? 'yes' : 'no',
        settlement: selectedObs.some((o) => o.includes('settlement') || o.includes('slump')) ? 'yes' : 'no',
      };

      const result = await analyzeInfrastructure(selectedFile, {
        assetType,
        assetName,
        latitude: location.latitude,
        longitude: location.longitude,
        description,
        observations: userObsObj as Record<string, string>,
        language,
      });

      updateStep(3, 'done');
      updateStep(4, 'active');
      await sleep(500);

      const imageData = await compressImageForStorage(selectedFile);
      const community = getCommunityData(assetName);
      const engineerReports = getEngineerReports(assetName);

      const reportId = generateReportId();
      const report: Report = {
        id: reportId,
        assetName,
        assetType: assetType as AssetType,
        location,
        image: imageData,
        description,
        observations: {
          cracks: result.assessment.cracks.severity as Report['observations']['cracks'],
          erosion: result.assessment.erosion.severity as Report['observations']['erosion'],
          seepage: result.assessment.seepage.severity as Report['observations']['seepage'],
          settlement: result.assessment.settlement.severity as Report['observations']['settlement'],
        },
        additionalIssues: [...result.assessment.additionalIssues, ...selectedObs],
        assessment: result.assessment,
        communityReports: community?.communityReports || 0,
        unresolvedCommunityReports: community?.unresolvedReports || 0,
        communityData: community || undefined,
        engineerReports: engineerReports.length,
        engineerReportData: engineerReports,
        riskScore: result.risk.totalScore,
        riskLevel: result.risk.riskLevel,
        riskBreakdown: result.risk,
        recommendedAction: result.recommendedAction,
        status: 'new',
        createdAt: new Date().toISOString(),
        summary: result.assessment.summary,
        submittedToAuthority: false,
      };

      saveReport(report);
      setCreatedReportId(reportId);

      updateStep(4, 'done');
      await sleep(300);
      setStage('complete');
    } catch {
      updateStep(3, 'done');
      updateStep(4, 'active');
      await sleep(400);

      const lowerObs = selectedObs.map((o) => o.toLowerCase());
      const hasCracks = lowerObs.some((o) => o.includes('crack'));
      const hasErosion = lowerObs.some((o) => o.includes('erosion') || o.includes('scour') || o.includes('wash') || o.includes('berm'));
      const hasSeepage = lowerObs.some((o) => o.includes('seepage') || o.includes('leak') || o.includes('pipe') || o.includes('wet'));
      const hasSettlement = lowerObs.some((o) => o.includes('settle') || o.includes('sink') || o.includes('slump') || o.includes('hole'));

      const damageCount = [hasCracks, hasErosion, hasSeepage, hasSettlement].filter(Boolean).length;
      const computedScore = damageCount > 0 ? Math.min(95, 45 + damageCount * 18) : 55;
      const computedLevel = computedScore >= 75 ? 'critical' : computedScore >= 50 ? 'high' : computedScore >= 30 ? 'moderate' : 'low';

      const imageData = await compressImageForStorage(selectedFile);
      const community = getCommunityData(assetName);
      const engineerReports = getEngineerReports(assetName);

      const reportId = generateReportId();
      const report: Report = {
        id: reportId,
        assetName,
        assetType: assetType as AssetType,
        location,
        image: imageData,
        description,
        observations: {
          cracks: hasCracks ? 'moderate' : 'none',
          erosion: hasErosion ? 'severe' : 'none',
          seepage: hasSeepage ? 'visible' : 'none',
          settlement: hasSettlement ? 'minor' : 'none',
        },
        additionalIssues: selectedObs.length > 0 ? selectedObs : ['Manual inspection requested'],
        communityReports: community?.communityReports || 0,
        unresolvedCommunityReports: community?.unresolvedReports || 0,
        communityData: community || undefined,
        engineerReports: engineerReports.length,
        engineerReportData: engineerReports,
        riskScore: computedScore,
        riskLevel: computedLevel,
        recommendedAction: 'Field inspection recommended: Report logged from citizen observations. A site visit by irrigation engineers is required to perform an official evaluation.',
        status: 'manual_inspection_needed',
        createdAt: new Date().toISOString(),
        summary: 'Preliminary assessment created from citizen field observations. Flagged for site inspection by local authorities.',
        submittedToAuthority: false,
      };

      saveReport(report);
      setCreatedReportId(reportId);
      updateStep(4, 'done');
      await sleep(300);
      setStage('complete');
    }
  };

  const canSubmit = selectedFile && assetType && assetName && location;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">{t('nav.report')}</h1>

        {/* STAGE: Upload */}
        {stage === 'upload' && (
          <ImageUpload
            onImageSelected={handleImageSelected}
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onRemove={handleRemove}
          />
        )}

        {/* STAGE: Quality Check */}
        {stage === 'quality' && (
          <Card className="border-2 border-primary/30 bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="text-center pb-2 bg-gradient-to-b from-primary/10 to-transparent border-b border-border/50">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-xs font-mono font-bold text-primary mx-auto mb-1">
                <Scan className="h-3.5 w-3.5 animate-pulse text-primary" />
                <span>AI OPTICAL VERIFICATION</span>
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">{t('quality.checking')}</CardTitle>
              <p className="text-xs text-muted-foreground">Evaluating camera sharpness, blur metrics, and infrastructure relevance</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Photo Scanning Box with Optical Reticle */}
              {previewUrl && (
                <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-xl bg-slate-950 group">
                  <img
                    src={previewUrl}
                    alt="Quality Evaluation"
                    className="w-full h-full object-cover opacity-85 filter contrast-105"
                  />

                  {/* High-Tech Shimmer Grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

                  {/* Scanning Laser Beam moving down and up */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#38bdf8] animate-[bounce_1.8s_infinite] top-0" />

                  {/* Optical Reticle Crosshairs in Center */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-24 h-24 rounded-full border border-cyan-400/40 flex items-center justify-center animate-pulse">
                      <div className="w-16 h-16 rounded-full border border-dashed border-cyan-300/60 animate-spin" />
                      <div className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                      <div className="absolute -top-2 text-[9px] font-mono text-cyan-300 font-bold tracking-wider">FOCUS</div>
                    </div>
                  </div>

                  {/* Corner Target Brackets */}
                  <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-400" />

                  {/* Bottom Real-Time Telemetry Bar */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/30 text-white text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                      <span className="font-semibold text-cyan-300">MEASURING LAPLACIAN VARIANCE</span>
                    </div>
                    <span className="text-slate-400 text-[10px] hidden sm:inline">EDGE CONTRAST ENGINE</span>
                  </div>
                </div>
              )}

              {/* Three Diagnostic Checklist Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-border/80 bg-muted/30 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Focus className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">Sharpness</p>
                    <p className="text-[10px] text-muted-foreground truncate">Checking blur variance</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-muted/30 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">Exposure</p>
                    <p className="text-[10px] text-muted-foreground truncate">Lighting & resolution</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-muted/30 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">Relevance</p>
                    <p className="text-[10px] text-muted-foreground truncate">Structure validation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STAGE: Relevance Failed */}
        {stage === 'relevance' && (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-sm font-medium">{validationError}</p>
              <Button onClick={handleRemove}>{t('relevance.uploadAnother')}</Button>
            </CardContent>
          </Card>
        )}

        {/* Blur result (borderline) */}
        {blurStatus === 'borderline' && stage === 'form' && (
          <Card className="mb-4 border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-amber-800">{t('quality.borderline')}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STAGE: Report Form */}
        {stage === 'form' && (
          <div className="space-y-6">
            {/* Preview */}
            {previewUrl && (
              <Card className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <Button size="sm" variant="secondary" onClick={handleRemove} className="text-xs">
                      {t('upload.change')}
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <div className="flex items-center gap-1.5 bg-green-100/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-xs font-medium text-green-700">{t('quality.good')}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Form Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('reportForm.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Location */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('reportForm.location')}</label>
                  {location ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">{t('reportForm.locationDetected')}</p>
                        <p className="text-xs text-green-600">
                          {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
                          {location.address && ` · ${location.address}`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={handleGetLocation}
                        disabled={locationLoading}
                        className="w-full"
                      >
                        {locationLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Navigation className="h-4 w-4 mr-2" />
                        )}
                        {t('reportForm.useMyLocation')}
                      </Button>
                      {locationError && <p className="text-xs text-amber-600">{locationError}</p>}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Asset Type Chips Selection */}
                <div>
                  <label className="text-sm font-semibold mb-2.5 flex items-center gap-1.5 text-foreground">
                    <span>{t('reportForm.assetType')} *</span>
                    <span className="text-xs text-muted-foreground font-normal">(Tap to select)</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ASSET_TYPES.map((type) => {
                      const config = ASSET_TYPE_CONFIG[type];
                      const isSelected = assetType === type;

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setAssetType(type);
                            setSelectedObs([]);
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? config.color
                              : 'border-border/80 bg-card hover:border-primary/40 hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-background shadow-xs' : 'bg-muted text-muted-foreground'}`}>
                              {config.icon}
                            </div>
                            <span className="font-semibold text-sm leading-tight">
                              {t(config.labelKey)}
                            </span>
                          </div>

                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-transparent'
                          }`}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Asset-Specific Observations Chips (Appears right after Asset Type) */}
                {assetType && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-semibold mb-1 block text-foreground">
                        {t('obs.title')}
                      </label>
                      <p className="text-xs text-muted-foreground mb-3">
                        {t('obs.subtitle')}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {ASSET_SPECIFIC_OBSERVATIONS[assetType as AssetType]?.map((obsItem) => {
                          const isSelected = selectedObs.includes(obsItem.id);
                          return (
                            <button
                              key={obsItem.id}
                              type="button"
                              onClick={() => {
                                setSelectedObs((prev) =>
                                  isSelected ? prev.filter((i) => i !== obsItem.id) : [...prev, obsItem.id]
                                );
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer ${
                                isSelected
                                  ? 'border-primary bg-primary text-primary-foreground shadow-xs font-semibold'
                                  : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted'
                              }`}
                            >
                              <span>{t(obsItem.labelKey)}</span>
                              {isSelected ? (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              ) : (
                                <span className="text-muted-foreground/60 text-xs">+</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Asset Name */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('reportForm.assetName')} *</label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder={t('reportForm.assetNamePlaceholder')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t('reportForm.assetNameHelper')}</p>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('reportForm.description')}</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('reportForm.descriptionPlaceholder')}
                    rows={3}
                  />
                  <div className="mt-2">
                    {isListening ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleStopVoiceInput}
                        className="animate-pulse text-xs font-semibold gap-1.5 cursor-pointer"
                      >
                        <Square className="h-3.5 w-3.5 fill-current" />
                        <span>Stop Listening</span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleStartVoiceInput}
                        className="text-xs gap-1.5 cursor-pointer"
                      >
                        <Mic className="h-3.5 w-3.5 text-primary" />
                        <span>{t('reportForm.voiceInput')}</span>
                      </Button>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full mt-6"
                  size="lg"
                >
                  {t('reportForm.submit')}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STAGE: Processing */}
        {stage === 'processing' && (
          <Card className="border border-border/80 bg-card shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-4">
                {previewUrl ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-primary/30 shadow-xs">
                    <img src={previewUrl} alt="Analyzing" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-primary/10" />
                    <div className="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_8px_currentColor] animate-[bounce_1.5s_infinite] top-0" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-[11px] font-medium text-primary mb-1">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Structural Analysis</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight leading-tight">{t('processing.title')}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Evaluating structural damage and computing explainable risk score...</p>
                </div>
              </div>

              {/* Progress Steps List */}
              <div className="bg-muted/40 p-4 rounded-xl border border-border/50">
                <ProgressSteps steps={processingSteps.map((s) => ({ key: s.key, label: t(`processing.${s.key}`), status: s.status }))} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* STAGE: Complete Celebration Modal */}
        {stage === 'complete' && (
          <Card className="border-2 border-emerald-500/40 bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <CardContent className="p-8 sm:p-10 text-center space-y-5 relative">
              {/* Glowing Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

              {/* Animated Checkmark Badge */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-75" />
                <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-full flex items-center justify-center shadow-lg text-white">
                  <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-foreground tracking-tight">
                  Health Card Generated!
                </h2>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-full text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{createdReportId}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Your embankment inspection report has been recorded and evaluated. Opening Health Card automatically...
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                <Button
                  size="lg"
                  className="font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
                  onClick={() => router.push(`/health-card/${createdReportId}`)}
                >
                  <span>Open Health Card Now</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="font-semibold text-xs gap-1.5"
                  onClick={() => router.push(`/map?id=${createdReportId}`)}
                >
                  <MapPin className="h-4 w-4" />
                  <span>{t('healthCard.viewOnMap')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
