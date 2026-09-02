import React from 'react';

export interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'whatsapp' | 'ghost' | 'yellow';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  isLoading?: boolean;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  size = 'lg',
  icon,
  iconPosition = 'start',
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm font-semibold rounded-xl min-h-[40px]',
    md: 'py-3 px-5 text-base font-bold rounded-2xl min-h-[48px]',
    lg: 'py-3.5 px-6 text-lg font-bold rounded-2xl min-h-[56px]',
  };

  const variantClasses = {
    primary:
      'bg-brand-red text-white shadow-tactile-red hover:brightness-105 active:translate-y-1 active:shadow-none',
    secondary:
      'bg-white text-brand-red border-2 border-brand-red shadow-tactile-white hover:bg-brand-redSoft active:translate-y-1 active:shadow-none',
    whatsapp:
      'bg-brand-whatsapp text-white shadow-tactile-whatsapp hover:brightness-105 active:translate-y-1 active:shadow-none',
    yellow:
      'bg-brand-yellow text-brand-ink shadow-tactile-yellow hover:brightness-105 active:translate-y-1 active:shadow-none',
    ghost:
      'bg-transparent text-brand-ink hover:bg-brand-border/40 active:bg-brand-border/60',
  };

  const disabledClasses = disabled || isLoading
    ? 'opacity-50 cursor-not-allowed transform-none shadow-none pointer-events-none'
    : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2.5 font-alexandria
        transition-all duration-150 cursor-pointer select-none text-center
        ${fullWidth ? 'w-full' : ''}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabledClasses}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'start' && <span className="text-xl flex-shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'end' && <span className="text-xl flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
