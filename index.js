/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Ignore all log notifications
if (__DEV__) {
  LogBox.ignoreAllLogs();
}

AppRegistry.registerComponent(appName, () => App);
