'use client';

import { useEffect } from 'react';

export interface ToastProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

const toastStyles = {
  error: {
    bg: 'from-white/25 via-white/20 to-white/15',
    border: 'border-white/50',
    text: 'text-white',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
      </svg>
    ),
    shadow: 'shadow-[0_12px_40px_rgba(255,255,255,0.4)]'
  },
  success: {
    bg: 'from-white/25 via-white/20 to-white/15',
    border: 'border-white/50',
    text: 'text-white',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
      </svg>
    ),
    shadow: 'shadow-[0_12px_40px_rgba(255,255,255,0.4)]'
  },
  warning: {
    bg: 'from-white/25 via-white/20 to-white/15',
    border: 'border-white/50',
    text: 'text-white',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
      </svg>
    ),
    shadow: 'shadow-[0_12px_40px_rgba(255,255,255,0.4)]'
  },
  info: {
    bg: 'from-white/25 via-white/20 to-white/15',
    border: 'border-white/50',
    text: 'text-white',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
      </svg>
    ),
    shadow: 'shadow-[0_12px_40px_rgba(255,255,255,0.4)]'
  }
};

export default function Toast({ type, message, onClose, duration = 4000 }: ToastProps) {
  const styles = toastStyles[type];

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-md px-5 z-[100] animate-slide-up">
      <div className={`
        relative overflow-hidden glass-card bg-gradient-to-r ${styles.bg} border ${styles.border} 
        rounded-3xl p-4 ${styles.shadow} group backdrop-blur-4xl
      `}>
        {/* Enhanced shimmer effect */}
        <div className="absolute inset-0 bg-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-4xl"></div>
        
        {/* Premium inner gradient */}
        <div className="absolute inset-0 bg-premium-gradient opacity-40 rounded-4xl"></div>
        
        {/* Enhanced progress bar */}
        <div className="absolute bottom-0 left-0 h-1.5 bg-white/25 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-white/80 to-white/60 animate-[shrink_4s_linear] shadow-soft"
            style={{
              animation: `shrink ${duration}ms linear`,
            }}
          />
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm shadow-inner-glow">
            <div className="text-white filter drop-shadow-sm">{styles.icon}</div>
          </div>
          <p className={`text-base font-bold ${styles.text} flex-1 leading-relaxed`}>
            {message}
          </p>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 transition-all duration-200 flex items-center justify-center group/close backdrop-blur-sm shadow-soft hover:shadow-elevated transform-gpu hover:scale-105"
          >
            <span className="text-xl text-white/70 group-hover/close:text-white/90 transition-colors">×</span>
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}