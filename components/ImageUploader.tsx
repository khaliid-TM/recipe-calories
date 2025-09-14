import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

interface ImageUploaderProps {
  onImageUpload: (imageData: { uri: string; base64: string; mimeType: string; }) => void;
  onAnalyze: () => void;
  onClear: () => void;
  hasImage: boolean;
  isLoading: boolean;
  imageUri?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  onAnalyze, 
  onClear, 
  hasImage, 
  isLoading,
  imageUri 
}) => {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        onImageUpload({
          uri: asset.uri,
          base64: asset.base64,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        onImageUpload({
          uri: asset.uri,
          base64: asset.base64,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to select an image',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {!imageUri ? (
        <TouchableOpacity 
          style={styles.uploadArea} 
          onPress={showImagePicker}
          disabled={isLoading}
        >
          <Text style={styles.uploadIcon}>📷</Text>
          <Text style={styles.uploadText}>Tap to upload or take photo</Text>
          <Text style={styles.uploadSubtext}>PNG, JPG, or WEBP</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.analyzeButton, (!hasImage || isLoading) && styles.disabledButton]}
          onPress={onAnalyze}
          disabled={!hasImage || isLoading}
        >
          <Text style={[styles.analyzeButtonText, (!hasImage || isLoading) && styles.disabledButtonText]}>
            {isLoading ? 'Analyzing...' : 'Estimate Calories'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.clearButton, (!hasImage || isLoading) && styles.disabledButton]}
          onPress={onClear}
          disabled={!hasImage || isLoading}
        >
          <Text style={[styles.clearButtonText, (!hasImage || isLoading) && styles.disabledButtonText]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  uploadArea: {
    height: 200,
    borderWidth: 2,
    borderColor: '#475569',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#334155',
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  imageContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 16,
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#06b6d4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#475569',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#374151',
  },
  disabledButtonText: {
    color: '#6b7280',
  },
});