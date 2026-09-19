import React from 'react';
import { clsx } from 'clsx';
import { useAccessibility } from '../../context/AccessibilityContext';

interface BigButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline';
  icon?: React.ReactNode;
  label: string;
  subLabel?: string;
  speakOnClick?: boolean;
}

export const BigButton: React.FC<BigButtonProps> = ({
  variant = 'primary',
  icon,
  label,
  subLabel,
  speakOnClick = false,
  className,
  onClick,
  ...props
}) => {
  const { speak, isHighContrast } = useAccessibility();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (speakOnClick && label) {
      speak(label);
    }
    if (onClick) {
      onClick(e);
    }
  };

  const variants = {
    primary: isHighContrast 
      ? 'bg-amber-400 text-black border-2 border-yellow-300 font-bold hover:bg-yellow-300' 
      : 'bg-saffron-600 text-white hover:bg-saffron-700 shadow-md active:scale-[0.98]',
    secondary: isHighContrast
      ? 'bg-emerald-400 text-black border-2 border-green-300 font-bold hover:bg-green-300'
      : 'bg-govGreen-600 text-white hover:bg-govGreen-700 shadow-md active:scale-[0.98]',
    accent: isHighContrast
      ? 'bg-sky-400 text-black border-2 border-sky-300 font-bold'
      : 'bg-panchayatBlue-600 text-white hover:bg-panchayatBlue-700 shadow-md active:scale-[0.98]',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md active:scale-[0.98]',
    outline: isHighContrast
      ? 'bg-black text-yellow-300 border-2 border-yellow-300 hover:bg-zinc-900'
      : 'bg-white text-slate-800 border-2 border-slate-300 hover:bg-amber-50 shadow-sm'
  };

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'w-full min-h-[56px] min-w-[56px] px-5 py-3 rounded-2xl flex items-center justify-between transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-saffron-500/50 cursor-pointer text-left',
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        {icon && <span className="text-2xl shrink-0">{icon}</span>}
        <div className="flex flex-col">
          <span className="font-bold text-lg md:text-xl tracking-wide">{label}</span>
          {subLabel && <span className="text-sm opacity-90 font-medium">{subLabel}</span>}
        </div>
      </div>
    </button>
  );
};
