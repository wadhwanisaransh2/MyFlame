import React, {useState} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useRoute, useTheme} from '@react-navigation/native';
import {sendMessage} from '../../Service/socketio';
import {navigateBack} from '../../Utils/navigation';
import {useGetUrlFromImageBase64StringMutation} from '../../redux/api/chat';
import {showToast} from '../../Utils/general';
import {IMAGES} from '../../Assets';
import {CustomButton} from '../../Components';

const ImagePreview = () => {
  const {colors} = useTheme();
  const route: any = useRoute();
  const {friendId, isSending} = route.params;
  const [getUrlFromImageBase64StringTrigger] =
    useGetUrlFromImageBase64StringMutation();
  const [isLoading, setIsLoading] = useState(false);

  // Get the image URI from route params - handle both imageUri and imagePath
  const getImageUri = () => {
    const {imageUri, imagePath} = route.params || {};
    return imageUri || imagePath || 'https://via.placeholder.com/400';
  };

  const currentImageUri = getImageUri();

  async function getImageUrl() {
    try {
      const formData = new FormData();
      // Add the image file to FormData
      formData.append('image', {
        uri: currentImageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      const result = await getUrlFromImageBase64StringTrigger({
        data: formData,
      }).unwrap();
      if (
        result.success &&
        result.imageUrl &&
        typeof result.imageUrl === 'string' &&
        result.imageUrl.length > 0
      ) {
        return result.imageUrl;
      }
      setIsLoading(false);
      return '';
    } catch (e) {
      return '';
    }
  }

  const handleSend = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const imageUrl = await getImageUrl();
    if (!imageUrl) {
      showToast('Failed to send image! Try later');
      navigateBack();
      return;
    }
    sendMessage(friendId, imageUrl, 'image');
    navigateBack();
  };

  const styles = makeStyles(colors);
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={navigateBack}>
          <Image source={IMAGES.BackArrow} style={styles.BackArrow} />
        </TouchableOpacity>
      </View>
      <Image
        source={{uri: currentImageUri}}
        style={styles.image}
        resizeMode="contain"
      />
      {isSending ? (
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          {/* <Text style={styles.sendText}>
            {isLoading ? 'Sending...' : 'Send'}
          </Text> */}
          <CustomButton
            title={isLoading ? 'Sending...' : 'Send'}
            titleStyle={{colors: 'white'}}
            onPress={handleSend}
            containerStyle={{width: '100%'}}
            isLoading={isLoading}
            isDisabled={isLoading}
            loaderColor="white"
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default ImagePreview;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height * 0.8,
    },
    sendButton: {
      backgroundColor: colors.primaryColor,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      position: 'absolute',
      bottom: 40,
    },
    sendText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    leftContainer: {
      flexDirection: 'row',
      width: '100%',
      marginTop: 30,
      marginLeft: 40,
    },
    BackArrow: {
      height: 27,
      width: 12,
      tintColor: 'grey',
      marginRight: 15,
    },
  });
