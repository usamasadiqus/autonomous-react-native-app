// screens/subscription/SubscriptionScreen.tsx (Updated to refresh payment history)
import React, {useEffect, useState} from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Button} from '../../components/common/Button';
import {LoadingSpinner} from '../../components/common/LoadingSpinner';
import {SubscriptionStatus} from '../../components/subscription/SubscriptionStatus';
import {AppDispatch, RootState} from '../../store';
import {
  cancelSubscription,
  clearError,
  fetchAvailablePlans,
  fetchCurrentSubscription,
  fetchPaymentHistory,
  setSelectedPlan,
} from '../../store/slices/subscriptionSlice';

interface SubscriptionScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentSubscription,
    availablePlans,
    paymentHistory,
    loading,
    reactivating,
    error,
  } = useSelector((state: RootState) => state.subscription);
  const {user} = useSelector((state: RootState) => state.auth);

  const [canceling, setCanceling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadSubscriptionData();
    }
  }, [dispatch, user?.id]);

  // Add effect to refresh payment history when subscription changes
  useEffect(() => {
    if (currentSubscription && currentSubscription.id) {
      dispatch(fetchPaymentHistory(currentSubscription.id));
    }
  }, [dispatch, currentSubscription?.id, currentSubscription?.lastPaymentDate]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadSubscriptionData = async () => {
    if (user?.id) {
      await dispatch(fetchCurrentSubscription(user.id));
      await dispatch(fetchAvailablePlans());
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSubscriptionData();
    setRefreshing(false);
  };

  const handleManagePlan = () => {
    navigation.navigate('PlansScreen');
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        {text: 'Keep Subscription', style: 'cancel'},
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            if (currentSubscription) {
              setCanceling(true);
              try {
                await dispatch(
                  cancelSubscription(currentSubscription.id),
                ).unwrap();
                Alert.alert(
                  'Success',
                  'Your subscription has been canceled. You can resubscribe anytime!',
                );
              } catch (error) {
                Alert.alert('Error', 'Failed to cancel subscription.');
              } finally {
                setCanceling(false);
              }
            }
          },
        },
      ],
    );
  };

  const handleResubscribe = () => {
    if (currentSubscription && availablePlans.length > 0) {
      const previousPlan = availablePlans.find(
        plan => plan.id === currentSubscription.planId,
      );
      const suggestedPlan =
        previousPlan ||
        availablePlans.find(plan => plan.popular) ||
        availablePlans[0];

      dispatch(setSelectedPlan(suggestedPlan));

      Alert.alert(
        'Resubscribe',
        `Would you like to resubscribe to the ${suggestedPlan.name} plan for $${suggestedPlan.price}/month?`,
        [
          {
            text: 'Choose Different Plan',
            onPress: () => navigation.navigate('PlansScreen'),
          },
          {
            text: 'Continue',
            onPress: () =>
              navigation.navigate('PaymentScreen', {
                plan: suggestedPlan,
                isReactivation: true,
                previousSubscriptionId: currentSubscription.id,
              }),
          },
        ],
      );
    } else {
      navigation.navigate('PlansScreen');
    }
  };

  const handleViewPlans = () => {
    navigation.navigate('PlansScreen');
  };

  const renderPaymentHistory = () => {
    if (paymentHistory.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        {paymentHistory.slice(0, 5).map(payment => (
          <View key={payment.id} style={styles.paymentItem}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentDescription}>
                {payment.description}
              </Text>
              <Text style={styles.paymentDate}>
                {new Date(payment.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <View style={styles.paymentAmount}>
              <Text style={styles.paymentAmountText}>
                ${payment.amount} {payment.currency}
              </Text>
              <View
                style={[
                  styles.paymentStatus,
                  {
                    backgroundColor:
                      payment.status === 'succeeded' ? '#4CAF50' : '#FF3B30',
                  },
                ]}>
                <Text style={styles.paymentStatusText}>
                  {payment.status === 'succeeded' ? 'Paid' : 'Failed'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading && !currentSubscription) {
    return <LoadingSpinner visible={true} text="Loading subscription..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        testID="subscription-scrollview"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }>
        <View style={styles.header}>
          <Text testID="subscription-plans-title" style={styles.title}>
            Subscription Plans
          </Text>
          <Text style={styles.subtitle}>
            Manage your subscription and billing
          </Text>
        </View>

        {currentSubscription ? (
          <>
            <SubscriptionStatus
              subscription={currentSubscription}
              onManage={
                currentSubscription.status !== 'canceled'
                  ? handleManagePlan
                  : undefined
              }
              onCancel={
                currentSubscription.status === 'active'
                  ? handleCancelSubscription
                  : undefined
              }
              onResubscribe={
                currentSubscription.status === 'canceled'
                  ? handleResubscribe
                  : undefined
              }
            />

            {renderPaymentHistory()}
          </>
        ) : (
          <View style={styles.noSubscriptionContainer}>
            <Text style={styles.noSubscriptionIcon}>💎</Text>
            <Text style={styles.noSubscriptionTitle}>
              No Active Subscription
            </Text>
            <Text style={styles.noSubscriptionMessage}>
              Choose a plan to unlock premium features and get the most out of
              your apps.
            </Text>

            {/* Render available plans for Detox test */}
            {availablePlans && availablePlans.length > 0 && (
              <View style={{width: '100%', marginBottom: 16}}>
                {availablePlans.map(plan => (
                  <View
                    key={plan.id}
                    testID={
                      plan.name.toLowerCase().includes('basic')
                        ? 'basic-plan'
                        : plan.name.toLowerCase().includes('pro')
                        ? 'pro-plan'
                        : `${plan.name.toLowerCase().replace(/\s/g, '-')}-plan`
                    }
                    style={{
                      backgroundColor: '#f4f6fa',
                      borderRadius: 10,
                      padding: 16,
                      marginBottom: 8,
                    }}>
                    <Text style={{fontWeight: 'bold', fontSize: 16}}>
                      {plan.name}
                    </Text>
                    <Text style={{color: '#7F8C8D', marginBottom: 4}}>
                      ${plan.price} / month
                    </Text>
                    <Text style={{color: '#7F8C8D'}}>{plan.description}</Text>
                  </View>
                ))}
              </View>
            )}

            <Button
              title="View Plans"
              onPress={handleViewPlans}
              style={styles.viewPlansButton}
              testID="view-plans-button"
            />
          </View>
        )}

        <LoadingSpinner
          visible={canceling}
          text="Canceling subscription..."
          overlay
        />
        <LoadingSpinner
          visible={reactivating}
          text="Reactivating subscription..."
          overlay
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  paymentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  paymentAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  paymentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  noSubscriptionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noSubscriptionIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noSubscriptionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  noSubscriptionMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  viewPlansButton: {
    paddingHorizontal: 32,
  },
});
