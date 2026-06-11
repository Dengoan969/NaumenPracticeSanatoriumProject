import React from 'react';
import { render, screen } from '@testing-library/react';
import NewsList from '../NewsList';

const mockNews = [
  { id: 1, title: 'Новость 1', content: 'Содержание 1', imageUrl: '/images/news1.jpg', createdAt: '2026-06-01T10:00:00Z' },
  { id: 2, title: 'Новость 2', content: 'Содержание 2', imageUrl: '/images/news2.jpg', createdAt: '2026-06-02T10:00:00Z' },
];

describe('NewsList Component', () => {
  it('should render all news items', () => {
    render(<NewsList news={mockNews} />);
    expect(screen.getByText('Новость 1')).toBeInTheDocument();
    expect(screen.getByText('Новость 2')).toBeInTheDocument();
  });

  it('should render news content', () => {
    render(<NewsList news={mockNews} />);
    expect(screen.getByText('Содержание 1')).toBeInTheDocument();
    expect(screen.getByText('Содержание 2')).toBeInTheDocument();
  });

  it('should render images with correct alt text', () => {
    render(<NewsList news={mockNews} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('alt', 'Новость 1');
    expect(images[1]).toHaveAttribute('alt', 'Новость 2');
  });

  it('should render images with correct src', () => {
    render(<NewsList news={mockNews} />);
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', '/images/news1.jpg');
    expect(images[1]).toHaveAttribute('src', '/images/news2.jpg');
  });

  it('should render dates in locale format', () => {
    render(<NewsList news={mockNews} />);
    expect(screen.getByText('01.06.2026')).toBeInTheDocument();
    expect(screen.getByText('02.06.2026')).toBeInTheDocument();
  });

  it('should render empty list when no news provided', () => {
    const { container } = render(<NewsList news={[]} />);
    expect(container.querySelector('.news-list-container')).toBeTruthy();
    expect(container.querySelector('.news-list-item')).toBeNull();
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(<NewsList news={mockNews} />);
    expect(container.querySelector('.news-list-container')).toBeTruthy();
    expect(container.querySelector('.news-list-item')).toBeTruthy();
    expect(container.querySelector('.news-list-image')).toBeTruthy();
    expect(container.querySelector('.news-list-content')).toBeTruthy();
    expect(container.querySelector('.news-list-date')).toBeTruthy();
    expect(container.querySelector('.news-list-text')).toBeTruthy();
  });

  it('should handle single news item', () => {
    const singleNews = [mockNews[0]];
    render(<NewsList news={singleNews} />);
    expect(screen.getByText('Новость 1')).toBeInTheDocument();
    expect(screen.queryByText('Новость 2')).not.toBeInTheDocument();
  });
});
