'use client';

import React from 'react';

interface RakshakLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
}

export function RakshakLogo({
  className = '',
  size = 'md',
  showText = false,
  textColor = 'currentColor',
}: RakshakLogoProps) {
  const dimensions = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 34, text: 'text-xl' },
    lg: { icon: 44, text: 'text-2xl' },
    xl: { icon: 56, text: 'text-3xl' },
  }[size];

  const iconDim = dimensions.icon;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Custom Vector Emblem for Rakshak */}
      <svg
        width={iconDim}
        height={iconDim}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform hover:scale-105"
      >
        <defs>
          {/* Shield Outer Gradient */}
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c25928" /> {/* Terracotta */}
            <stop offset="50%" stopColor="#d97706" /> {/* Amber */}
            <stop offset="100%" stopColor="#9a3412" /> {/* Deep Earth */}
          </linearGradient>

          {/* Water Wave Gradient */}
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Structural Pulse Gradient */}
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Subtle Inner Glow Filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Outer Protective Shield */}
        <path
          d="M50 8 L88 24 V50 C88 72 71.5 89 50 94 C28.5 89 12 72 12 50 V24 L50 8 Z"
          fill="url(#shieldGrad)"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* 2. Inner Shield Background */}
        <path
          d="M50 14 L82 28 V48 C82 67.5 68 83 50 87.5 C32 83 18 67.5 18 48 V28 L50 14 Z"
          fill="#1e293b"
          opacity="0.9"
        />

        {/* 3. Embankment Slope Geometry (Earth Structure) */}
        <path
          d="M22 62 L50 34 L78 62 H22 Z"
          fill="#78350f"
          opacity="0.85"
        />
        <path
          d="M30 62 L50 42 L70 62 H30 Z"
          fill="#b45309"
          opacity="0.9"
        />

        {/* 4. Water Flow Waves (Base protection area) */}
        <path
          d="M20 66 C30 63, 38 69, 50 66 C62 63, 70 69, 80 66 V76 C68 81, 58 75, 50 78 C40 81, 30 75, 20 78 V66 Z"
          fill="url(#waterGrad)"
          opacity="0.95"
        />
        <path
          d="M20 72 C30 69, 40 75, 50 72 C60 69, 70 75, 80 72"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* 5. Central Structural Check / Safety Pulse */}
        <circle cx="50" cy="40" r="11" fill="url(#pulseGrad)" filter="url(#glow)" />
        <path
          d="M44 40 L48 44 L56 36"
          stroke="#78350f"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* Optional Brand Name Text */}
      {showText && (
        <span className={`font-extrabold tracking-tight ${dimensions.text}`} style={{ color: textColor }}>
          Rakshak
        </span>
      )}
    </div>
  );
}
