import AuthService from '../auth.service';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios;

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should send POST request to signin endpoint', async () => {
      const mockResponse = { data: { token: 'abc123', id: 1, login: 'testuser' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await AuthService.login('testuser', 'password');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/signin',
        { login: 'testuser', password: 'password' },
        expect.any(Object)
      );
      expect(result.data.token).toBe('abc123');
    });

    it('should allow status codes below 500', async () => {
      const mockResponse = { status: 401, data: { message: 'Bad credentials' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await AuthService.login('testuser', 'wrong');

      expect(result.status).toBe(401);
    });
  });

  describe('logout', () => {
    it('should remove token and user from localStorage', () => {
      localStorage.setItem('token', 'abc123');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      AuthService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return parsed user from localStorage', () => {
      const mockUser = { id: 1, login: 'testuser', roles: ['ROLE_USER'] };
      localStorage.setItem('user', JSON.stringify(mockUser));

      const result = AuthService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user in localStorage', () => {
      const result = AuthService.getCurrentUser();

      expect(result).toBeNull();
    });
  });
});
