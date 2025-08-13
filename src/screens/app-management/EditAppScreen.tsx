import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {AppForm} from '../../components/app-management/AppForm';
import {DashboardStackParamList} from '../../navigation/MainNavigator';
import {AppDispatch, RootState} from '../../store';
import {clearError, updateApp} from '../../store/slices/appsSlice';

export type EditAppScreenProps = NativeStackScreenProps<
  DashboardStackParamList,
  'EditApp'
>;

export const EditAppScreen: React.FC<EditAppScreenProps> = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, error} = useSelector((state: RootState) => state.apps);
  const {app} = route.params;

  useEffect(() => {
    if (error) {
      Toast.show({type: 'error', text1: 'Error', text2: error});
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (formData: any) => {
    try {
      await dispatch(
        updateApp({
          ...app,
          ...formData,
        }),
      ).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'App updated successfully!',
      });

      navigation.goBack();
    } catch (error) {
      // Error handled by useEffect
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppForm
        initialData={app}
        onSubmit={handleSubmit}
        loading={loading}
        submitButtonTitle="Update App"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});
