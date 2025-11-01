import React, { useEffect } from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { CustomInput } from '../index';
import DatePickerInput from '../Inputs/DatePickerInput';
import { FormFieldConfig, SignupFormData } from '../../Interfaces/auth.types';

interface AnimatedFormFieldProps {
  field: FormFieldConfig;
  control: Control<SignupFormData>;
  errors: FieldErrors<SignupFormData>;
  animationDelay?: number;
  getValidationRules: (fieldName: keyof SignupFormData) => any;
}

const AnimatedFormField: React.FC<AnimatedFormFieldProps> = ({
  field,
  control,
  errors,
  animationDelay = 0,
  getValidationRules,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withDelay(
      animationDelay,
      withTiming(1, { duration: 600 })
    );
    translateY.value = withDelay(
      animationDelay,
      withSpring(0, {
        damping: 15,
        stiffness: 100,
      })
    );
    scale.value = withDelay(
      animationDelay,
      withSpring(1, {
        damping: 15,
        stiffness: 100,
      })
    );
  }, [animationDelay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => {
          if (field.isDatePicker) {
            return (
              <DatePickerInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={field.placeholder}
                error={errors[field.name]?.message}
              />
            );
          }
          
          return (
            <CustomInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={field.placeholder}
              error={errors[field.name]?.message}
              keyboardType={field.keyboardType}
              secureTextEntry={field.secureTextEntry}
              maxLength={field.maxLength}
            />
          );
        }}
        name={field.name}
        rules={getValidationRules(field.name)}
      />
    </Animated.View>
  );
};

export default AnimatedFormField; 