import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Lock, Bell, Shield, Palette, Globe, 
  Save, Eye, EyeOff, Check, X, Mail, Phone,
  Key, AlertCircle, CheckCircle2, Camera
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Form states
  const [accountInfo, setAccountInfo] = useState({
    fullName: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    phone: '+1 (555) 123-4567',
    role: 'Administrator',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    activityDigest: false,
    securityAlerts: true,
    teamUpdates: true,
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
  });

  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'preferences', label: 'Preferences', icon: <Palette className="w-5 h-5" /> },
  ];

  const handleSaveAccount = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSaveStatus('error');
      return;
    }
    
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };

  const handleToggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold font-display text-neutral-900 mb-2">
          Settings
        </h1>
        <p className="text-lg text-neutral-600">
          Manage your account preferences and security settings
        </p>
      </motion.div>

      {/* Save Status Banner */}
      {saveStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Card 
            padding="default"
            className={`border-l-4 ${
              saveStatus === 'success' ? 'border-green-500 bg-green-50' :
              saveStatus === 'error' ? 'border-red-500 bg-red-50' :
              'border-blue-500 bg-blue-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {saveStatus === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {saveStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {saveStatus === 'saving' && <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
              
              <p className={`font-medium ${
                saveStatus === 'success' ? 'text-green-800' :
                saveStatus === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {saveStatus === 'success' && 'Settings saved successfully!'}
                {saveStatus === 'error' && 'Passwords do not match. Please try again.'}
                {saveStatus === 'saving' && 'Saving your changes...'}
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card padding="sm">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Profile Picture */}
              <Card title="Profile Picture" padding="lg">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar 
                      name={accountInfo.fullName}
                      size="2xl"
                      variant="gradient"
                    />
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-600">
                      Upload a new profile picture. Max file size: 5MB
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Choose File
                      </Button>
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Personal Information */}
              <Card title="Personal Information" padding="lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      value={accountInfo.fullName}
                      onChange={(e) => setAccountInfo({...accountInfo, fullName: e.target.value})}
                      leftIcon={<User className="w-5 h-5" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={accountInfo.email}
                      onChange={(e) => setAccountInfo({...accountInfo, email: e.target.value})}
                      leftIcon={<Mail className="w-5 h-5" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      value={accountInfo.phone}
                      onChange={(e) => setAccountInfo({...accountInfo, phone: e.target.value})}
                      leftIcon={<Phone className="w-5 h-5" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Role
                    </label>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="md">
                        {accountInfo.role}
                      </Badge>
                      <span className="text-sm text-neutral-500">
                        Contact admin to change role
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      variant="primary"
                      onClick={handleSaveAccount}
                      leftIcon={<Save className="w-5 h-5" />}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password */}
              <Card title="Change Password" padding="lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        leftIcon={<Lock className="w-5 h-5" />}
                        placeholder="Enter current password"
                      />
                      <button
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        leftIcon={<Key className="w-5 h-5" />}
                        placeholder="Enter new password"
                      />
                      <button
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Must be at least 8 characters with uppercase, lowercase, and numbers
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        leftIcon={<Key className="w-5 h-5" />}
                        placeholder="Confirm new password"
                      />
                      <button
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      variant="primary"
                      onClick={handleChangePassword}
                      leftIcon={<Save className="w-5 h-5" />}
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Two-Factor Authentication */}
              <Card title="Two-Factor Authentication" padding="lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-700">
                      Add an extra layer of security to your account
                    </p>
                    <Badge variant="warning" size="sm">
                      Not Enabled
                    </Badge>
                  </div>
                  <Button variant="outline" leftIcon={<Shield className="w-5 h-5" />}>
                    Enable 2FA
                  </Button>
                </div>
              </Card>

              {/* Active Sessions */}
              <Card title="Active Sessions" padding="lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div>
                      <p className="font-medium text-neutral-900">Current Session</p>
                      <p className="text-sm text-neutral-600">Chrome on MacOS • New York, US</p>
                      <p className="text-xs text-neutral-500 mt-1">Last active: Just now</p>
                    </div>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                    <div>
                      <p className="font-medium text-neutral-900">Mobile Device</p>
                      <p className="text-sm text-neutral-600">Safari on iOS • New York, US</p>
                      <p className="text-xs text-neutral-500 mt-1">Last active: 2 hours ago</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Revoke
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <Card title="Email Notifications" padding="lg">
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 hover:bg-neutral-50 rounded-xl transition-colors">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {key === 'emailNotifications' && 'Receive email updates about your activity'}
                          {key === 'pushNotifications' && 'Get push notifications on your devices'}
                          {key === 'activityDigest' && 'Weekly summary of your workspace activity'}
                          {key === 'securityAlerts' && 'Important security and account alerts'}
                          {key === 'teamUpdates' && 'Updates from your team members'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleNotification(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-blue-600' : 'bg-neutral-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <Card title="Appearance" padding="lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['light', 'dark', 'auto'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setPreferences({...preferences, theme})}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            preferences.theme === theme
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <p className="font-medium capitalize">{theme}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Regional Settings" padding="lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Language
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Date Format
                    </label>
                    <select
                      value={preferences.dateFormat}
                      onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <Button 
                      variant="primary"
                      onClick={handleSaveAccount}
                      leftIcon={<Save className="w-5 h-5" />}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card 
                title="Danger Zone" 
                padding="lg"
                className="border-2 border-red-200"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">Delete Account</p>
                      <p className="text-sm text-neutral-600 mt-1">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button variant="danger" size="sm">
                      Delete Account
                    </Button>
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