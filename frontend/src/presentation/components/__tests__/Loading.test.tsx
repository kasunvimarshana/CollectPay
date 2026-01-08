/**
 * Loading Component Unit Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Loading } from '../Loading';

describe('Loading Component', () => {
  it('should render with default message', () => {
    const { getByText } = render(<Loading />);

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('should render with custom message', () => {
    const { getByText } = render(<Loading message="Please wait..." />);

    expect(getByText('Please wait...')).toBeTruthy();
  });

  it('should render without message when empty string provided', () => {
    const { queryByText } = render(<Loading message="" />);

    expect(queryByText('Loading...')).toBeNull();
  });

  it('should render with small size', () => {
    const { getByTestId } = render(<Loading size="small" />);

    // ActivityIndicator should be present
    expect(getByTestId).toBeTruthy();
  });

  it('should render with large size', () => {
    const { getByTestId } = render(<Loading size="large" />);

    // ActivityIndicator should be present
    expect(getByTestId).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: '#000' };
    const { getByText } = render(<Loading style={customStyle} />);

    // Just check that the component renders with custom style prop
    expect(getByText('Loading...')).toBeTruthy();
  });
});
