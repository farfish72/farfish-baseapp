import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  animated?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'outline',
      size = 'md',
      loading = false,
      animated = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variantClasses = {
      outline:
        'bg-[#181a20] border-2 border-[#00d4c4] text-white hover:bg-[#20232b] hover:shadow-[0_0_20px_rgba(0,212,196,0.3)]',
      primary:
        'bg-[#00d4c4] border-2 border-[#00d4c4] text-black hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,196,0.3)]',
      secondary:
        'bg-[#20232b] border-2 border-[#848e9c] text-white hover:bg-[#20232b] hover:border-white/50',
      danger:
        'bg-red-500 border-2 border-red-500 text-white hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,196,0.3)]',
      ghost:
        'bg-transparent border-2 border-transparent text-white/70 hover:text-white hover:bg-white/5',
    };

    // Size styles
    const sizeClasses = {
      sm: 'py-2 px-3 text-xs',
      md: 'py-3 px-4 text-sm',
      lg: 'py-4 px-6 text-base',
    };

    // Base classes
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-ink disabled:opacity-50 disabled:cursor-not-allowed';

    // Animated hover effect
    const animatedClasses = animated ? 'hover:-translate-y-px' : '';

    // Combine all classes
    const finalClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${animatedClasses} ${className}`;

    return (
      <button
        ref={ref}
        className={finalClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="border-2 border-current border-t-transparent rounded-full animate-spin inline-block w-4 h-4 mr-2" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;
