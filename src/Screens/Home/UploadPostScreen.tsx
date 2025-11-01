import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {fontSize} from '../../Utils/fontIcon';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {BackArrow} from '../../Assets/Images/SVGs/CommonSVG';
import {useCreatePostMutation} from '../../redux/api/post';
import {showToast} from '../../Utils/general';
import {CommonActions} from '@react-navigation/native';
import {navigateAndSimpleReset} from '../../Utils/navigation';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import {PostCard} from '../../Components/PostCard/PostCard';
import {CustomButton} from '../../Components';
import {useLazyGetUserCoinsQuery} from '../../redux/api/profile';
import {addCoins, updateCoins} from '../../redux/Store/AuthSlice';

const {width} = Dimensions.get('window');

export default function UploadPostScreen({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  // Get the image URI from route params
  const {imageUri} = route.params || {
    imageUri: 'https://via.placeholder.com/400',
  };

  const [createPost, {isLoading}] = useCreatePostMutation();
  const [getUserCoins, {isLoading: isLoadingCoins}] =
    useLazyGetUserCoinsQuery();
  const {profile, coinConfig} = useSelector(
    (state: RootState) => state.AuthManager,
  );

  const dispatch = useDispatch();

  // State for caption and hashtags
  const [caption, setCaption] = useState('');

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.9)).current;
  const optionsSlideUp = useRef(new Animated.Value(100)).current;

  // Start animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(imageScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(optionsSlideUp, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle adding hashtags

  // Simulate post creation
  const handlePost = async () => {
    // // // Show success animation before navigating
    // navigation.navigate('Feed');

    const form = new FormData();
    form.append('caption', caption);
    form.append('post', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });

    createPost({data: form})
      .unwrap()
      .then(async () => {
          dispatch(addCoins(coinConfig?.post));
          showToast('Post uploaded successfully');

        navigateAndSimpleReset('MainStack');
      })
      .catch(error => {
        showToast(error.message || 'Failed to upload post');
        Animated.timing(imageScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
  };

  return (
    <View style={{flex: 1}}>
      <Animated.View style={[styles.header, {opacity: headerOpacity}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          {/* <Ionicons name="chevron-back" size={28} color="#fff" /> */}
          <BackArrow width={28} height={28} fill={colors.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Create Post</Text>
        </View>
        <View />
      </Animated.View>
      <KeyboardAwareScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={40}>
        {/* Animated Header */}

        <Animated.View
          style={[styles.imageContainer, {transform: [{scale: imageScale}]}]}>
          <PostCard
            username={profile?.username}
            handle={`${profile?.firstName} ${profile?.lastName}`}
            content={caption}
            likes={0}
            comments={0}
            _id={''}
            userId={''}
            Liked={false}
            userAvatar={profile?.profilePicture}
            image={imageUri}
            createdAt={new Date().toISOString()}
            colorsChange={colors.primaryColor}
          />
        </Animated.View>

        {/* Caption Input */}
        <Animated.View
          style={[styles.captionContainer, {transform: [{scale: imageScale}]}]}>
          <View style={styles.captionInputContainer}>
            <Image
              source={{uri: profile?.profilePicture}}
              style={styles.userAvatar}
            />
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              placeholderTextColor="#A0A0A0"
              multiline
              value={caption}
              onChangeText={setCaption}
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.postButton, {transform: [{scale: imageScale}]}]}>
          <CustomButton
            isLoading={isLoading || isLoadingCoins}
            isDisabled={isLoading || !caption.trim() || isLoadingCoins}
            title="Post Now"
            onPress={handlePost}
          />
        </Animated.View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.backgroundColor,
    },
    keyboardAvoid: {
      flex: 1,
    },
    scrollContainer: {
      paddingBottom: 30,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 60,
      paddingHorizontal: 15,
      backgroundColor: colors.backgroundColor,
      borderBottomWidth: 1,
      borderBottomColor: colors.inputBackground,
    },
    backButton: {
      padding: 5,
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.black,
    },
    postButton: {
      borderRadius: 20,
      overflow: 'hidden',
    },
    gradientButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
    },
    postButtonText: {
      color: colors.primaryColor,
      fontWeight: 'bold',
      fontSize: 15,
    },
    imageContainer: {
      width: '100%',
      // alignItems: 'center',
      paddingVertical: 20,
    },
    imageWrapper: {
      width: width * 0.85,
      height: width * 0.85,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 5},
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 8,
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.black,
      marginBottom: 10,
      paddingHorizontal: 15,
    },
    captionContainer: {
      marginTop: 20,
      paddingHorizontal: 15,
    },
    captionInputContainer: {
      flexDirection: 'row',
      padding: 12,
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    captionInput: {
      flex: 1,
      color: colors.black,
      fontSize: fontSize.f16,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    hashtagContainer: {
      marginTop: 20,
      paddingHorizontal: 15,
    },
  });
