// screens/ForgotPasswordScreen.tsx
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';

import {Button} from '../../components/common/Button';
import {Input} from '../../components/common/Input';
import {LoadingSpinner} from '../../components/common/LoadingSpinner';
import {AuthStackParamList} from '../../navigation/AuthStack';
import {AppDispatch, RootState} from '../../store';
import {clearError, forgotPassword} from '../../store/slices/authSlice';
import {validation} from '../../utils/validation';

interface ForgotPasswordScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
  route: RouteProp<AuthStackParamList, 'ForgotPassword'>;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, error} = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Show error alert if there's an error
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleEmailChange = (value: string) => {
    setEmail(value);

    // Clear email error when user starts typing
    if (errors.email) {
      setErrors(prev => ({...prev, email: ''}));
    }
  };

  const validateForm = (): boolean => {
    const formErrors = validation.validateForgotPasswordForm(email);
    setErrors(formErrors);
    return !validation.hasErrors(formErrors);
  };

  const handleSendResetEmail = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(forgotPassword(email.trim().toLowerCase())).unwrap();

      setEmailSent(true);

      Toast.show({
        type: 'success',
        text1: 'Email Sent',
        text2: 'Password reset instructions have been sent.',
      });

      navigation.navigate('Login');
    } catch (error) {
      // Error handled by useEffect
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    handleSendResetEmail();
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>📧</Text>
          </View>

          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successMessage}>
            We've sent password reset instructions to:
          </Text>
          <Text style={styles.emailText}>{email}</Text>

          <Text style={styles.instructionText}>
            Click the link in the email to reset your password. If you don't see
            the email, check your spam folder.
          </Text>

          <Button
            title="Resend Email"
            onPress={handleResendEmail}
            style={styles.resendButton}
            variant="outline"
          />

          <Button
            title="Back to Login"
            onPress={handleBackToLogin}
            style={styles.backButtonSuccess}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          testID="back-button"
          style={styles.backButton}
          onPress={() => handleBackToLogin()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
          <Text testID="forgot-password-title" style={styles.title}>
            Forgot Password?
          </Text>
          <Text testID="forgot-password-subtitle" style={styles.subtitle}>
            Don't worry! Enter your email address and we'll send you
            instructions to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            testID="forgot-password-email-input"
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={handleEmailChange}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button
            testID="send-reset-button"
            title="Send Reset Instructions"
            onPress={handleSendResetEmail}
            loading={loading}
            style={styles.sendButton}
          />
        </View>

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Remember your password?{' '}
            <TouchableOpacity
              testID="sign-in-help-link"
              onPress={() => handleBackToLogin()}>
              <Text style={styles.helpLink}>Sign In</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>

      <LoadingSpinner visible={loading} overlay />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FEFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  backButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  lockIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  sendButton: {
    marginTop: 8,
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  helpLink: {
    color: '#007AFF',
    fontWeight: '500',
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconText: {
    fontSize: 48,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  resendButton: {
    marginBottom: 16,
    width: '100%',
  },
  backButtonSuccess: {
    width: '100%',
  },
});
