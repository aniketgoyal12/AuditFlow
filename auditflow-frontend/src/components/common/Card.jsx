import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  title = null,
  subtitle = null,
  action = null,
  variant = 'default',
  className = '',
  hover = true,
  padding = 'default',
  ...props 
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300 relative overflow-hidden';
  
  const variants = {
    default: 'bg-white border border-neutral-200 shadow-soft z-0',
    glass: 'glass shadow-medium z-0',
    gradient: 'gradient-primary text-white shadow-lg z-0',
    bordered: 'bg-white border-2 border-gradient shadow-soft z-0',
    flat: 'bg-neutral-50 z-0',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClass = hover ? 'card-hover cursor-pointer' : '';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold font-display mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-500">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default Card;