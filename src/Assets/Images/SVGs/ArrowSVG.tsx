import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

export const TrendUpSVG = (props: any) => (
  <Svg
    fill="#000000"
    xmlns="http://www.w3.org/2000/svg"
    width="800px"
    height="800px"
    viewBox="0 0 52 52"
    enableBackground="new 0 0 52 52"
    xmlSpace="preserve"
    {...props}>
    <Path d="M43.7,38H8.3c-1,0-1.7-1.3-0.9-2.2l17.3-21.2c0.6-0.8,1.9-0.8,2.5,0l17.5,21.2C45.4,36.7,44.8,38,43.7,38z" />
  </Svg>
);

export const TrendDownSVG = (props: any) => (
  <Svg
    width="800px"
    height="800px"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path d="M7.49988 12L-0.00012207 4L14.9999 4L7.49988 12Z" fill="#000000" />
  </Svg>
);
