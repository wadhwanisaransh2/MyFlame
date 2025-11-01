export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  referralCode: string;
  dateOfBirth: string;
}

export interface SignupApiData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  referralCode: string;
  dateOfBirth: string;
  deviceId: string;
}

export interface FormFieldConfig {
  name: keyof SignupFormData;
  placeholder: string;
  rules: any;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  secureTextEntry?: boolean;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  isDatePicker?: boolean;
}

export interface SignupStepData {
  title: string;
  subtitle: string;
  fields: FormFieldConfig[];
  stepNumber: number;
  totalSteps: number;
} 