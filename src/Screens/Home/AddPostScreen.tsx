import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  FlatList,
  SafeAreaView,
  ScrollView,
  Platform,
  Vibration,
} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import FastImage from 'react-native-fast-image';
import ImageCropPicker from 'react-native-image-crop-picker';
import {navigate, navigateBack} from '../../Utils/navigation';
import {showToast} from '../../Utils/general';
import {CameraSVG, GallerySVG} from '../../Assets/Images/SVGs/ChatsSVG';
import {fontSize} from '../../Utils/fontIcon';
import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import {requestGalleryPermission} from '../../Utils/permissions';
import {CustomButton} from '../../Components';
import LinearGradient from 'react-native-linear-gradient';
import CheckSVG from '../../Assets/Images/SVGs/CheckSVG';
import LottieView from 'lottie-react-native';
import {ANIMATION} from '../../Assets';
import {CloseSVG, BackArrow} from '../../Assets/Images/SVGs/CommonSVG';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/Store';

const {width, height} = Dimensions.get('window');

// Icons as components for better performance
const BackIcon = ({color}: {color: string}) => {
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.backIconContainer}>
      <View style={[styles.backIcon, {borderColor: color}]} />
    </View>
  );
};

const NextIcon = ({color}: {color: string}) => (
  <Text style={{color, fontWeight: 'bold', fontSize: 16}}>Next</Text>
);

// Action button component with gradient background
const ActionButton = ({
  onPress,
  icon,
  label,
  isPrimary = false,
}: {
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
  isPrimary?: boolean;
}) => {
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate();
    }
    onPress();
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={[styles.actionButton, isPrimary && styles.primaryActionButton]}>
      <View
      
        style={styles.gradientButton}
      >
        {icon}
        <Text style={[styles.actionButtonText, {color: isPrimary ? colors.white : colors.darkText}]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function InstagramShoePostScreen() {
  const {colors} = useTheme();
  const styles = makeStyles(colors);


  const {coinConfig} = useSelector((state: RootState) => state.AuthManager)


  // States with proper typing
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gallery' | 'camera'>('gallery');
  const [photos, setPhotos] = useState<PhotoIdentifier[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Function to fetch photos from camera roll
  const fetchPhotos = async () => {
    setIsLoading(true);
    const hasPermission = await requestGalleryPermission();
    if (hasPermission) {
      CameraRoll.getPhotos({
        first: 30,
        assetType: 'Photos',
      })
      
        .then(r => {
          // setPhotos(r.edges);
        })
        .catch(err => {
          showToast('Could not load recent photos');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  };

  // Handle image selection from gallery
  const handleSelectImage = () => {
    ImageCropPicker.openPicker({
      mediaType: 'photo',
      includeBase64: false,
      cropping: true,
      width: 1080,
      height: 1080,
      cropperToolbarTitle: 'Edit Your Amazing Photo',
      cropperCircleOverlay: false,
      cropperStatusBarColor: colors.primaryColor,
      cropperToolbarColor: colors.primaryColor,
      cropperToolbarTitleColor: '#FFFFFF',
      cropperActiveWidgetColor: colors.primaryColor,
      freeStyleCropEnabled: true,
    })
      .then(response => {
        if (response?.path) {
          setSelectedImage(response.path);
          setActiveTab('gallery');
        }
      })
      .catch(err => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          showToast('Error selecting image');
        }
      });
  };

  // Handle taking a photo with camera
  const handleTakePhoto = () => {
    ImageCropPicker.openCamera({
      mediaType: 'photo',
      includeBase64: false,
      cropping: true,
      width: 1080,
      height: 1080,
      cropperToolbarTitle: 'Perfect Your Shot',
      cropperStatusBarColor: colors.primaryColor,
      cropperToolbarColor: colors.primaryColor,
      cropperToolbarTitleColor: '#FFFFFF',
      tintColor: colors.primaryColor,
      freeStyleCropEnabled: true,
    })
      .then(response => {
        if (response?.path) {
          setSelectedImage(response.path);
          setActiveTab('gallery');
        }
      })
      .catch(err => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          showToast('Error taking photo');
        }
      });
  };

  // Navigate to next step
  const handleNext = () => {
    if (!selectedImage) {
      showToast('Please select an image first');
      return;
    }

    navigate('UploadPostScreen', {imageUri: selectedImage});
  };

  // Simplified gallery item component
  const GalleryItem = React.memo(
    ({
      item,
      isSelected,
      onPress,
    }: {
      item: PhotoIdentifier;
      isSelected: boolean;
      onPress: () => void;
    }) => {
      return (
        <TouchableOpacity
          onPress={onPress}
          style={[
            styles.galleryItem,
            isSelected && styles.selectedGalleryItem,
          ]}>
          <FastImage
            source={{uri: item.node.image.uri}}
            style={styles.galleryItemImage}
            resizeMode={FastImage.resizeMode.cover}
          />
          {isSelected && (
            <View style={styles.selectedOverlay}>
              <View style={styles.checkmark}>
                <CheckSVG width={16} height={16} fill={colors.white} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      );
    },
  );

  // Optimized gallery item render function
  const renderGalleryItem = ({
    item,
    index,
  }: {
    item: PhotoIdentifier;
    index: number;
  }) => {
    const isSelected = selectedImage === item.node.image.uri;

    const handlePress = () => {
      setSelectedImage(item.node.image.uri);
      if (Platform.OS === 'ios') {
        Vibration.vibrate();
      }
    };

    return (
      <GalleryItem item={item} isSelected={isSelected} onPress={handlePress} />
    );
  };

  const handleGoBack = () => {
    navigate('HomeScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={colors.backgroundColor}
        barStyle="light-content"
      />



      <View style={styles.content}>
        {/* Image Preview */}
        <View style={styles.previewSection}>
          {selectedImage ? (
            <View style={styles.selectedImageContainer}>
              <FastImage
                source={{uri: selectedImage}}
                style={styles.selectedImagePreview}
                resizeMode={FastImage.resizeMode.cover}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedImage(null)}>
                <CloseSVG width={16} height={16} fill={'white'} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNext}
                disabled={!selectedImage}
                style={[styles.nextButton, !selectedImage && {opacity: 0.5}]}>
                <Text style={styles.nextButtonText}>Next</Text>
                <BackArrow  style={{transform: [{rotate: '180deg'}]}} width={16} height={16} fill={'white'}  />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <LottieView
                source={ANIMATION.Post}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
              <Text style={styles.noImageText}>Select an image for your post</Text>
              <Text style={styles.noImageSubtext}>
                Choose from your gallery or take a new photo
              </Text>
            </View>
          )}
        </View>

        {/* Gallery Section */}
        <View style={styles.gallerySection}>
          <View style={styles.galleryHeader}>
            <Text style={styles.sectionTitle}>Recent Photos</Text>
            <TouchableOpacity
              onPress={handleSelectImage}
              style={styles.browseButton}>
              <Text style={styles.browseButtonText}>Browse All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={photos}
            renderItem={renderGalleryItem}
            keyExtractor={(item, index) => `gallery-${index}`}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.galleryGrid}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={21}
          />
        </View>

        {/* Action Buttons at Bottom */}
        <View style={styles.actionButtonsContainer}>
          <ActionButton
            onPress={handleSelectImage}
            icon={<GallerySVG fill={colors.darkText} width={18} height={18} />}
            label="Gallery"
          />
          <ActionButton
            onPress={handleTakePhoto}
            icon={<CameraSVG fill={colors.white} width={18} height={18} />}
            label="Camera"
            isPrimary={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGrey,
    },
    backIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    backIcon: {
      width: 14,
      height: 14,
      borderLeftWidth: 2,
      borderBottomWidth: 2,
      transform: [{ rotate: '45deg' }],
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.darkText,
    },
    nextButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      padding: 8,
      backgroundColor: colors.primaryColor,
      borderRadius: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
    },
    content: {
      flex: 1,
    },
    previewSection: {
      height: width,
      width: width,
      backgroundColor: colors.backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGrey,
    },
    selectedImageContainer: {
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    selectedImagePreview: {
      width: '100%',
      height: '100%',
    },
    closeButton: {
      position: 'absolute',
      top: 12,
      left: 12,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },

    noImageContainer: {
      width: '100%',
      padding: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    lottieAnimation: {
      width: 120,
      height: 120,
    },
    noImageText: {
      color: colors.darkText,
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      textAlign: 'center',
    },
    noImageSubtext: {
      color: colors.lightText,
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
    },
    gallerySection: {
      flex: 1,
    },
    galleryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.darkText,
    },
    browseButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    browseButtonText: {
      color: colors.primaryColor,
      fontSize: 14,
      fontWeight: '500',
    },
    galleryGrid: {
      padding: 3,
    },
    galleryItem: {
      width: (width - 24) / 3,
      height: (width - 24) / 3,
      margin: 4,
      borderRadius: 8,
      overflow: 'hidden',
    },
    selectedGalleryItem: {
      borderWidth: 2,
      borderColor: colors.primaryColor,
    },
    galleryItemImage: {
      width: '100%',
      height: '100%',
    },
    selectedOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.lightGrey,
    },
    actionButton: {
      borderRadius: 25,
      width: '40%',
      overflow: 'hidden',
    },
    primaryActionButton: {
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.25,
      shadowRadius: 5,
      // elevation: 5,
    },
    gradientButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 25,
      backgroundColor: colors.primaryColor,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
  });
