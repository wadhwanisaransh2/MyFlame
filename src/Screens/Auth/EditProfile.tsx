import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import React, {useState} from 'react';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import CustomHeader from '../../Components/Header/CustomHeader';
import {navigateBack} from '../../Utils/navigation';
import {ImagePickerModal} from '../../Components/ImagePicker.tsx/ImagePicker';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import {IMAGES} from '../../Assets';
import {Controller, useForm} from 'react-hook-form';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {CustomButton, CustomInput, DatePickerInput} from '../../Components';
import {showToast} from '../../Utils/general';
import {setUserProfile} from '../../redux/Store/AuthSlice';

import {_makeAxiosPatchRequest} from '../../Service';
import {endpoint} from '../../Constants/endpoints';
import {EditSVGIcon} from '../../Assets/Images/SVGs/CommonSVG';
import {
  useUpdateProfileMutation,
  useUpdateProfilePictureMutation,
} from '../../redux/api/profile';

export default function EditProfile() {
  const {colors} = useTheme();
  const [updateProfile, {isLoading: loading}] = useUpdateProfileMutation();
  const [updateProfilePicture, {isLoading: loadingPicture}] =
    useUpdateProfilePictureMutation();
  const style = makeStyles(colors);
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();
  const {profile} = useSelector((state: RootState) => state.AuthManager);

  const [profilePicture, setProfilePicture] = useState(profile?.profilePicture);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      username: profile?.username,
      address: profile?.address,
      bio: profile?.bio || '',
      dateOfBirth: profile?.dateOfBirth,
      gender: profile?.gender || 'prefer_not_to_say',
      phoneNumber: profile?.phoneNumber,
      email: profile?.email,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const _payload: any = {};
      if (data?.firstName !== profile?.firstName) {
        _payload.firstName = data?.firstName;
      }
      if (data?.lastName !== profile?.lastName) {
        _payload.lastName = data?.lastName;
      }
      if (data?.username !== profile?.username) {
        _payload.username = data?.username;
      }
      if (data?.address !== profile?.address) {
        _payload.address = data?.address;
      }
      if (data?.bio !== profile?.bio) {
        _payload.bio = data?.bio;
      }
      if (data?.gender !== profile?.gender) {
        _payload.gender = data?.gender;
      }

      const res = await updateProfile(_payload).unwrap();
      showToast('Profile updated successfully');
      // dispatch(setUserProfile(res));
      navigateBack();
    } catch (error: any) {
      showToast(error?.message || 'Failed to update profile');
    }
  };

  const handleImageSelect = (images: any) => {
    // For profile picture, we only expect one image
    const image = Array.isArray(images) ? images[0] : images;

    const _form = new FormData();
    _form.append('file', {
      uri: image.path,
      type: image.mime,
      name: image.filename || 'profile.jpg',
    });

    updateProfilePicture(_form)
      .unwrap()
      .then(res => {
        showToast('Profile picture updated successfully');
        setProfilePicture(image.path);
        // dispatch(setUserProfile(res));
        setModalVisible(false);
      })
      .catch(err => {
        showToast('Failed to update profile picture');
      });
  };

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  return (
    <View style={style.container}>
      <CustomHeader
        title={'Edit Profile'}
        onBackPress={() => navigateBack()}
        ShowSetting={true}
      />
      <ScrollView style={style.content} showsVerticalScrollIndicator={false}>
        <View style={style.profileSection}>
          <Pressable style={style.imageContainer} onPress={handleOpenModal}>
            <Image
              source={profilePicture ? {uri: profilePicture} : IMAGES.userImage}
              style={style.image}
            />
            <View style={style.editIconContainer}>
              <EditSVGIcon width={18} height={18} fill={colors.primaryColor} />
            </View>
          </Pressable>

          <Text style={style.changePhotoText}>Tap to change photo</Text>
        </View>

        <View style={style.formContainer}>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={40}>
            <Text style={style.sectionTitle}>Personal Information</Text>
            <Controller
              control={control}
              render={({field: {onChange, onBlur, value}}) => (
                <CustomInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="First Name"
                  error={errors.firstName?.message}
                  containerStyle={style.inputContainer}
                />
              )}
              name="firstName"
              rules={{required: 'First name is required'}}
            />
            <Controller
              control={control}
              render={({field: {onChange, onBlur, value}}) => (
                <CustomInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Last Name"
                  error={errors.lastName?.message}
                  containerStyle={style.inputContainer}
                />
              )}
              name="lastName"
              rules={{required: 'Last name is required'}}
            />
            <Controller
              control={control}
              render={({field: {onChange, onBlur, value}}) => (
                <CustomInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Username"
                  error={errors.username?.message}
                  containerStyle={style.inputContainer}
                  disabled={profile?.hasUsernameChanged}
                />
              )}
              name="username"
              rules={{required: 'Username is required'}}
            />

            <Text style={[style.sectionTitle, style.bioTitle]}>About You</Text>
            <Controller
              control={control}
              render={({field: {onChange, onBlur, value}}) => (
                <CustomInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Tell us about yourself..."
                  error={errors.bio?.message}
                  multiline={true}
                  numberOfLines={4}
                  containerStyle={style.bioContainer}
                  textAlignVertical="top"
                />
              )}
              name="bio"
              rules={{
                maxLength: {
                  value: 500,
                  message: 'Bio should not exceed 500 characters',
                },
              }}
            />

            <Text style={[style.sectionTitle, style.bioTitle]}>
              Additional Information
            </Text>

            <Controller
              control={control}
              render={({field: {onChange, onBlur, value}}) => (
                <DatePickerInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Date of Birth"
                  error={errors.dateOfBirth?.message?.toString()}
                />
              )}
              name="dateOfBirth"
              rules={{required: 'Date of birth is required'}}
            />
            <Controller
              control={control}
              render={({field: {onChange, onBlur, value}}) => (
                <CustomInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Address"
                  error={errors.address?.message}
                  containerStyle={style.inputContainer}
                />
              )}
              name="address"
              rules={{required: 'Address is required'}}
            />

            <Controller
              control={control}
              render={({field: {onChange, onBlur, value}}) => (
                <CustomInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Phone Number"
                  error={errors.phoneNumber?.message}
                  containerStyle={style.inputContainer}
                  keyboardType="numeric"
                  disabled={profile?.phoneNumber ? true : false}
                  maxLength={10}
                />
              )}
              name="phoneNumber"
              rules={{
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{12}$/,
                  message: 'Invalid phone number',
                },
                minLength: {
                  value: 10,
                  message: 'Phone number must be 10 digits',
                },
              }}
            />

            <Controller
              control={control}
              render={({field: {onChange, onBlur, value}}) => (
                <CustomInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Email"
                  error={errors.email?.message}
                  containerStyle={style.inputContainer}
                  keyboardType="numeric"
                  disabled={true}
                />
              )}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              }}
            />

            <View style={{paddingHorizontal: 10}}>
              <Text style={style.labelText}>Gender</Text>
              <Controller
                control={control}
                render={({field: {onChange, value}}) => (
                  <View style={style.radioContainer}>
                    <Pressable
                      style={style.radioOption}
                      onPress={() => onChange('male')}>
                      <View
                        style={[
                          style.radioOuter,
                          value === 'male' && style.radioOuterSelected,
                        ]}>
                        {value === 'male' && <View style={style.radioInner} />}
                      </View>
                      <Text
                        style={[
                          style.radioText,
                          value === 'male' && style.radioTextSelected,
                        ]}>
                        Male
                      </Text>
                    </Pressable>

                    <Pressable
                      style={style.radioOption}
                      onPress={() => onChange('female')}>
                      <View
                        style={[
                          style.radioOuter,
                          value === 'female' && style.radioOuterSelected,
                        ]}>
                        {value === 'female' && (
                          <View style={style.radioInner} />
                        )}
                      </View>
                      <Text
                        style={[
                          style.radioText,
                          value === 'female' && style.radioTextSelected,
                        ]}>
                        Female
                      </Text>
                    </Pressable>

                    <Pressable
                      style={style.radioOption}
                      onPress={() => onChange('prefer_not_to_say')}>
                      <View
                        style={[
                          style.radioOuter,
                          value === 'prefer_not_to_say' &&
                            style.radioOuterSelected,
                        ]}>
                        {value === 'prefer_not_to_say' && (
                          <View style={style.radioInner} />
                        )}
                      </View>
                      <Text
                        style={[
                          style.radioText,
                          value === 'prefer_not_to_say' &&
                            style.radioTextSelected,
                        ]}>
                        Prefer not to say
                      </Text>
                    </Pressable>
                  </View>
                )}
                name="gender"
              />
            </View>
          </KeyboardAwareScrollView>
        </View>

        <CustomButton
          title="Update Profile"
          onPress={handleSubmit(onSubmit)}
          isLoading={loading}
          containerStyle={style.updateButton}
        />
      </ScrollView>
      <ImagePickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onImageSelect={handleImageSelect}
        multiple={false}
        maxImages={1}
        cropperOptions={{
          width: 400,
          height: 400,
          cropping: true,
          cropperCircleOverlay: true,
          compressImageQuality: 0.8,
        }}
      />
    </View>
  );
}

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    content: {
      flexGrow: 1,
      backgroundColor: colors.backgroundColor,
      paddingHorizontal: 20,
    },
    profileSection: {
      alignItems: 'center',
      marginVertical: 20,
    },
    imageContainer: {
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    image: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: colors.primaryColor,
    },
    changePhotoText: {
      marginTop: 12,
      color: colors.primaryColor,
      fontSize: 16,
      fontWeight: '600',
    },
    formContainer: {
      flex: 1,
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.darkText,
      marginBottom: 15,
    },
    bioTitle: {
      marginTop: 20,
    },
    locationTitle: {
      marginTop: 20,
    },
    inputContainer: {
      marginBottom: 15,
    },
    bioContainer: {
      marginBottom: 15,
      height: 120,
    },
    updateButton: {
      marginVertical: 30,
    },
    editIconContainer: {
      position: 'absolute',
      bottom: 0,
      right: 6,
      backgroundColor: colors.white,
      borderRadius: 100,
      padding: 4,
      borderWidth: 2,
      borderColor: colors.primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    labelText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.darkText,
      marginBottom: 8,
      marginTop: 10,
    },
    radioContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      flexWrap: 'wrap',
    },
    radioOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 20,
      marginBottom: 10,
    },
    radioOuter: {
      height: 20,
      width: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.grey,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuterSelected: {
      borderColor: colors.primaryColor,
    },
    radioInner: {
      height: 10,
      width: 10,
      borderRadius: 5,
      backgroundColor: colors.primaryColor,
    },
    radioText: {
      marginLeft: 8,
      fontSize: 16,
      color: colors.grey,
    },
    radioTextSelected: {
      color: colors.primaryColor,
      fontWeight: '500',
    },
  });
