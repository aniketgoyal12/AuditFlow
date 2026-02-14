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

const NotesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
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
    setNotes(notes.filter(note => note.id !== noteId));
  };

  const NoteCard = ({ note }) => {
    const [showMenu, setShowMenu] = useState(false);

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
          onClick={() => setSelectedNote(note)}
        >
          {/* Color Bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-${note.color}-500 rounded-t-2xl`} />

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`w-10 h-10 bg-${note.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <FileText className={`w-5 h-5 text-${note.color}-600`} />
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

            {/* Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 hover:bg-neutral-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-5 h-5 text-neutral-600" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                      }}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-large border border-neutral-200 overflow-hidden z-20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNote(note);
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
                          handleDeleteNote(note.id);
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

          {/* Content Preview */}
          <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
            {note.content}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.map((tag, index) => (
              <Badge key={index} variant="default" size="sm">
                <Tag className="w-3 h-3" />
                {tag}
              </Badge>
            ))}
          </div>

          {/* Footer */}
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

  const NoteEditorModal = () => {
    const [title, setTitle] = useState(selectedNote?.title || '');
    const [content, setContent] = useState(selectedNote?.content || '');

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setSelectedNote(null)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-large w-full max-w-3xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2 className="text-2xl font-bold font-display text-neutral-900">
              {selectedNote ? 'Edit Note' : 'New Note'}
            </h2>
            <button
              onClick={() => setSelectedNote(null)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          {/* Modal Content */}
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
                  placeholder="Start typing your note..."
                  className="w-full h-64 px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tags
                </label>
                <Input
                  placeholder="Add tags (comma separated)..."
                  leftIcon={<Tag className="w-5 h-5" />}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
            <Button
              variant="ghost"
              onClick={() => setSelectedNote(null)}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              leftIcon={<Save className="w-5 h-5" />}
            >
              Save Note
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

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
            My Notes
          </h1>
          <p className="text-lg text-neutral-600">
            Create, organize, and collaborate on your documents
          </p>
        </div>

        <Button
          variant="gradient"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => setShowNewNoteModal(true)}
        >
          New Note
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card variant="glass" padding="default" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Notes</p>
              <p className="text-3xl font-bold font-display text-neutral-900">
                {notes.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card variant="glass" padding="default" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Owned by Me</p>
              <p className="text-3xl font-bold font-display text-neutral-900">
                {notes.filter(n => n.role === 'Owner').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <Edit className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </Card>

        <Card variant="glass" padding="default" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Shared with Me</p>
              <p className="text-3xl font-bold font-display text-neutral-900">
                {notes.filter(n => n.role !== 'Owner').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="glass" padding="default">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search notes by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${selectedFilter === filter.value
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                    }
                  `}
                >
                  {filter.label}
                  <span className={`ml-2 ${
                    selectedFilter === filter.value ? 'text-white/80' : 'text-neutral-400'
                  }`}>
                    ({filter.count})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notes Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Card variant="default" padding="lg">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No notes found
              </h3>
              <p className="text-neutral-600 mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Create your first note to get started'}
              </p>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-5 h-5" />}
                onClick={() => setShowNewNoteModal(true)}
              >
                Create Note
              </Button>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Note Editor Modal */}
      <AnimatePresence>
        {(selectedNote || showNewNoteModal) && <NoteEditorModal />}
      </AnimatePresence>
    </div>
  );
};

export default NotesPage;