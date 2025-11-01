import { SignupStepData } from '../Interfaces/auth.types';
import { getValidationRules } from '../Utils/formValidation';

export const SIGNUP_STEPS: SignupStepData[] = [
  {
    title: 'Personal Information',
    subtitle: 'Tell us about yourself',
    stepNumber: 1,
    totalSteps: 4,
    fields: [
      {
        name: 'firstName',
        placeholder: 'First Name*',
        rules: getValidationRules('firstName'),
        autoCapitalize: 'words',
      },
      {
        name: 'lastName',
        placeholder: 'Last Name*',
        rules: getValidationRules('lastName'),
        autoCapitalize: 'words',
      },
      {
        name: 'dateOfBirth',
        placeholder: 'Date of Birth*',
        rules: getValidationRules('dateOfBirth'),
        isDatePicker: true,
      },
    ],
  },
  {
    title: 'Account Details',
    subtitle: 'Create your account credentials',
    stepNumber: 2,
    totalSteps: 4,
    fields: [
      {
        name: 'email',
        placeholder: 'Email*',
        rules: getValidationRules('email'),
        keyboardType: 'email-address',
        autoCapitalize: 'none',
      },
      {
        name: 'username',
        placeholder: 'Username*',
        rules: getValidationRules('username'),
        autoCapitalize: 'none',
      },
      {
        name: 'phone',
        placeholder: 'Phone Number*',
        rules: getValidationRules('phone'),
        keyboardType: 'number-pad',
        maxLength: 10,
      },
    ],
  },
  {
    title: 'Security',
    subtitle: 'Secure your account',
    stepNumber: 3,
    totalSteps: 4,
    fields: [
      {
        name: 'password',
        placeholder: 'Password*',
        rules: getValidationRules('password'),
        secureTextEntry: true,
        autoCapitalize: 'none',
      },
      {
        name: 'confirmPassword',
        placeholder: 'Confirm Password*',
        rules: getValidationRules('confirmPassword'),
        secureTextEntry: true,
        autoCapitalize: 'none',
      },
    ],
  },
  {
    title: 'Additional Details',
    subtitle: 'Almost done! Just a few more details',
    stepNumber: 4,
    totalSteps: 4,
    fields: [
      {
        name: 'address',
        placeholder: 'Address (Optional)',
        rules: {},
        autoCapitalize: 'words',
      },
      {
        name: 'referralCode',
        placeholder: 'Refer Code (Optional)',
        rules: getValidationRules('referralCode'),
        autoCapitalize: 'characters',
        maxLength: 12,
      },
    ],
  },
];

export const SIGNUP_ANIMATIONS = {
  STEP_TRANSITION_DURATION: 300,
  FIELD_ANIMATION_DELAY: 100,
  SUCCESS_ANIMATION_DURATION: 1000,
}; 