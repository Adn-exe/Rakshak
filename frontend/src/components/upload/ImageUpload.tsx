'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, X, FileImage } from 'lucide-react';
import { validateImageFile, getImageDimensions, formatFileSize } from '@/lib/image';

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  selectedFile?: File | null;
  previewUrl?: string | null;
  onRemove?: () => void;
}

export function ImageUpload({ onImageSelected, selectedFile, previewUrl, onRemove }: ImageUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(t(`errors.${validation.error}`));
        return;
      }
      try {
        const dims = await getImageDimensions(file);
        setDimensions(dims);
      } catch {
        setDimensions(null);
      }
      onImageSelected(file);
    },
    [onImageSelected, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // If file is selected, show preview
  if (selectedFile && previewUrl) {
    return (
      <Card className="border-2 border-primary/20 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-48 h-48 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <FileImage className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate">{selectedFile.name}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{t('upload.fileSize')}: {formatFileSize(selectedFile.size)}</p>
                {dimensions && (
                  <p>{t('upload.dimensions')}: {dimensions.width} × {dimensions.height}</p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t('upload.change')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onRemove?.();
                    setDimensions(null);
                  }}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  {t('upload.remove')}
                </Button>
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleChange}
          />
        </CardContent>
      </Card>
    );
  }

  // Upload area
  return (
    <Card className="border-2 border-dashed border-border hover:border-primary/40 transition-colors shadow-sm">
      <CardContent
        className={`p-8 sm:p-12 text-center cursor-pointer transition-colors ${
          dragOver ? 'bg-primary/5' : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              {t('upload.title')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('upload.formats')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <FileImage className="h-4 w-4 mr-2" />
              {t('upload.choosePhoto')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                cameraInputRef.current?.click();
              }}
            >
              <Camera className="h-4 w-4 mr-2" />
              {t('upload.useCamera')}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground max-w-sm">
            {t('upload.hint')}
          </p>

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />
      </CardContent>
    </Card>
  );
}
