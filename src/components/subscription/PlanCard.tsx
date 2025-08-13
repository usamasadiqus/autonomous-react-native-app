// components/subscription/PlanCard.tsx
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Plan} from '../../store/slices/subscriptionSlice';

interface PlanCardProps {
  plan: Plan;
  isSelected?: boolean;
  isCurrent?: boolean;
  onSelect?: (plan: Plan) => void;
  disabled?: boolean;
  testID?: string;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isSelected = false,
  isCurrent = false,
  onSelect,
  disabled = false,
  testID,
}) => {
  const handlePress = () => {
    if (!disabled && onSelect) {
      onSelect(plan);
    }
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.container,
        isSelected && styles.selected,
        isCurrent && styles.current,
        plan.popular && styles.popular,
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}>
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}

      {isCurrent && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentText}>CURRENT PLAN</Text>
        </View>
      )}

      <View
        style={[
          styles.header,
          {
            marginTop: plan.popular ? 16 : 0,
          },
        ]}>
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>{plan.currency}</Text>
          <Text style={styles.price}>{plan.price}</Text>
          <Text style={styles.interval}>/{plan.interval}</Text>
        </View>
        <Text style={styles.description}>{plan.description}</Text>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Features included:</Text>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {plan.limitations && (
        <View style={styles.limitationsContainer}>
          <Text style={styles.limitationsTitle}>Plan limits:</Text>
          <View style={styles.limitationItem}>
            <Text style={styles.limitationLabel}>Max Apps:</Text>
            <Text style={styles.limitationValue}>
              {plan.limitations.maxApps}
            </Text>
          </View>
          <View style={styles.limitationItem}>
            <Text style={styles.limitationLabel}>Storage:</Text>
            <Text style={styles.limitationValue}>
              {plan.limitations.storage}
            </Text>
          </View>
          <View style={styles.limitationItem}>
            <Text style={styles.limitationLabel}>Support:</Text>
            <Text style={styles.limitationValue}>
              {plan.limitations.support}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E8F4FD',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selected: {
    borderColor: '#007AFF',
    backgroundColor: '#F8FCFF',
  },
  current: {
    borderColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  popular: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
  },
  disabled: {
    opacity: 0.6,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    right: 20,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  currentBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  currentText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currency: {
    fontSize: 18,
    color: '#7F8C8D',
    marginRight: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  interval: {
    fontSize: 16,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  limitationsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  limitationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 8,
  },
  limitationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  limitationLabel: {
    fontSize: 12,
    color: '#95A5A6',
  },
  limitationValue: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
});
