import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Trash2, 
  Edit, 
  Clock,
  Tag,
  MoreVertical,
  X,
  Save
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';

// Move sub-components outside to prevent re-creation on every render
const NoteCard = ({ note, onSelect, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const colorClasses = {
    primary: { bg: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-500' },
    error: { bg: 'bg-red-100', text: 'text-red-600', bar: 'bg-red-500' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-600', bar: 'bg-yellow-500' },
    success: { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-500' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', bar: 'bg-purple-500' },
    info: { bg: 'bg-cyan-100', text: 'text-cyan-600', bar: 'bg-cyan-500' },
  };

  const colors = colorClasses[note.color] || colorClasses.primary;

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
              <h3 className="font-semibold text-lg text-neutral-900 truncate mb-1">
                {note.title}
              </h3>
              <Badge variant="default" size="sm">
                {note.role}
              </Badge>
            </div>
          </div>

          <div className="relative">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-neutral-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-large border border-neutral-200 overflow-hidden z-20"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(note);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(note.id);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
          {note.content}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {note.tags.map((tag, index) => (
            <Badge key={index} variant="default" size="sm">
              <Tag className="w-3 h-3" />
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Clock className="w-3 h-3" />
            <span>{note.lastModified}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {[...Array(Math.min(note.collaborators, 3))].map((_, i) => (
                <Avatar
                  key={i}
                  name={`User ${i + 1}`}
                  size="xs"
                  variant="gradient"
                />
              ))}
            </div>
            {note.collaborators > 3 && (
              <span className="text-xs text-neutral-500 ml-1">
                +{note.collaborators - 3}
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const NoteEditorModal = ({ note, onClose, onSave }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tagsInput, setTagsInput] = useState(note?.tags?.join(', ') || '');
  const [selectedColor, setSelectedColor] = useState(note?.color || 'primary');

  const handleSave = () => {
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    const noteData = {
      ...(note || {}),
      title,
      content,
      tags,
      color: selectedColor,
    };
    onSave(noteData);
  };

  const colors = [
    { value: 'primary', label: 'Blue', class: 'bg-blue-500' },
    { value: 'error', label: 'Red', class: 'bg-red-500' },
    { value: 'warning', label: 'Yellow', class: 'bg-yellow-500' },
    { value: 'success', label: 'Green', class: 'bg-green-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'info', label: 'Cyan', class: 'bg-cyan-500' },
  ];

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
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold font-display text-neutral-900">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-4">
            <Input
              label="Title"
              placeholder="Enter note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold"
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your note..."
                className="w-full h-48 px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all resize-none"
              />
            </div>

            <Input
              label="Tags (comma separated)"
              placeholder="e.g., Compliance, Q4, Important"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Color Theme
              </label>
              <div className="grid grid-cols-6 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`
                      w-full aspect-square rounded-xl ${color.class}
                      transition-all duration-200
                      ${selectedColor === color.value 
                        ? 'ring-4 ring-offset-2 ring-neutral-900 scale-110' 
                        : 'hover:scale-105'
                      }
                    `}
                  >
                    <span className="sr-only">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            leftIcon={<Save className="w-5 h-5" />}
            onClick={handleSave}
            disabled={!title.trim() || !content.trim()}
          >
            {note ? 'Save Changes' : 'Create Note'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NoteViewModal = ({ note, onClose, onEdit }) => {
  const colorClasses = {
    primary: { bg: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-500' },
    error: { bg: 'bg-red-100', text: 'text-red-600', bar: 'bg-red-500' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-600', bar: 'bg-yellow-500' },
    success: { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-500' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', bar: 'bg-purple-500' },
    info: { bg: 'bg-cyan-100', text: 'text-cyan-600', bar: 'bg-cyan-500' },
  };

  const colors = colorClasses[note.color] || colorClasses.primary;

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
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-2 ${colors.bar}`} />

        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
              <FileText className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display text-neutral-900">
                {note.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default" size="sm">{note.role}</Badge>
                <span className="text-sm text-neutral-500">by {note.owner}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {note.role !== 'Read Only' && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit className="w-4 h-4" />}
                onClick={() => {
                  onEdit(note);
                  onClose();
                }}
              >
                Edit
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          <div className="prose max-w-none">
            <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {note.content}
            </p>
          </div>

          {note.tags && note.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag, index) => (
                  <Badge key={index} variant="default">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Last modified {note.lastModified}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(Math.min(note.collaborators, 3))].map((_, i) => (
                  <Avatar
                    key={i}
                    name={`User ${i + 1}`}
                    size="sm"
                    variant="gradient"
                  />
                ))}
              </div>
              <span>{note.collaborators} collaborator{note.collaborators !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NotesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Q4 Compliance Review',
      content: 'Detailed review of Q4 compliance requirements and findings...',
      owner: 'Sarah Chen',
      role: 'Owner',
      lastModified: '2 hours ago',
      tags: ['Compliance', 'Q4'],
      color: 'primary',
      collaborators: 3,
    },
    {
      id: 2,
      title: 'Incident Response Runbook',
      content: 'Step-by-step procedures for handling security incidents...',
      owner: 'Maria Garcia',
      role: 'Editor',
      lastModified: '1 day ago',
      tags: ['Security', 'Emergency'],
      color: 'error',
      collaborators: 5,
    },
    {
      id: 3,
      title: 'Security Training Materials',
      content: 'Training content for new employee security onboarding...',
      owner: 'Sarah Chen',
      role: 'Owner',
      lastModified: '2 days ago',
      tags: ['Training', 'Security'],
      color: 'warning',
      collaborators: 2,
    },
    {
      id: 4,
      title: 'API Documentation',
      content: 'Complete API reference and integration guidelines...',
      owner: 'James Wilson',
      role: 'Read Only',
      lastModified: '3 days ago',
      tags: ['Technical', 'API'],
      color: 'success',
      collaborators: 4,
    },
    {
      id: 5,
      title: 'Client Meeting Notes',
      content: 'Notes from the quarterly business review with key clients...',
      owner: 'Sarah Chen',
      role: 'Owner',
      lastModified: '5 days ago',
      tags: ['Business', 'Meeting'],
      color: 'purple',
      collaborators: 1,
    },
    {
      id: 6,
      title: 'Budget Planning 2024',
      content: 'Financial planning and budget allocation for next fiscal year...',
      owner: 'Alex Thompson',
      role: 'Editor',
      lastModified: '1 week ago',
      tags: ['Finance', 'Planning'],
      color: 'info',
      collaborators: 6,
    },
  ]);

  const filters = [
    { value: 'all', label: 'All Notes', count: notes.length },
    { value: 'owner', label: 'Owned by Me', count: notes.filter(n => n.role === 'Owner').length },
    { value: 'shared', label: 'Shared with Me', count: notes.filter(n => n.role !== 'Owner').length },
  ];

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' ? true :
                         selectedFilter === 'owner' ? note.role === 'Owner' :
                         note.role !== 'Owner';
    
    return matchesSearch && matchesFilter;
  });

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== noteId));
      console.log('Deleted note:', noteId);
    }
  };

  const handleCreateNote = (newNote) => {
    const note = {
      id: Date.now(),
      ...newNote,
      owner: 'Sarah Chen',
      role: 'Owner',
      lastModified: 'Just now',
      collaborators: 1,
    };
    setNotes([note, ...notes]);
    setShowNewNoteModal(false);
    console.log('Created note:', note);
  };

  const handleUpdateNote = (updatedNote) => {
    setNotes(notes.map(note => 
      note.id === updatedNote.id 
        ? { ...note, ...updatedNote, lastModified: 'Just now' }
        : note
    ));
    setEditingNote(null);
    setSelectedNote(null);
    console.log('Updated note:', updatedNote);
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display text-neutral-900">Notepad</h1>
          <p className="text-lg text-neutral-600 mt-1">
            Manage your audit notes and documentation
          </p>
        </div>
        <Button
          variant="gradient"
          size="lg"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => setShowNewNoteModal(true)}
        >
          New Note
        </Button>
      </div>

      {/* Filters and Search */}
      <Card variant="default" padding="default">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedFilter === filter.value ? 'primary' : 'outline'}
                size="md"
                onClick={() => setSelectedFilter(filter.value)}
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notes Grid */}
      <AnimatePresence mode="popLayout">
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onSelect={setSelectedNote}
                onEdit={setEditingNote}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card variant="default" padding="lg">
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  No notes found
                </h3>
                <p className="text-neutral-600 mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first note to get started'}
                </p>
                {!searchQuery && (
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showNewNoteModal && (
          <NoteEditorModal
            onClose={() => setShowNewNoteModal(false)}
            onSave={handleCreateNote}
          />
        )}
        {editingNote && (
          <NoteEditorModal
            note={editingNote}
            onClose={() => setEditingNote(null)}
            onSave={handleUpdateNote}
          />
        )}
        {selectedNote && !editingNote && (
          <NoteViewModal
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            onEdit={setEditingNote}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesPage;