import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NewsSection from '../NewsSection';
import newsService from '../../../services/news.service';

jest.mock('../../../services/news.service');

describe('NewsSection Heavy Rendering Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle rendering with 200 news items without crashing', async () => {
    const manyNews = Array.from({ length: 200 }, (_, i) => ({
      id: i + 1,
      title: `News Item ${i + 1}`,
      content: `Content for news item number ${i + 1}. This is a longer description to simulate real data.`,
      imageUrl: `/images/news${(i % 5) + 1}.jpg`,
      createdAt: new Date(2026, 5, (i % 30) + 1).toISOString(),
    }));

    newsService.getAllNews.mockResolvedValue({ data: manyNews });
    render(<BrowserRouter><NewsSection /></BrowserRouter>);

    // Wait for the component to process all 200 items
    await waitFor(() => {
      expect(screen.getByText('News Item 1')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify only first 3 are shown (component limit)
    expect(screen.getByText('News Item 1')).toBeInTheDocument();
    expect(screen.getByText('News Item 2')).toBeInTheDocument();
    expect(screen.getByText('News Item 3')).toBeInTheDocument();
    expect(screen.queryByText('News Item 4')).not.toBeInTheDocument();
    expect(screen.queryByText('News Item 200')).not.toBeInTheDocument();

    // Verify getAllNews was called
    expect(newsService.getAllNews).toHaveBeenCalledTimes(1);
  });

  it('should handle rapid re-renders with large datasets', async () => {
    // Simulate 3 rapid data fetches with different data sizes
    const smallSet = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      title: `Small ${i + 1}`,
      content: `Content ${i + 1}`,
      imageUrl: `/images/news${(i % 3) + 1}.jpg`,
      createdAt: new Date(2026, 5, i + 1).toISOString(),
    }));

    const largeSet = Array.from({ length: 150 }, (_, i) => ({
      id: i + 100,
      title: `Large Item ${i + 1}`,
      content: `Large content for item ${i + 1}`,
      imageUrl: `/images/news${(i % 5) + 1}.jpg`,
      createdAt: new Date(2026, 5, (i % 30) + 1).toISOString(),
    }));

    // First render with small set
    newsService.getAllNews.mockResolvedValueOnce({ data: smallSet });
    const { rerender } = render(<BrowserRouter><NewsSection /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Small 1')).toBeInTheDocument();
    });

    // Re-render with large set (simulating data refresh)
    newsService.getAllNews.mockResolvedValueOnce({ data: largeSet });
    rerender(<BrowserRouter><NewsSection key="rerender-1" /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Large Item 1')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify only first 3 large items are shown
    expect(screen.getByText('Large Item 1')).toBeInTheDocument();
    expect(screen.getByText('Large Item 2')).toBeInTheDocument();
    expect(screen.getByText('Large Item 3')).toBeInTheDocument();
    expect(screen.queryByText('Large Item 4')).not.toBeInTheDocument();
  });
});
