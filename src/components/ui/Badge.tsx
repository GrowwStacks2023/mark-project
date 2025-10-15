import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'gray';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', pulse = false, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary-100 text-primary-700',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-amber-100 text-amber-700',
      danger: 'bg-red-100 text-red-700',
      gray: 'bg-gray-100 text-gray-700',
    };

    const sizes = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-sm px-2.5 py-1',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
          variants[variant],
          sizes[size],
          pulse && 'animate-pulse',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
