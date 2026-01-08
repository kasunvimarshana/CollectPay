/**
 * ErrorMessage Component Unit Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage Component', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render error message', () => {
    const { getByText } = render(<ErrorMessage message="Something went wrong" />);

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('⚠️')).toBeTruthy();
  });

  it('should render retry button when onRetry is provided', () => {
    const { getByText } = render(
      <ErrorMessage message="Network error" onRetry={mockOnRetry} />
    );

    expect(getByText('Retry')).toBeTruthy();
  });

  it('should not render retry button when onRetry is not provided', () => {
    const { queryByText } = render(<ErrorMessage message="Network error" />);

    expect(queryByText('Retry')).toBeNull();
  });

  it('should call onRetry when retry button is pressed', () => {
    const { getByText } = render(
      <ErrorMessage message="Network error" onRetry={mockOnRetry} />
    );

    fireEvent.press(getByText('Retry'));

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('should apply custom styles', () => {
    const customStyle = { margin: 20 };
    const { getByText } = render(
      <ErrorMessage message="Error" style={customStyle} />
    );

    // Just check that the component renders with custom style prop
    expect(getByText('Error')).toBeTruthy();
  });

  it('should render long error messages', () => {
    const longMessage = 'This is a very long error message that might wrap to multiple lines and should still be displayed correctly';
    const { getByText } = render(<ErrorMessage message={longMessage} />);

    expect(getByText(longMessage)).toBeTruthy();
  });
});
