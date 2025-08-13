import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {Button} from '../../src/components/common/Button';

describe('Button Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render button with title', () => {
    const {getByText} = render(
      <Button title="Test Button" onPress={mockOnPress} />,
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const {getByText} = render(
      <Button title="Test Button" onPress={mockOnPress} />,
    );

    const button = getByText('Test Button');
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading prop is true', () => {
    const {getByText} = render(
      <Button title="Test Button" onPress={mockOnPress} loading={true} />,
    );

    const button = getByText('Test Button');
    fireEvent.press(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    const {getByText} = render(
      <Button title="Test Button" onPress={mockOnPress} disabled={true} />,
    );

    const button = getByText('Test Button');
    fireEvent.press(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should render with outline variant', () => {
    const {getByText} = render(
      <Button title="Test Button" onPress={mockOnPress} variant="outline" />,
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = {backgroundColor: 'red'};
    const {getByText} = render(
      <Button title="Test Button" onPress={mockOnPress} style={customStyle} />,
    );

    expect(getByText('Test Button')).toBeTruthy();
  });
});
