import React from 'react';
import {StyleSheet} from 'react-native';
import {BaseToast, ErrorToast, ToastConfig} from 'react-native-toast-message';

export const toastConfig: ToastConfig = {
  success: props => (
    <BaseToast
      {...props}
      style={[styles.successToast]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={3}
    />
  ),
  error: props => (
    <ErrorToast
      {...props}
      style={[styles.errorToast]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={3}
    />
  ),
  info: props => (
    <BaseToast
      {...props}
      style={[styles.infoToast]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={3}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: '#4CAF50',
    borderLeftWidth: 7,
    backgroundColor: '#F1F8E9',
    height: 80,
  },
  errorToast: {
    borderLeftColor: '#F44336',
    borderLeftWidth: 7,
    backgroundColor: '#FFEBEE',
    height: 80,
  },
  infoToast: {
    borderLeftColor: '#2196F3',
    borderLeftWidth: 7,
    backgroundColor: '#E3F2FD',
    height: 80,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  text1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  text2: {
    fontSize: 14,
    color: '#34495E',
    fontWeight: '400',
    lineHeight: 18,
  },
});
