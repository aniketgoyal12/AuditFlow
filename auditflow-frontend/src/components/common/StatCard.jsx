import { memo } from 'react';
import { motion } from '../../lib/motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ 
  title,
  value,
  icon,
  trend = null, // { value: 12, direction: 'up' | 'down' | 'neutral' }
  description = null,
  variant = 'default',
  className = '',
}) => {
  const variants = {
    default: 'bg-white border border-neutral-200',
    gradient: 'gradient-primary text-white',
    glass: 'glass',
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    const iconClass = 'w-4 h-4';
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className={iconClass} />;
      case 'down':
        return <TrendingDown className={iconClass} />;
      default:
        return <Minus className={iconClass} />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up':
        return variant === 'gradient' ? 'text-white/80' : 'text-success-600';
      case 'down':
        return variant === 'gradient' ? 'text-white/80' : 'text-error-600';
      default:
        return variant === 'gradient' ? 'text-white/60' : 'text-neutral-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)' }}
      transition={{ duration: 0.2 }}
      className={`
        ${variants[variant]}
        rounded-2xl p-6 
        shadow-soft
        transition-all duration-300
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`text-sm font-medium ${variant === 'gradient' ? 'text-white/80' : 'text-neutral-500'} mb-1`}>
            {title}
          </p>
          <motion.p 
            className="text-3xl font-bold font-display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {value}
          </motion.p>
        </div>
        
        {icon && (
          <motion.div 
            className={`
              ${variant === 'gradient' ? 'bg-white/20' : 'bg-primary-50'} 
              p-3 rounded-xl
            `}
            whileHover={{ rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className={variant === 'gradient' ? 'text-white' : 'text-primary-600'}>
              {icon}
            </div>
          </motion.div>
        )}
      </div>

      {(trend || description) && (
        <div className="space-y-1">
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(trend.value)}%</span>
              <span className={`text-xs ${variant === 'gradient' ? 'text-white/60' : 'text-neutral-500'}`}>
                vs last period
              </span>
            </div>
          )}
          
          {description && (
            <p className={`text-xs ${variant === 'gradient' ? 'text-white/70' : 'text-neutral-500'}`}>
              {description}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

const MemoizedStatCard = memo(StatCard);
MemoizedStatCard.displayName = 'StatCard';

export default MemoizedStatCard;
