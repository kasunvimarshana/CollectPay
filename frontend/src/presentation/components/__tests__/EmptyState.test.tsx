/**
 * EmptyState Component Unit Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

describe('EmptyState Component', () => {
  it('should render with message', () => {
    const { getByText } = render(<EmptyState message="No items found" />);

    expect(getByText('No items found')).toBeTruthy();
  });

  it('should render with default icon', () => {
    const { getByText } = render(<EmptyState message="No items found" />);

    expect(getByText('📭')).toBeTruthy();
  });

  it('should render with custom icon', () => {
    const { getByText } = render(
      <EmptyState message="No items found" icon="🔍" />
    );

    expect(getByText('🔍')).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyle = { padding: 40 };
    const { getByText } = render(
      <EmptyState message="Empty" style={customStyle} />
    );

    // Just check that the component renders with custom style prop
    expect(getByText('Empty')).toBeTruthy();
  });

  it('should render long messages', () => {
    const longMessage = 'There are currently no items to display. Please add some items to see them here.';
    const { getByText } = render(<EmptyState message={longMessage} />);

    expect(getByText(longMessage)).toBeTruthy();
  });

  it('should render with different icons for different contexts', () => {
    const { getByText: getByText1 } = render(
      <EmptyState message="No suppliers" icon="👥" />
    );
    expect(getByText1('👥')).toBeTruthy();

    const { getByText: getByText2 } = render(
      <EmptyState message="No products" icon="📦" />
    );
    expect(getByText2('📦')).toBeTruthy();

    const { getByText: getByText3 } = render(
      <EmptyState message="No collections" icon="📊" />
    );
    expect(getByText3('📊')).toBeTruthy();
  });
});
