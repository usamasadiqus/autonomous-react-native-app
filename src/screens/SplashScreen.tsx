import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {useAuth} from '../hooks/useAuth';
import {APP_CONSTANTS} from '../utils/constants';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const {restoreAuth} = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      const session = await restoreAuth();
      setTimeout(() => {
        if (session) {
          navigation.navigate('Main' as never);
        } else {
          navigation.navigate('Auth' as never);
        }
      }, 200000);
    };
    checkSession();
  }, [navigation, restoreAuth]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🚀</Text>
          <Text style={styles.appName}>{APP_CONSTANTS.APP_NAME}</Text>
          <Text style={styles.tagline}>Deploy with confidence</Text>
        </View>

        {/* <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {loading ? 'Loading...' : 'Initializing...'}
          </Text>
        </View> */}

        {/* <View style={styles.footer}>
          <Text style={styles.version}>Version {APP_CONSTANTS.VERSION}</Text>
        </View> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  footer: {
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default SplashScreen;
