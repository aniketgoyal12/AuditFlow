import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Activity, Users, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';

const DashboardPage = () => {
  const navigate = useNavigate();
  const stats = [
    {
      title: 'My Notes',
      value: '12',
      icon: <FileText className="w-6 h-6" />,
      trend: { value: 8, direction: 'up' },
      description: 'Active documents',
    },
    {
      title: 'Audit Events',
      value: '248',
      icon: <Activity className="w-6 h-6" />,
      trend: { value: 15, direction: 'up' },
      description: 'Events you have access to',
    },
    {
      title: 'Collaborators',
      value: '8',
      icon: <Users className="w-6 h-6" />,
      trend: { value: 3, direction: 'neutral' },
      description: 'Active team members',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: { name: 'Sarah Chen', avatar: null },
      action: 'Updated Q4 compliance report',
      time: '2 hours ago',
      tag: 'Q4 Report',
      type: 'edit',
    },
    {
      id: 2,
      user: { name: 'Maria Garcia', avatar: null },
      action: 'Commented on compliance findings',
      time: '5 hours ago',
      tag: 'Q4 Report',
      type: 'comment',
    },
    {
      id: 3,
      user: { name: 'James Wilson', avatar: null },
      action: 'Invited Alex Thompson with Edit access',
      time: '1 day ago',
      tag: 'Security Training',
      type: 'permission',
    },
    {
      id: 4,
      user: { name: 'Sarah Chen', avatar: null },
      action: 'Created security training materials',
      time: '2 days ago',
      tag: 'Security Training',
      type: 'create',
    },
  ];

  const quickActions = [
    { 
      label: 'Create New Note', 
      icon: <FileText className="w-5 h-5" />, 
      variant: 'primary',
      onClick: () => navigate('/notepad')
    },
    { 
      label: 'View Audit Logs', 
      icon: <Activity className="w-5 h-5" />, 
      variant: 'outline',
      onClick: () => navigate('/audit-logs')
    },
    { 
      label: 'Manage Team', 
      icon: <Users className="w-5 h-5" />, 
      variant: 'ghost',
      onClick: () => navigate('/settings')
    },
  ];

  const getActionBadge = (type) => {
    const badges = {
      edit: { variant: 'info', label: 'Edit' },
      comment: { variant: 'success', label: 'Comment' },
      permission: { variant: 'warning', label: 'Permission' },
      create: { variant: 'primary', label: 'Create' },
    };
    return badges[type] || badges.edit;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold font-display text-neutral-900">
            Welcome back, Sarah
          </h1>
          <motion.span
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
            className="text-3xl"
          >
            👋
          </motion.span>
        </div>
        <p className="text-lg text-neutral-600">
          Here's what's happening in your workspace today
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card 
          variant="glass" 
          padding="default"
          className="gradient-mesh"
        >
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
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant={action.variant}
                    leftIcon={action.icon}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
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
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-4 pb-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 p-3 rounded-xl transition-colors"
                >
                  <Avatar 
                    name={activity.user.name} 
                    size="md"
                    variant="gradient"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900">
                      <span className="font-semibold">{activity.user.name}</span>{' '}
                      {activity.action}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span className="text-xs text-neutral-500">{activity.time}</span>
                      <Badge 
                        variant={getActionBadge(activity.type).variant}
                        size="sm"
                      >
                        {getActionBadge(activity.type).label}
                      </Badge>
                    </div>
                  </div>

                  <Badge variant="default" size="sm">
                    {activity.tag}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Insights Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <Card 
            variant="gradient"
            padding="lg"
            hover={false}
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <TrendingUp className="w-12 h-12 mx-auto text-white" />
              </motion.div>
              <div>
                <h3 className="text-3xl font-bold font-display text-white mb-2">
                  +24%
                </h3>
                <p className="text-white/80 text-sm">
                  Activity increase this week
                </p>
              </div>
            </div>
          </Card>

          <Card 
            title="Team Performance"
            padding="default"
          >
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Audit Completion</span>
                  <span className="font-semibold text-neutral-900">87%</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '87%' }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-full gradient-primary"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Documentation</span>
                  <span className="font-semibold text-neutral-900">92%</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 1, delay: 1 }}
                    className="h-full bg-success-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Collaboration</span>
                  <span className="font-semibold text-neutral-900">78%</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '78%' }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="h-full gradient-accent"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;