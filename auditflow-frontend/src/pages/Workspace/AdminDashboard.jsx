import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from '../../lib/motion';
import {
  Users,
  FileText,
  Activity,
  Eye,
  Clock,
  Download,
  LogOut,
  Settings,
  Shield,
  Bell,
  Search,
  Ban,
  CheckCircle,
  XCircle,
  UserCheck,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import PageSkeleton from '../../components/common/PageSkeleton';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime, formatRelativeTime } from '../../lib/formatters';

const AdminDashboard = () => {
  const { token, clearSession, user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [adminData, setAdminData] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const loadAdmin = useCallback(async () => {
    try {
      setIsLoading(true);
      const [overviewResponse, usersResponse] = await Promise.all([
        api.getAdminOverview(token),
        api.getAdminUsers(token),
      ]);
      setAdminData(overviewResponse.data);
      setUsers(usersResponse.data);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadAdmin();
  }, [loadAdmin]);

  const handleLogout = async () => {
    clearSession();
    navigate('/');
  };

  const updateUserStatus = async (userId, status) => {
    try {
      await api.updateAdminUser(userId, { status }, token);
      await loadAdmin();
      setShowUserModal(false);
    } catch (apiError) {
      setError(apiError.message);
    }
  };

  const overviewStats = useMemo(() => (
    adminData ? [
      { title: 'Total Users', value: adminData.overviewStats.totalUsers, icon: <Users className="w-6 h-6" /> },
      { title: 'Total Notes', value: adminData.overviewStats.totalNotes, icon: <FileText className="w-6 h-6" /> },
      { title: 'Audit Events', value: adminData.overviewStats.totalAuditEvents, icon: <Activity className="w-6 h-6" /> },
      { title: 'Failed Events', value: adminData.overviewStats.failedEvents, icon: <XCircle className="w-6 h-6" /> },
    ] : []
  ), [adminData]);

  const filteredUsers = useMemo(
    () =>
      users.filter((entry) =>
        entry.name.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        entry.email.toLowerCase().includes(deferredSearchQuery.toLowerCase())
      ),
    [deferredSearchQuery, users]
  );

  const UserDetailsModal = () => (
    <AnimatePresence>
      {showUserModal && selectedUser && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUserModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name={selectedUser.name} size="xl" variant="gradient" />
                  <div>
                    <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                    <p className="text-indigo-100">{selectedUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedUser.notes}</p>
                  <p className="text-xs text-gray-600">Notes</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-900">{formatDateTime(selectedUser.joined)}</p>
                  <p className="text-xs text-gray-600">Joined</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <Activity className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-900">{formatRelativeTime(selectedUser.lastActive)}</p>
                  <p className="text-xs text-gray-600">Last Active</p>
                </div>
              </div>

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
                    <Badge variant={selectedUser.status === 'active' ? 'success' : selectedUser.status === 'suspended' ? 'danger' : 'default'} size="md">
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                {selectedUser.status !== 'suspended' ? (
                  <Button variant="danger" size="sm" leftIcon={<Ban className="w-4 h-4" />} onClick={() => updateUserStatus(selectedUser.id, 'suspended')}>
                    Suspend
                  </Button>
                ) : (
                  <Button variant="success" size="sm" leftIcon={<UserCheck className="w-4 h-4" />} onClick={() => updateUserStatus(selectedUser.id, 'active')}>
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

  if (isLoading) {
    return <PageSkeleton variant="workspace" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Admin Dashboard</h1>
                  <p className="text-xs text-gray-500">Platform Analytics</p>
                </div>
              </div>
              <div className="hidden lg:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2.5 w-80 rounded-xl border border-gray-200 bg-white text-sm" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>Export</Button>

              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                      <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-20">
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="font-bold text-gray-900">Notifications</h3>
                          <p className="text-xs text-gray-500">Recent system and security updates</p>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {adminData?.notifications?.map((notif) => (
                            <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <p className="text-sm text-gray-900">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(notif.time)}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <Avatar name={user?.name || 'Admin'} size="md" variant="gradient" />
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                      <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-20">
                        <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-600">{user?.email}</p>
                          <Badge variant="primary" size="sm" className="mt-2">Administrator</Badge>
                        </div>
                        <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
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

      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {error && <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 mb-6">{error}</div>}

        <div className="flex gap-2 mb-8">
          {['overview', 'users', 'activity'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-600 hover:bg-white/50'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {overviewStats.map((stat) => (
                <Card key={stat.title} padding="lg" hover={false}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      {stat.icon}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Card title="Recent Activities" padding="default">
              <div className="space-y-4">
                {adminData?.recentActivities?.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <Avatar name={activity.user} size="md" variant="gradient" />
                      <div>
                        <p className="font-semibold text-gray-900">{activity.user}</p>
                        <p className="text-sm text-gray-600">{activity.action} {activity.target}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{formatRelativeTime(activity.time)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
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
                  {filteredUsers.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={entry.name} size="md" variant="gradient" />
                          <div>
                            <p className="font-semibold text-gray-900">{entry.name}</p>
                            <p className="text-sm text-gray-500">{entry.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Badge variant="default" size="sm">{entry.role}</Badge></td>
                      <td className="px-6 py-4"><Badge variant={entry.status === 'active' ? 'success' : entry.status === 'suspended' ? 'danger' : 'default'} size="sm">{entry.status}</Badge></td>
                      <td className="px-6 py-4"><span className="font-semibold text-gray-900">{entry.notes}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-gray-600">{formatRelativeTime(entry.lastActive)}</span></td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(entry); setShowUserModal(true); }}>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900">Security Alert</p>
                    <p className="text-sm text-red-700">Failed sign-in events are being tracked in real time.</p>
                  </div>
                </div>
                <Button variant="danger" size="sm" leftIcon={<Shield className="w-4 h-4" />}>Review Alerts</Button>
              </div>
            </motion.div>

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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adminData?.recentActivities?.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-700">{formatDateTime(log.time)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar name={log.user} size="sm" variant="gradient" />
                            <span className="text-sm font-medium text-gray-900">{log.user}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4"><Badge variant="default" size="sm">{log.action}</Badge></td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.target || 'System'}</td>
                        <td className="px-6 py-4"><Badge variant={log.status === 'success' ? 'success' : 'danger'} size="sm">{log.status}</Badge></td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">Showing recent audit activity</p>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Live</span>
                  <RefreshCw className="w-4 h-4 text-gray-600 animate-spin" />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <UserDetailsModal />
    </div>
  );
};

export default AdminDashboard;
