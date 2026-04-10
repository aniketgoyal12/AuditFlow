import { memo, startTransition, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from '../../lib/motion';
import {
  Clock,
  Edit,
  FileText,
  Mail,
  MoreVertical,
  Plus,
  Save,
  Search,
  Share2,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import PageSkeleton from '../../components/common/PageSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { formatRelativeTime } from '../../lib/formatters';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const NOTE_COLORS = {
  primary: { bg: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-500' },
  error: { bg: 'bg-red-100', text: 'text-red-600', bar: 'bg-red-500' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-600', bar: 'bg-yellow-500' },
  success: { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-500' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', bar: 'bg-purple-500' },
  info: { bg: 'bg-cyan-100', text: 'text-cyan-600', bar: 'bg-cyan-500' },
};

const ACCESS_VARIANTS = {
  Owner: 'primary',
  Editor: 'success',
  'Read Only': 'warning',
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Notes' },
  { value: 'owner', label: 'Owned by Me' },
  { value: 'shared', label: 'Shared with Me' },
];

const normalizeNote = (note = {}, fallbackOwner = 'Unknown User') => ({
  ...note,
  id: note.id || note._id || `${Date.now()}`,
  title: note.title || 'Untitled note',
  content: note.content || '',
  owner: note.owner || fallbackOwner,
  role: note.role || 'Owner',
  tags: Array.isArray(note.tags) ? note.tags : [],
  color: note.color || 'primary',
  collaborators: Number(note.collaborators || 0),
  lastModified: note.lastModified || note.updatedAt || note.createdAt || new Date().toISOString(),
});

const NoteCard = memo(({ note, onDelete, onEdit, onSelect, onShare }) => {
  const [showMenu, setShowMenu] = useState(false);
  const colors = NOTE_COLORS[note.color] || NOTE_COLORS.primary;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative"
    >
      <Card
        variant="default"
        padding="default"
        className="h-full cursor-pointer hover:shadow-lg transition-all duration-300"
        onClick={() => onSelect(note)}
      >
        <div className={`absolute top-0 left-0 right-0 h-1 ${colors.bar} rounded-t-2xl`} />
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <FileText className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-neutral-900 truncate mb-1">{note.title}</h3>
              <Badge variant={ACCESS_VARIANTS[note.role] || 'default'} size="sm">
                {note.role}
              </Badge>
            </div>
          </div>
          <div className="relative">
            <motion.button
              onClick={(event) => {
                event.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-neutral-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4 text-neutral-600" />
            </motion.button>
            <AnimatePresence>
              {showMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-10"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-large border border-neutral-200 overflow-hidden z-20"
                  >
                    {note.role !== 'Read Only' && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(note);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    {note.role === 'Owner' && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onShare(note);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <Share2 className="w-4 h-4" />
                        Manage Access
                      </button>
                    )}
                    {note.role === 'Owner' && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(note.id);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{note.content}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="default" size="sm">
              <Tag className="w-3 h-3" />
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(note.lastModified)}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {[...Array(Math.min(note.collaborators, 3))].map((_, index) => (
                <Avatar key={index} name={`User ${index + 1}`} size="xs" variant="gradient" />
              ))}
            </div>
            {note.collaborators > 3 && (
              <span className="text-xs text-neutral-500 ml-1">+{note.collaborators - 3}</span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

NoteCard.displayName = 'NoteCard';

const NoteEditorModal = ({ note, onClose, onSave, isSaving }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tagsInput, setTagsInput] = useState(note?.tags?.join(', ') || '');
  const [selectedColor, setSelectedColor] = useState(note?.color || 'primary');

  const colors = [
    { value: 'primary', label: 'Blue', class: 'bg-blue-500' },
    { value: 'error', label: 'Red', class: 'bg-red-500' },
    { value: 'warning', label: 'Yellow', class: 'bg-yellow-500' },
    { value: 'success', label: 'Green', class: 'bg-green-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'info', label: 'Cyan', class: 'bg-cyan-500' },
  ];

  const handleSave = () => {
    const tags = tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean);
    onSave({ ...(note || {}), title, content, tags, color: selectedColor });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-large w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold font-display text-neutral-900">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
          <Input
            label="Title"
            placeholder="Enter note title..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="text-lg font-semibold"
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Start writing your note..."
              className="w-full h-48 px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all resize-none"
            />
          </div>
          <Input
            label="Tags (comma separated)"
            placeholder="e.g., Compliance, Q4, Important"
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">Color Theme</label>
            <div className="grid grid-cols-6 gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full aspect-square rounded-xl ${color.class} transition-all duration-200 ${
                    selectedColor === color.value
                      ? 'ring-4 ring-offset-2 ring-neutral-900 scale-110'
                      : 'hover:scale-105'
                  }`}
                >
                  <span className="sr-only">{color.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            leftIcon={<Save className="w-5 h-5" />}
            onClick={handleSave}
            disabled={!title.trim() || !content.trim()}
            loading={isSaving}
          >
            {note ? 'Save Changes' : 'Create Note'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NoteViewModal = ({ note, onClose, onEdit, onShare }) => {
  const colors = NOTE_COLORS[note.color] || NOTE_COLORS.primary;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-large w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`h-2 ${colors.bar}`} />
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-bold font-display text-neutral-900">{note.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={ACCESS_VARIANTS[note.role] || 'default'} size="sm">
                {note.role}
              </Badge>
              <span className="text-sm text-neutral-500">by {note.owner}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {note.role === 'Owner' && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Share2 className="w-4 h-4" />}
                onClick={() => onShare(note)}
              >
                Manage Access
              </Button>
            )}
            {note.role !== 'Read Only' && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit className="w-4 h-4" />}
                onClick={() => onEdit(note)}
              >
                Edit
              </Button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
          <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
          {(note.tags || []).length > 0 && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-neutral-200 bg-neutral-50 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Updated {formatRelativeTime(note.lastModified)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              {note.collaborators} collaborator{note.collaborators === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NoteShareModal = ({
  note,
  sharing,
  isLoading,
  isSaving,
  feedback,
  onClose,
  onSubmit,
  onCancelInvite,
  onRemoveCollaborator,
}) => {
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('Editor');

  useEffect(() => {
    setEmail('');
    setAccessLevel('Editor');
  }, [note?.id]);

  const handleSubmit = async () => {
    const didSave = await onSubmit({ email: email.trim(), accessLevel });
    if (didSave) {
      setEmail('');
      setAccessLevel('Editor');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-large w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-bold font-display text-neutral-900">Manage Access</h2>
            <p className="text-sm text-neutral-500 mt-1">{note.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <Card variant="default" padding="default">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 items-end">
              <Input
                label="Invite collaborator"
                placeholder="teammate@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">Access level</label>
                <select
                  value={accessLevel}
                  onChange={(event) => setAccessLevel(event.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                >
                  <option value="Editor">Editor</option>
                  <option value="Read Only">Read Only</option>
                </select>
              </div>
              <Button
                variant="gradient"
                leftIcon={<Share2 className="w-4 h-4" />}
                onClick={handleSubmit}
                disabled={!email.trim()}
                loading={isSaving}
              >
                Send Invite
              </Button>
            </div>
            {feedback && <p className="mt-3 text-sm text-neutral-600">{feedback}</p>}
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : (
            <>
              <Card variant="default" padding="default">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Collaborators</h3>
                  <Badge variant="default">{sharing.collaborators.length}</Badge>
                </div>
                {sharing.collaborators.length > 0 ? (
                  <div className="space-y-3">
                    {sharing.collaborators.map((collaborator) => (
                      <div
                        key={collaborator.id || collaborator.email}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-neutral-200"
                      >
                        <div>
                          <p className="font-medium text-neutral-900">{collaborator.name}</p>
                          <p className="text-sm text-neutral-500">{collaborator.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={ACCESS_VARIANTS[collaborator.accessLevel] || 'default'} size="sm">
                            {collaborator.accessLevel}
                          </Badge>
                          {!collaborator.isOwner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveCollaborator(collaborator.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500">No collaborators yet.</p>
                )}
              </Card>

              <Card variant="default" padding="default">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Pending Invites</h3>
                  <Badge variant="default">{sharing.invites.length}</Badge>
                </div>
                {sharing.invites.length > 0 ? (
                  <div className="space-y-3">
                    {sharing.invites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-neutral-200"
                      >
                        <div>
                          <p className="font-medium text-neutral-900">{invite.email}</p>
                          <p className="text-sm text-neutral-500">
                            {invite.accessLevel} access • invited {formatRelativeTime(invite.invitedAt)}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => onCancelInvite(invite.id)}>
                          Cancel
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500">No pending invites.</p>
                )}
              </Card>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const NotesPage = () => {
  const { token, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 250);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [sharingNote, setSharingNote] = useState(null);
  const [sharing, setSharing] = useState({ collaborators: [], invites: [] });
  const [isSharingLoading, setIsSharingLoading] = useState(false);
  const [isSharingSaving, setIsSharingSaving] = useState(false);
  const [sharingFeedback, setSharingFeedback] = useState('');

  const loadNotes = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.getNotes(
        {
          search: debouncedSearch,
          filter: selectedFilter,
        },
        token
      );

      setNotes((response?.data?.items || []).map((note) => normalizeNote(note, user?.name)));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load notes right now.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedFilter, token, user?.name]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const loadSharing = useCallback(
    async (noteId) => {
      if (!token || typeof api.getNoteSharing !== 'function') {
        return;
      }

      setIsSharingLoading(true);
      setSharingFeedback('');

      try {
        const response = await api.getNoteSharing(noteId, token);
        setSharing({
          collaborators: response?.data?.collaborators || [],
          invites: response?.data?.invites || [],
        });
      } catch (requestError) {
        setSharingFeedback(requestError.message || 'Unable to load sharing details.');
      } finally {
        setIsSharingLoading(false);
      }
    },
    [token]
  );

  const handleCreateNote = async (newNote) => {
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await api.createNote(newNote, token);
      const createdNote = normalizeNote(response?.data, user?.name);
      setNotes((current) => [createdNote, ...current]);
      setShowNewNoteModal(false);
      setMessage('Note created successfully.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to create the note.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateNote = async (updatedNote) => {
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await api.updateNote(updatedNote.id, updatedNote, token);
      const savedNote = normalizeNote(response?.data, user?.name);
      setNotes((current) => current.map((note) => (note.id === savedNote.id ? savedNote : note)));
      setEditingNote(null);
      setSelectedNote(savedNote);
      setMessage('Note updated successfully.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to update the note.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await api.deleteNote(noteId, token);
      setNotes((current) => current.filter((note) => note.id !== noteId));
      if (selectedNote?.id === noteId) setSelectedNote(null);
      if (editingNote?.id === noteId) setEditingNote(null);
      setMessage('Note deleted successfully.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete the note.');
    }
  };

  const handleOpenShare = async (note) => {
    setSelectedNote(null);
    setEditingNote(null);
    setSharingNote(note);
    await loadSharing(note.id);
  };

  const handleShareSubmit = async ({ email, accessLevel }) => {
    if (!sharingNote || !email || typeof api.shareNote !== 'function') {
      return false;
    }

    setIsSharingSaving(true);
    setSharingFeedback('');

    try {
      await api.shareNote(sharingNote.id, { email, accessLevel }, token);
      setSharingFeedback('Access updated successfully.');
      await Promise.all([loadSharing(sharingNote.id), loadNotes()]);
      return true;
    } catch (requestError) {
      setSharingFeedback(requestError.message || 'Unable to update note access.');
      return false;
    } finally {
      setIsSharingSaving(false);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    if (!sharingNote || typeof api.cancelNoteInvite !== 'function') {
      return;
    }

    setIsSharingSaving(true);

    try {
      await api.cancelNoteInvite(sharingNote.id, inviteId, token);
      setSharingFeedback('Invite cancelled successfully.');
      await Promise.all([loadSharing(sharingNote.id), loadNotes()]);
    } catch (requestError) {
      setSharingFeedback(requestError.message || 'Unable to cancel the invite.');
    } finally {
      setIsSharingSaving(false);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    if (!sharingNote || typeof api.removeNoteCollaborator !== 'function') {
      return;
    }

    setIsSharingSaving(true);

    try {
      await api.removeNoteCollaborator(sharingNote.id, userId, token);
      setSharingFeedback('Collaborator removed successfully.');
      await Promise.all([loadSharing(sharingNote.id), loadNotes()]);
    } catch (requestError) {
      setSharingFeedback(requestError.message || 'Unable to remove the collaborator.');
    } finally {
      setIsSharingSaving(false);
    }
  };

  if (isLoading && notes.length === 0) {
    return <PageSkeleton variant="workspace" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display text-neutral-900">Notepad</h1>
          <p className="text-lg text-neutral-600 mt-1">Manage your audit notes and documentation</p>
        </div>
        <Button
          variant="gradient"
          size="lg"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => {
            setEditingNote(null);
            setShowNewNoteModal(true);
          }}
        >
          New Note
        </Button>
      </div>

      {message && (
        <Card variant="default" padding="default" className="border border-green-200 bg-green-50">
          <p className="text-sm text-green-700">{message}</p>
        </Card>
      )}

      {error && (
        <Card variant="default" padding="default" className="border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      <Card variant="default" padding="default">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(event) => {
                const nextValue = event.target.value;
                startTransition(() => {
                  setSearchQuery(nextValue);
                });
              }}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedFilter === filter.value ? 'primary' : 'outline'}
                size="md"
                onClick={() => setSelectedFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader size="lg" />
        </div>
      ) : notes.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={handleDeleteNote}
                onEdit={(selected) => {
                  setSelectedNote(null);
                  setShowNewNoteModal(false);
                  setEditingNote(selected);
                }}
                onSelect={setSelectedNote}
                onShare={handleOpenShare}
              />
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <Card variant="default" padding="lg">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No notes found</h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery.trim() ? 'Try adjusting your search or filters.' : 'Create your first note to get started.'}
            </p>
            {!searchQuery.trim() && (
              <Button
                variant="primary"
                leftIcon={<Plus className="w-5 h-5" />}
                onClick={() => setShowNewNoteModal(true)}
              >
                Create Your First Note
              </Button>
            )}
          </div>
        </Card>
      )}

      <AnimatePresence>
        {showNewNoteModal && (
          <NoteEditorModal
            onClose={() => setShowNewNoteModal(false)}
            onSave={handleCreateNote}
            isSaving={isSaving}
          />
        )}

        {editingNote && (
          <NoteEditorModal
            note={editingNote}
            onClose={() => setEditingNote(null)}
            onSave={handleUpdateNote}
            isSaving={isSaving}
          />
        )}

        {selectedNote && !editingNote && !sharingNote && (
          <NoteViewModal
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            onEdit={(note) => {
              setSelectedNote(null);
              setEditingNote(note);
            }}
            onShare={handleOpenShare}
          />
        )}

        {sharingNote && (
          <NoteShareModal
            note={sharingNote}
            sharing={sharing}
            isLoading={isSharingLoading}
            isSaving={isSharingSaving}
            feedback={sharingFeedback}
            onClose={() => {
              setSharingNote(null);
              setSharing({ collaborators: [], invites: [] });
              setSharingFeedback('');
            }}
            onSubmit={handleShareSubmit}
            onCancelInvite={handleCancelInvite}
            onRemoveCollaborator={handleRemoveCollaborator}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesPage;
