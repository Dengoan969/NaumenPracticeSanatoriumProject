import procedureService from '../procedureService';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios;

describe('procedureService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProcedures = [
    { id: 1, name: 'Массаж', description: 'Лечебный массаж', price: 1500 },
    { id: 2, name: 'Физиотерапия', description: 'Физиотерапевтические процедуры', price: 2000 },
  ];

  describe('getAllProcedures', () => {
    it('should send GET request to procedures endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProcedures });

      const result = await procedureService.getAllProcedures();

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/procedures');
      expect(result.data).toEqual(mockProcedures);
    });

    it('should return procedures with correct structure', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProcedures });

      const result = await procedureService.getAllProcedures();

      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('name');
      expect(result.data[0]).toHaveProperty('description');
      expect(result.data[0]).toHaveProperty('price');
    });

    it('should handle network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(procedureService.getAllProcedures()).rejects.toThrow('Network Error');
    });

    it('should return empty array when no procedures', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      const result = await procedureService.getAllProcedures();

      expect(result.data).toEqual([]);
    });
  });
});