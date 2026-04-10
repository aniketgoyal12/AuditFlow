import { useEffect, useEffectEvent, useMemo, useState } from 'react';
import { motion } from '../../lib/motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Activity, Users, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import PageSkeleton from '../../components/common/PageSkeleton';
import { api } from '../../lib/api';
import { formatRelativeTime } from '../../lib/formatters';
import { useAuth } from '../../hooks/useAuth';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useEffectEvent(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.getDashboard(token);
      setDashboard(response.data);
      setError('');
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    void loadDashboard();
  }, [token]);

  const quickActions = [
    {
      label: 'Create New Note',
      icon: <FileText className="w-5 h-5" />,
      variant: 'primary',
      onClick: () => navigate('/notepad'),
    },
    {
      label: 'View Audit Logs',
      icon: <Activity className="w-5 h-5" />,
      variant: 'outline',
      onClick: () => navigate('/audit-logs'),
    },
  ];

  const getActionBadge = (type) => {
    const badges = {
      edit: { variant: 'info', label: 'Edit' },
      comment: { variant: 'success', label: 'Comment' },
      permission: { variant: 'warning', label: 'Permission' },
      create: { variant: 'primary', label: 'Create' },
      view: { variant: 'default', label: 'View' },
    };
    return badges[type] || badges.view;
  };

  const stats = useMemo(() => {
    const statIcons = [FileText, Activity, Users];

    return (
      dashboard?.stats?.map((stat, index) => {
        const Icon = statIcons[index];

        return {
          ...stat,
          icon: Icon ? <Icon className="w-6 h-6" /> : null,
        };
      }) || []
    );
  }, [dashboard?.stats]);

  if (isLoading) {
    return <PageSkeleton variant="workspace" />;
  }

  if (error) {
    return <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-error-700">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold font-display text-neutral-900">
            Welcome back, {dashboard?.userName}
          </h1>
        </div>
        <p className="text-lg text-neutral-600">
          Here's what's happening in your workspace today
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card variant="glass" padding="default" className="gradient-mesh">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold font-display text-neutral-900 mb-1">
                Quick Actions
              </h2>
              <p className="text-sm text-neutral-600">
                Get started with common tasks
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <motion.div key={action.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant={action.variant} leftIcon={action.icon} onClick={action.onClick}>
                    {action.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card
            title="Recent Activity"
            subtitle="Latest updates from your team"
            action={
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/audit-logs')}
              >
                View All
              </Button>
            }
          >
            <div className="space-y-4">
              {dashboard?.recentActivity?.length ? dashboard.recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-4 pb-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 p-3 rounded-xl transition-colors"
                >
                  <Avatar name={activity.user.name} size="md" variant="gradient" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900">
                      <span className="font-semibold">{activity.user.name}</span>{' '}
                      {activity.action}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span className="text-xs text-neutral-500">{formatRelativeTime(activity.time)}</span>
                      <Badge variant={getActionBadge(activity.type).variant} size="sm">
                        {getActionBadge(activity.type).label}
                      </Badge>
                    </div>
                  </div>

                  <Badge variant="default" size="sm">
                    {activity.tag}
                  </Badge>
                </motion.div>
              )) : <p className="text-sm text-neutral-500">No recent activity yet.</p>}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <Card variant="gradient" padding="lg" hover={false}>
            <div className="text-center space-y-4">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <TrendingUp className="w-12 h-12 mx-auto text-white" />
              </motion.div>
              <div>
                <h3 className="text-3xl font-bold font-display text-white mb-2">
                  +{dashboard?.insights?.activityIncrease || 0}%
                </h3>
                <p className="text-white/80 text-sm">
                  Activity increase this week
                </p>
              </div>
            </div>
          </Card>

          <Card title="Team Performance" padding="default">
            <div className="space-y-4">
              {[
                ['Audit Completion', dashboard?.insights?.teamPerformance?.auditCompletion || 0, 'gradient-primary'],
                ['Documentation', dashboard?.insights?.teamPerformance?.documentation || 0, 'bg-success-500'],
                ['Collaboration', dashboard?.insights?.teamPerformance?.collaboration || 0, 'gradient-accent'],
              ].map(([label, value, className], index) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-600">{label}</span>
                    <span className="font-semibold text-neutral-900">{value}%</span>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.2 }}
                      className={`h-full ${className}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
