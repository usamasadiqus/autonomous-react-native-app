import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {DeleteConfirmation} from '../../components/app-management/DeleteConfirmation';
import {Button} from '../../components/common/Button';
import {AppCard} from '../../components/dashboard/AppCard';
import {SearchBar} from '../../components/dashboard/SearchBar';
import {AppDispatch, RootState} from '../../store';
import {
  clearError,
  deleteApp,
  fetchApps,
  setFilterBy,
  setRefreshing,
  setSearchQuery,
  setSelectedApp,
  setSortBy,
} from '../../store/slices/appsSlice';
import {
  fetchAvailablePlans,
  fetchCurrentSubscription,
} from '../../store/slices/subscriptionSlice';

interface DashboardScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    filteredApps,
    loading,
    refreshing,
    error,
    searchQuery,
    filterBy,
    sortBy,
  } = useSelector((state: RootState) => state.apps);
  const {user} = useSelector((state: RootState) => state.auth);
  const {currentSubscription, availablePlans} = useSelector(
    (state: RootState) => state.subscription,
  );

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState<any>(null);
  const [deletingApp, setDeletingApp] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchApps(user.id));
      // Also load subscription data to ensure it's available for app creation
      dispatch(fetchCurrentSubscription(user.id));
      dispatch(fetchAvailablePlans());
    }
  }, [dispatch, user?.id]);

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

  const handleRefresh = () => {
    if (user?.id) {
      dispatch(setRefreshing(true));
      dispatch(fetchApps(user.id));
      // Also refresh subscription data
      dispatch(fetchCurrentSubscription(user.id));
      dispatch(fetchAvailablePlans());
    }
  };

  const handleAppPress = (app: any) => {
    dispatch(setSelectedApp(app));
    navigation.navigate('AppDetails', {appId: app.id});
  };

  const handleEditApp = (app: any) => {
    navigation.navigate('EditApp', {app});
  };

  const handleDeleteApp = (app: any) => {
    setAppToDelete(app);
  };

  const confirmDelete = async () => {
    if (!appToDelete) {
      return;
    }

    setDeletingApp(true);
    try {
      await dispatch(deleteApp(appToDelete.id)).unwrap();
      setAppToDelete(null);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'App deleted successfully!',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete app',
      });
    } finally {
      setDeletingApp(false);
    }
  };

  const handleCreateApp = () => {
    // Check if subscription data is still loading
    if (!currentSubscription && !loading) {
      // Try to fetch subscription data again if it's not available
      if (user?.id) {
        dispatch(fetchCurrentSubscription(user.id));
      }
      Toast.show({
        type: 'error',
        text1: 'Loading Subscription',
        text2: 'Please wait while we load your subscription details.',
      });
      return;
    }

    // Check subscription status
    if (!currentSubscription || currentSubscription.status !== 'active') {
      Toast.show({
        type: 'error',
        text1: 'Subscription Required',
        text2:
          'You need an active subscription to create an app. Please subscribe first.',
      });
      return;
    }

    // Check app limit (if any)
    let appLimit = null;
    if (currentSubscription && currentSubscription.features) {
      // If your plan has a limitation object, use that
      if (currentSubscription.features.find(f => f.includes('maxApps'))) {
        const maxAppsFeature = currentSubscription.features.find(f =>
          f.includes('maxApps'),
        );
        if (maxAppsFeature) {
          const match = maxAppsFeature.match(/maxApps\s*:\s*(\d+)/);
          if (match) {
            appLimit = parseInt(match[1], 10);
          }
        }
      }
    }
    // Fallback: check plan limitation if available
    if (
      !appLimit &&
      currentSubscription &&
      availablePlans &&
      currentSubscription.planId
    ) {
      const plan = availablePlans.find(
        p => p.id === currentSubscription.planId,
      );
      if (plan && plan.limitations && plan.limitations.maxApps) {
        appLimit = parseInt(plan.limitations.maxApps, 10);
      }
    }
    if (appLimit && filteredApps.length >= appLimit) {
      Toast.show({
        type: 'error',
        text1: 'App Limit Reached',
        text2: `Your subscription allows only ${appLimit} apps. Upgrade your plan to create more apps.`,
      });
      return;
    }
    navigation.navigate('CreateApp');
  };

  const renderAppCard = ({item, index}: {item: any; index: number}) => (
    <AppCard
      testID={`app-card-${index}`}
      app={item}
      onPress={handleAppPress}
      onEdit={handleEditApp}
      onDelete={handleDeleteApp}
      index={index}
    />
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFilterModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text testID="filter-modal-title" style={styles.modalTitle}>
            Filter Apps
          </Text>

          {['all', 'active', 'inactive', 'development'].map(filter => (
            <TouchableOpacity
              key={filter}
              testID={`filter-option-${filter}`}
              style={[
                styles.modalOption,
                filterBy === filter && styles.modalOptionSelected,
              ]}
              onPress={() => {
                dispatch(setFilterBy(filter as any));
                setShowFilterModal(false);
              }}>
              <Text
                style={[
                  styles.modalOptionText,
                  filterBy === filter && styles.modalOptionTextSelected,
                ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowFilterModal(false)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSortModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text testID="sort-modal-title" style={styles.modalTitle}>
            Sort Apps
          </Text>

          {[
            {key: 'lastUpdated', label: 'Last Updated'},
            {key: 'name', label: 'Name'},
            {key: 'downloads', label: 'Downloads'},
            {key: 'rating', label: 'Rating'},
          ].map(({key, label}) => (
            <TouchableOpacity
              key={key}
              testID={`sort-option-${key}`}
              style={[
                styles.modalOption,
                sortBy === key && styles.modalOptionSelected,
              ]}
              onPress={() => {
                dispatch(setSortBy(key as any));
                setShowSortModal(false);
              }}>
              <Text
                style={[
                  styles.modalOptionText,
                  sortBy === key && styles.modalOptionTextSelected,
                ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowSortModal(false)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📱</Text>
      <Text style={styles.emptyTitle}>No Apps Found</Text>
      <Text style={styles.emptyMessage}>
        {searchQuery
          ? 'Try adjusting your search or filters'
          : 'Create your first app to get started'}
      </Text>
      {!searchQuery && (
        <Button
          testID="create-first-app-button"
          title="Create Your First App"
          onPress={handleCreateApp}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text testID="dashboard-greeting" style={styles.greeting}>
            Hello, {user?.name}! 👋
          </Text>
          <Text testID="dashboard-subtitle" style={styles.subtitle}>
            You have {filteredApps.length} app
            {filteredApps.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          testID="create-app-button"
          style={styles.createButton}
          onPress={handleCreateApp}>
          <Text style={styles.createButtonText}>+ New App</Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        testID="search-bar"
        value={searchQuery}
        onChangeText={text => dispatch(setSearchQuery(text))}
        onFilterPress={() => setShowFilterModal(true)}
        onSortPress={() => setShowSortModal(true)}
      />

      <View style={styles.indicatorContainer}>
        {filterBy !== 'all' && (
          <Text testID={`${filterBy}-filter-badge`} style={styles.indicator}>
            Filter: {filterBy}
          </Text>
        )}
        {sortBy !== 'lastUpdated' && (
          <Text testID={`sort-indicator-${sortBy}`} style={styles.indicator}>
            Sort: {sortBy}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredApps}
        renderItem={renderAppCard}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredApps.length === 0 ? styles.emptyListContainer : undefined
        }
      />

      {renderFilterModal()}
      {renderSortModal()}

      <DeleteConfirmation
        visible={!!appToDelete}
        app={appToDelete}
        onConfirm={confirmDelete}
        onCancel={() => setAppToDelete(null)}
        loading={deletingApp}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  indicatorContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  indicator: {
    backgroundColor: '#E3F2FD',
    color: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginRight: 8,
    fontWeight: '600',
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    paddingHorizontal: 32,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    minWidth: 280,
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  modalOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
