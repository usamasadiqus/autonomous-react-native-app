import React, {useEffect} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {AppForm} from '../../components/app-management/AppForm';
import {AppDispatch, RootState} from '../../store';
import {clearError, createApp} from '../../store/slices/appsSlice';

interface CreateAppScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const CreateAppScreen: React.FC<CreateAppScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, error} = useSelector((state: RootState) => state.apps);
  const {user} = useSelector((state: RootState) => state.auth);
  const {currentSubscription} = useSelector(
    (state: RootState) => state.subscription,
  );

  useEffect(() => {
    if (error) {
      Toast.show({type: 'error', text1: 'Error', text2: error});
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (formData: any) => {
    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'User not found',
      });
      return;
    }

    // Prevent app creation if no active subscription
    if (!currentSubscription || currentSubscription.status !== 'active') {
      Toast.show({
        type: 'error',
        text1: 'Subscription Required',
        text2:
          'You need an active subscription to create an app. Please subscribe first.',
      });
      return;
    }

    try {
      await dispatch(
        createApp({
          ...formData,
          userId: user.id,
          downloads: 0,
          rating: 0.0,
          features: ['Basic features'],
        }),
      ).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'App created successfully!',
      });

      navigation.goBack();
    } catch (error) {
      // Error handled by useEffect
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppForm
        onSubmit={handleSubmit}
        loading={loading}
        submitButtonTitle="Create App"
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
