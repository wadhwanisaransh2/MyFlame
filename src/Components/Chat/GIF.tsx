import React, {useEffect, useState} from 'react';
import {SafeAreaView, TextInput, Text} from 'react-native';
import {GiphyContent, GiphyGridView} from '@giphy/react-native-sdk';
import {Colors} from '../../Utils/colors';
import FastImage from 'react-native-fast-image';
import {View} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import {SearchSVG} from '../../Assets/Images/SVGs/ChatsSVG';

interface Props {
  sendGIF: (url: string) => void;
}

export function GIFInput({sendGIF}: Props) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  return (
    <SafeAreaView>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.backgroundColor,
          borderColor: Colors.primaryColor,
          borderWidth: 2,
          margin: 5,
          paddingHorizontal: 10,
          borderRadius: 10,
        }}>
        <SearchSVG fill={Colors.primaryColor} width={22} height={22} />
        <TextInput
          autoFocus
          onChangeText={setSearchQuery}
          placeholder="Search..."
          value={searchQuery}
          style={{
            flex: 1,
            paddingVertical: 5,
            color: Colors.black,
            fontSize: 16,
            marginLeft: 7,
          }}
          placeholderTextColor={Colors.grey || '#999'}
        />
      </View>
      <GiphyGridView
        content={
          searchQuery
            ? GiphyContent.search({searchQuery: searchQuery})
            : GiphyContent.trendingGifs()
        }
        cellPadding={25}
        style={{height: 300}}
        onMediaSelect={e => {
          sendGIF(e.nativeEvent.media.id);
        }}
      />
    </SafeAreaView>
  );
}

export const GIFMessage = ({
  id,
  getGIFData,
}: {
  id: string;
  getGIFData: (id: string) => Promise<{
    imageUrl: string;
    dimensions: {width: number; height: number};
  } | null>;
}) => {
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [dimensions, setDimensions] = useState({width: 0, height: 0});
  const {colors} = useTheme();

  async function getData() {
    setLoading(true);
    const result = await getGIFData(id);
    if (result) {
      const {dimensions: dimensionResult, imageUrl} = result;
      setDimensions(dimensionResult);
      setImage(imageUrl);
    }
    setLoading(false);
  }

  useEffect(() => {
    getData();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10,
        }}>
        <Text style={{color: colors.white}}>Loading...</Text>
      </View>
    );
  }

  if (!loading && !image) {
    return <Text style={{color: colors.white}}>GIF not available</Text>;
  }

  return (
    <View style={{position: 'relative'}}>
      <FastImage
        source={{uri: image}}
        style={{
          width: dimensions.width || 250,
          height: dimensions.height || 250,
          borderRadius: 10,
        }}
        resizeMode={FastImage.resizeMode.contain}
      />
      <Text
        style={{
          position: 'absolute',
          bottom: 5,
          right: 5,
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: 'white',
          paddingHorizontal: 4,
          fontSize: 10,
          borderRadius: 3,
        }}>
        Powered by GIPHY
      </Text>
    </View>
  );
};
