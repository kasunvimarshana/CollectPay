/**
 * Pagination Component Unit Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Pagination } from '../Pagination';

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn();

  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    perPage: 10,
    onPageChange: mockOnPageChange,
    hasNextPage: true,
    hasPreviousPage: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render pagination controls', () => {
    const { getByText } = render(<Pagination {...defaultProps} />);

    expect(getByText('Showing 1-10 of 50 items')).toBeTruthy();
    expect(getByText('Page 1 of 5')).toBeTruthy();
    expect(getByText('← Previous')).toBeTruthy();
    expect(getByText('Next →')).toBeTruthy();
  });

  it('should not render when totalPages is 1', () => {
    const props = { ...defaultProps, totalPages: 1, hasNextPage: false };
    const { queryByText } = render(<Pagination {...props} />);

    expect(queryByText('Showing 1-10 of 50 items')).toBeNull();
  });

  it('should disable previous button on first page', () => {
    const { getByLabelText } = render(<Pagination {...defaultProps} />);

    const prevButton = getByLabelText('Previous page');
    expect(prevButton.props.accessibilityState.disabled).toBe(true);
  });

  it('should enable previous button when not on first page', () => {
    const props = {
      ...defaultProps,
      currentPage: 2,
      hasPreviousPage: true,
    };
    const { getByLabelText } = render(<Pagination {...props} />);

    const prevButton = getByLabelText('Previous page');
    expect(prevButton.props.accessibilityState.disabled).toBe(false);
  });

  it('should disable next button on last page', () => {
    const props = {
      ...defaultProps,
      currentPage: 5,
      hasNextPage: false,
      hasPreviousPage: true,
    };
    const { getByLabelText } = render(<Pagination {...props} />);

    const nextButton = getByLabelText('Next page');
    expect(nextButton.props.accessibilityState.disabled).toBe(true);
  });

  it('should enable next button when not on last page', () => {
    const { getByLabelText } = render(<Pagination {...defaultProps} />);

    const nextButton = getByLabelText('Next page');
    expect(nextButton.props.accessibilityState.disabled).toBe(false);
  });

  it('should call onPageChange with previous page number', () => {
    const props = {
      ...defaultProps,
      currentPage: 3,
      hasPreviousPage: true,
    };
    const { getByText } = render(<Pagination {...props} />);

    fireEvent.press(getByText('← Previous'));

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange with next page number', () => {
    const { getByText } = render(<Pagination {...defaultProps} />);

    fireEvent.press(getByText('Next →'));

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should not call onPageChange when previous button is disabled', () => {
    const { getByText } = render(<Pagination {...defaultProps} />);

    fireEvent.press(getByText('← Previous'));

    // Should not be called because button is disabled
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it('should not call onPageChange when next button is disabled', () => {
    const props = {
      ...defaultProps,
      currentPage: 5,
      hasNextPage: false,
      hasPreviousPage: true,
    };
    const { getByText } = render(<Pagination {...props} />);

    fireEvent.press(getByText('Next →'));

    // Should not be called because button is disabled
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it('should display correct item range for middle pages', () => {
    const props = {
      ...defaultProps,
      currentPage: 3,
      hasPreviousPage: true,
    };
    const { getByText } = render(<Pagination {...props} />);

    expect(getByText('Showing 21-30 of 50 items')).toBeTruthy();
    expect(getByText('Page 3 of 5')).toBeTruthy();
  });

  it('should display correct item range for last page with partial items', () => {
    const props = {
      ...defaultProps,
      currentPage: 5,
      totalItems: 47,
      hasNextPage: false,
      hasPreviousPage: true,
    };
    const { getByText } = render(<Pagination {...props} />);

    expect(getByText('Showing 41-47 of 47 items')).toBeTruthy();
  });

  it('should have proper accessibility attributes', () => {
    const { getByText, getByLabelText } = render(<Pagination {...defaultProps} />);

    // Check accessibility labels
    expect(getByLabelText('Previous page')).toBeTruthy();
    expect(getByLabelText('Next page')).toBeTruthy();
    expect(getByLabelText('Page 1 of 5')).toBeTruthy();
  });
});
