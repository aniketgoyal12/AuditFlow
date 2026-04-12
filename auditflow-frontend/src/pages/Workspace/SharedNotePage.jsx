import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from '../../lib/motion';
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  Globe,
  Link2,
  Lock,
  Shield,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { formatDateTime, formatRelativeTime } from '../../lib/formatters';

const SharedNotePage = () => {
  const navigate = useNavigate();
  const { token: shareToken } = useParams();
  const { token, isAuthenticated } = useAuth();
  const [sharedNote, setSharedNote] = useState(null);
  const [shareLink, setShareLink] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusCode, setStatusCode] = useState(null);

  useEffect(() => {
    const loadSharedNote = async () => {
      if (!shareToken) {
        setIsLoading(false);
        setError('This share link is invalid.');
        setStatusCode(404);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const response = await api.getSharedNote(shareToken, token);
        setSharedNote(response?.data?.note || null);
        setShareLink(response?.data?.shareLink || null);
        setStatusCode(null);
      } catch (requestError) {
        setError(requestError.message || 'Unable to open this shared note.');
        setStatusCode(requestError.statusCode || 500);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSharedNote();
  }, [shareToken, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-neutral-700">
          <Loader size="lg" />
          <span>Loading shared note…</span>
        </div>
      </div>
    );
  }

  if (!sharedNote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
            Go Back
          </Button>

          <Card variant="default" padding="lg" hover={false}>
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                {statusCode === 401 ? <Lock className="w-7 h-7" /> : <Shield className="w-7 h-7" />}
              </div>
              <div>
                <h1 className="text-3xl font-bold font-display text-neutral-900">
                  {statusCode === 401 ? 'Sign in required' : 'Shared note unavailable'}
                </h1>
                <p className="text-neutral-600 mt-2">{error}</p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {statusCode === 401 ? (
                  <Link to="/">
                    <Button variant="primary" leftIcon={<Lock className="w-4 h-4" />}>
                      Sign In
                    </Button>
                  </Link>
                ) : (
                  <Link to="/">
                    <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                      Return Home
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
            Go Back
          </Button>

          <div className="flex flex-wrap gap-3">
            <Badge variant="warning" size="md">
              <Lock className="w-3.5 h-3.5" />
              Read-only shared view
            </Badge>
            <Badge variant={shareLink?.visibility === 'public' ? 'success' : 'primary'} size="md">
              {shareLink?.visibility === 'public' ? (
                <Globe className="w-3.5 h-3.5" />
              ) : (
                <Link2 className="w-3.5 h-3.5" />
              )}
              {shareLink?.visibility === 'public' ? 'Public link' : 'Private link'}
            </Badge>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="default" padding="lg" hover={false} className="overflow-visible">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-bold font-display text-neutral-900 break-words">
                    {sharedNote.title}
                  </h1>
                  <p className="text-neutral-600 mt-2">
                    Shared by {sharedNote.owner} • updated {formatRelativeTime(sharedNote.lastModified)}
                  </p>
                </div>
              </div>

              {(sharedNote.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {sharedNote.tags.map((tag) => (
                    <Badge key={tag} variant="default" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                <p className="text-neutral-800 leading-8 whitespace-pre-wrap">{sharedNote.content}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card variant="flat" padding="default" hover={false}>
                  <div className="flex items-center gap-3 text-neutral-700">
                    <CalendarClock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-500">Updated</p>
                      <p className="font-medium">{formatDateTime(sharedNote.updatedAt || sharedNote.lastModified)}</p>
                    </div>
                  </div>
                </Card>
                <Card variant="flat" padding="default" hover={false}>
                  <div className="flex items-center gap-3 text-neutral-700">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-500">Access</p>
                      <p className="font-medium">Viewer</p>
                    </div>
                  </div>
                </Card>
                <Card variant="flat" padding="default" hover={false}>
                  <div className="flex items-center gap-3 text-neutral-700">
                    <Link2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-500">Link expires</p>
                      <p className="font-medium">
                        {shareLink?.expiresAt ? formatDateTime(shareLink.expiresAt) : 'No expiry'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="flex flex-wrap gap-3">
          {isAuthenticated ? (
            <Button variant="primary" onClick={() => navigate('/notepad')}>
              Open Workspace
            </Button>
          ) : (
            <Link to="/">
              <Button variant="primary">Sign In to AuditFlow</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedNotePage;
