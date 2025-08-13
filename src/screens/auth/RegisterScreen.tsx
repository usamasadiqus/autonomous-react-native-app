// screens/RegisterScreen.tsx
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
import {clearError, registerUser} from '../../store/slices/authSlice';
import {validation} from '../../utils/validation';

interface RegisterScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();

  const {loading, error} = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [enableBiometric, setEnableBiometric] = useState(false);
  const [biometricAdded, setBiometricAdded] = useState(false);
  const [biometricError, setBiometricError] = useState('');

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
        text1: 'Registration Failed',
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
    const newErrors = validation.validateRegisterForm(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword,
    );

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return !validation.hasErrors(newErrors);
  };

  const handleAddBiometric = async () => {
    setBiometricError('');
    const rnBiometrics = new ReactNativeBiometrics();
    const {available, biometryType} = await rnBiometrics.isSensorAvailable();
    if (!available) {
      setBiometricError(
        'Biometric authentication is not available on this device.',
      );
      return;
    }
    rnBiometrics
      .simplePrompt({
        promptMessage:
          biometryType === 'FaceID'
            ? 'Register with Face ID'
            : 'Register with Biometrics',
      })
      .then(resultObject => {
        const {success} = resultObject;
        if (success) {
          setBiometricAdded(true);
        } else {
          setBiometricError('Biometric authentication cancelled.');
        }
      })
      .catch(() => {
        setBiometricError('Biometric authentication failed.');
      });
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    if (enableBiometric && !biometricAdded) {
      setBiometricError('Please add biometric before registering.');
      return;
    }
    try {
      await dispatch(
        registerUser({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          isBiometricEnabled: enableBiometric && biometricAdded,
        }),
      ).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Account created successfully!',
      });
    } catch (error) {
      // Error handled by useEffect
    }
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
              <Text style={styles.logo}>✨</Text>
            </View>
            <Text testID="register-title" style={styles.title}>
              Create Account
            </Text>
            <Text testID="register-subtitle" style={styles.subtitle}>
              Join us and start your journey today
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              testID="register-name-input"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={value => handleInputChange('name', value)}
              error={errors.name}
              autoCapitalize="words"
            />

            <Input
              testID="register-email-input"
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={value => handleInputChange('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              testID="register-password-input"
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={value => handleInputChange('password', value)}
              error={errors.password}
            />

            <Input
              testID="register-confirm-password-input"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={value =>
                handleInputChange('confirmPassword', value)
              }
              error={errors.confirmPassword}
              onFocus={scrollToEndOnFocus}
            />

            {/* Terms Checkbox */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                testID="terms-checkbox"
                style={styles.checkbox}
                onPress={() => setAcceptTerms(!acceptTerms)}>
                <View
                  style={[
                    styles.checkboxBox,
                    acceptTerms && styles.checkboxChecked,
                  ]}>
                  {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {errors.terms && (
                <Text style={styles.errorText}>{errors.terms}</Text>
              )}
            </View>

            {/* Biometric Option */}
            <View style={{marginBottom: 16}}>
              <TouchableOpacity
                testID="biometric-toggle"
                style={{flexDirection: 'row', alignItems: 'center'}}
                onPress={() => setEnableBiometric(!enableBiometric)}>
                <View
                  style={[
                    styles.checkboxBox,
                    enableBiometric && styles.checkboxChecked,
                  ]}>
                  {enableBiometric && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={{fontSize: 14, color: '#2C3E50'}}>
                  Enable Biometric Authentication?
                </Text>
              </TouchableOpacity>
              {enableBiometric && (
                <View style={{marginTop: 10}}>
                  <Button
                    testID="add-biometric-button"
                    title={biometricAdded ? 'Biometric Added' : 'Add Biometric'}
                    onPress={handleAddBiometric}
                    disabled={biometricAdded}
                    style={{marginBottom: 4}}
                  />
                  {biometricError ? (
                    <Text style={{color: '#FF3B30', fontSize: 12}}>
                      {biometricError}
                    </Text>
                  ) : null}
                </View>
              )}
            </View>

            <Button
              testID="create-account-button"
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                testID="sign-in-link"
                onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLinkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
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
  termsContainer: {
    marginBottom: 24,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#E1E8ED',
    borderRadius: 6,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 34,
  },
  registerButton: {
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
