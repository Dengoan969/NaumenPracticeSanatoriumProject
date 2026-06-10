import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import HeroSection from '../HeroSection';

// Mock image imports
jest.mock('../../../images/hero-1.jpg', () => 'hero-1-mock.jpg');
jest.mock('../../../images/hero-2.jpg', () => 'hero-2-mock.jpg');
jest.mock('../../../images/hero-3.jpg', () => 'hero-3-mock.jpg');

describe('HeroSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render hero section wrapper', () => {
    const { container } = render(<HeroSection />);
    expect(container.querySelector('.hero-wrapper')).toBeTruthy();
    expect(container.querySelector('.hero-container')).toBeTruthy();
  });

  it('should render welcome text', () => {
    render(<HeroSection />);
    expect(screen.getByText('Добро пожаловать!')).toBeInTheDocument();
  });

  it('should render hero image', () => {
    render(<HeroSection />);
    const image = screen.getByAltText('Фотография санатория');
    expect(image).toBeInTheDocument();
    expect(image).toHaveClass('hero-image');
  });

  it('should render indicator dots', () => {
    const { container } = render(<HeroSection />);
    const indicators = container.querySelectorAll('.indicator');
    expect(indicators.length).toBe(3);
  });

  it('should have first indicator active by default', () => {
    const { container } = render(<HeroSection />);
    const indicators = container.querySelectorAll('.indicator');
    expect(indicators[0]).toHaveClass('active');
    expect(indicators[1]).not.toHaveClass('active');
    expect(indicators[2]).not.toHaveClass('active');
  });

  it('should change image when indicator is clicked', () => {
    const { container } = render(<HeroSection />);
    const indicators = container.querySelectorAll('.indicator');

    // Click second indicator
    fireEvent.click(indicators[1]);
    expect(indicators[1]).toHaveClass('active');
    expect(indicators[0]).not.toHaveClass('active');
  });

  it('should auto-advance slides every 5 seconds', () => {
    const { container } = render(<HeroSection />);
    const indicators = container.querySelectorAll('.indicator');

    // Initially first is active
    expect(indicators[0]).toHaveClass('active');

    // Advance 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Second should be active now
    expect(indicators[1]).toHaveClass('active');

    // Advance another 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Third should be active now
    expect(indicators[2]).toHaveClass('active');
  });

  it('should loop back to first image after last', () => {
    const { container } = render(<HeroSection />);
    const indicators = container.querySelectorAll('.indicator');

    // Advance 15 seconds (3 slides)
    act(() => {
      jest.advanceTimersByTime(15000);
    });

    // Should be back to first
    expect(indicators[0]).toHaveClass('active');
  });

  it('should render correct number of indicators', () => {
    const { container } = render(<HeroSection />);
    const indicators = container.querySelectorAll('.indicator');
    expect(indicators.length).toBe(3);
  });

  it('should have hero-image with correct src', () => {
    render(<HeroSection />);
    const image = screen.getByAltText('Фотография санатория');
    expect(image).toHaveAttribute('src', 'hero-1-mock.jpg');
  });

  it('should clear interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const { unmount } = render(<HeroSection />);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});