import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button} from '../common/Button';
import {Input} from '../common/Input';

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  holderName: string;
  email: string;
  address: {
    line1: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  loading?: boolean;
  planName?: string;
  planPrice?: number;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  loading = false,
  planName = '',
  planPrice = 0,
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
    email: '',
    address: {
      line1: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);
  const prevLoading = useRef(loading);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({...prev, [field]: value}));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Card number validation
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    // Expiry date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Please enter expiry date in MM/YY format';
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    // Cardholder name validation
    if (!formData.holderName) {
      newErrors.holderName = 'Cardholder name is required';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setSubmitting(true);
      onSubmit(formData);
    }
  };

  // Reset submitting when redux loading finishes
  useEffect(() => {
    if (prevLoading.current && !loading) {
      setSubmitting(false);
    }
    prevLoading.current = loading;
  }, [loading]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      testID="payment-form-scrollview">
      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{planName} Plan</Text>
          <Text style={styles.summaryValue}>${planPrice}/month</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>$0.00</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>${planPrice}/month</Text>
        </View>
      </View>

      {/* Payment Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>

        <Input
          label="Card Number"
          testID="payment-card-number"
          placeholder="4242 4242 4242 4242"
          value={formData.cardNumber}
          onChangeText={value => {
            const formatted = formatCardNumber(value);
            handleInputChange('cardNumber', formatted);
          }}
          error={errors.cardNumber}
          keyboardType="numeric"
          maxLength={19}
          editable={!loading && !submitting}
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Input
              label="Expiry Date"
              testID="payment-expiry-date"
              placeholder="MM/YY"
              value={formData.expiryDate}
              onChangeText={value => {
                const formatted = formatExpiryDate(value);
                handleInputChange('expiryDate', formatted);
              }}
              error={errors.expiryDate}
              keyboardType="numeric"
              maxLength={5}
              editable={!loading && !submitting}
            />
          </View>
          <View style={styles.halfWidth}>
            <Input
              label="CVV"
              testID="payment-cvv"
              placeholder="123"
              value={formData.cvv}
              onChangeText={value => handleInputChange('cvv', value)}
              error={errors.cvv}
              keyboardType="numeric"
              maxLength={4}
              editable={!loading && !submitting}
            />
          </View>
        </View>

        <Input
          label="Cardholder Name"
          testID="payment-holder-name"
          placeholder="John Doe"
          value={formData.holderName}
          onChangeText={value => handleInputChange('holderName', value)}
          error={errors.holderName}
          autoCapitalize="words"
          editable={!loading && !submitting}
        />
      </View>

      {/* Billing Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Billing Information</Text>

        <Input
          label="Email"
          testID="payment-email"
          placeholder="john@example.com"
          value={formData.email}
          onChangeText={value => handleInputChange('email', value)}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading && !submitting}
        />

        <Input
          label="Address"
          testID="payment-address"
          placeholder="123 Main Street"
          value={formData.address.line1}
          onChangeText={value => handleInputChange('address.line1', value)}
          editable={!loading && !submitting}
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Input
              label="City"
              testID="payment-city"
              placeholder="New York"
              value={formData.address.city}
              onChangeText={value => handleInputChange('address.city', value)}
              editable={!loading && !submitting}
            />
          </View>
          <View style={styles.halfWidth}>
            <Input
              label="State"
              testID="payment-state"
              placeholder="NY"
              value={formData.address.state}
              onChangeText={value => handleInputChange('address.state', value)}
              maxLength={2}
              editable={!loading && !submitting}
            />
          </View>
        </View>

        <Input
          label="ZIP Code"
          testID="payment-zip"
          placeholder="10001"
          value={formData.address.zipCode}
          onChangeText={value => handleInputChange('address.zipCode', value)}
          keyboardType="numeric"
          maxLength={10}
          editable={!loading && !submitting}
        />
      </View>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>
          Your payment information is encrypted and secure. We never store your
          card details.
        </Text>
      </View>

      {/* Submit Button */}
      <Button
        testID="payment-subscribe-button"
        title={
          loading
            ? 'Processing Payment...'
            : `Subscribe for $${planPrice}/month`
        }
        onPress={handleSubmit}
        loading={loading || submitting}
        disabled={loading || submitting}
        style={styles.submitButton}
      />

      {/* Test Card Info */}
      <View style={styles.testCardInfo}>
        <Text style={styles.testCardTitle}>💳 Test Card Information</Text>
        <Text style={styles.testCardText}>Card: 4242 4242 4242 4242</Text>
        <Text style={styles.testCardText}>Expiry: Any future date (12/26)</Text>
        <Text style={styles.testCardText}>CVV: Any 3 digits (123)</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  summaryContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
    paddingTop: 8,
    marginTop: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#2C3E50',
    lineHeight: 16,
  },
  submitButton: {
    marginBottom: 24,
  },
  testCardInfo: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  testCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  testCardText: {
    fontSize: 12,
    color: '#BF360C',
    marginBottom: 2,
  },
});
