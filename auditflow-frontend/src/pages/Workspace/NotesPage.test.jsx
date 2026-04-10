import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import NotesPage from './NotesPage';
import { AuthContext } from '../../contexts/authContext';
import { api } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  api: {
    getNotes: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    shareNote: vi.fn(),
  },
  API_URL: 'https://auditflow-g54b.onrender.com',
  API_BASE_URL: 'https://auditflow-g54b.onrender.com/api',
}));

const renderWithAuth = (ui) =>
  render(
    <AuthContext.Provider
      value={{
        token: 'token-123',
        user: {
          _id: 'u1',
          name: 'Alice Example',
          role: 'User',
        },
        isAuthenticated: true,
        isBootstrapping: false,
        setSession: vi.fn(),
        updateUser: vi.fn(),
        clearSession: vi.fn(),
      }}
    >
      {ui}
    </AuthContext.Provider>
  );

describe('NotesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getNotes.mockResolvedValue({
      data: {
        items: [],
        pagination: {
          page: 1,
          total: 0,
          totalPages: 1,
        },
      },
    });
    api.createNote.mockResolvedValue({
      data: {
        id: 'n1',
        title: 'Fresh note',
        content: 'Documented content',
        owner: 'Alice Example',
        ownerId: 'u1',
        role: 'Owner',
        lastModified: new Date().toISOString(),
        tags: ['Q2'],
        color: 'primary',
        collaborators: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

  it('creates a new note from the modal editor', async () => {
    renderWithAuth(<NotesPage />);

    await waitFor(() => {
      expect(api.getNotes).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: /new note/i }));
    fireEvent.change(await screen.findByPlaceholderText(/enter note title/i), {
      target: { value: 'Fresh note' },
    });
    fireEvent.change(screen.getByPlaceholderText(/start writing your note/i), {
      target: { value: 'Documented content' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Create Note$/i }));

    await waitFor(() => {
      expect(api.createNote).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Fresh note',
          content: 'Documented content',
        }),
        'token-123'
      );
    });

    expect(await screen.findByText('Fresh note')).toBeInTheDocument();
  });
});
