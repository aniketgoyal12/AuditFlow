import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, Search, Calendar } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Avatar from '../../components/common/Avatar';
import Table from '../../components/common/Table';

const AuditLogsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

  const handleExportLogs = () => {
    console.log('Exporting audit logs...');
    // Create CSV content
    const headers = ['User', 'Action', 'Summary', 'Target', 'Timestamp', 'IP Address'];
    const csvContent = [
      headers.join(','),
      ...auditLogs.map(log => [
        log.user.name,
        log.action,
        `"${log.summary}"`,
        log.target,
        log.timestamp,
        log.ip
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDateRangeClick = () => {
    alert('Date range picker would be implemented here');
  };

  const auditLogs = [
    {
      id: 1,
      user: { name: 'Sarah Chen', avatar: null },
      action: 'edit',
      summary: 'Updated Q4 compliance report',
      target: 'Q4 Report',
      timestamp: 'Feb 14, 10:45 AM',
      ip: '192.168.1.1',
    },
    {
      id: 2,
      user: { name: 'Maria Garcia', avatar: null },
      action: 'comment',
      summary: 'Commented on compliance findings',
      target: 'Q4 Report',
      timestamp: 'Feb 14, 09:30 AM',
      ip: '192.168.1.2',
    },
    {
      id: 3,
      user: { name: 'James Wilson', avatar: null },
      action: 'permission',
      summary: 'Granted Edit access to Alex Thompson',
      target: 'Security Training',
      timestamp: 'Feb 13, 04:20 PM',
      ip: '192.168.1.3',
    },
    {
      id: 4,
      user: { name: 'Alex Thompson', avatar: null },
      action: 'view',
      summary: 'Viewed security audit document',
      target: 'Security Audit 2024',
      timestamp: 'Feb 13, 02:15 PM',
      ip: '192.168.1.4',
    },
    {
      id: 5,
      user: { name: 'Sarah Chen', avatar: null },
      action: 'create',
      summary: 'Created new compliance document',
      target: 'Compliance Review',
      timestamp: 'Feb 12, 11:00 AM',
      ip: '192.168.1.1',
    },
  ];

  const getActionBadge = (action) => {
    const badges = {
      edit: { variant: 'info', label: 'Edit' },
      comment: { variant: 'success', label: 'Comment' },
      permission: { variant: 'warning', label: 'Permission' },
      view: { variant: 'default', label: 'View' },
      create: { variant: 'primary', label: 'Create' },
    };
    return badges[action] || badges.view;
  };

  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'edit', label: 'Edit' },
    { value: 'comment', label: 'Comment' },
    { value: 'permission', label: 'Permission' },
    { value: 'view', label: 'View' },
    { value: 'create', label: 'Create' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold font-display text-neutral-900 mb-2">
            Audit Logs
          </h1>
          <p className="text-lg text-neutral-600">
            Track all activities and changes in your workspace
          </p>
        </div>
        
        <Button 
          variant="outline"
          leftIcon={<Download className="w-5 h-5" />}
          onClick={handleExportLogs}
        >
          Export Logs
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="glass" padding="default">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by user, action, or target..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all bg-white"
            >
              {actionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <Button 
              variant="outline"
              leftIcon={<Calendar className="w-5 h-5" />}
              onClick={handleDateRangeClick}
            >
              Date Range
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Audit Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Summary
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Target
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          name={log.user.name} 
                          size="sm"
                          variant="gradient"
                        />
                        <span className="text-sm font-medium text-neutral-900">
                          {log.user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={getActionBadge(log.action).variant}
                        size="sm"
                      >
                        {getActionBadge(log.action).label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-700">
                        {log.summary}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default" size="sm">
                        {log.target}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-600">
                        {log.timestamp}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-neutral-500 font-mono">
                        {log.ip}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Showing <span className="font-medium">1-5</span> of{' '}
              <span className="font-medium">248</span> results
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuditLogsPage;