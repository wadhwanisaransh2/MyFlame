import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import {ColorThemeInterface} from '../../Utils/colors';
import {useTheme} from '../../Theme/ThemeContext';
import {fontSize} from '../../Utils/fontIcon';
import {wp} from '../../Utils/responsive';
import {CloseSVG} from '../../Assets/Images/SVGs/CommonSVG';

// Define types for the selected images
interface SelectedImage {
  path: string;
  width: number;
  height: number;
  mime: string;
  size: number;
  modificationDate?: string;
  creationDate?: string;
}

// Props interface
interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelect: (images: SelectedImage[]) => void;
  multiple?: boolean;
  maxImages?: number;
  cropperOptions?: {
    width?: number;
    height?: number;
    cropping?: boolean;
    cropperCircleOverlay?: boolean;
    compressImageQuality?: number;
  };
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onImageSelect,
  multiple = true,
  maxImages = 5,
  cropperOptions = {
    cropping: true,
    compressImageQuality: 0.8,
  },
}) => {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  // Open camera with cropping
  const openCamera = async () => {
    try {
      const image = await ImageCropPicker.openCamera({
        width: cropperOptions.width,
        height: cropperOptions.height,
        cropping: cropperOptions.cropping,
        cropperCircleOverlay: cropperOptions.cropperCircleOverlay,
        compressImageQuality: cropperOptions.compressImageQuality,
      });

      handleImageSelection([image]);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        }
    }
  };

  // Open gallery with cropping
  const openGallery = async () => {
    try {
      const images = await ImageCropPicker.openPicker({
        multiple: multiple,
        maxFiles: maxImages - selectedImages.length,
        width: cropperOptions.width,
        height: cropperOptions.height,
        cropping: cropperOptions.cropping,
        cropperCircleOverlay: cropperOptions.cropperCircleOverlay,
        compressImageQuality: cropperOptions.compressImageQuality,
        mediaType: 'photo',
      });
      // Handle both single image and array of images
      const imageArray = Array.isArray(images) ? images : [images];
      handleImageSelection(imageArray);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        }
    }
  };

  // Handle image selection
  const handleImageSelection = (newImages: SelectedImage[]) => {
    // If multiple selection is not allowed, replace existing images
    const imagesToAdd = multiple
      ? [...selectedImages, ...newImages].slice(0, maxImages)
      : newImages.slice(0, 1);

    setSelectedImages(imagesToAdd);
  };

  // Remove image
  const removeImage = (path: string) => {
    setSelectedImages(prevImages =>
      prevImages.filter(image => image.path !== path),
    );
  };

  // Confirm selection
  const confirmSelection = () => {
    onImageSelect(selectedImages);
    onClose();
    setSelectedImages([]);
  };

  // Clean up resources when modal closes
  const handleClose = () => {
    // Clean up any image crop picker resources
    ImageCropPicker.clean()
      .then(() => {
        })
      .catch(e => {
        });

    onClose();
    setSelectedImages([]);
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <Text style={styles.modalTitle}>Select Images</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={openCamera}>
              <Text style={styles.actionButtonText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={openGallery}>
              <Text style={styles.actionButtonText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <ScrollView
              horizontal
              contentContainerStyle={styles.imagePreviewContainer}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image
                    source={{uri: image.path}}
                    style={styles.previewImage}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(image.path)}>
                    <CloseSVG width={20} height={20} fill={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Modal Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.footerButton, styles.cancelButton]}
              onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.footerButton,
                styles.confirmButton,
                {
                  backgroundColor:
                    selectedImages.length > 0 ? colors.primaryColor : '#cccccc',
                },
              ]}
              onPress={confirmSelection}
              disabled={selectedImages.length === 0}>
              <Text style={styles.footerButtonText}>
                Confirm ({selectedImages.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Example Usage Component

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: fontSize.f18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: colors.black,
    },
    actionButtonContainer: {
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: 15,
      alignItems: 'center',
      gap: 10,
    },
    actionButton: {
      backgroundColor: colors.primaryColor,
      padding: 10,
      borderRadius: 5,
      width: '90%',
      alignItems: 'center',
    },
    actionButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    imagePreviewContainer: {
      flexDirection: 'row',
      padding: 10,
    },
    imageWrapper: {
      position: 'relative',
      marginHorizontal: 5,
    },
    previewImage: {
      width: wp('50%'),
      height: wp('50%'),
      borderRadius: 10,
    },
    removeButton: {
      position: 'absolute',
      top: 5,
      right: 5,
      backgroundColor: 'red',
      borderRadius: 15,
      width: 25,
      height: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 15,
    },
    footerButton: {
      padding: 10,
      borderRadius: 5,
      width: '45%',
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primaryColor,
    },
    cancelButtonText: {
      color: colors.primaryColor,
      fontWeight: 'bold',
    },
    confirmButton: {
      backgroundColor: colors.primaryColor,
    },
    footerButtonText: {
      fontWeight: 'bold',
      color: 'white',
    },

    // Example Component Styles
  });
