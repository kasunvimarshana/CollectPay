/**
 * SortButton Component Unit Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SortButton } from '../SortButton';

describe('SortButton Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with label', () => {
    const { getByText } = render(
      <SortButton label="Name" direction={null} onPress={mockOnPress} />
    );

    expect(getByText(/Name/)).toBeTruthy();
  });

  it('should display unsorted icon when direction is null', () => {
    const { getByText } = render(
      <SortButton label="Name" direction={null} onPress={mockOnPress} />
    );

    expect(getByText(/⇅/)).toBeTruthy();
  });

  it('should display ascending icon when direction is asc', () => {
    const { getByText } = render(
      <SortButton label="Name" direction="asc" onPress={mockOnPress} />
    );

    expect(getByText(/↑/)).toBeTruthy();
  });

  it('should display descending icon when direction is desc', () => {
    const { getByText } = render(
      <SortButton label="Name" direction="desc" onPress={mockOnPress} />
    );

    expect(getByText(/↓/)).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { getByText } = render(
      <SortButton label="Name" direction={null} onPress={mockOnPress} />
    );

    fireEvent.press(getByText(/Name/));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes when not sorted', () => {
    const { getByLabelText } = render(
      <SortButton label="Name" direction={null} onPress={mockOnPress} />
    );

    const button = getByLabelText('Sort by Name');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityState.selected).toBe(false);
  });

  it('should have proper accessibility attributes when sorted ascending', () => {
    const { getByLabelText } = render(
      <SortButton label="Name" direction="asc" onPress={mockOnPress} />
    );

    const button = getByLabelText('Sort by Name');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityState.selected).toBe(true);
  });

  it('should have proper accessibility attributes when sorted descending', () => {
    const { getByLabelText } = render(
      <SortButton label="Name" direction="desc" onPress={mockOnPress} />
    );

    const button = getByLabelText('Sort by Name');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityState.selected).toBe(true);
  });

  it('should apply active styles when sorted', () => {
    const { getByText, rerender } = render(
      <SortButton label="Name" direction={null} onPress={mockOnPress} />
    );

    let labelElement = getByText(/Name/);
    let initialStyle = labelElement.props.style;

    // Re-render with active sort
    rerender(<SortButton label="Name" direction="asc" onPress={mockOnPress} />);

    labelElement = getByText(/Name/);
    let activeStyle = labelElement.props.style;

    // Active style should be different (this is a simplified check)
    expect(activeStyle).not.toEqual(initialStyle);
  });

  it('should render multiple sort buttons independently', () => {
    const { getByText } = render(
      <>
        <SortButton label="Name" direction="asc" onPress={jest.fn()} />
        <SortButton label="Date" direction={null} onPress={jest.fn()} />
        <SortButton label="Amount" direction="desc" onPress={jest.fn()} />
      </>
    );

    expect(getByText(/Name/)).toBeTruthy();
    expect(getByText(/Date/)).toBeTruthy();
    expect(getByText(/Amount/)).toBeTruthy();
    expect(getByText(/↑/)).toBeTruthy(); // Name ascending
    expect(getByText(/⇅/)).toBeTruthy(); // Date unsorted
    expect(getByText(/↓/)).toBeTruthy(); // Amount descending
  });
});
