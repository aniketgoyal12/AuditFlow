import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Download,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  LogOut,
  Settings,
  Shield,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Zap,
  Database,
  Server,
  AlertCircle,
  UserPlus,
  Mail,
  Ban,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  UserCheck,
  Globe,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [activitySearch, setActivitySearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const navigate = useNavigate();

  const overviewStats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Active users this month',
      subtext: '+42 new today'
    },
    {
      title: 'Total Notes',
      value: '18,392',
      change: '+8.2%',
      trend: 'up',
      icon: <FileText className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-500',
      description: 'Documents created',
      subtext: '234 created today'
    },
    {
      title: 'Total Views',
      value: '124,583',
      change: '+23.1%',
      trend: 'up',
      icon: <Eye className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-500',
      description: 'Page views this week',
      subtext: '18K views today'
    },
    {
      title: 'Audit Events',
      value: '45,291',
      change: '-3.2%',
      trend: 'down',
      icon: <Activity className="w-6 h-6" />,
      gradient: 'from-orange-500 to-red-500',
      description: 'Logged activities',
      subtext: '1.2K events today'
    },
  ];

  const notifications = [
    { id: 1, type: 'warning', message: 'High CPU usage detected (87%)', time: '2 min ago', unread: true },
    { id: 2, type: 'info', message: 'New user registration: John Doe', time: '15 min ago', unread: true },
    { id: 3, type: 'success', message: 'Backup completed successfully', time: '1 hour ago', unread: false },
    { id: 4, type: 'error', message: '3 failed login attempts detected', time: '2 hours ago', unread: true },
  ];

  const users = [
    {
      id: 1,
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      role: 'Admin',
      status: 'active',
      notes: 234,
      lastActive: '2 min ago',
      joined: '2023-01-15',
      location: 'New York, US',
      avatar: null
    },
    {
      id: 2,
      name: 'Maria Garcia',
      email: 'maria@company.com',
      role: 'Editor',
      status: 'active',
      notes: 187,
      lastActive: '5 min ago',
      joined: '2023-03-22',
      location: 'Madrid, Spain',
      avatar: null
    },
    {
      id: 3,
      name: 'James Wilson',
      email: 'james@company.com',
      role: 'Editor',
      status: 'inactive',
      notes: 156,
      lastActive: '2 days ago',
      joined: '2023-02-10',
      location: 'London, UK',
      avatar: null
    },
    {
      id: 4,
      name: 'Alex Thompson',
      email: 'alex@company.com',
      role: 'User',
      status: 'active',
      notes: 142,
      lastActive: '1 hour ago',
      joined: '2023-04-05',
      location: 'Toronto, Canada',
      avatar: null
    },
    {
      id: 5,
      name: 'Emma Davis',
      email: 'emma@company.com',
      role: 'User',
      status: 'suspended',
      notes: 128,
      lastActive: '1 week ago',
      joined: '2023-05-12',
      location: 'Sydney, Australia',
      avatar: null
    },
  ];

  const activityData = [
    { day: 'Mon', users: 320, notes: 145, edits: 89 },
    { day: 'Tue', users: 385, notes: 167, edits: 102 },
    { day: 'Wed', users: 412, notes: 189, edits: 115 },
    { day: 'Thu', users: 445, notes: 201, edits: 128 },
    { day: 'Fri', users: 398, notes: 176, edits: 94 },
    { day: 'Sat', users: 289, notes: 124, edits: 67 },
    { day: 'Sun', users: 267, notes: 98, edits: 52 },
  ];

  const recentActivities = [
    {
      id: 1,
      user: 'Sarah Chen',
      action: 'created',
      target: 'Q4 Compliance Report',
      time: '5 minutes ago',
      type: 'create',
      ip: '192.168.1.1'
    },
    {
      id: 2,
      user: 'Maria Garcia',
      action: 'edited',
      target: 'Security Guidelines',
      time: '12 minutes ago',
      type: 'edit',
      ip: '192.168.1.2'
    },
    {
      id: 3,
      user: 'James Wilson',
      action: 'commented on',
      target: 'API Documentation',
      time: '23 minutes ago',
      type: 'comment',
      ip: '192.168.1.3'
    },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      active: { variant: 'success', label: 'Active', icon: <CheckCircle className="w-3 h-3" /> },
      inactive: { variant: 'default', label: 'Inactive', icon: <XCircle className="w-3 h-3" /> },
      suspended: { variant: 'danger', label: 'Suspended', icon: <Ban className="w-3 h-3" /> },
    };
    return badges[status] || badges.active;
  };

  const UserDetailsModal = () => (
    <AnimatePresence>
      {showUserModal && selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowUserModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name={selectedUser.name} size="xl" variant="gradient" />
                  <div>
                    <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                    <p className="text-indigo-100">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedUser.notes}</p>
                  <p className="text-xs text-gray-600">Notes</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedUser.joined}</p>
                  <p className="text-xs text-gray-600">Joined</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <Activity className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedUser.lastActive}</p>
                  <p className="text-xs text-gray-600">Last Active</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Role</label>
                  <div className="mt-1">
                    <Badge variant="primary" size="md">{selectedUser.role}</Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusBadge(selectedUser.status).variant} size="md" className="flex items-center gap-2 w-fit">
                      {getStatusBadge(selectedUser.status).icon}
                      {getStatusBadge(selectedUser.status).label}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Location</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{selectedUser.location}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
                  Edit User
                </Button>
                <Button variant="outline" size="sm" leftIcon={<Mail className="w-4 h-4" />}>
                  Send Email
                </Button>
                {selectedUser.status !== 'suspended' && (
                  <Button variant="danger" size="sm" leftIcon={<Ban className="w-4 h-4" />}>
                    Suspend
                  </Button>
                )}
                {selectedUser.status === 'suspended' && (
                  <Button variant="success" size="sm" leftIcon={<UserCheck className="w-4 h-4" />}>
                    Activate
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Top Navigation */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Branding */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs text-gray-500">Platform Analytics</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="hidden lg:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users, documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-80 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white text-sm"
                />
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white text-sm font-medium"
              >
                <option value="24hours">Last 24 Hours</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>

              <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                Export
              </Button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-20"
                      >
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="font-bold text-gray-900">Notifications</h3>
                          <p className="text-xs text-gray-500">You have {notifications.filter(n => n.unread).length} unread messages</p>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${notif.unread ? 'bg-blue-50/50' : ''
                                }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${notif.type === 'error' ? 'bg-red-500' :
                                    notif.type === 'warning' ? 'bg-yellow-500' :
                                      notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                  }`}></div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900">{notif.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 border-t border-gray-200 text-center">
                          <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                            View all notifications
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Avatar name="Admin User" size="md" variant="gradient" />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-20"
                      >
                        <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">Admin User</p>
                          <p className="text-xs text-gray-600">admin@auditflow.com</p>
                          <Badge variant="primary" size="sm" className="mt-2">Administrator</Badge>
                        </div>
                        <button
                          onClick={() => navigate('/settings')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <button
                          onClick={() => navigate('/')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {['overview', 'users', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === tab
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-gray-600 hover:bg-white/50'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {overviewStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-16 -mt-16`}></div>

                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <div className="text-white">{stat.icon}</div>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${stat.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}>
                          {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span className="text-sm font-bold">{stat.change}</span>
                        </div>
                      </div>
                      <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                      <p className="text-sm font-semibold text-gray-700 mb-1">{stat.title}</p>
                      <p className="text-xs text-gray-500">{stat.subtext}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card title="Weekly Activity" subtitle="User engagement trends">
                <div className="space-y-4">
                  <div className="flex gap-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">Notes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Edits</span>
                    </div>
                  </div>

                  {activityData.map((day, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold w-16">{day.day}</span>
                        <div className="flex gap-6 text-xs text-gray-500">
                          <span className="font-medium">{day.users}</span>
                          <span className="font-medium">{day.notes}</span>
                          <span className="font-medium">{day.edits}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-10 bg-gray-50 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.users / 500) * 100}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                          className="bg-gradient-to-r from-blue-500 to-blue-400"
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.notes / 500) * 100}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                          className="bg-gradient-to-r from-purple-500 to-purple-400"
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.edits / 500) * 100}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                          className="bg-gradient-to-r from-green-500 to-green-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Recent Activity" subtitle="Latest user actions">
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                      <Avatar name={activity.user} size="md" variant="gradient" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-1">
                          <span className="font-semibold">{activity.user}</span>{' '}
                          <span className="text-gray-600">{activity.action}</span>{' '}
                          <span className="font-medium text-indigo-600">{activity.target}</span>
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{activity.time}</span>
                          <span>•</span>
                          <Globe className="w-3 h-3" />
                          <span>{activity.ip}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-600">Manage all platform users</p>
              </div>
              <Button variant="primary" leftIcon={<UserPlus className="w-5 h-5" />}>
                Add User
              </Button>
            </div>

            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Notes</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Last Active</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} size="md" variant="gradient" />
                            <div>
                              <p className="font-semibold text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="default" size="sm">{user.role}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusBadge(user.status).variant} size="sm" className="flex items-center gap-1 w-fit">
                            {getStatusBadge(user.status).icon}
                            {getStatusBadge(user.status).label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">{user.notes}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{user.lastActive}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
                <p className="text-gray-600">Complete activity tracking and compliance monitoring</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Live</span>
                  <RefreshCw className="w-4 h-4 text-gray-600 animate-spin" />
                </div>
                <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                  Export Logs
                </Button>
              </div>
            </div>

            {/* Security Alert */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900">Security Alert</p>
                    <p className="text-sm text-red-700">3 failed login attempts detected in the last hour</p>
                  </div>
                </div>
                <Button variant="danger" size="sm" leftIcon={<Shield className="w-4 h-4" />}>
                  Review Alerts
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card padding="lg" hover={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Logs</p>
                    <p className="text-3xl font-bold text-gray-900">45,291</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card padding="lg" hover={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Today</p>
                    <p className="text-3xl font-bold text-gray-900">1,247</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card padding="lg" hover={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Failed</p>
                    <p className="text-3xl font-bold text-red-600">23</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </Card>

              <Card padding="lg" hover={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                    <p className="text-3xl font-bold text-green-600">98%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Card padding="default">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>

                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white"
                >
                  <option>All Actions</option>
                  <option>Create</option>
                  <option>Edit</option>
                  <option>Delete</option>
                  <option>View</option>
                  <option>Share</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white"
                >
                  <option>All Status</option>
                  <option>Success</option>
                  <option>Failed</option>
                </select>

                <select className="px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white">
                  <option>Last 7 Days</option>
                  <option>Last 24 Hours</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </div>
            </Card>

            {/* Audit Logs Table */}
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Timestamp</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Target</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">IP Address</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      {
                        time: '2024-02-15 14:23:45',
                        user: 'Sarah Chen',
                        action: 'create',
                        actionLabel: 'Created',
                        target: 'Q4 Compliance Report.docx',
                        status: 'success',
                        ip: '192.168.1.101',
                        location: 'New York, USA'
                      },
                      {
                        time: '2024-02-15 14:18:32',
                        user: 'Maria Garcia',
                        action: 'edit',
                        actionLabel: 'Edited',
                        target: 'Security Policy v2.docx',
                        status: 'success',
                        ip: '192.168.1.102',
                        location: 'Madrid, Spain'
                      },
                      {
                        time: '2024-02-15 14:05:18',
                        user: 'Unknown User',
                        action: 'login',
                        actionLabel: 'Login Failed',
                        target: 'Authentication System',
                        status: 'failed',
                        ip: '45.123.67.89',
                        location: 'Unknown'
                      },
                      {
                        time: '2024-02-15 13:54:22',
                        user: 'James Wilson',
                        action: 'delete',
                        actionLabel: 'Deleted',
                        target: 'Old Training Materials.pdf',
                        status: 'success',
                        ip: '192.168.1.103',
                        location: 'London, UK'
                      },
                      {
                        time: '2024-02-15 13:42:10',
                        user: 'Alex Thompson',
                        action: 'share',
                        actionLabel: 'Shared',
                        target: 'Budget Planning 2024.xlsx',
                        status: 'success',
                        ip: '192.168.1.104',
                        location: 'Toronto, Canada'
                      },
                      {
                        time: '2024-02-15 13:28:45',
                        user: 'Emma Davis',
                        action: 'view',
                        actionLabel: 'Viewed',
                        target: 'Employee Handbook.pdf',
                        status: 'success',
                        ip: '192.168.1.105',
                        location: 'Sydney, Australia'
                      },
                      {
                        time: '2024-02-15 13:15:33',
                        user: 'Admin User',
                        action: 'permission',
                        actionLabel: 'Permission Changed',
                        target: 'Sarah Chen - Role Updated',
                        status: 'success',
                        ip: '192.168.1.1',
                        location: 'New York, USA'
                      },
                      {
                        time: '2024-02-15 12:58:20',
                        user: 'System',
                        action: 'backup',
                        actionLabel: 'Backup',
                        target: 'Database Backup Completed',
                        status: 'success',
                        ip: '127.0.0.1',
                        location: 'Server Internal'
                      },
                      {
                        time: '2024-02-15 12:45:15',
                        user: 'Sarah Chen',
                        action: 'edit',
                        actionLabel: 'Edited',
                        target: 'API Documentation v3.docx',
                        status: 'success',
                        ip: '192.168.1.101',
                        location: 'New York, USA'
                      },
                      {
                        time: '2024-02-15 12:32:08',
                        user: 'Unknown User',
                        action: 'login',
                        actionLabel: 'Login Failed',
                        target: 'Authentication System',
                        status: 'failed',
                        ip: '45.123.67.89',
                        location: 'Unknown'
                      }
                    ].filter(log => {
                      const matchesSearch =
                        log.user.toLowerCase().includes(activitySearch.toLowerCase()) ||
                        log.target.toLowerCase().includes(activitySearch.toLowerCase()) ||
                        log.actionLabel.toLowerCase().includes(activitySearch.toLowerCase());

                      const matchesAction = actionFilter === 'All Actions' ||
                        log.actionLabel.toLowerCase().includes(actionFilter.toLowerCase()) ||
                        log.action === actionFilter.toLowerCase();

                      const matchesStatus = statusFilter === 'All Status' ||
                        log.status === statusFilter.toLowerCase();

                      return matchesSearch && matchesAction && matchesStatus;
                    }).map((log, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-mono text-gray-900">{log.time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar name={log.user} size="sm" variant="gradient" />
                            <span className="text-sm font-medium text-gray-900">{log.user}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              log.action === 'create' ? 'success' :
                                log.action === 'edit' ? 'info' :
                                  log.action === 'delete' ? 'danger' :
                                    log.action === 'share' ? 'primary' :
                                      log.action === 'login' ? 'warning' :
                                        'default'
                            }
                            size="sm"
                          >
                            {log.actionLabel}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{log.target}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={log.status === 'success' ? 'success' : 'danger'}
                            size="sm"
                            className="flex items-center gap-1 w-fit"
                          >
                            {log.status === 'success' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {log.status === 'success' ? 'Success' : 'Failed'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-600">{log.ip}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{log.location}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium">1-10</span> of <span className="font-medium">45,291</span> logs
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <UserDetailsModal />
    </div>
  );
};

export default AdminDashboard;