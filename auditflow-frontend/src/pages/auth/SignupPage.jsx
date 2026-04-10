import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from '../../lib/motion';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Shield,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setSession({ ...response.data, rememberMe: true });
      setIsSuccess(true);
      setTimeout(
        () => navigate(response.data.user.role === 'Admin' ? '/admin' : '/dashboard'),
        2000
      );
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const floatingShapes = [
    { size: 100, delay: 0, duration: 20, x: '10%', y: '10%' },
    { size: 150, delay: 2, duration: 25, x: '80%', y: '20%' },
    { size: 80, delay: 4, duration: 22, x: '15%', y: '80%' },
    { size: 120, delay: 1, duration: 23, x: '85%', y: '75%' },
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="absolute inset-0 gradient-mesh opacity-40" />

        {floatingShapes.map((shape, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-primary-500/10 backdrop-blur-xl"
            style={{
              width: shape.size,
              height: shape.size,
              left: shape.x,
              top: shape.y,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              delay: shape.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg space-y-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-display text-gradient">AuditFlow</h1>
                <p className="text-sm text-neutral-600">Enterprise Edition</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <h2 className="text-5xl font-bold font-display text-neutral-900 leading-tight">
              Secure Your
              <br />
              <span className="text-gradient">Organization</span>
            </h2>
            <p className="text-xl text-neutral-600 leading-relaxed">
              Join teams that are scaling their compliance and auditing operations with a
              hardened workspace.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            {[
              { icon: CheckCircle2, text: 'Instant setup in less than 2 minutes' },
              { icon: Sparkles, text: 'Live audit visibility for every action' },
              { icon: Shield, text: 'Security-first controls and access policies' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-soft flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-lg text-neutral-700 font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-3xl p-8 sm:p-10 shadow-large">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-neutral-900">Welcome Aboard!</h2>
                <p className="text-neutral-600">
                  Your account has been created successfully. Redirecting to your dashboard...
                </p>
              </motion.div>
            ) : (
              <>
                <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-md">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold font-display text-gradient">AuditFlow</h1>
                </div>

                <div className="text-center mb-8">
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-bold font-display text-neutral-900 mb-2"
                  >
                    Create account
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-neutral-600"
                  >
                    Create your secure workspace and start documenting with confidence.
                  </motion.p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
                      {error}
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Input
                      name="name"
                      label="Full Name"
                      placeholder="Aniket Goyal"
                      value={formData.name}
                      onChange={handleChange}
                      leftIcon={<User className="w-5 h-5" />}
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Input
                      name="email"
                      type="email"
                      label="Work Email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      leftIcon={<Mail className="w-5 h-5" />}
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <Input
                      name="password"
                      type="password"
                      label="Password"
                      placeholder="Strong password"
                      value={formData.password}
                      onChange={handleChange}
                      helperText="Use 8+ characters with uppercase, lowercase, and a number."
                      leftIcon={<Lock className="w-5 h-5" />}
                      required
                    />
                    <Input
                      name="confirmPassword"
                      type="password"
                      label="Confirm"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      leftIcon={<Lock className="w-5 h-5" />}
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="pt-2"
                  >
                    <p className="text-[11px] text-neutral-500 mb-4 px-1">
                      By signing up, you agree to our{' '}
                      <span className="text-primary-600 cursor-pointer">Terms of Service</span> and{' '}
                      <span className="text-primary-600 cursor-pointer">Privacy Policy</span>.
                    </p>
                    <Button
                      type="submit"
                      variant="gradient"
                      size="lg"
                      className="w-full"
                      loading={isLoading}
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Get Started
                    </Button>
                  </motion.div>
                </form>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-center text-sm text-neutral-600 mt-8"
                >
                  Already have an account?{' '}
                  <Link to="/" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Sign in here
                  </Link>
                </motion.p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
