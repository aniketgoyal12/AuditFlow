import { memo, useCallback, useEffect, useEffectEvent, useMemo, useState } from 'react';
import { motion } from '../../lib/motion';
import { Download, Search, Filter } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Avatar from '../../components/common/Avatar';
import PageSkeleton from '../../components/common/PageSkeleton';
import { api } from '../../lib/api';
import { formatDateTime } from '../../lib/formatters';
import { useAuth } from '../../hooks/useAuth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const AuditLogRow = memo(({ log, index, getActionBadge }) => (
  <motion.tr key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.05 }} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <Avatar name={log.user.name} size="sm" variant="gradient" />
        <span className="text-sm font-medium text-neutral-900">{log.user.name}</span>
      </div>
    </td>
    <td className="px-6 py-4">
      <Badge variant={getActionBadge(log.action).variant} size="sm">{getActionBadge(log.action).label}</Badge>
    </td>
    <td className="px-6 py-4"><span className="text-sm text-neutral-700">{log.summary}</span></td>
    <td className="px-6 py-4"><Badge variant="default" size="sm">{log.target || 'System'}</Badge></td>
    <td className="px-6 py-4"><span className="text-sm text-neutral-600">{formatDateTime(log.timestamp)}</span></td>
    <td className="px-6 py-4"><span className="text-xs text-neutral-500 font-mono">{log.ip}</span></td>
  </motion.tr>
));

AuditLogRow.displayName = 'AuditLogRow';

const AuditLogsPage = () => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 250);

  const loadLogs = useEffectEvent(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.getAuditLogs(
        {
          search: debouncedSearchQuery,
          action: filterAction,
          status: filterStatus,
          page: pagination.page,
          limit: 10,
        },
        token
      );
      setLogs(response.data.items);
      setPagination(response.data.pagination);
      setError('');
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    void loadLogs();
  }, [debouncedSearchQuery, filterAction, filterStatus, pagination.page, token]);

  const getActionBadge = useCallback((action) => {
    const badges = {
      edit: { variant: 'info', label: 'Edit' },
      comment: { variant: 'success', label: 'Comment' },
      permission: { variant: 'warning', label: 'Permission' },
      view: { variant: 'default', label: 'View' },
      create: { variant: 'primary', label: 'Create' },
      login: { variant: 'default', label: 'Login' },
      logout: { variant: 'default', label: 'Logout' },
    };
    return badges[action] || { variant: 'default', label: action };
  }, []);

  const actionTypes = useMemo(
    () => [
      { value: 'all', label: 'All Actions' },
      { value: 'edit', label: 'Edit' },
      { value: 'permission', label: 'Permission' },
      { value: 'view', label: 'View' },
      { value: 'create', label: 'Create' },
      { value: 'login', label: 'Login' },
      { value: 'logout', label: 'Logout' },
    ],
    []
  );

  const statusTypes = useMemo(
    () => [
      { value: 'all', label: 'All Statuses' },
      { value: 'success', label: 'Success' },
      { value: 'failed', label: 'Failed' },
    ],
    []
  );

  const escapeCsvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const handleExportLogs = () => {
    const headers = ['User', 'Action', 'Summary', 'Target', 'Timestamp', 'IP Address'];
    const csvContent = [
      headers.map(escapeCsvValue).join(','),
      ...logs.map((log) => [
        escapeCsvValue(log.user.name),
        escapeCsvValue(log.action),
        escapeCsvValue(log.summary),
        escapeCsvValue(log.target),
        escapeCsvValue(formatDateTime(log.timestamp)),
        escapeCsvValue(log.ip),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading && logs.length === 0) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display text-neutral-900 mb-2">Audit Logs</h1>
          <p className="text-lg text-neutral-600">Track all activities and changes in your workspace</p>
        </div>
        <Button variant="outline" leftIcon={<Download className="w-5 h-5" />} onClick={handleExportLogs}>
          Export Logs
        </Button>
      </motion.div>

      {error && <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card variant="glass" padding="default">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="Search by user, action, or target..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPagination((current) => ({ ...current, page: 1 })); }} leftIcon={<Search className="w-5 h-5" />} />
            <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPagination((current) => ({ ...current, page: 1 })); }} className="px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all bg-white">
              {actionTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPagination((current) => ({ ...current, page: 1 })); }} className="px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all bg-white">
              {statusTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
            <Filter className="w-4 h-4" />
            Filters apply to the live audit stream and exported CSV.
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Action</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Summary</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Target</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Timestamp</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <AuditLogRow key={log.id} log={log} index={index} getActionBadge={getActionBadge} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Showing page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.totalPages}</span>
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</Button>
              <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuditLogsPage;
