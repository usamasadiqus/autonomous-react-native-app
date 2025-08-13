import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import Toast from 'react-native-toast-message';
import {useSelector} from 'react-redux';
import {toastConfig} from '../config/toastConfig';
import {RootState} from '../store';
import {AuthStack} from './AuthStack';
import {MainNavigator} from './MainNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const {isAuthenticated} = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const timer = setTimeout(() => {
      BootSplash.hide({fade: true});
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FEFF" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {isAuthenticated ? (
            <Stack.Screen name="Main" component={MainNavigator} />
          ) : (
            <Stack.Screen name="Auth" component={AuthStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast config={toastConfig} />
    </>
  );
};
