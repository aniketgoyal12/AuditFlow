import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignupPage from './SignupPage';
import { AuthContext } from '../../contexts/authContext';
import { api } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  api: {
    register: vi.fn(),
  },
  API_URL: 'https://auditflow-g54b.onrender.com',
  API_BASE_URL: 'https://auditflow-g54b.onrender.com/api',
}));

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a validation error when passwords do not match', async () => {
    render(
      <AuthContext.Provider
        value={{
          setSession: vi.fn(),
        }}
      >
        <MemoryRouter>
          <SignupPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/Aniket Goyal/i), {
      target: { value: 'Alice Example' },
    });
    fireEvent.change(screen.getByPlaceholderText(/name@company\.com/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Strong password/i), {
      target: { value: 'Password1' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Repeat password/i), {
      target: { value: 'Password2' },
    });
    fireEvent.submit(document.querySelector('form'));

    await waitFor(() => {
      expect(api.register).not.toHaveBeenCalled();
    });
    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });
});
