const PERMISSION_ALIASES = {
  owner: 'owner',
  editor: 'editor',
  viewer: 'viewer',
  'read only': 'viewer',
  readonly: 'viewer',
};

export const normalizeNotePermission = (value, fallback = 'viewer') => {
  const normalizedKey = String(value || '').trim().toLowerCase();
  return PERMISSION_ALIASES[normalizedKey] || fallback;
};

export const canEditNote = (value) => normalizeNotePermission(value) !== 'viewer';

export const canShareNote = (value) => normalizeNotePermission(value) === 'owner';

export const isOwnerPermission = (value) => normalizeNotePermission(value) === 'owner';

export const getNotePermissionLabel = (value) => {
  const permission = normalizeNotePermission(value);

  if (permission === 'owner') {
    return 'Owner';
  }

  if (permission === 'editor') {
    return 'Editor';
  }

  return 'Viewer';
};

export const getNotePermissionVariant = (value) => {
  const permission = normalizeNotePermission(value);

  if (permission === 'owner') {
    return 'primary';
  }

  if (permission === 'editor') {
    return 'success';
  }

  return 'warning';
};
