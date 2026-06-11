import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../Layout';

jest.mock('../Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../Footer', () => () => <div data-testid="mock-footer">Footer</div>);

describe('Layout Component', () => {
  it('should render Header component', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });

  it('should render Footer component', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });

  it('should render main element', () => {
    const { container } = render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    const main = container.querySelector('main');
    expect(main).toBeTruthy();
    expect(main).toHaveClass('flex-grow-1');
  });

  it('should render wrapper div with correct classes', () => {
    const { container } = render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    const wrapper = container.querySelector('.d-flex');
    expect(wrapper).toBeTruthy();
    expect(wrapper).toHaveClass('flex-column');
    expect(wrapper).toHaveClass('min-vh-100');
  });

  it('should render Outlet placeholder', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/test']}>
        <Layout />
      </MemoryRouter>
    );
    const main = container.querySelector('main');
    expect(main).toBeTruthy();
  });
});
