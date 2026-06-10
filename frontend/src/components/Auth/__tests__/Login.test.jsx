import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';

const mockAuthLogin = jest.fn();

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockAuthLogin,
    user: null,
    token: null,
    logout: jest.fn(),
  }),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Login Component', () => {
  beforeEach(() => {
    mockAuthLogin.mockReset();
    mockNavigate.mockReset();
  });

  it('should render login form', () => {
    renderWithRouter(<Login />);

    expect(screen.getByPlaceholderText('Логин')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByText('Войти')).toBeInTheDocument();
    expect(screen.getByText('Забыли пароль?')).toBeInTheDocument();
  });

  it('should show error when submitting empty form', () => {
    renderWithRouter(<Login />);

    fireEvent.click(screen.getByText('Войти'));

    expect(screen.getByText('Логин и пароль обязательны')).toBeInTheDocument();
  });

  it('should call authLogin with credentials on submit', async () => {
    mockAuthLogin.mockResolvedValue({ success: true });
    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Логин'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByText('Войти'));

    await waitFor(() => {
      expect(mockAuthLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('should navigate to /profile on successful login', async () => {
    mockAuthLogin.mockResolvedValue({ success: true });
    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Логин'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByText('Войти'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  it('should show error message on failed login', async () => {
    mockAuthLogin.mockResolvedValue({ success: false, message: 'Неверный пароль' });
    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Логин'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByText('Войти'));

    await waitFor(() => {
      expect(screen.getByText('Неверный пароль')).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', () => {
    renderWithRouter(<Login />);

    const passwordInput = screen.getByPlaceholderText('Пароль');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleIcon = document.querySelector('.toggle-password');
    fireEvent.click(toggleIcon);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('should show forgot password message when clicked', () => {
    renderWithRouter(<Login />);

    fireEvent.click(screen.getByText('Забыли пароль?'));

    expect(screen.getByText(/Какая жалость!/)).toBeInTheDocument();
  });

  it('should disable inputs while loading', async () => {
    mockAuthLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );
    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Логин'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByText('Войти'));

    expect(screen.getByPlaceholderText('Логин')).toBeDisabled();
    expect(screen.getByPlaceholderText('Пароль')).toBeDisabled();
    expect(screen.getByText('Вход...')).toBeDisabled();
  });
});
