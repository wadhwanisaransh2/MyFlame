import React, {useEffect, useRef, useState} from 'react';
import {Text, View, Animated, TouchableOpacity, FlatList} from 'react-native';
import {requestGalleryPermission} from '../../Utils/permissions';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {showToast} from '../../Utils/general';
import ImageCropPicker from 'react-native-image-crop-picker';
import {useTheme} from '../../Theme/ThemeContext';
import {CameraSVG, GallerySVG} from '../../Assets/Images/SVGs/ChatsSVG';
import FastImage from 'react-native-fast-image';
import {navigate} from '../../Utils/navigation';
import {makeSendImageStyles} from './messageStyle';

const SendImage = ({
  closeGallery,
  friendId,
}: {
  closeGallery: () => void;
  friendId: string;
}) => {
  const {colors} = useTheme();
  const styles = makeSendImageStyles(colors);

  // States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('gallery');
  const [recentImages, setRecentImages] = useState<string[]>([]);
  const [photos, setPhotos] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Load recent photos from device
    loadRecentPhotos();
  }, []);

  useEffect(() => {
    const fetchPhotos = async () => {
      const hasPermission = await requestGalleryPermission();
      if (hasPermission) {
        CameraRoll.getPhotos({
          first: 10,
          assetType: 'Photos',
        })
          .then((r: any) => {
            setPhotos(r.edges);
          })
          .catch(err => {
            showToast('Could not load recent photos');
          });
      }
    };

    fetchPhotos();
  }, []);

  // Function to load recent photos
  const loadRecentPhotos = async () => {
    try {
      // This would normally get the most recent photos from the device
      // For demo purposes, we'll use placeholder images
      const demoImages = Array(15)
        .fill(null)
        .map(
          (_, i) => `https://source.unsplash.com/collection/4277693/${500 + i}`,
        );
      setRecentImages(demoImages);
    } catch (error) {
      showToast('Could not load recent photos');
    }
  };

  // Handle image selection from gallery
  const handleSelectImage = () => {
    ImageCropPicker.openPicker({
      mediaType: 'photo',
      includeBase64: false,
      cropping: false,
    })
      .then(response => {
        if (response?.path) {
          setSelectedImage(response.path);
          // Reset to gallery tab after selection
          // setActiveTab('gallery');
          closeGallery();
          navigate('ImagePreview', {
            imageUri: response.path,
            friendId,
            isSending: true,
          });
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
      cropping: false,
    })
      .then(response => {
        if (response?.path) {
          setSelectedImage(response.path);
          // setActiveTab('gallery');
          closeGallery();
          navigate('ImagePreview', {
            imageUri: response.path,
            friendId,
            isSending: true,
          });
        }
      })
      .catch(err => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          showToast('Error taking photo');
        }
      });
  };

  // Render gallery item
  const renderGalleryItem = ({item, index}: any) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedImage(item.node.image.uri);
        closeGallery();
        navigate('ImagePreview', {
          imageUri: item.node.image.uri,
          friendId,
          isSending: true,
        });
      }}
      style={[
        styles.galleryItem,
        selectedImage === item.node.image.uri && styles.selectedGalleryItem,
      ]}>
      <FastImage
        source={{uri: item.node.image.uri}}
        style={styles.galleryItemImage}
        resizeMode={FastImage.resizeMode.cover}
      />
    </TouchableOpacity>
  );

  return (
    <View>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'gallery' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('gallery')}>
          <GallerySVG fill={colors.primaryColor} width={25} height={25} />
          <Text style={[styles.tabText]}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'camera' && styles.activeTabButton,
          ]}
          onPress={handleTakePhoto}>
          <CameraSVG fill={colors.primaryColor} width={25} height={25} />
          <Text style={[styles.tabText]}>Camera</Text>
        </TouchableOpacity>
      </View>

      {/* Gallery View */}
      {activeTab === 'gallery' && (
        <FlatList
          data={photos}
          renderItem={renderGalleryItem}
          keyExtractor={(item, index) => `gallery-${index}`}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.galleryList}
          ListHeaderComponent={
            <View style={styles.galleryHeader}>
              <Text style={styles.galleryTitle}>Recent</Text>
              <TouchableOpacity onPress={handleSelectImage}>
                <Text style={styles.browseButton}>Browse All</Text>
              </TouchableOpacity>
            </View>
          }
          style={{height: 300, maxHeight: 300}}
        />
      )}
    </View>
  );
};

export default SendImage;
