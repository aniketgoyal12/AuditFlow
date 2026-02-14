import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const Avatar = ({ 
  name = 'User',
  src = null,
  size = 'md',
  status = null, // online, offline, busy, away
  showTooltip = false,
  variant = 'default',
  className = '',
  ...props 
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
    '2xl': 'w-20 h-20 text-3xl',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  };

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-neutral-400',
    busy: 'bg-error-500',
    away: 'bg-warning-500',
  };

  const variants = {
    default: 'bg-neutral-200 text-neutral-700',
    gradient: 'gradient-primary text-white',
    accent: 'gradient-accent text-white',
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative inline-block group">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`
          ${sizes[size]} 
          ${variants[variant]}
          rounded-full 
          flex items-center justify-center 
          font-semibold 
          overflow-hidden
          border-2 border-white
          shadow-md
          ${className}
        `}
        {...props}
      >
        {src ? (
          <img 
            src={src} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </motion.div>

      {status && (
        <span 
          className={`
            absolute bottom-0 right-0 
            ${statusSizes[size]} 
            ${statusColors[status]}
            rounded-full 
            border-2 border-white
            status-dot
          `}
        />
      )}

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900" />
        </div>
      )}
    </div>
  );
};

export default Avatar;