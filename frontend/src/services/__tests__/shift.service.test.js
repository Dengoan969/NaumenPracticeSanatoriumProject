import shiftService from '../shift.service';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios;

describe('shiftService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockShifts = [
    { id: 1, name: 'Summer Shift', startDate: '2026-06-01', endDate: '2026-06-14', active: true },
  ];

  describe('getAllShifts', () => {
    it('should send GET request to shifts endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockShifts });

      const result = await shiftService.getAllShifts();

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/shifts');
      expect(result.data).toEqual(mockShifts);
    });

    it('should handle network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(shiftService.getAllShifts()).rejects.toThrow('Network Error');
    });
  });

  describe('getActiveShifts', () => {
    it('should send GET request for active shifts', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockShifts });

      const result = await shiftService.getActiveShifts();

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/shifts/active');
      expect(result.data).toEqual(mockShifts);
    });

    it('should return empty array when no active shifts', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      const result = await shiftService.getActiveShifts();

      expect(result.data).toEqual([]);
    });
  });
});
