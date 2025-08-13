import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Subscription} from '../../store/slices/subscriptionSlice';

interface SubscriptionStatusProps {
  subscription: Subscription;
  onManage?: () => void;
  onCancel?: () => void;
  onResubscribe?: () => void;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  subscription,
  onManage,
  onCancel,
  onResubscribe,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'past_due':
        return '#FF9800';
      case 'canceled':
      case 'inactive':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isCanceled = subscription.status === 'canceled';

  return (
    <View
      testID="subscription-status"
      style={[styles.container, isCanceled && styles.canceledContainer]}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              {backgroundColor: getStatusColor(subscription.status)},
            ]}
          />
          <Text style={styles.statusText}>
            {getStatusText(subscription.status)}
          </Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.currency}>{subscription.currency}</Text>
          <Text style={styles.amount}>{subscription.amount}</Text>
          <Text style={styles.period}>/month</Text>
        </View>
      </View>

      {isCanceled && (
        <View style={styles.canceledNotice}>
          <Text style={styles.canceledIcon}>⚠️</Text>
          <View style={styles.canceledTextContainer}>
            <Text style={styles.canceledTitle}>Subscription Canceled</Text>
            <Text style={styles.canceledMessage}>
              Your subscription was canceled on{' '}
              {subscription.canceledAt
                ? formatDate(subscription.canceledAt)
                : 'Unknown'}
              . You can resubscribe anytime to restore access to premium
              features.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.details}>
        {!isCanceled && (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next billing date:</Text>
              <Text style={styles.detailValue}>
                {formatDate(subscription.nextBillingDate)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment method:</Text>
              <Text style={styles.detailValue}>
                {subscription.paymentMethod}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Auto-renewal:</Text>
              <Text style={styles.detailValue}>
                {subscription.autoRenew ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            {isCanceled ? 'Canceled on:' : 'Last payment:'}
          </Text>
          <Text style={styles.detailValue}>
            {isCanceled && subscription.canceledAt
              ? formatDate(subscription.canceledAt)
              : formatDate(subscription.lastPaymentDate)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {isCanceled ? (
          // Resubscribe button for canceled subscriptions
          <TouchableOpacity
            style={styles.resubscribeButton}
            onPress={onResubscribe}>
            <Text style={styles.resubscribeButtonText}>Resubscribe</Text>
          </TouchableOpacity>
        ) : (
          // Normal action buttons for active subscriptions
          <>
            {onManage && (
              <TouchableOpacity style={styles.manageButton} onPress={onManage}>
                <Text style={styles.manageButtonText}>Manage Plan</Text>
              </TouchableOpacity>
            )}

            {onCancel && subscription.status === 'active' && (
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  canceledContainer: {
    backgroundColor: '#FFF8F8',
    borderWidth: 1,
    borderColor: '#FFE6E6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 14,
    color: '#7F8C8D',
    marginRight: 2,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  period: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 2,
  },
  canceledNotice: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  canceledIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  canceledTextContainer: {
    flex: 1,
  },
  canceledTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 4,
  },
  canceledMessage: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  details: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  detailValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  manageButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 14,
  },
  resubscribeButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  resubscribeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
