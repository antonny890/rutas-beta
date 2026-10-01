import React from 'react';

interface EnrutaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'full' | 'icon-only' | 'horizontal';
  className?: string;
}

export const EnrutaLogo: React.FC<EnrutaLogoProps> = ({
  size = 'md',
  showTagline = true,
  variant = 'horizontal',
  className = '',
}) => {
  // Dimensions based on size
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size];

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  return (
    <div
      className={`inline-flex items-center ${
        variant === 'full' ? 'flex-col text-center' : 'flex-row text-left'
      } gap-2.5 select-none ${className}`}
    >
      {/* Crisp Circular Vector Emblem */}
      <div className={`relative ${iconDimensions} shrink-0`}>
        <img
          src="/logo.svg"
          alt="ENRUTA Logo"
          className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-200 hover:scale-105"
        />
      </div>

      {variant !== 'icon-only' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight text-slate-900 ${titleSizes}`}
              style={{ letterSpacing: '-0.03em' }}
            >
              en<span className="text-emerald-600">ruta</span>
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold text-sky-700 bg-sky-50 border border-sky-200 rounded tracking-wider uppercase">
              SIT AQP
            </span>
          </div>
          {showTagline && (
            <span className={`font-semibold text-slate-500 tracking-normal mt-0.5 ${taglineSizes}`}>
              Tu Ruta, Tu Costo Justo
            </span>
          )}
        </div>
      )}
    </div>
  );
};
