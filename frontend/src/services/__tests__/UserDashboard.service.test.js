import UserDashboardService from '../UserDashboard.service';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios;

describe('UserDashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockToken = 'test-jwt-token';
  const mockUserId = 1;

  describe('getProfile', () => {
    it('should send GET request with auth header', async () => {
      const mockProfile = { id: 1, fullName: 'Test User', email: 'test@example.com' };
      mockedAxios.get.mockResolvedValue({ data: mockProfile });

      const result = await UserDashboardService.getProfile(mockUserId, mockToken);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/1/profile',
        { headers: { Authorization: 'Bearer test-jwt-token' } }
      );
      expect(result).toEqual(mockProfile);
    });

    it('should handle network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(UserDashboardService.getProfile(mockUserId, mockToken))
        .rejects.toThrow('Network Error');
    });

    it('should handle 401 error', async () => {
      mockedAxios.get.mockRejectedValue({ response: { status: 401 } });

      await expect(UserDashboardService.getProfile(mockUserId, mockToken))
        .rejects.toEqual({ response: { status: 401 } });
    });
  });

  describe('getShifts', () => {
    it('should send GET request with auth header', async () => {
      const mockShifts = [{ id: 1, name: 'Summer Shift' }];
      mockedAxios.get.mockResolvedValue({ data: mockShifts });

      const result = await UserDashboardService.getShifts(mockUserId, mockToken);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/1/shifts',
        { headers: { Authorization: 'Bearer test-jwt-token' } }
      );
      expect(result).toEqual(mockShifts);
    });

    it('should return empty array when no shifts', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      const result = await UserDashboardService.getShifts(mockUserId, mockToken);

      expect(result).toEqual([]);
    });
  });

  describe('getActiveShifts', () => {
    it('should send GET request without auth', async () => {
      const mockShifts = [{ id: 1, name: 'Active Shift', active: true }];
      mockedAxios.get.mockResolvedValue({ data: mockShifts });

      const result = await UserDashboardService.getActiveShifts();

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/shifts/active');
      expect(result).toEqual(mockShifts);
    });

    it('should return only active shifts', async () => {
      const mockShifts = [
        { id: 1, name: 'Active Shift', active: true },
        { id: 2, name: 'Inactive Shift', active: false },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockShifts });

      const result = await UserDashboardService.getActiveShifts();

      expect(result).toHaveLength(2);
    });
  });
});
