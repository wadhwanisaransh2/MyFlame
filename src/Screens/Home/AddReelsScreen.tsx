import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  NativeEventEmitter,
  NativeModules,
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import {isValidFile, showEditor} from 'react-native-video-trim';
import {useState, useEffect, useRef} from 'react';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {hp, wp} from '../../Utils/responsive';
import {BackArrow, CloseSVG} from '../../Assets/Images/SVGs/CommonSVG';
import {useCreateReelMutation} from '../../redux/api/post';
import {CustomButton} from '../../Components';
import {convertVideoToLongPath, showToast} from '../../Utils/general';
import {navigateAndSimpleReset} from '../../Utils/navigation';
import ImagePicker from 'react-native-image-crop-picker';
import {addCoins, updateCoins} from '../../redux/Store/AuthSlice';
import {useLazyGetUserCoinsQuery} from '../../redux/api/profile';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';

// Design constants for consistent spacing and sizes
const SPACING = {
  xs: wp('1%'),
  sm: wp('2%'),
  md: wp('4%'),
  lg: wp('6%'),
  xl: wp('8%'),
};

// Define interface for tag render item
interface TagItemProps {
  item: string;
}

// Main component
const AddReelsScreen: React.FC = () => {
  const [videoUri, setVideoUri] = useState<string>('');
  const [thumbnailUri, setThumbnailUri] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isTagModalVisible, setTagModalVisible] = useState<boolean>(false);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [popularTags, setPopularTags] = useState<string[]>([
    'travel',
    'food',
    'fashion',
    'music',
    'dance',
    'comedy',
    'fitness',
    'lifestyle',
    'beauty',
    'art',
  ]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const {width: screenWidth} = Dimensions.get('window');
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const {coinConfig} = useSelector((state: RootState) => state.AuthManager);
  const dispatch = useDispatch();
  const [createReel, {isLoading: isReelLoading}] = useCreateReelMutation();
  const [getUserCoins, {isLoading: isLoadingCoins}] = useLazyGetUserCoinsQuery();
  const handleCreateReel = async () => {
    if (!videoUri || !thumbnailUri) {
      showToast('Please select a video and thumbnail');
      return;
    }

    try {
      // Reset progress
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(progressInterval);
            return prevProgress;
          }
          return prevProgress + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('reel', {
        uri: videoUri,
        type: 'video/mp4',
        name: 'video.mp4',
      });
      formData.append('thumbnail', {
        uri: thumbnailUri,
        type: 'image/jpeg',
        name: 'thumbnail.jpg',
      });
      formData.append('caption', description);

      tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });

      const response = await createReel({
        data: formData,
      }).unwrap();

      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      showToast('Reel created successfully!');
      dispatch(addCoins(coinConfig?.reel));
      showToast('Reel uploaded successfully');
      navigateAndSimpleReset('MainStack');

      // Navigate back or reset form
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload reel. Please try again.');
      setUploadProgress(0); // Reset progress on error
    }
  };

  useEffect(() => {
    // Animate UI elements on component mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.VideoTrim);
    const subscription = eventEmitter.addListener('VideoTrim', event => {
      switch (event.name) {
        case 'onFinishTrimming': {
          if (event.outputPath) {
            // Convert the short path to a proper file URI
            let convertedPath = convertVideoToLongPath(event.outputPath);

            // Fallback: if conversion doesn't add file://, add it manually
            if (
              !convertedPath.startsWith('file://') &&
              !convertedPath.startsWith('http')
            ) {
              convertedPath = `file://${event.outputPath}`;
            }

            // setVideoUri(convertedPath);
          }
          break;
        }
        // Other event cases would go here
      }
    });

    return () => {
      subscription.remove();
    };
  }, [thumbnailUri]);

  const pickVideo = async (): Promise<void> => {
    const result = await ImagePicker.openPicker({
      mediaType: 'video',
      compressVideoPreset: 'Passthrough',
      compressVideoQuality: 1,
      compressVideoFormat: 'mp4',
      compressVideoMaxDuration: 10,
      // compressVideoMaxDuration: 10,
    });

    if (result.path) {
      const uri = result.path || '';
      const isValid = await isValidFile(uri);

      if (isValid) {
        setVideoUri(uri);
        showEditor(uri, {
          maxDuration: 60,
        });
      } else {
        showToast('Selected file is not a valid video');
      }
    }
  };

  const pickThumbnail = async (): Promise<void> => {
    const result = await ImagePicker.openPicker({
      mediaType: 'photo',
      cropping: true,
      width: 1080,
      height: 1920,
      compressImageQuality: 0.8,
      compressImageFormat: 'jpg',
      compressImageMaxWidth: 1024,
      compressImageMaxHeight: 1024,
      aspectRatio: {width: 9, height: 16},
    });

    if (result.path) {
      setThumbnailUri(result.path);
    }
  };

  const togglePreview = (): void => {
    setIsPreviewMode(!isPreviewMode);
    setIsPaused(isPreviewMode); // Play when entering preview mode, pause when exiting
  };

  const addTag = (tag: string): void => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (index: number): void => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const renderTagItem = ({item}: TagItemProps) => (
    <TouchableOpacity
      style={styles.popularTagItem}
      onPress={() => {
        addTag(item);
        setTagModalVisible(false);
      }}>
      <Text style={styles.popularTagText}>#{item}</Text>
    </TouchableOpacity>
  );

  // Video Preview Mode
  if (isPreviewMode && videoUri) {
    return (
      <View style={styles.previewModeContainer}>
        <Video
          source={{uri: videoUri}}
          style={styles.fullScreenVideo}
          resizeMode="cover"
          paused={isPaused}
          repeat={true}
        />

        <LinearGradient
          colors={[
            'rgba(0,0,0,0.7)',
            'transparent',
            'transparent',
            'rgba(0,0,0,0.7)',
          ]}
          style={styles.previewOverlay}>
          <View style={styles.previewHeader}>
            <TouchableOpacity
              style={styles.previewHeaderButton}
              onPress={togglePreview}>
              <CloseSVG fill={colors.white} width={24} height={24} />
            </TouchableOpacity>
            <Text style={styles.previewHeaderTitle}>Preview</Text>
            <View style={styles.previewHeaderButton} />
          </View>

          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={() => setIsPaused(!isPaused)}>
            <Text style={styles.playPauseButtonText}>
              {isPaused ? '▶' : '❚❚'}
            </Text>
          </TouchableOpacity>

          <View style={styles.previewInfo}>
            <Text style={styles.previewDescription} numberOfLines={2}>
              {description || 'No description added'}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.previewTags}>
              {tags.map((tag, index) => (
                <Text key={index} style={styles.previewTagText}>
                  #{tag}{' '}
                </Text>
              ))}
            </ScrollView>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Main Create Reel Screen
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <LinearGradient
        colors={[colors.primaryColor, colors.inputBackground]}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Main Content Area */}
        <Animated.View
          style={[
            styles.mainContentArea,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          {/* Improved Media Selection Layout */}
          <View style={styles.mediaSelectContainer}>
            {/* Video Selection */}
            <View style={styles.videoContainer}>
              {videoUri ? (
                <View style={styles.videoContent}>
                  <View style={styles.videoPreview}>
                    {thumbnailUri ? (
                      <Image
                        source={{uri: thumbnailUri}}
                        style={styles.videoThumbnail}
                      />
                    ) : (
                      <View style={styles.videoPlaceholder}>
                        <Text style={styles.videoPlaceholderText}>
                          Video Selected
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.playOverlay}
                      onPress={togglePreview}>
                      <View style={styles.playIconButton}>
                        <Text style={styles.playIconText}>▶</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.changeVideoButton}
                    onPress={pickVideo}>
                    <Text style={styles.changeButtonText}>Change Video</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.selectVideoButton}
                  onPress={pickVideo}>
                  <View style={styles.uploadIconContainer}>
                    <CloseSVG
                      fill={colors.primaryColor}
                      width={35}
                      height={35}
                      style={{transform: [{rotate: '45deg'}]}}
                    />
                  </View>
                  <Text style={styles.selectVideoText}>Select Video</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Thumbnail Selection */}
            <View style={styles.thumbnailContainer}>
              {thumbnailUri ? (
                <View style={styles.thumbnailContent}>
                  <Image
                    source={{uri: thumbnailUri}}
                    style={styles.thumbnailImage}
                  />
                  <TouchableOpacity
                    style={styles.changeThumbnailButton}
                    onPress={pickThumbnail}>
                    <Text style={styles.changeThumbnailText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.selectThumbnailButton}
                  onPress={pickThumbnail}>
                  <View style={styles.uploadIconContainer}>
                    <CloseSVG
                      fill={colors.primaryColor}
                      width={30}
                      height={30}
                      style={{transform: [{rotate: '45deg'}]}}
                    />
                  </View>
                  <Text style={styles.selectThumbnailText}>Add Cover</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tell Your Clips</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.grey}
              multiline
              value={description}
              onChangeText={setDescription}
              maxLength={2200}
            />
            <Text style={styles.characterCount}>{description.length}/2200</Text>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Some Magic ✨</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Type your tags..."
                placeholderTextColor={colors.grey}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={() => addTag(tagInput)}
              />
              <TouchableOpacity
                style={styles.suggestTagsButton}
                onPress={() => setTagModalVisible(true)}>
                <Text style={styles.suggestTagsText}>Inspire Me</Text>
              </TouchableOpacity>
            </View>

            {/* Tags Display */}
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(index)}>
                    <Text style={styles.tagRemove}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {tags.length === 0 && (
                <Text style={styles.noTagsText}>
                  Add tags to reach more people
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.shareButton,
              !videoUri && styles.disabledButton,
            ]}
            onPress={() => handleCreateReel()}
            disabled={!videoUri || isReelLoading || isLoadingCoins}
            activeOpacity={0.8}>
            <View style={styles.buttonContent}>
              {(isReelLoading || isLoadingCoins) && (
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        {width: `${uploadProgress}%`}
                      ]} 
                    />
                  </View>
                </View>
              )}
              <Text style={styles.shareButtonText}>
                {(isReelLoading || isLoadingCoins) 
                  ? `Uploading... ${uploadProgress}%` 
                  : "Share Your Clips"
                }
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Popular Tags Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isTagModalVisible}
        onRequestClose={() => setTagModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[colors.primaryColor, colors.inputBackground]}
              style={styles.modalGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trending Tags</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setTagModalVisible(false)}>
                <CloseSVG fill={'#fff'} width={24} height={24} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={popularTags}
              renderItem={renderTagItem}
              keyExtractor={item => item}
              numColumns={3}
              contentContainerStyle={styles.tagsList}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// TypeScript interface for style props

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    gradientBackground: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: '100%',
      opacity: 0.1,
    },
    scrollContainer: {
      flex: 1,
    },
    contentContainer: {
      padding: SPACING.md,
      paddingBottom: SPACING.xl,
    },
    headerContainer: {
      marginBottom: SPACING.xl,
      alignItems: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primaryColor,
      textAlign: 'center',
      marginVertical: SPACING.sm,
    },
    subtitle: {
      fontSize: 16,
      color: colors.grey,
      textAlign: 'center',
      marginBottom: SPACING.md,
    },
    mainContentArea: {
      flex: 1,
    },
    mediaSelectContainer: {
      flexDirection: 'row',
      marginBottom: SPACING.lg,
      height: hp('30%'),
      gap: SPACING.md,
      justifyContent: 'center',
    },
    videoContainer: {
      // flex: 3,
      borderRadius: 24,
      backgroundColor: colors.inputBackground,
      // padding: SPACING.md,
      aspectRatio: 9 / 16,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 0,
    },
    mediaLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primaryColor,
      marginBottom: SPACING.sm,
    },
    uploadIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(0,136,204,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    videoContent: {
      flex: 1,
    },
    videoPreview: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
      marginBottom: SPACING.sm,
    },
    videoThumbnail: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
    },
    videoPlaceholder: {
      flex: 1,
      backgroundColor: colors.lightGrey,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
    },
    videoPlaceholderText: {
      color: colors.grey,
      fontWeight: '500',
    },
    playOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 12,
    },
    playIconButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255,255,255,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playIconText: {
      color: colors.primaryColor,
      fontSize: 24,
      marginLeft: 3,
    },
    changeVideoButton: {
      backgroundColor: colors.primaryColor,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      bottom: 10,
      alignSelf: 'center',
      width: wp('25%'),
      height: hp('5%'),
    },
    changeButtonText: {
      color: colors.white,
      fontWeight: 'bold',
      fontSize: 14,
    },
    selectVideoButton: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.primaryColor,
      borderStyle: 'dashed',
    },
    selectVideoText: {
      color: colors.primaryColor,
      fontWeight: 'bold',
      fontSize: 16,
    },
    thumbnailContainer: {
      // flex: 2,
      borderRadius: 24,
      backgroundColor: colors.white,
      aspectRatio: 9 / 16,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 0,
    },
    thumbnailContent: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: colors.inputBackground,
    },
    thumbnailImage: {
      flex: 1,
      aspectRatio: 9 / 16,
      borderRadius: 12,

      alignSelf: 'center',
    },
    changeThumbnailButton: {
      backgroundColor: colors.primaryColor,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      bottom: 10,
      alignSelf: 'center',
      width: wp('25%'),
      height: hp('5%'),
    },
    changeThumbnailText: {
      color: colors.white,
      fontWeight: 'bold',
      fontSize: 14,
    },
    selectThumbnailButton: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primaryColor,
      borderStyle: 'dashed',
    },
    selectThumbnailIconText: {
      fontSize: 30,
      color: colors.primaryColor,
      marginBottom: SPACING.xs,
    },
    selectThumbnailText: {
      color: colors.primaryColor,
      fontWeight: '500',
      fontSize: 14,
      textAlign: 'center',
      paddingHorizontal: SPACING.sm,
    },
    section: {
      marginBottom: SPACING.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: SPACING.sm,
      color: colors.grey,
    },
    descriptionInput: {
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      padding: SPACING.lg,
      minHeight: 120,
      textAlignVertical: 'top',
      fontSize: 16,
      color: colors.black,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 0,
      borderWidth: 1,
      borderColor: colors.primaryColor,
    },
    characterCount: {
      textAlign: 'right',
      color: colors.black,
      fontSize: 12,
      marginTop: SPACING.xs,
    },
    tagInputContainer: {
      flexDirection: 'row',
      marginBottom: SPACING.sm,
    },
    tagInput: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      padding: SPACING.md,
      marginRight: SPACING.sm,
      fontSize: 16,
      color: colors.grey,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 0,
      borderWidth: 1,
      borderColor: colors.primaryColor,
    },
    suggestTagsButton: {
      backgroundColor: colors.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      borderRadius: 16,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 0,
    },
    suggestTagsText: {
      color: colors.white,
      fontWeight: 'bold',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: SPACING.md,
    },
    tag: {
      flexDirection: 'row',
      backgroundColor: colors.primaryColor,
      borderRadius: 20,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      margin: 5,
      alignItems: 'center',
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 0,
    },
    tagText: {
      color: colors.white,
      marginRight: SPACING.xs,
      fontWeight: '500',
    },
    tagRemove: {
      color: colors.white,
      fontWeight: 'bold',
      fontSize: 16,
    },
    noTagsText: {
      color: colors.grey,
      fontStyle: 'italic',
      padding: SPACING.sm,
    },
    shareButton: {
      marginTop: SPACING.xl,
      borderRadius: 20,
      backgroundColor: colors.primaryColor,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 0,
      padding: SPACING.md,
    },
    disabledButton: {
      backgroundColor: 'rgba(0,136,204,0.4)',
    },
    buttonContent: {
      alignItems: 'center',
    },
    progressBarBackground: {
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 2,
      width: '100%',
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.white,
      borderRadius: 2,
    },
    shareButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '600',
    },
    uploadingContainer: {
      width: '100%',
      alignItems: 'center',
    },
    progressBarContainer: {
      width: '100%',
      marginBottom: SPACING.xs,
    },
    progressBar: {
      height: '100%',
      backgroundColor: colors.white,
      borderRadius: 3,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: 24,
      padding: SPACING.lg,
      width: '85%',
      maxHeight: '60%',
      overflow: 'hidden',
    },
    modalGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      borderRadius: 24,
      opacity: 0.95,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.xl,
      paddingBottom: SPACING.md,
    },
    modalTitle: {
      fontSize: 28,
      fontWeight: '600',
      color: '#fff',
      letterSpacing: 0.5,
    },
    modalCloseButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0,0,0,0.05)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tagsList: {
      paddingBottom: SPACING.md,
    },
    popularTagItem: {
      backgroundColor: colors.primaryColor,
      borderRadius: 16,
      paddingVertical: 5,
      paddingHorizontal: 5,
      margin: 6,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primaryColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 0,
      minWidth: '30%',
    },
    popularTagText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 15,
      textAlign: 'center',
    },
    previewModeContainer: {
      flex: 1,
      backgroundColor: 'black',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    fullScreenVideo: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
    previewOverlay: {
      flex: 1,
      justifyContent: 'space-between',
      padding: SPACING.md,
    },
    previewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
    },
    previewHeaderButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      padding: 5,
    },
    previewBackButton: {
      // color: colors.white,
      // fontSize: 18,
      // fontWeight: 'bold',
    },
    previewHeaderTitle: {
      color: colors.white,
      fontSize: 18,
      fontWeight: 'bold',
    },
    playPauseButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: 'rgba(255,255,255,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    playPauseButtonText: {
      color: colors.white,
      fontSize: 22,
    },
    previewInfo: {
      width: '100%',
      paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
    },
    previewDescription: {
      color: colors.white,
      fontSize: 16,
      marginBottom: SPACING.sm,
    },
    previewTags: {
      marginBottom: SPACING.sm,
    },
    previewTagText: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 14,
      marginRight: SPACING.xs,
    },
  });

export default AddReelsScreen;
