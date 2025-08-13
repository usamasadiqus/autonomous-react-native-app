// screens/subscription/PlansScreen.tsx (Updated to ensure plans are loaded)
import React, {useEffect, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {Button} from '../../components/common/Button';
import {LoadingSpinner} from '../../components/common/LoadingSpinner';
import {PlanCard} from '../../components/subscription/PlanCard';
import {AppDispatch, RootState} from '../../store';
import {
  clearError,
  fetchAvailablePlans,
  Plan,
  setSelectedPlan,
} from '../../store/slices/subscriptionSlice';

interface PlansScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export const PlansScreen: React.FC<PlansScreenProps> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {availablePlans, currentSubscription, loading, error} = useSelector(
    (state: RootState) => state.subscription,
  );

  const [localSelectedPlan, setLocalSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    // Always fetch plans to ensure they're available
    console.log('PlansScreen: Fetching available plans...');
    dispatch(fetchAvailablePlans());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handlePlanSelect = (plan: Plan) => {
    console.log('Plan selected:', plan);
    setLocalSelectedPlan(plan);
    dispatch(setSelectedPlan(plan));
  };

  const handleContinue = () => {
    if (localSelectedPlan) {
      console.log('Continuing with plan:', localSelectedPlan);

      if (currentSubscription) {
        const currentPlan = availablePlans.find(
          p => p.id === currentSubscription.planId,
        );
        const isUpgrade = localSelectedPlan.price > (currentPlan?.price || 0);
        const priceDifference = Math.abs(
          localSelectedPlan.price - (currentPlan?.price || 0),
        );

        Alert.alert(
          'Change Plan',
          `Are you sure you want to ${
            isUpgrade ? 'upgrade' : 'downgrade'
          } to the ${localSelectedPlan.name} plan?\n\nNew price: $${
            localSelectedPlan.price
          }/month${
            priceDifference > 0
              ? `\nPrice difference: ${
                  isUpgrade ? '+' : '-'
                }$${priceDifference.toFixed(2)}/month`
              : ''
          }`,
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Continue',
              onPress: () => {
                console.log(
                  'Navigating to PaymentScreen with plan:',
                  localSelectedPlan,
                );
                navigation.navigate('PaymentScreen', {
                  plan: localSelectedPlan,
                  isUpgrade: true,
                });
              },
            },
          ],
        );
      } else {
        console.log(
          'Navigating to PaymentScreen for new subscription with plan:',
          localSelectedPlan,
        );
        navigation.navigate('PaymentScreen', {
          plan: localSelectedPlan,
          isUpgrade: false,
        });
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a plan first',
      });
    }
  };

  const getCurrentPlanPrice = (): number => {
    if (!currentSubscription) {
      return 0;
    }
    const currentPlan = availablePlans.find(
      p => p.id === currentSubscription.planId,
    );
    return currentPlan?.price || currentSubscription.amount || 0;
  };

  const getCurrentPlanId = (): number | null => {
    return currentSubscription?.planId || null;
  };

  if (loading && availablePlans.length === 0) {
    return <LoadingSpinner visible={true} text="Loading plans..." />;
  }

  // Show error if no plans available
  if (!loading && availablePlans.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Plans Not Available</Text>
          <Text style={styles.errorMessage}>
            Unable to load subscription plans. Please check your connection and
            try again.
          </Text>
          <Button
            title="Retry"
            onPress={() => dispatch(fetchAvailablePlans())}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        testID="plans-scrollview"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title} testID="plans-screen-title">
            Choose Your Plan
          </Text>
          <Text style={styles.subtitle}>
            {currentSubscription
              ? 'Upgrade or downgrade your subscription'
              : 'Select the plan that best fits your needs'}
          </Text>
          {currentSubscription && (
            <View style={styles.currentPlanInfo}>
              <Text style={styles.currentPlanText}>
                Current plan: ${getCurrentPlanPrice()}/month
              </Text>
            </View>
          )}
        </View>

        <View style={styles.plansContainer}>
          {availablePlans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={localSelectedPlan?.id === plan.id}
              isCurrent={getCurrentPlanId() === plan.id}
              onSelect={handlePlanSelect}
              disabled={getCurrentPlanId() === plan.id}
              testID={
                plan.name.toLowerCase().includes('basic')
                  ? 'basic-plan'
                  : plan.name.toLowerCase().includes('pro')
                  ? 'pro-plan'
                  : `${plan.name.toLowerCase().replace(/\s/g, '-')}-plan`
              }
            />
          ))}
        </View>

        {localSelectedPlan && getCurrentPlanId() !== localSelectedPlan.id && (
          <View style={styles.actionContainer}>
            <View style={styles.priceComparison}>
              {currentSubscription && (
                <Text style={styles.priceComparisonText}>
                  Current: ${getCurrentPlanPrice()}/month → New: $
                  {localSelectedPlan.price}/month
                </Text>
              )}
            </View>
            <Button
              title={
                currentSubscription
                  ? `Change to ${localSelectedPlan.name} Plan`
                  : `Continue with ${localSelectedPlan.name} Plan`
              }
              onPress={handleContinue}
              style={styles.continueButton}
              testID={`continue-${localSelectedPlan.name
                .toLowerCase()
                .replace(/\s/g, '-')}-plan`}
            />
          </View>
        )}

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>All plans include:</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>SSL encryption</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Regular backups</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>99.9% uptime guarantee</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Cancel anytime</Text>
            </View>
          </View>
        </View>

        <View style={styles.guarantee}>
          <Text style={styles.guaranteeIcon}>💝</Text>
          <Text style={styles.guaranteeText}>
            30-day money-back guarantee. No questions asked.
          </Text>
        </View>
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
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  currentPlanInfo: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  currentPlanText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  plansContainer: {
    marginBottom: 24,
  },
  actionContainer: {
    marginBottom: 32,
  },
  priceComparison: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  priceComparisonText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
  },
  features: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    maxWidth: 250,
  },
  featureIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 12,
    width: 20,
  },
  featureText: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  guarantee: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  guaranteeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  guaranteeText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    lineHeight: 20,
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
  },
});
