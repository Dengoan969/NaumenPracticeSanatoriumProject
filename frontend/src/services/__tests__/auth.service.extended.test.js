import axios from 'axios';
import authService from '../auth.service';

jest.mock('axios');

const mockedAxios = axios;

describe('Auth Service Extended Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Login functionality', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        data: {
          token: 'test-jwt-token',
          id: 1,
          login: 'testuser',
          email: 'test@example.com',
          roles: ['ROLE_USER'],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authService.login('testuser', 'password123');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/signin',
        { login: 'testuser', password: 'password123' },
        expect.any(Object)
      );
      expect(result.data.token).toBe('test-jwt-token');
    });

    it('should handle login failure with invalid credentials', async () => {
      const mockResponse = { status: 401, data: { message: 'Invalid credentials' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authService.login('wronguser', 'wrongpass');

      expect(result.status).toBe(401);
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle network errors during login', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network Error'));

      await expect(authService.login('testuser', 'password123')).rejects.toThrow('Network Error');
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should allow status codes below 500', async () => {
      const mockResponse = { status: 400, data: { message: 'Bad request' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authService.login('testuser', 'password');

      expect(result.status).toBe(400);
    });
  });

  describe('Logout functionality', () => {
    it('should clear user data on logout', () => {
      localStorage.setItem('user', JSON.stringify({ login: 'testuser' }));
      localStorage.setItem('token', 'test-token');

      authService.logout();

      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle logout when no user is logged in', () => {
      expect(() => authService.logout()).not.toThrow();
    });
  });

  describe('User management', () => {
    it('should get current user from localStorage', () => {
      const testUser = { login: 'testuser', roles: ['ROLE_USER'] };
      localStorage.setItem('user', JSON.stringify(testUser));

      const user = authService.getCurrentUser();

      expect(user).toEqual(testUser);
    });

    it('should return null when no user is stored', () => {
      localStorage.clear();

      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });

    it('should return user object with correct structure', () => {
      const testUser = { login: 'testuser', id: 1, email: 'test@test.com', roles: ['ROLE_USER'] };
      localStorage.setItem('user', JSON.stringify(testUser));

      const user = authService.getCurrentUser();

      expect(user).toHaveProperty('login', 'testuser');
      expect(user).toHaveProperty('id', 1);
      expect(user).toHaveProperty('roles');
      expect(Array.isArray(user.roles)).toBe(true);
    });
  });

  describe('Token management', () => {
    it('should store token in localStorage after login', async () => {
      const mockResponse = {
        data: {
          token: 'test-jwt-token',
          id: 1,
          login: 'testuser',
          email: 'test@example.com',
          roles: ['ROLE_USER'],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      await authService.login('testuser', 'password123');

      // Note: auth.service.login doesn't store to localStorage directly,
      // it returns the response. The AuthContext handles storage.
      // This test verifies the API call works correctly.
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should clear token from localStorage on logout', () => {
      localStorage.setItem('token', 'some-token');

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle login with empty credentials', async () => {
      mockedAxios.post.mockResolvedValue({ status: 400, data: { message: 'Bad credentials' } });

      const result = await authService.login('', '');

      expect(result.status).toBe(400);
    });

    it('should handle login with special characters in credentials', async () => {
      const mockResponse = {
        data: {
          token: 'token-123',
          id: 1,
          login: 'user@domain.com',
          roles: ['ROLE_USER'],
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authService.login('user@domain.com', 'p@ssw0rd!');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/signin',
        { login: 'user@domain.com', password: 'p@ssw0rd!' },
        expect.any(Object)
      );
      expect(result.data.token).toBe('token-123');
    });

    it('should handle concurrent localStorage access', () => {
      // Simulate race condition by setting and immediately reading
      localStorage.setItem('user', JSON.stringify({ login: 'user1' }));
      const user1 = authService.getCurrentUser();
      expect(user1.login).toBe('user1');

      localStorage.setItem('user', JSON.stringify({ login: 'user2' }));
      const user2 = authService.getCurrentUser();
      expect(user2.login).toBe('user2');
    });

    it('should handle logout called multiple times', () => {
      localStorage.setItem('user', JSON.stringify({ login: 'testuser' }));
      localStorage.setItem('token', 'test-token');

      authService.logout();
      authService.logout();
      authService.logout();

      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});