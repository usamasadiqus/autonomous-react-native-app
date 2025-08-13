import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';

import {CreateAppScreen} from '../screens/app-management/CreateAppScreen';
import {EditAppScreen} from '../screens/app-management/EditAppScreen';
import {DashboardScreen} from '../screens/dashboard/DashboardScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {PaymentScreen} from '../screens/subscription/PaymentScreen';
import {PlansScreen} from '../screens/subscription/PlansScreen';
import {SubscriptionScreen} from '../screens/subscription/SubscriptionScreen';

import {
  getToken,
  registerNotificationHandlers,
  requestUserPermission,
} from '../services/firebaseMessaging';

export type DashboardStackParamList = {
  DashboardMain: undefined;
  CreateApp: undefined;
  EditApp: {appId: string};
  AppDetails: {appId: string};
};

export type SubscriptionStackParamList = {
  Subscription: undefined;
  PlansScreen: undefined;
  PaymentScreen: {plan: any; isUpgrade: boolean};
};

// App Details Screen placeholder
const AppDetailsScreen = ({route}: any) => {
  const {appId} = route.params;

  return (
    <SafeAreaView style={styles.placeholderContainer}>
      <View style={styles.placeholderContent}>
        <Text style={styles.placeholderTitle}>App Details</Text>
        <Text style={styles.placeholderSubtitle}>App ID: {appId}</Text>
        <View style={styles.placeholderIcon}>
          <Text style={styles.iconText}>📊</Text>
        </View>
        <Text style={styles.placeholderDescription}>
          View comprehensive analytics and details about your app
        </Text>
      </View>
    </SafeAreaView>
  );
};

const Stack = createNativeStackNavigator<DashboardStackParamList>();
const Subscription = createNativeStackNavigator<SubscriptionStackParamList>();
const Tab = createBottomTabNavigator();

// Dashboard Stack
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="DashboardMain"
      component={DashboardScreen}
      options={{
        title: 'My Apps',
        headerStyle: {backgroundColor: '#007AFF'},
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {fontWeight: 'bold'},
      }}
    />
    <Stack.Screen
      name="CreateApp"
      component={CreateAppScreen}
      options={{
        title: 'Create New App',
        headerStyle: {backgroundColor: '#007AFF'},
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {fontWeight: 'bold'},
      }}
    />
    <Stack.Screen
      name="EditApp"
      component={EditAppScreen}
      options={{
        title: 'Edit App',
        headerStyle: {backgroundColor: '#007AFF'},
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {fontWeight: 'bold'},
      }}
    />
    <Stack.Screen
      name="AppDetails"
      component={AppDetailsScreen}
      options={{
        title: 'App Details',
        headerStyle: {backgroundColor: '#007AFF'},
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {fontWeight: 'bold'},
      }}
    />
  </Stack.Navigator>
);

// Subscription Stack
const SubscriptionStack = () => (
  <Subscription.Navigator>
    <Subscription.Screen
      name="Subscription"
      component={SubscriptionScreen}
      options={{
        title: 'Subscription',
        headerStyle: {backgroundColor: '#007AFF'},
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {fontWeight: 'bold'},
      }}
    />
    <Subscription.Screen
      name="PlansScreen"
      component={PlansScreen}
      options={{
        title: 'Choose Plan',
        headerStyle: {backgroundColor: '#007AFF'},
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {fontWeight: 'bold'},
      }}
    />
    <Subscription.Screen
      name="PaymentScreen"
      component={PaymentScreen}
      options={{
        title: 'Payment',
        headerStyle: {backgroundColor: '#007AFF'},
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {fontWeight: 'bold'},
      }}
    />
  </Subscription.Navigator>
);

// Main Tab Navigator
const TabNavigator = () => {
  useEffect(() => {
    const initializeFirebaseMessaging = async () => {
      try {
        // Request permission first
        await requestUserPermission();

        // Register notification handlers
        registerNotificationHandlers();

        // Get FCM token with retry logic
        let retryCount = 0;
        const maxRetries = 3;

        const getFCMToken = async () => {
          try {
            const token = await getToken();
            if (token) {
              console.log('Device FCM Token:', token);
              return token;
            } else if (retryCount < maxRetries) {
              retryCount++;
              console.log(
                `FCM token retry attempt ${retryCount}/${maxRetries}`,
              );
              await new Promise(resolve => setTimeout(resolve, 2000));
              return await getFCMToken();
            }
          } catch (error) {
            console.error('Error getting FCM token:', error);
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(
                `FCM token retry attempt ${retryCount}/${maxRetries}`,
              );
              await new Promise(resolve => setTimeout(resolve, 2000));
              return await getFCMToken();
            }
          }
          return null;
        };

        await getFCMToken();
      } catch (error) {
        console.error('Error initializing Firebase messaging:', error);
      }
    };

    // initializeFirebaseMessaging();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#95A5A6',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E1E8ED',
          paddingBottom: 5,
          paddingTop: 10,
          // height: 60,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Apps',
          tabBarIcon: ({color, focused}) => (
            <View
              style={[
                styles.tabIconContainer,
                focused && styles.tabIconFocused,
              ]}>
              <Text style={[styles.tabIcon, {color}]}>📱</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="SubscriptionTab"
        component={SubscriptionStack}
        options={{
          tabBarLabel: 'Plans',
          tabBarIcon: ({color, focused}) => (
            <View
              style={[
                styles.tabIconContainer,
                focused && styles.tabIconFocused,
              ]}>
              <Text style={[styles.tabIcon, {color}]}>💎</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, focused}) => (
            <View
              style={[
                styles.tabIconContainer,
                focused && styles.tabIconFocused,
              ]}>
              <Text style={[styles.tabIcon, {color}]}>👤</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const MainNavigator = () => <TabNavigator />;

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  placeholderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 32,
    fontWeight: '600',
  },
  placeholderIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  iconText: {
    fontSize: 48,
  },
  placeholderDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  logoutSection: {
    marginTop: 48,
    width: '100%',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconFocused: {
    backgroundColor: '#E3F2FD',
  },
  tabIcon: {
    fontSize: 20,
  },
});
