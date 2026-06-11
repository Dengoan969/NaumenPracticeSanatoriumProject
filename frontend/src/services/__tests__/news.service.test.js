import newsService from '../news.service';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios;

describe('newsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllNews', () => {
    it('should send GET request to news endpoint', async () => {
      const mockNews = [
        { id: 1, title: 'News 1', content: 'Content 1' },
        { id: 2, title: 'News 2', content: 'Content 2' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockNews });

      const result = await newsService.getAllNews();

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/news');
      expect(result.data).toEqual(mockNews);
    });

    it('should handle network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(newsService.getAllNews()).rejects.toThrow('Network Error');
    });

    it('should return empty array when no news', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      const result = await newsService.getAllNews();

      expect(result.data).toEqual([]);
    });

    it('should return news with correct structure', async () => {
      const mockNews = [
        { id: 1, title: 'News 1', content: 'Content 1', imageUrl: '/img.jpg', createdAt: '2026-06-01T10:00:00Z' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockNews });

      const result = await newsService.getAllNews();

      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('title');
      expect(result.data[0]).toHaveProperty('content');
      expect(result.data[0]).toHaveProperty('imageUrl');
      expect(result.data[0]).toHaveProperty('createdAt');
    });
  });

  describe('createNews', () => {
    it('should send POST request with news data', async () => {
      const mockResponse = { data: { id: 1, title: 'New', content: 'Body' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await newsService.createNews('New', 'Body', '/img.jpg');

      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8080/api/news', {
        title: 'New',
        content: 'Body',
        imageUrl: '/img.jpg',
      });
      expect(result.data.title).toBe('New');
    });

    it('should create news without imageUrl', async () => {
      const mockResponse = { data: { id: 1, title: 'No Image', content: 'Content' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await newsService.createNews('No Image', 'Content', '');

      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8080/api/news', {
        title: 'No Image',
        content: 'Content',
        imageUrl: '',
      });
      expect(result.data.id).toBe(1);
    });

    it('should handle server error on create', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Server Error'));

      await expect(newsService.createNews('Fail', 'Fail', ''))
        .rejects.toThrow('Server Error');
    });
  });
});
