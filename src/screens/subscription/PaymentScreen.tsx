// screens/subscription/PaymentScreen.tsx (Updated with better error handling)
import React, {useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {PaymentForm} from '../../components/subscription/PaymentForm';
import {AppDispatch, RootState} from '../../store';
import {
  clearError,
  clearPaymentSuccess,
  fetchAvailablePlans,
  processPayment,
  reactivateSubscription,
  updateSubscription,
} from '../../store/slices/subscriptionSlice';

interface PaymentScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
    reset: (state: any) => void;
  };
  route: {
    params: {
      plan: any;
      isUpgrade?: boolean;
      isReactivation?: boolean;
      previousSubscriptionId?: number;
    };
  };
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    paymentLoading,
    reactivating,
    paymentSuccess,
    error,
    currentSubscription,
    availablePlans,
  } = useSelector((state: RootState) => state.subscription);
  const {user} = useSelector((state: RootState) => state.auth);

  const {
    plan,
    isUpgrade = false,
    isReactivation = false,
    previousSubscriptionId,
  } = route.params;

  useEffect(() => {
    // Ensure plans are loaded
    if (availablePlans.length === 0) {
      console.log('PaymentScreen: Loading plans...');
      dispatch(fetchAvailablePlans());
    }
  }, [dispatch, availablePlans.length]);

  useEffect(() => {
    if (paymentSuccess) {
      const successMessage = isReactivation
        ? `🎉 Welcome back! Your ${plan.name} subscription has been reactivated.`
        : isUpgrade
        ? `✅ Your subscription has been updated to ${plan.name}!`
        : `🎉 Welcome to ${plan.name}! Your subscription is now active.`;

      Toast.show({
        type: 'success',
        text1: 'Payment Successful!',
        text2: successMessage,
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 60,
        onHide: () => {
          dispatch(clearPaymentSuccess());
          navigation.reset({
            index: 0,
            routes: [{name: 'Subscription'}],
          });
        },
      });
    }
  }, [
    paymentSuccess,
    isUpgrade,
    isReactivation,
    plan.name,
    navigation,
    dispatch,
  ]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Payment Failed',
        text2: error,
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 60,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handlePaymentSubmit = async (paymentData: any) => {
    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'User not found. Please login again.',
        visibilityTime: 3000,
      });
      return;
    }

    // Validate plan data
    if (!plan || !plan.id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid plan selected. Please try again.',
        visibilityTime: 3000,
      });
      return;
    }

    console.log('Submitting payment for plan:', plan);

    try {
      if (isReactivation && previousSubscriptionId) {
        console.log('Processing reactivation...');
        await dispatch(
          reactivateSubscription({
            subscriptionId: previousSubscriptionId,
            planId: plan.id,
            paymentMethod: {
              cardNumber: paymentData.cardNumber,
              expiryDate: paymentData.expiryDate,
              cvv: paymentData.cvv,
              holderName: paymentData.holderName,
            },
          }),
        ).unwrap();
      } else if (isUpgrade && currentSubscription) {
        console.log('Processing upgrade...');
        await dispatch(
          updateSubscription({
            subscriptionId: currentSubscription.id,
            planId: plan.id,
          }),
        ).unwrap();
      } else {
        console.log('Processing new subscription...');
        await dispatch(
          processPayment({
            planId: plan.id,
            userId: user.id,
            paymentMethod: {
              cardNumber: paymentData.cardNumber,
              expiryDate: paymentData.expiryDate,
              cvv: paymentData.cvv,
              holderName: paymentData.holderName,
            },
          }),
        ).unwrap();
      }
    } catch (error: any) {
      console.error('Payment submission error:', error);
      // Error will be handled by useEffect above
    }
  };

  const isLoading = paymentLoading || reactivating;

  return (
    <SafeAreaView style={styles.container}>
      <Text testID="payment-details-title" style={styles.title}>
        Payment Details
      </Text>
      <PaymentForm
        onSubmit={handlePaymentSubmit}
        loading={isLoading}
        planName={plan?.name || 'Unknown Plan'}
        planPrice={plan?.price || 0}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
});
