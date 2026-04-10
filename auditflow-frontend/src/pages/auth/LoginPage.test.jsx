import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthContext } from '../../contexts/authContext';
import { api } from '../../lib/api';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../lib/api', () => ({
  api: {
    login: vi.fn(),
  },
  API_BASE_URL: 'http://localhost:5000/api',
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.login.mockResolvedValue({
      data: {
        token: 'token-123',
        user: {
          _id: 'u1',
          name: 'Alice Example',
          email: 'alice@example.com',
          role: 'User',
        },
      },
    });
  });

  it('submits credentials and navigates to the dashboard', async () => {
    const setSession = vi.fn();

    render(
      <AuthContext.Provider value={{ setSession }}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'Password1' },
    });
    fireEvent.submit(document.querySelector('form'));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        email: 'alice@example.com',
        password: 'Password1',
        rememberMe: false,
      });
    });

    expect(setSession).toHaveBeenCalledWith({
      token: 'token-123',
      user: expect.objectContaining({ role: 'User' }),
      rememberMe: false,
    });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
