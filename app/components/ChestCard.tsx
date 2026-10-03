// app/components/ChestCard.tsx
import { useState, useEffect } from 'react';
import { Warning } from '@phosphor-icons/react';

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
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,5V19H5V5H19M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14Z"/>
      </svg>
    )
  },
  silver: {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5,3A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3H5M5,5H19V19H5V5M7.5,8A1.5,1.5 0 0,0 6,9.5A1.5,1.5 0 0,0 7.5,11A1.5,1.5 0 0,0 9,9.5A1.5,1.5 0 0,0 7.5,8M16.5,8A1.5,1.5 0 0,0 15,9.5A1.5,1.5 0 0,0 16.5,11A1.5,1.5 0 0,0 18,9.5A1.5,1.5 0 0,0 16.5,8M12,13A1.5,1.5 0 0,0 10.5,14.5A1.5,1.5 0 0,0 12,16A1.5,1.5 0 0,0 13.5,14.5A1.5,1.5 0 0,0 12,13Z"/>
      </svg>
    )
  },
  default: {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,17V16H9V14H13V13H10A1,1 0 0,1 9,12V9A1,1 0 0,1 10,8H14V9H16V11H12V12H15A1,1 0 0,1 16,13V16A1,1 0 0,1 15,17H11Z"/>
      </svg>
    )
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
      setLocalError('Action failed. Please try again.');
      console.error('ChestCard action error:', error);
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
      setLocalError('Action failed. Please try again.');
      console.error('ChestCard secondary action error:', error);
    } finally {
      setSecondaryLoading(false);
    }
  };

  const displayError = error || localError;

  useEffect(() => {
    return () => {
      setIsLoading(false);
      setSecondaryLoading(false);
      setLocalError(null);
    };
  }, []);

  useEffect(() => {
    if (isLoading || secondaryLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setSecondaryLoading(false);
        setLocalError('Operation timed out. Please try again.');
      }, 30000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading, secondaryLoading]);

  return (
    <article className="glass-card rounded-3xl p-6 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-primary flex-shrink-0" style={{ background: '#181a20', border: '2px solid #000000' }}>
            <div className="text-white">
              {styles.icon}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="premium-heading text-lg text-text-primary">{title}</h3>
            {description && (
              <p className="premium-caption text-text-secondary mt-1">{description}</p>
            )}
          </div>
        </div>
        {/* Badge */}
        {badge && (
          <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ${
            badge === "Ready" 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : badge === "Cooling" 
                ? "bg-white/10 text-white/60 border border-white/20"
                : badge === "Stake required"
                  ? "bg-white/5 text-white/50 border border-white/10"
                  : badge === "Coming Soon"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-white/10 text-white/60 border border-white/20"
          }`}>
            {badge}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {typeof progress === "number" && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="premium-caption text-text-secondary">Progress</span>
            <span className="premium-caption text-text-primary font-semibold">{progress}%</span>
          </div>
          <div className="premium-progress h-2">
            <div
              className="premium-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {displayError && (
        <div className="mb-6 outlined-card rounded-2xl p-4 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3">
            <Warning size={20} weight="duotone" color="#f87171" className="flex-shrink-0" />
            <p className="premium-caption text-red-300 flex-1">{displayError}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={handleAction}
            disabled={actionDisabled || isLoading}
            className={`w-full py-3 px-6 rounded-2xl font-semibold transition-all duration-300 ${
              actionDisabled || isLoading
                ? "bg-ink border-2 border-muted/30 text-muted cursor-not-allowed"
                : "bg-ink border-2 border-teal text-white hover:shadow-glow hover:bg-teal/10"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="premium-spinner w-4 h-4"></div>
                Processing...
              </div>
            ) : (
              actionLabel
            )}
          </button>
        )}
        
        {secondaryActionLabel && onSecondaryAction && (
          <button
            type="button"
            onClick={handleSecondaryAction}
            disabled={secondaryActionDisabled || secondaryLoading}
            className={`w-full py-3 px-6 rounded-2xl font-semibold transition-all duration-300 bg-ink border-2 border-white/30 text-white hover:bg-white/5 hover:border-white/50 ${
              secondaryActionDisabled || secondaryLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-white/5"
            }`}
          >
            {secondaryLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="premium-spinner w-4 h-4"></div>
                Loading...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21C5,22.11 5.89,23 7,23H17C18.11,23 19,22.11 19,21V3C19,1.89 18.11,1 17,1Z"/>
                </svg>
                {secondaryActionLabel}
              </div>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
