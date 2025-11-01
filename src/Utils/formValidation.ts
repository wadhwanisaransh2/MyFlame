// Helper function to convert camelCase to display name
const convertToDisplayName = (field: string): string => {
  return field
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim(); // Remove any leading/trailing spaces
};

export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]+$/,
  phone: /^[0-9]{10}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  referralCode: /^[A-Z0-9]{6,12}$/,
  dateOfBirth: /^\d{4}-\d{2}-\d{2}$/,
};

export const ValidationMessages = {
  required: (field: string) => `${convertToDisplayName(field)} is required`,
  invalid: (field: string) => `${convertToDisplayName(field)} is invalid`,
  minLength: (field: string, length: number) => 
    `${convertToDisplayName(field)} must be at least ${length} characters`,
  maxLength: (field: string, length: number) => 
    `${convertToDisplayName(field)} must not exceed ${length} characters`,
  passwordMismatch: 'Passwords do not match',
  usernameFormat: 'Username can only contain letters, numbers, and underscores(_)',
  passwordStrength: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  referralCodeFormat: 'Refer code must be 6-12 characters long and contain only letters and numbers',
  dateOfBirthFormat: 'Please select a valid date of birth',
  minimumAge: 'You must be at least 13 years old to register',
};

export const getValidationRules = (fieldName: string) => {
  const rules: any = {};

  switch (fieldName) {
    case 'firstName':
    case 'lastName':
      rules.required = ValidationMessages.required(fieldName);
      rules.minLength = {
        value: 2,
        message: ValidationMessages.minLength(fieldName, 2),
      };
      break;

    case 'email':
      rules.required = ValidationMessages.required('Email');
      rules.pattern = {
        value: ValidationPatterns.email,
        message: ValidationMessages.invalid('Email'),
      };
      break;

    case 'username':
      rules.required = ValidationMessages.required('Username');
      rules.pattern = {
        value: ValidationPatterns.username,
        message: ValidationMessages.usernameFormat,
      };
      rules.minLength = {
        value: 3,
        message: ValidationMessages.minLength('Username', 3),
      };
      break;

    case 'phone':
      rules.required = ValidationMessages.required('Phone number');
      rules.pattern = {
        value: ValidationPatterns.phone,
        message: ValidationMessages.invalid('Phone number'),
      };
      rules.minLength = {
        value: 10,
        message: ValidationMessages.invalid('Phone number'),
      };
      break;

    case 'password':
      rules.required = ValidationMessages.required('Password');
      rules.minLength = {
        value: 8,
        message: ValidationMessages.minLength('Password', 8),
      };
      // Uncomment for stronger password validation
      // rules.pattern = {
      //   value: ValidationPatterns.password,
      //   message: ValidationMessages.passwordStrength,
      // };
      break;

    case 'confirmPassword':
      rules.required = ValidationMessages.required('Confirm password');
      break;

    case 'referralCode':
      // Refer code is optional, but if provided, it should match the pattern
      rules.pattern = {
        value: ValidationPatterns.referralCode,
        message: ValidationMessages.referralCodeFormat,
      };
      break;

    case 'dateOfBirth':
      rules.required = ValidationMessages.required('Date of birth');
      rules.validate = (value: string) => {
        if (!value) return ValidationMessages.required('Date of birth');
        
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 13) {
          return ValidationMessages.minimumAge;
        }
        
        return true;
      };
      break;

    default:
      break;
  }

  return rules;
}; 