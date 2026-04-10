import { useEffect, useState } from 'react';
import { motion } from '../../lib/motion';
import {
  User, Lock, Bell, Shield, Palette,
  Save, Eye, EyeOff, Mail, Phone,
  Key, AlertCircle, CheckCircle2, Camera
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import PageSkeleton from '../../components/common/PageSkeleton';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime } from '../../lib/formatters';

const SettingsPage = () => {
  const { token, user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [message, setMessage] = useState('');

  const [accountInfo, setAccountInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: user?.notificationSettings?.emailNotifications ?? true,
    pushNotifications: user?.notificationSettings?.pushNotifications ?? true,
    activityDigest: user?.notificationSettings?.activityDigest ?? false,
    securityAlerts: user?.notificationSettings?.securityAlerts ?? true,
    teamUpdates: user?.notificationSettings?.teamUpdates ?? true,
  });
  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || 'light',
    language: user?.preferences?.language || 'en',
    timezone: user?.preferences?.timezone || 'Asia/Calcutta',
    dateFormat: user?.preferences?.dateFormat || 'DD/MM/YYYY',
  });

  useEffect(() => {
    setAccountInfo({
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || '',
    });
    setNotifications({
      emailNotifications: user?.notificationSettings?.emailNotifications ?? true,
      pushNotifications: user?.notificationSettings?.pushNotifications ?? true,
      activityDigest: user?.notificationSettings?.activityDigest ?? false,
      securityAlerts: user?.notificationSettings?.securityAlerts ?? true,
      teamUpdates: user?.notificationSettings?.teamUpdates ?? true,
    });
    setPreferences({
      theme: user?.preferences?.theme || 'light',
      language: user?.preferences?.language || 'en',
      timezone: user?.preferences?.timezone || 'Asia/Calcutta',
      dateFormat: user?.preferences?.dateFormat || 'DD/MM/YYYY',
    });
  }, [user]);

  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'preferences', label: 'Preferences', icon: <Palette className="w-5 h-5" /> },
  ];

  const setStatus = (type, text) => {
    setSaveStatus(type);
    setMessage(text);
    if (type !== 'saving') {
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleSaveAccount = async () => {
    try {
      setStatus('saving', 'Saving your changes...');
      const response = await api.updateProfile({
        name: accountInfo.fullName,
        email: accountInfo.email,
        phone: accountInfo.phone,
        notificationSettings: notifications,
        preferences,
      }, token);
      updateUser(response.data);
      setStatus('success', 'Settings saved successfully!');
    } catch (apiError) {
      setStatus('error', apiError.message);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatus('error', 'New password and confirmation do not match.');
      return;
    }

    try {
      setStatus('saving', 'Updating your password...');
      await api.changePassword(passwordForm, token);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatus('success', 'Password updated successfully!');
    } catch (apiError) {
      setStatus('error', apiError.message);
    }
  };

  const handleToggleNotification = async (key) => {
    const nextNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(nextNotifications);
    try {
      const response = await api.updateProfile({ notificationSettings: nextNotifications }, token);
      updateUser(response.data);
    } catch {
      setNotifications(notifications);
    }
  };

  if (!user) {
    return <PageSkeleton variant="workspace" />;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold font-display text-neutral-900 mb-2">Settings</h1>
        <p className="text-lg text-neutral-600">Manage your account preferences and security settings</p>
      </motion.div>

      {saveStatus && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="default" className={`border-l-4 ${saveStatus === 'success' ? 'border-green-500 bg-green-50' : saveStatus === 'error' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'}`}>
            <div className="flex items-center gap-3">
              {saveStatus === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {saveStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {saveStatus === 'saving' && <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
              <p className={`font-medium ${saveStatus === 'success' ? 'text-green-800' : saveStatus === 'error' ? 'text-red-800' : 'text-blue-800'}`}>{message}</p>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
          <Card padding="sm">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-neutral-700 hover:bg-neutral-100'}`}>
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3 space-y-6">
          {activeTab === 'account' && (
            <div className="space-y-6">
              <Card title="Profile Picture" padding="lg">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar name={accountInfo.fullName} size="2xl" variant="gradient" />
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-600">Profile image upload is ready for future storage integration.</p>
                  </div>
                </div>
              </Card>

              <Card title="Personal Information" padding="lg">
                <div className="space-y-4">
                  <Input value={accountInfo.fullName} onChange={(e) => setAccountInfo({ ...accountInfo, fullName: e.target.value })} leftIcon={<User className="w-5 h-5" />} label="Full Name" />
                  <Input type="email" value={accountInfo.email} onChange={(e) => setAccountInfo({ ...accountInfo, email: e.target.value })} leftIcon={<Mail className="w-5 h-5" />} label="Email Address" />
                  <Input value={accountInfo.phone} onChange={(e) => setAccountInfo({ ...accountInfo, phone: e.target.value })} leftIcon={<Phone className="w-5 h-5" />} label="Phone Number" />
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Role</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="md">{accountInfo.role}</Badge>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button variant="primary" onClick={handleSaveAccount} leftIcon={<Save className="w-5 h-5" />}>Save Changes</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card title="Change Password" padding="lg">
                <div className="space-y-4">
                  {[
                    ['Current Password', 'currentPassword', showCurrentPassword, setShowCurrentPassword, Lock],
                    ['New Password', 'newPassword', showNewPassword, setShowNewPassword, Key],
                    ['Confirm New Password', 'confirmPassword', showConfirmPassword, setShowConfirmPassword, Key],
                  ].map(([label, key, visible, setVisible, Icon]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
                      <div className="relative">
                        <Input type={visible ? 'text' : 'password'} value={passwordForm[key]} onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })} leftIcon={<Icon className="w-5 h-5" />} />
                        <button onClick={() => setVisible(!visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700">
                          {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Button variant="primary" onClick={handleChangePassword} leftIcon={<Save className="w-5 h-5" />}>Update Password</Button>
                  </div>
                </div>
              </Card>

              <Card title="Two-Factor Authentication" padding="lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-700">Add an extra layer of security to your account</p>
                    <Badge variant="warning" size="sm">Not Enabled</Badge>
                  </div>
                  <Button variant="outline" leftIcon={<Shield className="w-5 h-5" />} disabled>Enable 2FA</Button>
                </div>
              </Card>

              <Card title="Active Sessions" padding="lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div>
                      <p className="font-medium text-neutral-900">Current Session</p>
                      <p className="text-xs text-neutral-500 mt-1">Last active: {formatDateTime(user?.lastLoginAt || new Date())}</p>
                    </div>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card title="Email Notifications" padding="lg">
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 hover:bg-neutral-50 rounded-xl transition-colors">
                    <div>
                      <p className="font-medium text-neutral-900">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</p>
                    </div>
                    <button onClick={() => handleToggleNotification(key)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-neutral-300'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <Card title="Appearance" padding="lg">
                <div className="grid grid-cols-3 gap-3">
                  {['light', 'dark', 'auto'].map((theme) => (
                    <button key={theme} onClick={() => setPreferences({ ...preferences, theme })} className={`p-4 rounded-xl border-2 transition-all ${preferences.theme === theme ? 'border-blue-600 bg-blue-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                      <p className="font-medium capitalize">{theme}</p>
                    </button>
                  ))}
                </div>
              </Card>

              <Card title="Regional Settings" padding="lg">
                <div className="space-y-4">
                  <select value={preferences.language} onChange={(e) => setPreferences({ ...preferences, language: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 bg-white">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                  <select value={preferences.timezone} onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 bg-white">
                    <option value="Asia/Calcutta">India (IST)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                  <select value={preferences.dateFormat} onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 bg-white">
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                  <div className="pt-4">
                    <Button variant="primary" onClick={handleSaveAccount} leftIcon={<Save className="w-5 h-5" />}>Save Preferences</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
