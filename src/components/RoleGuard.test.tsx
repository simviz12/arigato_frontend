// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RoleGuard } from './RoleGuard';
import { useAuthStore } from '../store/authStore';

// Mock Zustand store
vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('RoleGuard', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactNode, initialEntries = ['/protected']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route path="/pos" element={<div data-testid="pos-page">POS Page</div>} />
          <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
            <Route path="/protected" element={<div data-testid="protected-content">Secret Admin Data</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it('redirects to /login when no accessToken exists', () => {
    // Mock unauthenticated state
    (useAuthStore as any).mockReturnValue({ accessToken: null, role: null });

    const { getByTestId, queryByTestId } = renderWithRouter(<div />);

    expect(getByTestId('login-page')).toBeDefined();
    expect(queryByTestId('protected-content')).toBeNull();
  });

  it('redirects to /pos when user role is not in allowedRoles', () => {
    // Mock authenticated CASHIER trying to access ADMIN route
    (useAuthStore as any).mockReturnValue({ accessToken: 'valid-token', role: 'CASHIER' });

    const { getByTestId, queryByTestId } = renderWithRouter(<div />);

    expect(getByTestId('pos-page')).toBeDefined();
    expect(queryByTestId('protected-content')).toBeNull();
  });

  it('renders Outlet (protected content) when role matches', () => {
    // Mock authenticated ADMIN
    (useAuthStore as any).mockReturnValue({ accessToken: 'valid-token', role: 'ADMIN' });

    const { getByTestId, queryByTestId } = renderWithRouter(<div />);

    expect(getByTestId('protected-content')).toBeDefined();
    expect(queryByTestId('login-page')).toBeNull();
    expect(queryByTestId('pos-page')).toBeNull();
  });
});
