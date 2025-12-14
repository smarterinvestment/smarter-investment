// ============================================
// 🧩 UI COMPONENTS - COMPREHENSIVE LIBRARY
// ============================================
import React, { forwardRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useStore, getThemeColors } from '../../stores/useStore';

// ========================================
// BUTTON
// ========================================
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const theme = useStore((state) => state.theme);
    const colors = getThemeColors(theme);

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return {
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            color: 'white',
            boxShadow: `0 0 20px ${colors.primary}60, 0 4px 15px rgba(0, 0, 0, 0.3)`,
          };
        case 'secondary':
          return {
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          };
        case 'danger':
          return {
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          };
        case 'ghost':
          return {
            background: 'transparent',
            color: 'rgba(255, 255, 255, 0.7)',
          };
        case 'outline':
          return {
            background: 'transparent',
            color: colors.primary,
            border: `2px solid ${colors.primary}`,
          };
        default:
          return {};
      }
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold rounded-xl',
          'transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          'hover:scale-105 active:scale-95',
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        style={{ ...getVariantStyles(), ...style }}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ========================================
// CARD - THEME AWARE WITH NEON EFFECTS
// ========================================
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  neon?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = true,
  padding = 'md',
  onClick,
  neon = true,
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'card relative rounded-2xl backdrop-blur-lg overflow-hidden',
        'transition-all duration-300',
        paddings[padding],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// ========================================
// MODAL
// ========================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
}) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'card relative w-full rounded-2xl max-h-[90vh] overflow-auto',
              sizes[size]
            )}
          >
            {/* Header */}
            {(title || showClose) && (
              <div 
                className="flex items-center justify-between p-6"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                {title && (
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                )}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ========================================
// STAT CARD
// ========================================
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: number;
  changeLabel?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  changeLabel,
  className,
}) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-white/60 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-xs font-semibold',
                  isPositive ? 'text-success-400' : 'text-danger-400'
                )}
              >
                {isPositive ? '+' : ''}{change.toFixed(1)}%
              </span>
              {changeLabel && (
                <span className="text-xs text-white/40">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-primary-500/20 text-primary-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

// ========================================
// INPUT
// ========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-semibold text-white/90">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 rounded-xl',
              'bg-dark-700/60 border-2 border-white/10',
              'text-white placeholder-white/40',
              'transition-all duration-300',
              'focus:border-primary-500 focus:ring-0',
              'focus:shadow-[0_0_0_3px_rgba(5,191,219,0.2)]',
              error && 'border-danger-500 focus:border-danger-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-danger-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ========================================
// SELECT
// ========================================
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-semibold text-white/90">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl appearance-none cursor-pointer',
            'bg-dark-700/60 border-2 border-white/10',
            'text-white',
            'transition-all duration-300',
            'focus:border-primary-500 focus:ring-0',
            'focus:shadow-[0_0_0_3px_rgba(5,191,219,0.2)]',
            error && 'border-danger-500',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-danger-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ========================================
// EMPTY STATE
// ========================================
interface EmptyStateProps {
  icon?: string | ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="text-6xl mb-4 opacity-50">
          {typeof icon === 'string' ? icon : icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-white/80 mb-2">{title}</h3>
      {description && (
        <p className="text-white/50 max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  );
};

// ========================================
// LOADING SPINNER
// ========================================
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin',
          sizes[size]
        )}
      />
    </div>
  );
};

// ========================================
// SKELETON
// ========================================
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
}) => {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={cn(
        'bg-white/10 animate-pulse',
        variants[variant],
        className
      )}
      style={{ width, height: height || (variant === 'text' ? '1rem' : undefined) }}
    />
  );
};

// ========================================
// BADGE
// ========================================
interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
}) => {
  const variants = {
    default: 'bg-white/10 text-white/70',
    success: 'bg-success-500/20 text-success-400',
    warning: 'bg-warning-500/20 text-warning-400',
    danger: 'bg-danger-500/20 text-danger-400',
    primary: 'bg-primary-500/20 text-primary-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full',
        variants[variant],
        sizes[size]
      )}
    >
      {children}
    </span>
  );
};

// ========================================
// PROGRESS BAR - THEME AWARE
// ========================================
interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  className,
  color,
}) => {
  const theme = useStore((state) => state.theme);
  const themeColors = getThemeColors(theme);
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getVariant = () => {
    if (variant !== 'default') return variant;
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  const getColor = () => {
    if (color) return color;
    const v = getVariant();
    switch (v) {
      case 'success': return '#22C55E';
      case 'warning': return '#F59E0B';
      case 'danger': return '#EF4444';
      case 'primary':
      default: return themeColors.primary;
    }
  };

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const finalColor = getColor();

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm">
          <span className="text-white/60">{isNaN(value) ? '0' : value.toFixed(0)}</span>
          <span className="text-white/40">{max}</span>
        </div>
      )}
      <div className={cn('w-full bg-white/10 rounded-full overflow-hidden', heights[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${isNaN(percentage) ? 0 : percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn('h-full rounded-full')}
          style={{ 
            background: `linear-gradient(90deg, ${finalColor}, ${finalColor}dd)`,
            boxShadow: `0 0 10px ${finalColor}60`
          }}
        />
      </div>
    </div>
  );
};

// ========================================
// TABS
// ========================================
interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div className={cn('flex gap-1 p-1 bg-white/5 rounded-xl', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            activeTab === tab.id
              ? 'bg-primary-500/20 text-primary-400'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// ========================================
// AVATAR
// ========================================
interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn(
          'rounded-full object-cover bg-primary-500/20',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full',
        'bg-gradient-to-br from-primary-500 to-secondary-500',
        'font-bold text-white',
        sizes[size],
        className
      )}
    >
      {initials || '?'}
    </div>
  );
};

// ========================================
// SWITCH
// ========================================
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled = false, className }) => {
  const theme = useStore((state) => state.theme);
  const colors = getThemeColors(theme);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        checked ? 'bg-primary-500' : 'bg-white/20',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={checked ? { backgroundColor: colors.primary } : undefined}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0',
          'transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
};

// Export all
export default {
  Button,
  Card,
  Modal,
  StatCard,
  Input,
  Select,
  EmptyState,
  LoadingSpinner,
  Skeleton,
  Badge,
  ProgressBar,
  Tabs,
  Avatar,
  Switch,
};
