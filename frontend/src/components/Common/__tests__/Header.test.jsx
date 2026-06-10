import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

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

// Mock UserDashboardService
jest.mock('../../../services/UserDashboard.service', () => ({
  getProfile: jest.fn(),
}));

// Mock image import
jest.mock('../../../images/logo.jpg', () => 'logo-mock.jpg');

describe('Header Component', () => {
  const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render logo with correct alt text', () => {
    mockAuthContext.user = null;
    mockAuthContext.token = null;

    renderWithRouter(<Header />);

    const logo = screen.getByAltText('Логотип ВоГУ');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'logo-mock.jpg');
  });

  it('should render navigation links for unauthenticated user', () => {
    mockAuthContext.user = null;
    mockAuthContext.token = null;

    renderWithRouter(<Header />);

    expect(screen.getByText('О санатории')).toBeInTheDocument();
    expect(screen.getByText('Смены')).toBeInTheDocument();
    expect(screen.getByText('Услуги')).toBeInTheDocument();
    expect(screen.getByText('Контакты')).toBeInTheDocument();
  });

  it('should render login icon link for unauthenticated user', () => {
    mockAuthContext.user = null;
    mockAuthContext.token = null;

    renderWithRouter(<Header />);

    const authLinks = screen.getAllByRole('link');
    const authLink = authLinks.find(link => link.getAttribute('href') === '/auth');
    expect(authLink).toBeTruthy();
    expect(authLink).toHaveAttribute('href', '/auth');
  });

  it('should render user icon for authenticated user', () => {
    mockAuthContext.user = {
      id: 1,
      login: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER'],
    };
    mockAuthContext.token = 'test-token';

    renderWithRouter(<Header />);

    const userIcon = document.querySelector('.fa-user');
    expect(userIcon).toBeInTheDocument();
  });

  it('should show user dropdown when user icon is clicked', async () => {
    const mockGetProfile = require('../../../services/UserDashboard.service').getProfile;
    mockGetProfile.mockResolvedValue({
      fullName: 'Тестовый Пользователь',
      email: 'test@example.com',
    });

    mockAuthContext.user = {
      id: 1,
      login: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER'],
    };
    mockAuthContext.token = 'test-token';

    renderWithRouter(<Header />);

    // Click user icon to open dropdown
    const userIcon = document.querySelector('.user-icon');
    fireEvent.click(userIcon);

    // Check dropdown items
    await waitFor(() => {
      expect(screen.getByText('Профиль')).toBeInTheDocument();
      expect(screen.getByText('Выйти')).toBeInTheDocument();
    });
  });

  it('should call logout when logout button is clicked', async () => {
    const mockGetProfile = require('../../../services/UserDashboard.service').getProfile;
    mockGetProfile.mockResolvedValue({
      fullName: 'Тестовый Пользователь',
      email: 'test@example.com',
    });

    mockAuthContext.user = {
      id: 1,
      login: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER'],
    };
    mockAuthContext.token = 'test-token';

    renderWithRouter(<Header />);

    // Open dropdown
    const userIcon = document.querySelector('.user-icon');
    fireEvent.click(userIcon);

    // Click logout
    await waitFor(() => {
      const logoutButton = screen.getByText('Выйти');
      fireEvent.click(logoutButton);
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('should show admin link for admin user', async () => {
    const mockGetProfile = require('../../../services/UserDashboard.service').getProfile;
    mockGetProfile.mockResolvedValue({
      fullName: 'Администратор',
      email: 'admin@example.com',
    });

    mockAuthContext.user = {
      id: 2,
      login: 'admin',
      email: 'admin@example.com',
      roles: ['ROLE_ADMIN'],
    };
    mockAuthContext.token = 'admin-token';

    renderWithRouter(<Header />);

    // Admin link should be visible in nav
    expect(screen.getByText('Админ')).toBeInTheDocument();
    expect(screen.getByText('Админ').closest('a')).toHaveAttribute('href', '/profile');
  });

  it('should toggle mobile menu when hamburger button is clicked', () => {
    mockAuthContext.user = null;
    mockAuthContext.token = null;

    renderWithRouter(<Header />);

    // Find hamburger menu toggle (fa-bars icon)
    const menuToggle = document.querySelector('.menu-toggle');
    expect(menuToggle).toBeInTheDocument();
    expect(menuToggle).toHaveClass('fa-bars');

    // Click to open menu
    fireEvent.click(menuToggle);
    expect(menuToggle).toHaveClass('fa-times');

    // Click to close menu
    fireEvent.click(menuToggle);
    expect(menuToggle).toHaveClass('fa-bars');
  });

  it('should toggle search bar when search icon is clicked', () => {
    mockAuthContext.user = null;
    mockAuthContext.token = null;

    renderWithRouter(<Header />);

    // Search should be collapsed initially
    const searchContainer = document.querySelector('.search-container');
    expect(searchContainer).not.toHaveClass('expanded');

    // Click search to expand
    fireEvent.click(searchContainer);
    expect(searchContainer).toHaveClass('expanded');

    // Search input should appear
    const searchInput = document.querySelector('.search-form input');
    expect(searchInput).toBeInTheDocument();
  });

  it('should navigate to search page on search submit', () => {
    mockAuthContext.user = null;
    mockAuthContext.token = null;

    renderWithRouter(<Header />);

    // Expand search
    const searchContainer = document.querySelector('.search-container');
    fireEvent.click(searchContainer);

    // Type search query
    const searchInput = document.querySelector('.search-form input');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    // Submit search
    const searchForm = document.querySelector('.search-form');
    fireEvent.submit(searchForm);

    // Search should collapse after submit
    expect(searchContainer).not.toHaveClass('expanded');
  });

  it('should close user dropdown when clicking outside', async () => {
    const mockGetProfile = require('../../../services/UserDashboard.service').getProfile;
    mockGetProfile.mockResolvedValue({
      fullName: 'Тестовый Пользователь',
      email: 'test@example.com',
    });

    mockAuthContext.user = {
      id: 1,
      login: 'testuser',
      email: 'test@example.com',
      roles: ['ROLE_USER'],
    };
    mockAuthContext.token = 'test-token';

    renderWithRouter(<Header />);

    // Open dropdown
    const userIcon = document.querySelector('.user-icon');
    fireEvent.click(userIcon);

    // Dropdown should be visible
    await waitFor(() => {
      expect(screen.getByText('Профиль')).toBeInTheDocument();
    });

    // Click outside (document body)
    fireEvent.mouseDown(document.body);

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByText('Профиль')).not.toBeInTheDocument();
    });
  });

  it('should render with correct header class', () => {
    mockAuthContext.user = null;
    mockAuthContext.token = null;

    const { container } = renderWithRouter(<Header />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('fixed-top');
  });
});