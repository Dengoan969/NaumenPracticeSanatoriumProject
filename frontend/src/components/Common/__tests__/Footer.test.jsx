import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Footer from '../Footer';

// Mock AuthContext
const mockLogout = jest.fn();
const mockAuthContext = {
  user: null,
  token: null,
  login: jest.fn(),
  logout: mockLogout,
};

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
}));

describe('Footer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render footer element', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toBeTruthy();
  });

  it('should render hospital icon', () => {
    render(<Footer />);
    const hospitalIcon = document.querySelector('.fa-hospital-alt');
    expect(hospitalIcon).toBeTruthy();
  });

  it('should show feedback text for unauthenticated user', () => {
    mockAuthContext.user = null;
    mockAuthContext.token = null;

    render(<Footer />);

    expect(screen.getByText('Авторизуйтесь, чтобы оставить сообщение')).toBeInTheDocument();
  });

  it('should show feedback text for authenticated user', () => {
    mockAuthContext.user = {
      id: 1,
      login: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER'],
    };
    mockAuthContext.token = 'test-token';

    render(<Footer />);

    expect(screen.getByText('Есть жалобы или предложения?')).toBeInTheDocument();
  });

  it('should have disabled textarea for unauthenticated user', () => {
    mockAuthContext.user = null;
    mockAuthContext.token = null;

    render(<Footer />);

    const textarea = screen.getByPlaceholderText('Авторизуйтесь для отправки сообщения');
    expect(textarea).toBeDisabled();
  });

  it('should have enabled textarea for authenticated user', () => {
    mockAuthContext.user = {
      id: 1,
      login: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER'],
    };
    mockAuthContext.token = 'test-token';

    render(<Footer />);

    const textarea = screen.getByPlaceholderText('Ваше сообщение (максимум 1000 символов)');
    expect(textarea).toBeEnabled();
  });

  it('should have disabled send button for unauthenticated user', () => {
    mockAuthContext.user = null;
    mockAuthContext.token = null;

    render(<Footer />);

    const sendButton = screen.getByLabelText('Отправить сообщение');
    expect(sendButton).toBeDisabled();
  });

  it('should have disabled send button when message is empty for authenticated user', () => {
    mockAuthContext.user = {
      id: 1,
      login: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER'],
    };
    mockAuthContext.token = 'test-token';

    render(<Footer />);

    const sendButton = screen.getByLabelText('Отправить сообщение');
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when message is not empty', () => {
    mockAuthContext.user = {
      id: 1,
      login: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER'],
    };
    mockAuthContext.token = 'test-token';

    render(<Footer />);

    const textarea = screen.getByPlaceholderText('Ваше сообщение (максимум 1000 символов)');
    fireEvent.change(textarea, { target: { value: 'Test message' } });

    const sendButton = screen.getByLabelText('Отправить сообщение');
    expect(sendButton).toBeEnabled();
  });

  it('should show char counter for authenticated user', () => {
    mockAuthContext.user = {
      id: 1,
      login: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER'],
    };
    mockAuthContext.token = 'test-token';

    render(<Footer />);

    expect(screen.getByText(/\/1000 символов/)).toBeInTheDocument();
  });

  it('should update char counter when typing', () => {
    mockAuthContext.user = {
      id: 1,
      login: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER'],
    };
    mockAuthContext.token = 'test-token';

    render(<Footer />);

    const textarea = screen.getByPlaceholderText('Ваше сообщение (максимум 1000 символов)');
    fireEvent.change(textarea, { target: { value: 'Hello' } });

    expect(screen.getByText('5/1000 символов')).toBeInTheDocument();
  });

  it('should send feedback message successfully', async () => {
    const mockAxios = require('axios');
    mockAxios.post.mockResolvedValue({ status: 200 });

    mockAuthContext.user = {
      id: 1,
      login: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER'],
    };
    mockAuthContext.token = 'test-token';

    render(<Footer />);

    const textarea = screen.getByPlaceholderText('Ваше сообщение (максимум 1000 символов)');
    fireEvent.change(textarea, { target: { value: 'Test feedback message' } });

    const sendButton = screen.getByLabelText('Отправить сообщение');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/feedback',
        expect.objectContaining({
          message: 'Test feedback message',
          userId: 1,
        }),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        })
      );
    });

    // Success notification should appear
    await waitFor(() => {
      expect(screen.getByText('Сообщение успешно отправлено!')).toBeInTheDocument();
    });
  });

  it('should handle feedback send error', async () => {
    const mockAxios = require('axios');
    mockAxios.post.mockRejectedValue({
      response: { status: 500, data: { message: 'Server error' } },
    });

    mockAuthContext.user = {
      id: 1,
      login: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER'],
    };
    mockAuthContext.token = 'test-token';

    render(<Footer />);

    const textarea = screen.getByPlaceholderText('Ваше сообщение (максимум 1000 символов)');
    fireEvent.change(textarea, { target: { value: 'Test message' } });

    const sendButton = screen.getByLabelText('Отправить сообщение');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('should handle 401 error during feedback send', async () => {
    const mockAxios = require('axios');
    mockAxios.post.mockRejectedValue({
      response: { status: 401, data: { message: 'Unauthorized' } },
    });

    mockAuthContext.user = {
      id: 1,
      login: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER'],
    };
    mockAuthContext.token = 'test-token';

    render(<Footer />);

    const textarea = screen.getByPlaceholderText('Ваше сообщение (максимум 1000 символов)');
    fireEvent.change(textarea, { target: { value: 'Test message' } });

    const sendButton = screen.getByLabelText('Отправить сообщение');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Сессия истекла. Пожалуйста, войдите снова')).toBeInTheDocument();
    });

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should have correct CSS classes', () => {
    const { container } = render(<Footer />);

    expect(container.querySelector('.footer-content')).toBeTruthy();
    expect(container.querySelector('.footer-center')).toBeTruthy();
    expect(container.querySelector('.footer-right')).toBeTruthy();
    expect(container.querySelector('.feedback-container')).toBeTruthy();
    expect(container.querySelector('.feedback-text')).toBeTruthy();
  });

  it('should have aria-label on send button', () => {
    render(<Footer />);

    const sendButton = screen.getByLabelText('Отправить сообщение');
    expect(sendButton).toBeTruthy();
  });

  it('should have title attribute on send button for unauthenticated user', () => {
    mockAuthContext.user = null;
    mockAuthContext.token = null;

    render(<Footer />);

    const sendButton = screen.getByLabelText('Отправить сообщение');
    expect(sendButton).toHaveAttribute('title', 'Требуется авторизация');
  });
});