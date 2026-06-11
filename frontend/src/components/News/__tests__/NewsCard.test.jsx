import React from 'react';
import { render, screen } from '@testing-library/react';
import NewsCard from '../../News/NewsCard';

describe('NewsCard Component', () => {
  const defaultProps = {
    title: 'Test News Title',
    content: 'This is the news content for testing.',
    imageUrl: '/uploads/news/test.jpg',
  };

  it('should render title, content and image', () => {
    render(<NewsCard {...defaultProps} />);

    expect(screen.getByText('Test News Title')).toBeInTheDocument();
    expect(screen.getByText('This is the news content for testing.')).toBeInTheDocument();
    const image = screen.getByAltText('Test News Title');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/uploads/news/test.jpg');
  });

  it('should apply news-card class', () => {
    const { container } = render(<NewsCard {...defaultProps} />);

    expect(container.firstChild).toHaveClass('news-card');
  });

  it('should render with empty content', () => {
    render(<NewsCard title="Empty" content="" imageUrl="/img.jpg" />);

    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});
