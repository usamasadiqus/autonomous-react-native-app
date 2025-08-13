import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {App} from '../../store/slices/appsSlice';
import {Button} from '../common/Button';
import {Input} from '../common/Input';
import {ImageUploader} from './ImageUploader';

interface AppFormData {
  name: string;
  description: string;
  logo: string;
  packageName: string;
  version: string;
  category: string;
  platform: string[];
  subscriptionStatus: 'free' | 'basic' | 'premium';
  status: 'active' | 'inactive' | 'development';
}

interface AppFormProps {
  initialData?: Partial<App>;
  onSubmit: (data: AppFormData) => void;
  loading?: boolean;
  submitButtonTitle: string;
}

export const AppForm: React.FC<AppFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  submitButtonTitle,
}) => {
  const [formData, setFormData] = useState<AppFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    logo: initialData?.logo || '',
    packageName: initialData?.packageName || '',
    version: initialData?.version || '',
    category: initialData?.category || '',
    platform: initialData?.platform || ['iOS', 'Android'],
    subscriptionStatus: initialData?.subscriptionStatus || 'free',
    status: initialData?.status || 'development',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const categories = [
    'Productivity',
    'Health & Fitness',
    'Finance',
    'Education',
    'Food & Drink',
    'Lifestyle',
    'Entertainment',
    'Business',
    'Social',
    'Travel',
    'News',
    'Sports',
    'Weather',
    'Utilities',
  ];

  const platforms = ['iOS', 'Android', 'Web'];

  const handleInputChange = (field: keyof AppFormData, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platform: prev.platform.includes(platform)
        ? prev.platform.filter(p => p !== platform)
        : [...prev.platform, platform],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'App name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'App name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.packageName.trim()) {
      newErrors.packageName = 'Package name is required';
    } else if (!/^[a-z0-9.]+$/.test(formData.packageName)) {
      newErrors.packageName =
        'Package name must contain only lowercase letters, numbers, and dots';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Version is required';
    } else if (!/^\d+\.\d+\.\d+$/.test(formData.version)) {
      newErrors.version = 'Version must be in format x.x.x (e.g., 1.0.0)';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.platform.length === 0) {
      newErrors.platform = 'At least one platform must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>

          <ScrollView style={styles.modalScrollView}>
            {options.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.modalOption,
                  selectedValue === option && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}>
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedValue === option && styles.modalOptionTextSelected,
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Image Upload */}
        <ImageUploader
          imageUri={formData.logo}
          onImageSelected={uri => handleInputChange('logo', uri)}
          error={errors.logo}
        />

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Input
            testID="app-name-input"
            label="App Name *"
            placeholder="Enter app name"
            value={formData.name}
            onChangeText={value => handleInputChange('name', value)}
            error={errors.name}
          />

          <Input
            testID="app-description-input"
            label="Description *"
            placeholder="Describe your app"
            value={formData.description}
            onChangeText={value => handleInputChange('description', value)}
            error={errors.description}
            numberOfLines={4}
            style={styles.textArea}
          />

          <Input
            testID="app-package-name-input"
            label="Package Name *"
            placeholder="com.example.myapp"
            value={formData.packageName}
            onChangeText={value => handleInputChange('packageName', value)}
            error={errors.packageName}
            autoCapitalize="none"
          />

          <Input
            testID="app-version-input"
            label="Version *"
            placeholder="1.0.0"
            value={formData.version}
            onChangeText={value => handleInputChange('version', value)}
            error={errors.version}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity
              style={[styles.selector, errors.category && styles.selectorError]}
              onPress={() => setShowCategoryModal(true)}>
              <Text
                style={[
                  styles.selectorText,
                  !formData.category && styles.selectorPlaceholder,
                ]}>
                {formData.category || 'Select category'}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
            {errors.category && (
              <Text style={styles.errorText}>{errors.category}</Text>
            )}
          </View>

          {/* Platform Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Platforms *</Text>
            <View style={styles.platformContainer}>
              {platforms.map(platform => (
                <TouchableOpacity
                  key={platform}
                  style={[
                    styles.platformChip,
                    formData.platform.includes(platform) &&
                      styles.platformChipSelected,
                  ]}
                  onPress={() => togglePlatform(platform)}>
                  <Text
                    style={[
                      styles.platformChipText,
                      formData.platform.includes(platform) &&
                        styles.platformChipTextSelected,
                    ]}>
                    {platform}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.platform && (
              <Text style={styles.errorText}>{errors.platform}</Text>
            )}
          </View>
        </View>

        {/* Status & Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Status</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subscription Status</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowSubscriptionModal(true)}>
              <Text style={styles.selectorText}>
                {formData.subscriptionStatus.charAt(0).toUpperCase() +
                  formData.subscriptionStatus.slice(1)}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Development Status</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowStatusModal(true)}>
              <Text style={styles.selectorText}>
                {formData.status.charAt(0).toUpperCase() +
                  formData.status.slice(1)}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <Button
          testID={
            submitButtonTitle === 'Create App'
              ? 'create-app-submit'
              : 'update-app-submit'
          }
          title={submitButtonTitle}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>

      {/* Modals */}
      {renderModal(
        showCategoryModal,
        () => setShowCategoryModal(false),
        'Select Category',
        categories,
        formData.category,
        value => handleInputChange('category', value),
      )}

      {renderModal(
        showSubscriptionModal,
        () => setShowSubscriptionModal(false),
        'Subscription Status',
        ['free', 'basic', 'premium'],
        formData.subscriptionStatus,
        value => handleInputChange('subscriptionStatus', value as any),
      )}

      {renderModal(
        showStatusModal,
        () => setShowStatusModal(false),
        'Development Status',
        ['development', 'active', 'inactive'],
        formData.status,
        value => handleInputChange('status', value as any),
      )}
    </KeyboardAvoidingView>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  textArea: {},
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8F4FD',
    borderRadius: 12,
    backgroundColor: '#F8FEFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 50,
  },
  selectorError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  selectorText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  selectorPlaceholder: {
    color: '#95A5A6',
  },
  selectorArrow: {
    fontSize: 12,
    color: '#95A5A6',
  },
  platformContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E8F4FD',
    backgroundColor: '#F8FEFF',
  },
  platformChipSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  platformChipText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  platformChipTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
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
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 300,
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
    color: '#FF3B30',
    fontWeight: '600',
  },
});
