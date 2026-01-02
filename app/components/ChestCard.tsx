// app/components/ChestCard.tsx
import { useState } from 'react';

type Props = {
  title: string;
  description?: string;
  badge?: string;
  progress?: number;
  variant?: "bronze" | "silver" | "default";
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void | Promise<void>;
  secondaryActionLabel?: string;
  secondaryActionDisabled?: boolean;
  onSecondaryAction?: () => void | Promise<void>;
  error?: string | null;
};

const variantStyles = {
  bronze: {
    gradient: "from-amber-400/20 via-orange-400/15 to-red-400/8",
    border: "border-amber-400/40",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    iconBg: "from-amber-400 via-orange-400 to-red-500",
    button: "from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600",
    progress: "from-amber-400 to-orange-500",
    shadow: "shadow-[0_12px_40px_rgba(251,191,36,0.3)]",
    glow: "shadow-[0_0_24px_rgba(251,191,36,0.4)]"
  },
  silver: {
    gradient: "from-slate-400/20 via-gray-400/15 to-slate-500/8",
    border: "border-slate-400/40",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    iconBg: "from-slate-400 via-gray-400 to-slate-600",
    button: "from-slate-400 to-gray-500 hover:from-slate-500 hover:to-gray-600",
    progress: "from-slate-400 to-gray-500",
    shadow: "shadow-[0_12px_40px_rgba(148,163,184,0.3)]",
    glow: "shadow-[0_0_24px_rgba(148,163,184,0.4)]"
  },
  default: {
    gradient: "from-accent-400/20 via-primary-400/15 to-blue-400/8",
    border: "border-accent-400/40",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z M6,4H13V9H18V20H6V4Z"/>
      </svg>
    ),
    iconBg: "from-accent-400 via-primary-400 to-blue-500",
    button: "from-accent-400 to-primary-500 hover:from-accent-500 hover:to-primary-600",
    progress: "from-accent-400 to-primary-500",
    shadow: "shadow-floating",
    glow: "shadow-glow-accent"
  }
};

export default function ChestCard({
  title,
  description,
  badge,
  progress,
  variant = "default",
  actionLabel,
  actionDisabled = false,
  onAction,
  secondaryActionLabel,
  secondaryActionDisabled = false,
  onSecondaryAction,
  error
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [secondaryLoading, setSecondaryLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const styles = variantStyles[variant];

  const handleAction = async () => {
    if (!onAction || actionDisabled || isLoading) return;
    
    setIsLoading(true);
    setLocalError(null);
    
    try {
      await onAction();
    } catch (error) {
      console.error('ChestCard action error:', error);
      setLocalError('Action failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecondaryAction = async () => {
    if (!onSecondaryAction || secondaryActionDisabled || secondaryLoading) return;
    
    setSecondaryLoading(true);
    setLocalError(null);
    
    try {
      await onSecondaryAction();
    } catch (error) {
      console.error('ChestCard secondary action error:', error);
      setLocalError('Action failed. Please try again.');
    } finally {
      setSecondaryLoading(false);
    }
  };

  const displayError = error || localError;

  return (
    <article className={`
      relative overflow-hidden rounded-5xl glass-card-hover transition-all duration-500 hover:scale-[1.02]
      bg-gradient-to-br ${styles.gradient} ${styles.border} ${styles.shadow} p-7 group animate-scale-in
      backdrop-blur-4xl transform-gpu will-change-transform
    `}>
      {/* Enhanced animated background elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-white/8 to-transparent rounded-full blur-3xl animate-float opacity-60"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-white/8 to-transparent rounded-full blur-3xl animate-float-delayed opacity-60"></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse-slower opacity-40"></div>
      
      {/* Enhanced shimmer overlay */}
      <div className="absolute inset-0 bg-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-5xl"></div>
      
      {/* Premium inner gradient */}
      <div className="absolute inset-0 bg-premium-gradient opacity-30 rounded-5xl"></div>
      
      <div className="relative z-10">
        {/* Enhanced Header */}
        <div className="flex items-start justify-between gap-5 mb-7">
          <div className="flex items-center gap-5">
            <div className={`
              relative w-18 h-18 rounded-4xl bg-gradient-to-br ${styles.iconBg} 
              flex items-center justify-center ${styles.glow} transition-all duration-300 hover:scale-110
              shadow-inner-glow backdrop-blur-sm group/icon
            `}>
              <div className="absolute inset-0 rounded-4xl bg-gradient-to-br from-white/30 to-white/5"></div>
              <div className="absolute inset-0 rounded-4xl bg-shimmer opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500"></div>
              <div className="text-white relative z-10 filter drop-shadow-lg">
                {styles.icon}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-premium-lg text-premium mb-2">{title}</h3>
              {description && (
                <p className="text-base font-medium text-secondary leading-relaxed">{description}</p>
              )}
            </div>
          </div>

          {badge && (
            <div className={`
              px-5 py-2.5 rounded-3xl glass-card text-sm font-bold tracking-wide transition-all duration-300
              backdrop-blur-xl shadow-soft hover:scale-105 transform-gpu
              ${badge === "Ready" 
                ? "bg-green-400/25 border-green-400/50 text-green-200 shadow-[0_0_12px_rgba(34,197,94,0.4)]" 
                : badge === "Cooling" 
                  ? "bg-blue-400/25 border-blue-400/50 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                  : badge === "Stake required"
                    ? "bg-red-400/25 border-red-400/50 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                    : "bg-white/15 border-white/25 text-white/95"
              }
            `}>
              {badge}
            </div>
          )}
        </div>

        {/* Enhanced Progress Bar */}
        {typeof progress === "number" && (
          <div className="mb-7">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-bold text-secondary">Progress</span>
              <span className="text-base font-bold text-premium">{progress}%</span>
            </div>
            <div className="relative h-4 w-full rounded-full bg-white/15 overflow-hidden shadow-inner backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-white/8 to-transparent rounded-full"></div>
              <div
                className={`
                  h-full bg-gradient-to-r ${styles.progress} transition-all duration-1000 ease-out 
                  shadow-lg relative overflow-hidden rounded-full
                `}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-shimmer animate-shimmer-slow"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Error Display */}
        {displayError && (
          <div className="mb-5 p-5 rounded-4xl glass-card bg-red-500/15 border-red-400/40 animate-slide-up backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <span className="text-red-400 text-xl">⚠️</span>
              <p className="text-base font-medium text-red-200 flex-1">{displayError}</p>
            </div>
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className="space-y-4">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={handleAction}
              disabled={actionDisabled || isLoading}
              className={`
                w-full py-5 rounded-4xl font-bold text-lg transition-all duration-300 shadow-elevated
                btn-premium relative overflow-hidden group transform-gpu will-change-transform
                ${actionDisabled || isLoading
                  ? "bg-white/15 text-white/50 cursor-not-allowed"
                  : `bg-gradient-to-r ${styles.button} text-black hover:scale-[1.02] ${styles.glow} hover:shadow-floating`
                }
              `}
            >
              {!actionDisabled && !isLoading && (
                <div className="absolute inset-0 bg-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-4xl"></div>
              )}
              
              <span className="relative z-10">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  actionLabel
                )}
              </span>
            </button>
          )}
          
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={handleSecondaryAction}
              disabled={secondaryActionDisabled || secondaryLoading}
              className={`
                w-full py-4 rounded-4xl glass-card text-base font-bold transition-all duration-300
                btn-premium relative overflow-hidden group backdrop-blur-xl transform-gpu will-change-transform
                ${secondaryActionDisabled || secondaryLoading
                  ? "border-white/25 text-white/50 cursor-not-allowed"
                  : "border-white/40 text-premium hover:bg-white/15 hover:border-white/50 hover:scale-[1.02] shadow-soft hover:shadow-elevated"
                }
              `}
            >
              {!secondaryActionDisabled && !secondaryLoading && (
                <div className="absolute inset-0 bg-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-4xl"></div>
              )}
              
              <span className="relative z-10">
                {secondaryLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21C5,22.11 5.89,23 7,23H17C18.11,23 19,22.11 19,21V3C19,1.89 18.11,1 17,1Z"/>
                    </svg>
                    {secondaryActionLabel}
                  </div>
                )}
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
