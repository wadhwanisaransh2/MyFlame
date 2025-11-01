import React, {useMemo} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import { Colors } from '../../Utils/colors';
import { Text } from 'react-native-gesture-handler';
import { RFValue } from 'react-native-responsive-fontsize';


interface UserDetailsProps {
  user: any;
}

const UserDetails: React.FC<UserDetailsProps> = React.memo(({user}) => {




  return (
    <View>
      <TouchableOpacity
        style={styles.flexRow}
        onPress={() => {
          
        }}>
        <FastImage
          source={{
            uri: user?.userImage,
            priority: FastImage.priority.high,
          }}
          style={styles.img}
          resizeMode={FastImage.resizeMode.cover}
        />
        <Text style={styles.username}>{user?.username}</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  img: {
    height: 35,
    width: 35,
    borderRadius: 100,
  },
  follow: {
    borderWidth: 1,
    borderColor: 'white',
    padding: 5,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 50,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },

  username: {
    fontSize: RFValue(12),
    fontFamily: 'Poppins-Regular',
    color: 'white',
  },
});

export default UserDetails;