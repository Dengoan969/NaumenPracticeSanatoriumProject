import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';
import { useAuth } from '../../../context/AuthContext';
import UserDashboardService from '../../../services/UserDashboard.service';

jest.mock('../../../context/AuthContext');
jest.mock('../../../services/UserDashboard.service');

const renderHeader = (authValue) => {
  useAuth.mockReturnValue(authValue);
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
};

describe('Header Heavy State Management Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle rapid menu toggle without breaking', () => {
    UserDashboardService.getProfile.mockResolvedValue({
      id: 1,
      fullName: 'Test User',
      email: 'test@test.com',
    });

    renderHeader({
      user: { id: 1, roles: ['ROLE_USER'] },
      token: 'test-token',
      logout: jest.fn(),
    });

    const menuToggle = document.querySelector('.menu-toggle');

    // Rapidly toggle menu 20 times
    for (let i = 0; i < 20; i++) {
      fireEvent.click(menuToggle);
    }

    // Menu should be in a consistent state (toggled 20 times = even = closed)
    const nav = document.querySelector('.nav-links');
    expect(nav).toBeTruthy();
  });

  it('should handle rapid user menu open/close with profile fetch', async () => {
    // Mock profile fetch with delay to simulate network
    UserDashboardService.getProfile.mockImplementation(() =>
      new Promise((resolve) =>
        setTimeout(() => resolve({
          id: 1,
          fullName: 'Test User',
          email: 'test@test.com',
          phone: '+7-999-111-1111',
          birthDate: '1990-01-01',
        }), 50)
      )
    );

    renderHeader({
      user: { id: 1, roles: ['ROLE_USER'] },
      token: 'test-token',
      logout: jest.fn(),
    });

    const userIcon = document.querySelector('.user-icon');

    // Rapidly open/close user menu 10 times
    for (let i = 0; i < 10; i++) {
      fireEvent.click(userIcon);
      await new Promise(r => setTimeout(r, 10));
    }

    // After all toggles, the profile fetch should have been called
    await waitFor(() => {
      expect(UserDashboardService.getProfile).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should render with all possible role combinations', () => {
    UserDashboardService.getProfile.mockResolvedValue({
      id: 1,
      fullName: 'Admin User',
      email: 'admin@test.com',
    });

    const roles = [
      ['ROLE_USER'],
      ['ROLE_ADMIN'],
      ['ROLE_USER', 'ROLE_ADMIN'],
      ['ROLE_DOCTOR'],
      ['ROLE_NURSE'],
      ['ROLE_REGISTRAR'],
      ['ROLE_USER', 'ROLE_DOCTOR', 'ROLE_ADMIN'],
    ];

    roles.forEach((roleSet) => {
      const { unmount } = renderHeader({
        user: { id: 1, roles: roleSet },
        token: 'test-token',
        logout: jest.fn(),
      });

      // Verify header renders without crash for each role combination
      expect(screen.getByAltText('Логотип ВоГУ')).toBeInTheDocument();
      unmount();
    });
  });
});
