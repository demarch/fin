import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Toast from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render toast with message', () => {
    const onClose = vi.fn();
    render(<Toast id="1" message="Test message" type="success" onClose={onClose} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render with role="alert"', () => {
    const onClose = vi.fn();
    render(<Toast id="1" message="Test" type="success" onClose={onClose} />);

    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
  });

  it('should render success toast with correct styling', () => {
    const onClose = vi.fn();
    render(<Toast id="1" message="Success" type="success" onClose={onClose} />);

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800');
  });

  it('should render error toast with correct styling', () => {
    const onClose = vi.fn();
    render(<Toast id="1" message="Error" type="error" onClose={onClose} />);

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
  });

  it('should render warning toast with correct styling', () => {
    const onClose = vi.fn();
    render(<Toast id="1" message="Warning" type="warning" onClose={onClose} />);

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800');
  });

  it('should render info toast with correct styling', () => {
    const onClose = vi.fn();
    render(<Toast id="1" message="Info" type="info" onClose={onClose} />);

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();

    render(<Toast id="1" message="Test" type="success" onClose={onClose} />);

    const closeButton = screen.getByLabelText('Fechar notificação');
    closeButton.click();

    expect(onClose).toHaveBeenCalledWith('1');
  });

  it('should auto-dismiss after default duration (5000ms)', () => {
    const onClose = vi.fn();
    render(<Toast id="1" message="Test" type="success" onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5000);

    expect(onClose).toHaveBeenCalledWith('1');
  });

  it('should auto-dismiss after custom duration', () => {
    const onClose = vi.fn();
    render(<Toast id="1" message="Test" type="success" duration={3000} onClose={onClose} />);

    vi.advanceTimersByTime(2999);
    expect(onClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onClose).toHaveBeenCalledWith('1');
  });

  it('should clear timeout on unmount', () => {
    const onClose = vi.fn();
    const { unmount } = render(<Toast id="1" message="Test" type="success" onClose={onClose} />);

    unmount();
    vi.advanceTimersByTime(5000);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should render close button with correct accessibility label', () => {
    const onClose = vi.fn();
    render(<Toast id="1" message="Test" type="success" onClose={onClose} />);

    const closeButton = screen.getByLabelText('Fechar notificação');
    expect(closeButton).toBeInTheDocument();
  });

  describe('Icons', () => {
    it('should render CheckCircle icon for success', () => {
      const onClose = vi.fn();
      const { container } = render(<Toast id="1" message="Test" type="success" onClose={onClose} />);

      // CheckCircle has class text-green-600
      const iconContainer = container.querySelector('.text-green-600');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should render XCircle icon for error', () => {
      const onClose = vi.fn();
      const { container } = render(<Toast id="1" message="Test" type="error" onClose={onClose} />);

      const iconContainer = container.querySelector('.text-red-600');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should render AlertCircle icon for warning', () => {
      const onClose = vi.fn();
      const { container } = render(<Toast id="1" message="Test" type="warning" onClose={onClose} />);

      const iconContainer = container.querySelector('.text-yellow-600');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should render Info icon for info', () => {
      const onClose = vi.fn();
      const { container } = render(<Toast id="1" message="Test" type="info" onClose={onClose} />);

      const iconContainer = container.querySelector('.text-blue-600');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have animation class', () => {
      const onClose = vi.fn();
      render(<Toast id="1" message="Test" type="success" onClose={onClose} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('animate-slide-in-right');
    });

    it('should have minimum and maximum width', () => {
      const onClose = vi.fn();
      render(<Toast id="1" message="Test" type="success" onClose={onClose} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('min-w-[300px]', 'max-w-md');
    });

    it('should have shadow and rounded corners', () => {
      const onClose = vi.fn();
      render(<Toast id="1" message="Test" type="success" onClose={onClose} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('shadow-lg', 'rounded-lg');
    });
  });

  describe('Multiple toasts', () => {
    it('should handle multiple toasts with different IDs', () => {
      const onClose = vi.fn();

      const { rerender } = render(<Toast id="1" message="First" type="success" onClose={onClose} />);

      expect(screen.getByText('First')).toBeInTheDocument();

      rerender(<Toast id="2" message="Second" type="error" onClose={onClose} />);

      // Only the second toast should be visible after rerender
      expect(screen.queryByText('First')).not.toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });
});
