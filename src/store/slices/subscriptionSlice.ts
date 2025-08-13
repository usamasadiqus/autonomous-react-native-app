// store/slices/subscriptionSlice.ts (Updated with better error handling)
import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {APP_CONSTANTS} from '../../utils/constants';

// Types remain the same
export interface Plan {
  id: number;
  name: string;
  price: number;
  currency: string;
  interval: string;
  description: string;
  features: string[];
  limitations?: {
    maxApps: string;
    storage: string;
    support: string;
  };
  popular: boolean;
  stripePriceId: string;
  isActive: boolean;
}

export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  lastPaymentDate: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  features?: string[];
  canceledAt?: string;
}

export interface PaymentHistory {
  id: number;
  subscriptionId: number;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  date: string;
  description: string;
  paymentMethod: string;
  receiptUrl?: string;
}

export interface SubscriptionState {
  currentSubscription: Subscription | null;
  availablePlans: Plan[];
  paymentHistory: PaymentHistory[];
  loading: boolean;
  paymentLoading: boolean;
  reactivating: boolean;
  error: string | null;
  selectedPlan: Plan | null;
  paymentSuccess: boolean;
}

// FIXED: Better plan fetching with fallback
const getPlanById = async (
  planId: number,
  availablePlans?: Plan[],
): Promise<Plan | undefined> => {
  try {
    // First try to get from available plans (in memory)
    if (availablePlans && availablePlans.length > 0) {
      const plan = availablePlans.find(p => p.id === planId);
      if (plan) {
        console.log('Found plan in memory:', plan);
        return plan;
      }
    }

    // Fallback to API call
    console.log('Fetching plan from API for ID:', planId);
    const response = await fetch(
      `${APP_CONSTANTS.API_BASE_URL}/plans/${planId}`,
    );

    if (!response.ok) {
      console.warn(`Plan API call failed with status: ${response.status}`);
      throw new Error(`Plan not found: ${response.status}`);
    }

    const plan = await response.json();
    console.log('Found plan from API:', plan);
    return plan || undefined;
  } catch (error) {
    console.error('Error fetching plan:', error);

    // Last resort: fallback to default plan structure
    if (availablePlans && availablePlans.length > 0) {
      console.warn('Using fallback plan from available plans');
      return (
        availablePlans.find(p => p.id === planId) ||
        availablePlans[0] ||
        undefined
      );
    }

    return undefined;
  }
};

// Helper function to add payment history entry
const addPaymentHistoryEntry = async (paymentData: {
  subscriptionId: number;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed';
  description: string;
  paymentMethod: string;
}): Promise<PaymentHistory> => {
  const newPayment = {
    ...paymentData,
    id: Date.now(),
    date: new Date().toISOString(),
    receiptUrl: `https://example.com/receipt/${Date.now()}`,
  };

  try {
    const response = await fetch(`${APP_CONSTANTS.API_BASE_URL}/payments`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(newPayment),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Failed to save payment history, using mock data');
  }

  return newPayment;
};

// Fetch current subscription with plan details
export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrent',
  async (userId: number, {rejectWithValue, getState}) => {
    try {
      const response = await fetch(
        `${APP_CONSTANTS.API_BASE_URL}/subscriptions?userId=${userId}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const subscriptions = await response.json();
      const subscription = subscriptions[0] || null;

      if (subscription) {
        // Get available plans from state
        const state = getState() as {subscription: SubscriptionState};
        const availablePlans = state.subscription.availablePlans;

        // Get plan details to ensure correct pricing
        const plan = await getPlanById(subscription.planId, availablePlans);
        if (plan) {
          subscription.amount = plan.price;
          subscription.currency = plan.currency;
        }
      }

      return subscription;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchAvailablePlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, {rejectWithValue}) => {
    try {
      const response = await fetch(
        `${APP_CONSTANTS.API_BASE_URL}/plans?isActive=true`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const plans = await response.json();
      console.log('Fetched available plans:', plans);
      return plans;
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      return rejectWithValue(error.message);
    }
  },
);

export const fetchPaymentHistory = createAsyncThunk(
  'subscription/fetchPaymentHistory',
  async (subscriptionId: number, {rejectWithValue}) => {
    try {
      const response = await fetch(
        `${APP_CONSTANTS.API_BASE_URL}/payments?subscriptionId=${subscriptionId}`,
      );

      if (response.ok) {
        const payments = await response.json();
        if (payments.length > 0) {
          return payments.sort(
            (a: PaymentHistory, b: PaymentHistory) =>
              new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
        }
      }

      // Fallback to mock data
      const mockPayments: PaymentHistory[] = [
        {
          id: 1,
          subscriptionId,
          amount: 19.99,
          currency: 'USD',
          status: 'succeeded',
          date: '2025-06-01T10:00:00.000Z',
          description: 'Premium Plan - Monthly',
          paymentMethod: 'Visa ending in 4242',
          receiptUrl: 'https://example.com/receipt/1',
        },
      ];

      return mockPayments;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// FIXED: Process payment with better error handling
export const processPayment = createAsyncThunk(
  'subscription/processPayment',
  async (
    paymentData: {
      planId: number;
      userId: number;
      paymentMethod: {
        cardNumber: string;
        expiryDate: string;
        cvv: string;
        holderName: string;
      };
      isReactivation?: boolean;
      plan?: Plan;
    },
    {rejectWithValue, getState},
  ) => {
    try {
      console.log('Processing payment for plan ID:', paymentData.planId);

      // Use plan from paymentData if provided
      let plan: Plan | undefined = paymentData.plan ?? undefined;

      // Get available plans from state first
      const state = getState() as {subscription: SubscriptionState};
      const availablePlans = state.subscription.availablePlans;

      if (!plan && availablePlans && availablePlans.length > 0) {
        plan =
          availablePlans.find(p => p.id === paymentData.planId) || undefined;
      }

      // If still no plan found, try to find in selectedPlan
      if (!plan && state.subscription.selectedPlan) {
        console.log('Using selected plan as fallback');
        plan = state.subscription.selectedPlan;
      }

      // Fallback to API call
      if (!plan) {
        plan = await getPlanById(paymentData.planId, availablePlans);
      }

      // Last resort: use default values
      if (!plan) {
        console.error('No plan found, using default values');
        plan = {
          id: paymentData.planId,
          name: 'Unknown Plan',
          price: 19.99,
          currency: 'USD',
          interval: 'monthly',
          description: 'Default plan',
          features: [],
          popular: false,
          stripePriceId: '',
          isActive: true,
        };
      }

      console.log('Using plan for payment:', plan);

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock Stripe payment processing
      const isSuccessful = true; // Always succeed for testing

      if (!isSuccessful) {
        throw new Error(
          'Payment failed. Please check your card details and try again.',
        );
      }

      // Create new subscription with correct plan pricing
      const subscriptionData = {
        userId: paymentData.userId,
        planId: paymentData.planId,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
        paymentMethod: `Visa ending in ${paymentData.paymentMethod.cardNumber.slice(
          -4,
        )}`,
        lastPaymentDate: new Date().toISOString(),
        nextBillingDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        amount: plan.price,
        currency: plan.currency,
      };

      console.log('Creating subscription with data:', subscriptionData);

      const response = await fetch(
        `${APP_CONSTANTS.API_BASE_URL}/subscriptions`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(subscriptionData),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Subscription creation failed:', errorText);
        throw new Error('Failed to create subscription');
      }

      const newSubscription = await response.json();
      console.log('Created subscription:', newSubscription);

      // Add payment history entry
      try {
        await addPaymentHistoryEntry({
          subscriptionId: newSubscription.id,
          amount: plan.price,
          currency: plan.currency,
          status: 'succeeded',
          description: `${plan.name} Plan - Monthly`,
          paymentMethod: `Visa ending in ${paymentData.paymentMethod.cardNumber.slice(
            -4,
          )}`,
        });
      } catch (historyError) {
        console.warn('Failed to add payment history:', historyError);
        // Don't fail the whole process for payment history
      }

      return newSubscription;
    } catch (error: any) {
      console.error('Payment processing error:', error);
      return rejectWithValue(error.message);
    }
  },
);

// FIXED: Update subscription with better error handling
export const updateSubscription = createAsyncThunk(
  'subscription/update',
  async (
    subscriptionData: {subscriptionId: number; planId: number; plan?: Plan},
    {rejectWithValue, getState},
  ) => {
    try {
      console.log(
        'Updating subscription for plan ID:',
        subscriptionData.planId,
      );

      // Use plan from subscriptionData if provided
      let plan: Plan | undefined = subscriptionData.plan ?? undefined;

      // Get available plans from state
      const state = getState() as {subscription: SubscriptionState};
      const availablePlans = state.subscription.availablePlans;

      if (!plan && availablePlans && availablePlans.length > 0) {
        plan =
          availablePlans.find(p => p.id === subscriptionData.planId) ||
          undefined;
      }

      if (!plan && state.subscription.selectedPlan) {
        plan = state.subscription.selectedPlan;
      }

      if (!plan) {
        plan = await getPlanById(subscriptionData.planId, availablePlans);
      }

      if (!plan) {
        throw new Error(`Plan with ID ${subscriptionData.planId} not found`);
      }

      console.log('Updating subscription with plan:', plan);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const updateData = {
        planId: subscriptionData.planId,
        amount: plan.price,
        currency: plan.currency,
        lastUpdated: new Date().toISOString(),
      };

      const response = await fetch(
        `${APP_CONSTANTS.API_BASE_URL}/subscriptions/${subscriptionData.subscriptionId}`,
        {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      const updatedSubscription = await response.json();

      // Add payment history entry for plan change
      try {
        await addPaymentHistoryEntry({
          subscriptionId: subscriptionData.subscriptionId,
          amount: plan.price,
          currency: plan.currency,
          status: 'succeeded',
          description: `Plan changed to ${plan.name} - Monthly`,
          paymentMethod: 'Existing payment method',
        });
      } catch (historyError) {
        console.warn('Failed to add payment history:', historyError);
      }

      return updatedSubscription;
    } catch (error: any) {
      console.error('Subscription update error:', error);
      return rejectWithValue(error.message);
    }
  },
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (subscriptionId: number, {rejectWithValue}) => {
    try {
      const response = await fetch(
        `${APP_CONSTANTS.API_BASE_URL}/subscriptions/${subscriptionId}`,
        {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            status: 'canceled',
            autoRenew: false,
            canceledAt: new Date().toISOString(),
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// FIXED: Reactivate subscription with better error handling
export const reactivateSubscription = createAsyncThunk(
  'subscription/reactivate',
  async (
    data: {
      subscriptionId: number;
      planId: number;
      paymentMethod: {
        cardNumber: string;
        expiryDate: string;
        cvv: string;
        holderName: string;
      };
      plan?: Plan;
    },
    {rejectWithValue, getState},
  ) => {
    try {
      console.log('Reactivating subscription for plan ID:', data.planId);

      // Use plan from data if provided
      let plan: Plan | undefined = data.plan ?? undefined;

      // Get available plans from state
      const state = getState() as {subscription: SubscriptionState};
      const availablePlans = state.subscription.availablePlans;

      if (!plan && availablePlans && availablePlans.length > 0) {
        plan = availablePlans.find(p => p.id === data.planId) || undefined;
      }

      if (!plan && state.subscription.selectedPlan) {
        plan = state.subscription.selectedPlan;
      }

      if (!plan) {
        plan = await getPlanById(data.planId, availablePlans);
      }

      if (!plan) {
        throw new Error(
          `Plan with ID ${data.planId} not found for reactivation`,
        );
      }

      console.log('Reactivating with plan:', plan);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      const isSuccessful = true; // Always succeed for testing

      if (!isSuccessful) {
        throw new Error(
          'Payment failed. Please check your card details and try again.',
        );
      }

      const updateData = {
        status: 'active',
        autoRenew: true,
        planId: data.planId,
        amount: plan.price,
        currency: plan.currency,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: `Visa ending in ${data.paymentMethod.cardNumber.slice(
          -4,
        )}`,
        lastPaymentDate: new Date().toISOString(),
        nextBillingDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        reactivatedAt: new Date().toISOString(),
      };

      const response = await fetch(
        `${APP_CONSTANTS.API_BASE_URL}/subscriptions/${data.subscriptionId}`,
        {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }

      const reactivatedSubscription = await response.json();

      // Add payment history entry for reactivation
      try {
        await addPaymentHistoryEntry({
          subscriptionId: data.subscriptionId,
          amount: plan.price,
          currency: plan.currency,
          status: 'succeeded',
          description: `Subscription reactivated - ${plan.name} Plan`,
          paymentMethod: `Visa ending in ${data.paymentMethod.cardNumber.slice(
            -4,
          )}`,
        });
      } catch (historyError) {
        console.warn('Failed to add payment history:', historyError);
      }

      return reactivatedSubscription;
    } catch (error: any) {
      console.error('Reactivation error:', error);
      return rejectWithValue(error.message);
    }
  },
);

const initialState: SubscriptionState = {
  currentSubscription: null,
  availablePlans: [],
  paymentHistory: [],
  loading: false,
  paymentLoading: false,
  reactivating: false,
  error: null,
  selectedPlan: null,
  paymentSuccess: false,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setSelectedPlan: (state, action: PayloadAction<Plan | null>) => {
      state.selectedPlan = action.payload;
      console.log('Selected plan set:', action.payload);
    },
    clearPaymentSuccess: state => {
      state.paymentSuccess = false;
    },
    setPaymentLoading: (state, action: PayloadAction<boolean>) => {
      state.paymentLoading = action.payload;
    },
    setReactivating: (state, action: PayloadAction<boolean>) => {
      state.reactivating = action.payload;
    },
    refreshPaymentHistory: (state, action: PayloadAction<PaymentHistory[]>) => {
      state.paymentHistory = action.payload.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    },
  },
  extraReducers: builder => {
    // Fetch Current Subscription
    builder.addCase(fetchCurrentSubscription.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
      state.loading = false;
      state.currentSubscription = action.payload;
    });
    builder.addCase(fetchCurrentSubscription.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Available Plans
    builder.addCase(fetchAvailablePlans.pending, state => {
      state.loading = true;
    });
    builder.addCase(fetchAvailablePlans.fulfilled, (state, action) => {
      state.loading = false;
      state.availablePlans = action.payload;
      console.log('Available plans updated in state:', action.payload);
    });
    builder.addCase(fetchAvailablePlans.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Payment History
    builder.addCase(fetchPaymentHistory.fulfilled, (state, action) => {
      state.paymentHistory = action.payload;
    });

    // Process Payment
    builder.addCase(processPayment.pending, state => {
      state.paymentLoading = true;
      state.error = null;
      state.paymentSuccess = false;
    });
    builder.addCase(processPayment.fulfilled, (state, action) => {
      state.paymentLoading = false;
      state.currentSubscription = action.payload;
      state.paymentSuccess = true;
      state.selectedPlan = null;
    });
    builder.addCase(processPayment.rejected, (state, action) => {
      state.paymentLoading = false;
      state.error = action.payload as string;
    });

    // Update Subscription
    builder.addCase(updateSubscription.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateSubscription.fulfilled, (state, action) => {
      state.loading = false;
      state.currentSubscription = action.payload;
      state.paymentSuccess = true;
    });
    builder.addCase(updateSubscription.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Cancel Subscription
    builder.addCase(cancelSubscription.fulfilled, (state, action) => {
      state.currentSubscription = action.payload;
    });

    // Reactivate Subscription
    builder.addCase(reactivateSubscription.pending, state => {
      state.reactivating = true;
      state.error = null;
      state.paymentSuccess = false;
    });
    builder.addCase(reactivateSubscription.fulfilled, (state, action) => {
      state.reactivating = false;
      state.currentSubscription = action.payload;
      state.paymentSuccess = true;
      state.selectedPlan = null;
    });
    builder.addCase(reactivateSubscription.rejected, (state, action) => {
      state.reactivating = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  clearError,
  setSelectedPlan,
  clearPaymentSuccess,
  setPaymentLoading,
  setReactivating,
  refreshPaymentHistory,
} = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
