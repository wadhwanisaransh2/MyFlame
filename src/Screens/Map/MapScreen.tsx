import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  BackHandler,
  Platform,
  Linking,
  ActivityIndicator,
  Alert,
  Pressable,
  PanResponder,
} from 'react-native';

import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {useTheme} from '../../Theme/ThemeContext';
import {navigate} from '../../Utils/navigation';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../redux/Store';
import {useGetNearbyUsersQuery} from '../../redux/api/profile';
import {hp} from '../../Utils/responsive';
import {useFocusEffect} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../Assets';
import {
  getUserLocation,
  requestLocationPermission,
} from '../../Utils/permissions';
import {setLocation} from '../../redux/Store/AuthSlice';
import {useUpdateLocationMutation} from '../../redux/api/auth';
import {CloseSVG} from '../../Assets/Images/SVGs/CommonSVG';
import {ColorThemeInterface} from '../../Utils/colors';
import Slider from '@react-native-community/slider';

const {width} = Dimensions.get('window');

// Helper function to calculate map region based on radius
const getRegionForRadius = (
  latitude: number,
  longitude: number,
  radiusKm: number,
) => {
  // Rough approximation: 1 degree ~ 111 km
  const latitudeDelta = (radiusKm * 2) / 111;
  const longitudeDelta =
    latitudeDelta * (width / Dimensions.get('window').height);

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

// Default coordinates if no location or nearby users available
const DEFAULT_LATITUDE = 24.58579731;
const DEFAULT_LONGITUDE = 73.73976463;

// Custom map styles for dark and light modes
// const lightMapStyle = [
//   {
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#f5f5f5',
//       },
//     ],
//   },
//   {
//     elementType: 'labels.icon',
//     stylers: [
//       {
//         visibility: 'off',
//       },
//     ],
//   },
//   {
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#616161',
//       },
//     ],
//   },
//   {
//     elementType: 'labels.text.stroke',
//     stylers: [
//       {
//         color: '#f5f5f5',
//       },
//     ],
//   },
//   {
//     featureType: 'administrative.land_parcel',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#bdbdbd',
//       },
//     ],
//   },
//   {
//     featureType: 'poi',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#eeeeee',
//       },
//     ],
//   },
//   {
//     featureType: 'poi',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#757575',
//       },
//     ],
//   },
//   {
//     featureType: 'poi.park',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#e5e5e5',
//       },
//     ],
//   },
//   {
//     featureType: 'poi.park',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#9e9e9e',
//       },
//     ],
//   },
//   {
//     featureType: 'road',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#ffffff',
//       },
//     ],
//   },
//   {
//     featureType: 'road.arterial',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#757575',
//       },
//     ],
//   },
//   {
//     featureType: 'road.highway',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#dadada',
//       },
//     ],
//   },
//   {
//     featureType: 'road.highway',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#616161',
//       },
//     ],
//   },
//   {
//     featureType: 'road.local',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#9e9e9e',
//       },
//     ],
//   },
//   {
//     featureType: 'transit.line',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#e5e5e5',
//       },
//     ],
//   },
//   {
//     featureType: 'transit.station',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#eeeeee',
//       },
//     ],
//   },
//   {
//     featureType: 'water',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#c9c9c9',
//       },
//     ],
//   },
//   {
//     featureType: 'water',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#9e9e9e',
//       },
//     ],
//   },
// ];

// const darkMapStyle = [
//   {
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#212121',
//       },
//     ],
//   },
//   {
//     elementType: 'labels.icon',
//     stylers: [
//       {
//         visibility: 'off',
//       },
//     ],
//   },
//   {
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#757575',
//       },
//     ],
//   },
//   {
//     elementType: 'labels.text.stroke',
//     stylers: [
//       {
//         color: '#212121',
//       },
//     ],
//   },
//   {
//     featureType: 'administrative',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#757575',
//       },
//     ],
//   },
//   {
//     featureType: 'administrative.country',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#9e9e9e',
//       },
//     ],
//   },
//   {
//     featureType: 'administrative.land_parcel',
//     stylers: [
//       {
//         visibility: 'off',
//       },
//     ],
//   },
//   {
//     featureType: 'administrative.locality',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#bdbdbd',
//       },
//     ],
//   },
//   {
//     featureType: 'poi',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#757575',
//       },
//     ],
//   },
//   {
//     featureType: 'poi.park',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#181818',
//       },
//     ],
//   },
//   {
//     featureType: 'poi.park',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#616161',
//       },
//     ],
//   },
//   {
//     featureType: 'poi.park',
//     elementType: 'labels.text.stroke',
//     stylers: [
//       {
//         color: '#1b1b1b',
//       },
//     ],
//   },
//   {
//     featureType: 'road',
//     elementType: 'geometry.fill',
//     stylers: [
//       {
//         color: '#2c2c2c',
//       },
//     ],
//   },
//   {
//     featureType: 'road',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#8a8a8a',
//       },
//     ],
//   },
//   {
//     featureType: 'road.arterial',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#373737',
//       },
//     ],
//   },
//   {
//     featureType: 'road.highway',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#3c3c3c',
//       },
//     ],
//   },
//   {
//     featureType: 'road.highway.controlled_access',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#4e4e4e',
//       },
//     ],
//   },
//   {
//     featureType: 'road.local',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#616161',
//       },
//     ],
//   },
//   {
//     featureType: 'transit',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#757575',
//       },
//     ],
//   },
//   {
//     featureType: 'water',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#000000',
//       },
//     ],
//   },
//   {
//     featureType: 'water',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#3d3d3d',
//       },
//     ],
//   },
// ];

interface NearbyUser {
  _id: string;
  username: string;
  profilePicture: string;
  latitude: number;
  longitude: number;
}

const MapScreen = ({navigation}: any) => {
  const {colors, isDark} = useTheme();
  const mapRef = useRef<MapView>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userMarkerModalVisible, setUserMarkerModalVisible] = useState(false);
  const [userMarker, setUserMarker] = useState<NearbyUser | null>(null);
  const [markersReady, setMarkersReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [updateLocation] = useUpdateLocationMutation();
  const dispatch = useDispatch();
  const styles = useMemo(() => createStyle(colors), [colors]);

  // Distance state (in km) for the slider
  const [distance, setDistance] = useState(1); // Default 5km radius
  const [sliderWidth, setSliderWidth] = useState(0);

  const {location, profile} = useSelector(
    (state: RootState) => state.AuthManager,
  );

  // Pass the distance to your API query
  const {
    data,
    refetch,
    error,
    isLoading: isApiLoading,
  } = useGetNearbyUsersQuery({
    distanceKm: distance, // Pass the radius to your API
  });

  // Set markers ready when data or location changes
  useEffect(() => {
    if (data?.data?.nearbyUsers) {
      // Add a small delay to ensure markers render properly
      const timer = setTimeout(() => {
        setMarkersReady(true);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [data]);

  // Refetch when distance changes
  useEffect(() => {
    try {
      refetch();
      // Reset marker ready state when refetching
      setMarkersReady(false);
      setIsLoading(true);
    } catch (error) {
      setIsLoading(false);
    }
  }, [distance, refetch]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      setIsLoading(false);
    }
  }, [error]);

  // Update map region when distance changes
  useEffect(() => {
    if (mapRef.current) {
      try {
        let centerLatitude = DEFAULT_LATITUDE;
        let centerLongitude = DEFAULT_LONGITUDE;

        // Use user location if available
        if (location?.latitude && location?.longitude) {
          centerLatitude = location.latitude;
          centerLongitude = location.longitude;
        }
        // Otherwise use the first nearby user's location
        else if (data?.data?.nearbyUsers && data.data.nearbyUsers.length > 0) {
          centerLatitude = data.data.nearbyUsers[0].latitude;
          centerLongitude = data.data.nearbyUsers[0].longitude;
        }

        const region = getRegionForRadius(
          centerLatitude,
          centerLongitude,
          distance,
        );

        mapRef.current.animateToRegion(region, 300);
      } catch (error) {
        }
    }
  }, [distance, location, data]);

  // Re-render markers when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (data) {
        setMarkersReady(false);
        setTimeout(() => {
          setMarkersReady(true);
          setIsLoading(false);
        }, 500);
      }
      return () => {};
    }, [data]),
  );

  // Format the distance display
  const formatDistance = (value: number) => {
    return `${value.toFixed(1)} km`;
  };

  // Calculate center coordinates for the map
  const getCenterCoordinates = () => {
    if (location?.latitude && location?.longitude) {
      return {latitude: location.latitude, longitude: location.longitude};
    } else if (data?.data?.nearbyUsers && data.data.nearbyUsers.length > 0) {
      return {
        latitude: data.data.nearbyUsers[0].latitude,
        longitude: data.data.nearbyUsers[0].longitude,
      };
    } else {
      return {latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE};
    }
  };

  // Handle user marker modal options
  const handleGoToProfile = () => {
    setUserMarkerModalVisible(false);
    navigate('ProfileScreen', {
      userId: userMarker?._id,
      username: userMarker?.username,
    });
  };

  const handleGoToMap = () => {
    setUserMarkerModalVisible(false);

    if (mapRef.current && userMarker?.latitude && userMarker?.longitude) {
      const scheme = Platform.select({
        ios: 'maps:0,0?q=',
        android: 'geo:0,0?q=',
      });
      const latLng = `${userMarker.latitude},${userMarker.longitude}`;
      const label = userMarker.username;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
      });

      if (url) {
        Linking.openURL(url);
      }
    }
  };

  // Handle requesting location permissions and update location
  const handleLocationRequest = async () => {
    setIsRequestingLocation(true);
    try {
      // First request location permission
      const permissionGranted = await requestLocationPermission();

      if (permissionGranted) {
        // Permission granted, get location
        const location = await getUserLocation();

        if (location) {
          // Update location in Redux store

          dispatch(
            setLocation({
              latitude: location.latitude,
              longitude: location.longitude,
            }),
          );

          const res = await updateLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          });

          // Refetch nearby users with new location
          refetch();
        } else {
          // Location retrieval failed
          Alert.alert(
            'Location Error',
            'Unable to get your location. Please ensure location services are enabled.',
            [
              {
                text: 'Open Settings',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                },
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ],
          );
        }
      } else {
        // Permission denied
        Alert.alert(
          'Location Permission',
          'Location permission is required to show your position on the map. Please enable it in your device settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location. Please try again later.');
    } finally {
      setIsRequestingLocation(false);
    }
  };

  // If still initially loading and no data
  if (isLoading && !data?.data?.nearbyUsers) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}>
        <ActivityIndicator size="large" color={colors.primaryColor} />
        <Text style={{color: colors.darkText, marginTop: 10}}>
          Loading map data...
        </Text>
      </View>
    );
  }

  const centerCoords = getCenterCoordinates();

  // Custom slider PanResponder

  return (
    <View style={[styles.container, {backgroundColor: colors.backgroundColor}]}>
      <MapView
        mapType="standard"
        ref={mapRef}
        initialRegion={getRegionForRadius(
          centerCoords.latitude,
          centerCoords.longitude,
          distance,
        )}
        style={styles.map}
        showsScale
        // customMapStyle={isDark ? darkMapStyle : lightMapStyle}
      >
        {/* User's marker */}
        {markersReady && location?.latitude && location?.longitude && (
          <Marker
            onPress={() => {
              navigate('ProfileScreen', {
                userId: profile?._id,
                username: profile?.username,
              });
            }}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            // anchor={{x: 0.5, y: 0.5}}
            // title={'You'}
          >
            <View style={styles.markerContainer}>
              <View style={styles.nameContainer}>
                <Text style={styles.nameText}>{'You'}</Text>
              </View>
              <View style={styles.customMarker}>
                <FastImage
                  source={{
                    uri: profile?.profilePicture || IMAGES.logo,
                    priority: FastImage.priority.high,
                  }}
                  style={styles.markerImage}
                  resizeMode={FastImage.resizeMode.cover}
                />
              </View>
            </View>
          </Marker>
        )}

        {/* Nearby users markers */}
        {markersReady &&
          data?.data &&
          data?.data?.nearbyUsers &&
          data?.data?.nearbyUsers?.map((marker: NearbyUser) =>
            marker?.latitude && marker?.longitude ? (
              <Marker
                key={marker._id}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                anchor={{x: 0.5, y: 0.5}}
                // title={marker.username}
                onPress={() => {
                  setUserMarker(marker);
                  setUserMarkerModalVisible(true);
                }}>
                <View style={styles.markerContainer}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.nameText}>{marker.username}</Text>
                  </View>
                  <View style={styles.customMarker}>
                    <FastImage
                      source={{
                        uri: marker?.profilePicture || IMAGES.logo,
                        priority: FastImage.priority.high,
                      }}
                      style={styles.markerImage}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  </View>
                </View>
              </Marker>
            ) : null,
          )}
      </MapView>

      {/* Loading indicator for markers */}
      {!markersReady && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primaryColor} />
          <Text style={[styles.loadingText, {color: colors.darkText}]}>
            Loading markers...
          </Text>
        </View>
      )}

      {/* Location warning if user location is missing */}
      {!location?.latitude && !location?.longitude && markersReady && (
        <View style={styles.locationWarningContainer}>
          <Text style={styles.locationWarningText}>
            Location services unavailable. Showing nearby users only.
          </Text>
          <TouchableOpacity
            style={[
              styles.enableLocationButton,
              {backgroundColor: colors.primaryColor},
            ]}
            onPress={handleLocationRequest}
            disabled={isRequestingLocation}>
            {isRequestingLocation ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.enableLocationButtonText}>
                Enable Location
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Button to open modal */}
      <TouchableOpacity
        style={[
          styles.modalTriggerButton,
          {backgroundColor: colors.primaryColor},
        ]}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.modalTriggerText}>
          Set Distance ({formatDistance(distance)})
        </Text>
      </TouchableOpacity>

      {/* Location Button (when not shown in warning banner) */}

      {/* Distance Slider Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <Pressable
          onPress={() => setModalVisible(false)}
          style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.sliderCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.sliderTitle}>Discover Nearby</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <CloseSVG width={20} height={20} fill={colors.black} />
                </TouchableOpacity>
              </View>

              <View style={styles.sliderHeader}>
                <View style={styles.sliderValueContainer}>
                  <Text style={styles.sliderValue}>
                    {formatDistance(distance)}
                  </Text>
                </View>
              </View>

              <Slider
                value={distance}
                onValueChange={setDistance}
                minimumValue={1}
                maximumValue={25}
                step={1}
                style={styles.slider}
                thumbTintColor={colors.primaryColor}
                minimumTrackTintColor={colors.primaryColor}
                maximumTrackTintColor={colors.primaryColor}
              />

              <View style={styles.sliderContent}>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabelText}>Near</Text>
                  <Text style={styles.sliderLabelText}>Far</Text>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* User Marker Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={userMarkerModalVisible}
        onRequestClose={() => {
          setUserMarkerModalVisible(false);
          setUserMarker(null);
        }}>
        <Pressable
          onPress={() => {
            setUserMarkerModalVisible(false);
            setUserMarker(null);
          }}
          style={styles.userModalOverlay}>
          <View style={styles.userModalContent}>
            <View style={styles.userModalHeader}>
              <Text style={styles.userModalTitle}>Choose Action</Text>
              <TouchableOpacity
                onPress={() => {
                  setUserMarkerModalVisible(false);
                  setUserMarker(null);
                }}>
                <CloseSVG width={20} height={20} fill={colors.black} />
              </TouchableOpacity>
            </View>

            <View style={styles.userModalOptions}>
              <TouchableOpacity
                style={[
                  styles.userModalOption,
                  {borderColor: colors.primaryColor},
                ]}
                onPress={handleGoToProfile}>
                <Text
                  style={[
                    styles.userModalOptionText,
                    {color: colors.primaryColor},
                  ]}>
                  View Profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userModalOption,
                  {borderColor: colors.primaryColor},
                ]}
                onPress={handleGoToMap}>
                <Text
                  style={[
                    styles.userModalOptionText,
                    {color: colors.primaryColor},
                  ]}>
                  Navigate to Map
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const createStyle = (colors: ColorThemeInterface) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    markerContainer: {
      alignItems: 'center',
    },
    nameContainer: {
      backgroundColor: 'white',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginBottom: 4,
      borderWidth: 0.5,
      borderColor: '#ccc',
    },
    nameText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: 'black',
    },
    customMarker: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'white',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    markerImage: {
      width: 40,
      height: 40,
      borderRadius: 18,
      zIndex: 99,
    },
    sliderContainer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    sliderCard: {
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      padding: 16,
      width: width - 40,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    sliderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp('1%'),
    },
    sliderTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.black,
    },
    sliderContent: {
      marginBottom: hp('2%'),
    },
    sliderValueContainer: {
      backgroundColor: 'rgba(0,122,255,0.1)',
      paddingHorizontal: 12,
      paddingVertical: 0,
      borderRadius: 12,
    },
    sliderValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#007AFF',
    },
    distanceMarker: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      paddingHorizontal: 8,
    },
    distanceIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#f2f2f2',
      justifyContent: 'center',
      alignItems: 'center',
    },
    distanceIconText: {
      fontSize: 16,
    },
    distanceLine: {
      flex: 1,
      height: 2,
      backgroundColor: 'rgba(0,122,255,0.3)',
      marginHorizontal: 8,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    sliderLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      marginTop: -8,
    },
    sliderLabelText: {
      fontSize: 12,
      color: '#888',
    },
    refreshButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    refreshButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
    modalTriggerButton: {
      position: 'absolute',
      bottom: 100,
      alignSelf: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 10,
    },
    modalTriggerText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.inputBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: -4},
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    closeButton: {
      fontSize: 24,
      color: '#666',
      padding: 5,
    },
    loaderContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      fontWeight: '500',
    },
    locationWarningContainer: {
      position: 'absolute',
      top: 10,
      left: 10,
      right: 10,
      backgroundColor: 'rgba(255, 204, 0, 0.8)',
      borderRadius: 8,
      padding: 10,
      alignItems: 'center',
    },
    locationWarningText: {
      color: '#333',
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    enableLocationButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 25,
      marginTop: 4,
    },
    enableLocationButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    locationButton: {
      position: 'absolute',
      bottom: 160,
      alignSelf: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    userModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    userModalContent: {
      backgroundColor: colors.inputBackground,
      borderRadius: 20,
      padding: 20,
      width: width - 80,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    userModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    userModalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.black,
    },
    userModalOptions: {
      gap: 12,
    },
    userModalOption: {
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1.5,
      backgroundColor: 'rgba(0, 122, 255, 0.05)',
      alignItems: 'center',
    },
    userModalOptionText: {
      fontSize: 16,
      fontWeight: '600',
    },
    sliderTrack: {
      width: '100%',
      height: 4,
      backgroundColor: 'rgba(0,122,255,0.2)',
      borderRadius: 2,
      marginVertical: 15,
      position: 'relative',
    },
    sliderActiveTrack: {
      height: '100%',
      borderRadius: 2,
      position: 'absolute',
      left: 0,
    },
    sliderTouchArea: {
      position: 'absolute',
      top: -25,
      left: 0,
      right: 0,
      bottom: -25,
      zIndex: 10,
    },
    sliderThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      position: 'absolute',
      top: 17,
      marginLeft: -10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
      // elevation: 2,
    },
  });
};

export default MapScreen;
