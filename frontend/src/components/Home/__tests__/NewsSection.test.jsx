import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NewsSection from '../NewsSection';
import newsService from '../../../services/news.service';

jest.mock('../../../services/news.service');

const mockNews = [
  { id: 1, title: 'Новость 1', content: 'Содержание 1', imageUrl: '/images/news1.jpg', createdAt: '2026-06-01T10:00:00Z' },
  { id: 2, title: 'Новость 2', content: 'Содержание 2', imageUrl: '/images/news2.jpg', createdAt: '2026-06-02T10:00:00Z' },
  { id: 3, title: 'Новость 3', content: 'Содержание 3', imageUrl: '/images/news3.jpg', createdAt: '2026-06-03T10:00:00Z' },
];

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('NewsSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render section title', () => {
    newsService.getAllNews.mockResolvedValue({ data: [] });
    renderWithRouter(<NewsSection />);
    expect(screen.getByText('Последние новости')).toBeInTheDocument();
  });

  it('should render "Все новости" link', () => {
    newsService.getAllNews.mockResolvedValue({ data: [] });
    renderWithRouter(<NewsSection />);
    const link = screen.getByRole('link', { name: /все новости/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/news');
  });

  it('should fetch and display up to 3 news items', async () => {
    newsService.getAllNews.mockResolvedValue({ data: mockNews });
    renderWithRouter(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText('Новость 1')).toBeInTheDocument();
      expect(screen.getByText('Новость 2')).toBeInTheDocument();
      expect(screen.getByText('Новость 3')).toBeInTheDocument();
    });
  });

  it('should limit displayed news to 3 items', async () => {
    const manyNews = [
      ...mockNews,
      { id: 4, title: 'Новость 4', content: 'Содержание 4', imageUrl: '/images/news4.jpg', createdAt: '2026-06-04T10:00:00Z' },
      { id: 5, title: 'Новость 5', content: 'Содержание 5', imageUrl: '/images/news5.jpg', createdAt: '2026-06-05T10:00:00Z' },
    ];
    newsService.getAllNews.mockResolvedValue({ data: manyNews });
    renderWithRouter(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText('Новость 1')).toBeInTheDocument();
      expect(screen.getByText('Новость 3')).toBeInTheDocument();
    });

    expect(screen.queryByText('Новость 4')).not.toBeInTheDocument();
    expect(screen.queryByText('Новость 5')).not.toBeInTheDocument();
  });

  it('should handle empty news list', async () => {
    newsService.getAllNews.mockResolvedValue({ data: [] });
    renderWithRouter(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText('Последние новости')).toBeInTheDocument();
    });

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should handle fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    newsService.getAllNews.mockRejectedValue(new Error('Network Error'));
    renderWithRouter(<NewsSection />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching news:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should render news cards with correct structure', async () => {
    newsService.getAllNews.mockResolvedValue({ data: mockNews });
    const { container } = render(<BrowserRouter><NewsSection /></BrowserRouter>);

    await waitFor(() => {
      expect(container.querySelector('.news-frame')).toBeTruthy();
      expect(container.querySelector('.news-header')).toBeTruthy();
      expect(container.querySelector('.news-cards-container')).toBeTruthy();
    });
  });

  it('should call getAllNews on mount', () => {
    newsService.getAllNews.mockResolvedValue({ data: [] });
    renderWithRouter(<NewsSection />);
    expect(newsService.getAllNews).toHaveBeenCalledTimes(1);
  });
});