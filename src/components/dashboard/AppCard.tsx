import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {App} from '../../store/slices/appsSlice';

interface AppCardProps {
  app: App;
  onPress: (app: App) => void;
  onEdit?: (app: App) => void;
  onDelete?: (app: App) => void;
  index: number;
  testID?: string;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onPress,
  onEdit,
  onDelete,
  index,
  testID,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'inactive':
        return '#F44336';
      case 'development':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getSubscriptionBadgeColor = (subscription: string) => {
    switch (subscription) {
      case 'premium':
        return '#FFD700';
      case 'basic':
        return '#87CEEB';
      case 'free':
        return '#E0E0E0';
      default:
        return '#E0E0E0';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return 'Just now';
    }
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    if (diffInHours < 48) {
      return 'Yesterday';
    }
    return formatDate(dateString);
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={styles.container}
      onPress={() => onPress(app)}
      activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.appInfo}>
          <View style={styles.logoContainer}>
            {app.logo ? (
              <Image source={{uri: app.logo}} style={styles.logo} />
            ) : (
              <View style={[styles.logo, styles.placeholderLogo]}>
                <Text style={styles.placeholderText}>
                  {app.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.details}>
            <View style={styles.nameRow}>
              <Text
                testID={`app-name-${index}`}
                style={styles.appName}
                numberOfLines={1}>
                {app.name}
              </Text>
              <View
                style={[
                  styles.subscriptionBadge,
                  {
                    backgroundColor: getSubscriptionBadgeColor(
                      app.subscriptionStatus,
                    ),
                  },
                ]}>
                <Text style={styles.subscriptionText}>
                  {app.subscriptionStatus.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {app.description}
            </Text>

            <View style={styles.metaInfo}>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    {backgroundColor: getStatusColor(app.status)},
                  ]}
                />
                <Text style={styles.statusText}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </Text>
              </View>

              <Text style={styles.lastUpdated}>
                Updated {formatTime(app.lastUpdated)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {app.downloads.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Downloads</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statValue}>⭐ {app.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statValue}>v{app.version}</Text>
            <Text style={styles.statLabel}>Version</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              testID={`edit-app-button-${index}`}
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(app)}>
              <Text style={styles.actionButtonText}>✏️</Text>
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              testID={`delete-app-button-${index}`}
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(app)}>
              <Text style={styles.actionButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    marginBottom: 12,
  },
  appInfo: {
    flexDirection: 'row',
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  placeholderLogo: {
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  details: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    marginRight: 8,
  },
  subscriptionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2C3E50',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#95A5A6',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  stats: {
    flexDirection: 'row',
    flex: 1,
  },
  stat: {
    marginRight: 20,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 12,
    color: '#95A5A6',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
    fontSize: 16,
  },
});
