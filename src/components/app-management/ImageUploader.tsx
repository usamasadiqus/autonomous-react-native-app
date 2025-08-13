import React, {useState} from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
  MediaType,
} from 'react-native-image-picker';

interface ImageUploaderProps {
  imageUri?: string;
  onImageSelected: (uri: string) => void;
  error?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageUri,
  onImageSelected,
  error,
}) => {
  const [showImagePicker, setShowImagePicker] = useState(false);

  const selectImage = () => {
    setShowImagePicker(true);
  };

  const handleCameraSelect = () => {
    setShowImagePicker(false);

    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 512,
      maxHeight: 512,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]) {
        onImageSelected(response.assets[0].uri || '');
      }
    });
  };

  const handleGallerySelect = () => {
    setShowImagePicker(false);

    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 512,
      maxHeight: 512,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]) {
        onImageSelected(response.assets[0].uri || '');
      }
    });
  };

  const renderImagePickerModal = () => (
    <Modal
      visible={showImagePicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowImagePicker(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Image</Text>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={handleCameraSelect}>
            <Text style={styles.modalOptionIcon}>📷</Text>
            <Text style={styles.modalOptionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={handleGallerySelect}>
            <Text style={styles.modalOptionIcon}>🖼️</Text>
            <Text style={styles.modalOptionText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowImagePicker(false)}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>App Icon</Text>

      <TouchableOpacity
        style={[styles.imageContainer, error && styles.imageContainerError]}
        onPress={selectImage}>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📱</Text>
            <Text style={styles.placeholderText}>Tap to add icon</Text>
          </View>
        )}

        <View style={styles.uploadOverlay}>
          <Text style={styles.uploadIcon}>📷</Text>
        </View>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {renderImagePickerModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8F4FD',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FEFF',
    position: 'relative',
  },
  imageContainerError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  uploadOverlay: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  uploadIcon: {
    fontSize: 16,
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
    minWidth: 280,
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  modalOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
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
