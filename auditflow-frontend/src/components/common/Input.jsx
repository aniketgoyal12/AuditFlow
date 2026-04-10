import { useState } from 'react';
import { motion, AnimatePresence } from '../../lib/motion';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

const Input = ({
  type = 'text',
  label = '',
  placeholder = '',
  value = '',
  onChange,
  error = '',
  success = '',
  helperText = '',
  leftIcon = null,
  rightIcon = null,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  const hasError = !!error;
  const hasSuccess = !!success;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {leftIcon}
          </div>
        )}

        <motion.input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-2.5 rounded-xl
            font-body text-base
            bg-white border-2
            transition-all duration-200
            placeholder:text-neutral-400
            disabled:bg-neutral-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || type === 'password' ? 'pr-10' : ''}
            ${hasError 
              ? 'border-error-500 focus:border-error-500 focus:ring-4 focus:ring-error-500/10' 
              : hasSuccess
                ? 'border-success-500 focus:border-success-500 focus:ring-4 focus:ring-success-500/10'
                : 'border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
            }
          `}
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.2 }}
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {rightIcon && type !== 'password' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {rightIcon}
          </div>
        )}

        {hasError && !rightIcon && type !== 'password' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error-500">
            <AlertCircle size={20} />
          </div>
        )}

        {hasSuccess && !rightIcon && type !== 'password' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success-500">
            <CheckCircle2 size={20} />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-error-500 flex items-center gap-1"
          >
            <AlertCircle size={14} />
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-success-500 flex items-center gap-1"
          >
            <CheckCircle2 size={14} />
            {success}
          </motion.p>
        )}
        {helperText && !error && !success && (
          <p className="text-sm text-neutral-500">{helperText}</p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
