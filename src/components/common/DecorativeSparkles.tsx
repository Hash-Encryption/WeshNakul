import React from 'react';

export const SparkleRays: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = '#FFD75A',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    className={`w-6 h-6 ${className}`}
    stroke={color}
    strokeWidth="3.5"
    strokeLinecap="round"
  >
    <path d="M16 4V10" />
    <path d="M25 7L20.5 11.5" />
    <path d="M28 16H22" />
  </svg>
);

export const DoodleHeart: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = '#55B96A',
}) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    stroke={color}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-6 h-6 ${className}`}
  >
    <path d="M18 31 C 18 31, 6 22, 6 12 C 6 6, 12 4, 18 10 C 24 4, 30 6, 30 12 C 30 22, 18 31, 18 31 Z" />
  </svg>
);

export const DoodleSquiggle: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = '#F0443E',
}) => (
  <svg
    viewBox="0 0 40 20"
    fill="none"
    stroke={color}
    strokeWidth="3"
    strokeLinecap="round"
    className={`w-8 h-4 ${className}`}
  >
    <path d="M4 10 Q 12 2, 20 10 T 36 10" />
  </svg>
);
