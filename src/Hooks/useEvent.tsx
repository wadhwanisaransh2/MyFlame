export const useEvent = () => {
  const rank1Color = '#FFD700';
  const rank2Color = '#B0B0B0'; // Slightly darker than #C0C0C0
  const rank3Color = '#D88A50'; // lighter than

  const formatPrize = (prize: number): string => {
    if (prize >= 1000) {
      const thousands = Math.floor(prize / 1000);
      const remainder = prize % 1000;

      if (remainder === 0) {
        return `${thousands}K`;
      } else {
        // For values like 1500 -> 1.5K, 1250 -> 1.25K
        const decimal = remainder / 1000;
        const formatted = thousands + decimal;

        // Remove trailing zeros after decimal
        return `${formatted.toString().replace(/\.?0+$/, '')}K`;
      }
    }

    return prize.toString();
  };

  const getPositionStyle = (
    position: number,
    colors: any,
  ): {bg: string; borderStyle: object; color: string; zIndex: number} => {
    switch (position) {
      case 1:
        return {
          bg: colors.primaryColor,
          borderStyle: {
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
          },
          color: rank1Color,
          zIndex: 3, // Highest z-index for winner
        };
      case 2:
        const leftCardBorderStyle = {
          marginLeft: 0,
          borderBottomRightRadius: 0,
          borderTopRightRadius: 0,
        };
        return {
          bg: '#5C7B8D',
          borderStyle: leftCardBorderStyle,
          color: rank2Color,
          zIndex: 2, // Medium z-index for second place
        };
      case 3:
        const rightCardBorderStyle = {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        };
        return {
          bg: '#5C7B8D',
          borderStyle: rightCardBorderStyle,
          color: rank3Color,
          zIndex: 2, // Same as second place to prevent clipping
        };
      default:
        return {bg: '#2C3E50', borderStyle: {}, color: '', zIndex: 1};
    }
  };

  // New function for two-winner layout styling
  const getTwoWinnerPositionStyle = (
    position: number,
    colors: any,
  ): {bg: string; borderStyle: object; color: string; zIndex: number} => {
    switch (position) {
      case 1:
        return {
          bg: colors.primaryColor,
          borderStyle: {
            borderRadius: 20,
          },
          color: rank1Color,
          zIndex: 3,
        };
      case 2:
        return {
          bg: '#5C7B8D',
          borderStyle: {
            borderRadius: 20,
          },
          color: rank2Color,
          zIndex: 2,
        };
      default:
        return {bg: '#2C3E50', borderStyle: {}, color: '', zIndex: 1};
    }
  };

  return {
    rank1Color,
    rank2Color,
    rank3Color,
    formatPrize,
    getPositionStyle,
    getTwoWinnerPositionStyle,
  };
};
