import React from 'react';
import {ActivityIndicator, Modal, StyleSheet, Text, View} from 'react-native';

interface LoadingSpinnerProps {
  visible: boolean;
  text?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible,
  text = 'Loading...',
  overlay = false,
}) => {
  if (!visible) {return null;}

  const content = (
    <View style={[styles.container, overlay && styles.overlay]}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#007AFF" />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
});
