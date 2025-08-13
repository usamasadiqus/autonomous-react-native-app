import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Animated,
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
import {AppDispatch, RootState} from '../store';
import {logoutUser, updateUserBiometric} from '../store/slices/authSlice';
import {APP_CONSTANTS} from '../utils/constants';

export const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.auth);

  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const toggleAnimation = useRef(new Animated.Value(0)).current;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Jab bhi ProfileScreen open ho, agar logged-in user me isBiometricEnabled true ho tu toggle enable karo warna disable hi rehne do
    if (user?.isBiometricEnabled) {
      setIsBiometricEnabled(true);
      Animated.timing(toggleAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      setIsBiometricEnabled(false);
      Animated.timing(toggleAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    checkBiometricAvailability();
  }, [user]);

  const animateToggle = (enabled: boolean) => {
    Animated.timing(toggleAnimation, {
      toValue: enabled ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const checkBiometricAvailability = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const {available, biometryType} = await rnBiometrics.isSensorAvailable();
      if (available) {
        setBiometricType(biometryType || '');
      }
    } catch (error) {
      console.log('Biometric check failed:', error);
    }
  };

  const updateBiometricCredentials = async (
    email: string,
    password: string,
  ) => {
    try {
      await AsyncStorage.setItem(
        'biometric_credentials',
        JSON.stringify({
          email,
          password,
        }),
      );
    } catch (error) {
      console.log('Failed to update biometric credentials:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    if (isLoggingOut) return;
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          Toast.hide(); // Dismiss any active toasts before logout
          // Check and remove biometric_credentials if set
          try {
            const creds = await AsyncStorage.getItem('biometric_credentials');
            if (creds) {
              await AsyncStorage.removeItem('biometric_credentials');
            }
          } catch (e) {
            console.log('Error removing biometric credentials:', e);
          }
          setTimeout(() => {
            dispatch(logoutUser()).finally(() => setIsLoggingOut(false));
          }, 600); // Increased delay to allow overlays to dismiss
        },
      },
    ]);
  };

  const handleBiometricToggle = async () => {
    if (isBiometricEnabled) {
      // Disable biometric
      Alert.alert(
        'Disable Biometric',
        'Are you sure you want to disable biometric authentication?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              try {
                await dispatch(updateUserBiometric(false)).unwrap();
                setIsBiometricEnabled(false);
                animateToggle(false);
                Toast.show({
                  type: 'success',
                  text1: 'Biometric Disabled',
                  text2: 'Biometric authentication has been disabled.',
                });
              } catch (error) {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Failed to disable biometric authentication.',
                });
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
      );
    } else {
      // Enable biometric
      setIsLoading(true);
      try {
        const rnBiometrics = new ReactNativeBiometrics();
        const {available} = await rnBiometrics.isSensorAvailable();

        if (!available) {
          Toast.show({
            type: 'error',
            text1: 'Biometric Not Available',
            text2: 'Biometric authentication is not available on this device.',
          });
          setIsLoading(false);
          return;
        }

        const result = await rnBiometrics.simplePrompt({
          promptMessage:
            biometricType === 'FaceID'
              ? 'Setup Face ID for login'
              : 'Setup Biometric for login',
        });

        if (result.success) {
          // Store current user credentials for biometric login
          const currentUser = user;
          if (currentUser) {
            try {
              // Get actual user password from database
              const response = await fetch(
                `${APP_CONSTANTS.API_BASE_URL}/users/${currentUser.id}`,
              );
              const userData = await response.json();

              // Validate that user has a password
              if (!userData.password) {
                Toast.show({
                  type: 'error',
                  text1: 'Setup Failed',
                  text2: 'User password not found. Please contact support.',
                });
                setIsLoading(false);
                return;
              }

              await updateBiometricCredentials(
                currentUser.email,
                userData.password,
              );
            } catch (error) {
              console.log('Failed to get user password:', error);
              Toast.show({
                type: 'error',
                text1: 'Setup Failed',
                text2: 'Failed to get user credentials.',
              });
              setIsLoading(false);
              return;
            }
          }

          await dispatch(updateUserBiometric(true)).unwrap();
          setIsBiometricEnabled(true);
          animateToggle(true);
          Toast.show({
            type: 'success',
            text1: 'Biometric Enabled',
            text2: 'Biometric authentication has been enabled successfully.',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Setup Cancelled',
            text2: 'Biometric setup was cancelled.',
          });
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Setup Failed',
          text2: 'Failed to setup biometric authentication.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text testID="profile-settings-title" style={styles.sectionTitle}>
            Account Settings
          </Text>

          {/* Biometric Setting */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text testID="biometric-title" style={styles.settingTitle}>
                Biometric Authentication
              </Text>
              <Text style={styles.settingDescription}>
                {isBiometricEnabled
                  ? 'Use fingerprint or Face ID to login quickly'
                  : 'Enable biometric authentication for faster login'}
              </Text>
            </View>
            <TouchableOpacity
              testID="biometric-toggle"
              style={[
                styles.toggleContainer,
                isBiometricEnabled && styles.toggleContainerActive,
              ]}
              onPress={handleBiometricToggle}
              disabled={isLoading}>
              <Animated.View
                style={[
                  styles.toggleThumb,
                  {
                    transform: [
                      {
                        translateX: toggleAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 20],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </TouchableOpacity>
          </View>

          {/* Biometric Status */}
          {isBiometricEnabled && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                ✅ {biometricType === 'FaceID' ? 'Face ID' : 'Fingerprint'} is
                enabled
              </Text>
            </View>
          )}
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.1</Text>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            testID="logout-button"
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
            disabled={isLoggingOut}>
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FEFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  toggleContainer: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#E1E8ED',
    padding: 2,
    justifyContent: 'center',
  },
  toggleContainerActive: {
    backgroundColor: '#007AFF',
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    transform: [{translateX: 0}],
  },

  statusContainer: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuTitle: {
    fontSize: 16,
    color: '#2C3E50',
  },
  menuArrow: {
    fontSize: 18,
    color: '#95A5A6',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#2C3E50',
  },
  infoValue: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  logoutSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
