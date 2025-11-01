import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

interface AlertProps {
  visible: boolean;
  title: string;
  content: string;
  onHide: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  visible,
  title,
  content,
  onHide,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => onHide());
        }, 3000);
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.alertContainer, {opacity}]}>
      <View style={styles.alert}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.content} numberOfLines={1} ellipsizeMode="tail">
          {content}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    maxHeight: 50,
    // overflow: 'hidden',
  },
  alert: {
    backgroundColor: '#e0ffe0',
    padding: 12,
    borderRadius: 10,
    width: width * 0.9,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 17,
  },
  content: {
    color: 'black',
    fontSize: 16,
  },
});
