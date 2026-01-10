// app/components/ChestCard.tsx
import { useState, useEffect } from 'react';

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
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    )
  },
  silver: {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    )
  },
  default: {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z M6,4H13V9H18V20H6V4Z"/>
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
      <div className="flex items-start gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-primary flex-shrink-0">
            <div className="text-black">
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
          <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
            badge === "Ready" 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : badge === "Cooling" 
                ? "bg-white/10 text-white/60 border border-white/20"
                : badge === "Stake required"
                  ? "bg-white/5 text-white/50 border border-white/10"
                  : badge === "Coming Soon"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
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
            <span className="text-red-400 text-lg flex-shrink-0">⚠️</span>
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
            className={`w-full py-3 px-6 rounded-2xl font-semibold focus-ring ${
              actionDisabled || isLoading
                ? "bg-neutral/20 text-neutral cursor-not-allowed"
                : "bg-gradient-primary text-black hover:shadow-lg"
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
            className={`outlined-card w-full py-3 px-6 rounded-2xl font-semibold text-text-primary focus-ring interactive-scale ${
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
