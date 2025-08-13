import React, {useEffect, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {Button} from '../../components/common/Button';
import {Input} from '../../components/common/Input';
import {AppDispatch, RootState} from '../../store';
import {
  clearError,
  getBiometricCredentials,
  loginUser,
} from '../../store/slices/authSlice';
import {validation} from '../../utils/validation';

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, error} = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const scrollViewRef = useRef<ScrollView>(null);

  // Helper to scroll to end
  const scrollToEndOnFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({animated: true});
    }, 100);
  };

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = validation.validateLoginForm(
      formData.email,
      formData.password,
    );
    setErrors(newErrors);
    return !validation.hasErrors(newErrors);
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(
        loginUser({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      ).unwrap();
    } catch (error) {
      // Error handled by useEffect
    }
  };

  const handleBiometricLogin = async () => {
    // First check if biometric credentials exist
    try {
      const credentials = await dispatch(getBiometricCredentials()).unwrap();
      if (!credentials || !credentials.email || !credentials.password) {
        // Show toast to guide user to Profile screen
        Toast.show({
          type: 'info',
          text1: '🔐 Biometric Not Setup',
          text2:
            'Go to Profile tab after login to setup biometric authentication.',
        });
        return;
      }
    } catch (error) {
      // Show toast to guide user to Profile screen
      Toast.show({
        type: 'info',
        text1: '🔐 Biometric Not Setup',
        text2:
          'Go to Profile tab after login to setup biometric authentication.',
      });
      return;
    }

    // If biometric is set up, proceed with authentication
    const rnBiometrics = new ReactNativeBiometrics();
    const {available, biometryType} = await rnBiometrics.isSensorAvailable();
    if (!available) {
      Toast.show({
        type: 'error',
        text1: 'Biometric Authentication',
        text2: 'Biometric authentication is not available on this device.',
      });
      return;
    }
    rnBiometrics
      .simplePrompt({
        promptMessage:
          biometryType === 'FaceID'
            ? 'Login with Face ID'
            : 'Login with Biometrics',
      })
      .then(async resultObject => {
        const {success} = resultObject;
        if (success) {
          // Fetch credentials from storage
          try {
            const credentials = await dispatch(
              getBiometricCredentials(),
            ).unwrap();
            if (credentials && credentials.email && credentials.password) {
              setFormData({
                email: credentials.email,
                password: credentials.password,
              });
            } else {
              Toast.show({
                type: 'error',
                text1: 'Biometric Not Setup',
                text2:
                  'Please go to Profile screen and setup biometric authentication first.',
              });
            }
          } catch (e) {
            Toast.show({
              type: 'error',
              text1: 'Biometric Authentication',
              text2: 'Failed to retrieve credentials.',
            });
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'Biometric Authentication',
            text2: 'Authentication cancelled.',
          });
        }
      })
      .catch(() => {
        Toast.show({
          type: 'error',
          text1: 'Biometric Authentication',
          text2: 'Biometric authentication failed.',
        });
      })
      .finally(() => setErrors({}));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>🚀</Text>
            </View>
            <Text testID="login-title" style={styles.title}>
              Welcome Back!
            </Text>
            <Text testID="login-subtitle" style={styles.subtitle}>
              Sign in to continue your journey
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              testID="email-input"
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={value => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />

            <Input
              testID="password-input"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={value => handleInputChange('password', value)}
              isPassword
              error={errors.password}
              onFocus={scrollToEndOnFocus}
            />

            <TouchableOpacity
              testID="forgot-password-button"
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              testID="sign-in-button"
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            {/* Biometric Login Button */}
            <Button
              testID="biometric-login-button"
              title="Login with Biometrics"
              onPress={handleBiometricLogin}
              style={[styles.loginButton, {marginTop: 12}] as any}
              variant="outline"
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              testID="create-account-button"
              title="Create New Account"
              onPress={() => navigation.navigate('Register')}
              variant="outline"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing in, you agree to our Terms & Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FEFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1E8ED',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 16,
  },
});
