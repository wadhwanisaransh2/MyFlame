import {useState, useCallback} from 'react';
import {useForm} from 'react-hook-form';
import {SignupFormData, SignupApiData} from '../Interfaces/auth.types';
import {SIGNUP_STEPS} from '../Constants/signupSteps';
import {useRegisterMutation} from '../redux/api/auth';
import {navigate} from '../Utils/navigation';
import {ValidationMessages} from '../Utils/formValidation';
import {showToast} from '../Utils/general';
import {getFcmToken} from '../Utils/NotificationService';

export const useSignupForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [register, {error, isLoading}] = useRegisterMutation();

  const {
    control,
    handleSubmit,
    formState: {errors},
    getValues,
    trigger,
    watch,
  } = useForm<SignupFormData>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
      address: '',
      referralCode: '',
      dateOfBirth: '',
    },
  });

  const currentStepData = SIGNUP_STEPS[currentStep];
  const isLastStep = currentStep === SIGNUP_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  // Watch password for confirm password validation
  const password = watch('password');

  const validateCurrentStep = useCallback(async () => {
    const fieldsToValidate = currentStepData.fields.map(field => field.name);
    const isValid = await trigger(fieldsToValidate);
    return isValid;
  }, [currentStep, trigger, currentStepData]);

  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && !isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
    return isValid;
  }, [validateCurrentStep, isLastStep]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirstStep]);

  const getFieldValidationRules = useCallback(
    (fieldName: keyof SignupFormData) => {
      const baseRules =
        currentStepData.fields.find(field => field.name === fieldName)?.rules ||
        {};

      // Add confirm password validation
      if (fieldName === 'confirmPassword') {
        return {
          ...baseRules,
          validate: (value: string) =>
            value === password || ValidationMessages.passwordMismatch,
        };
      }

      return baseRules;
    },
    [currentStepData, password],
  );

  const onSubmit = useCallback(
    async (data: SignupFormData) => {
      try {
        const fcmToken = await getFcmToken();
        const apiData: SignupApiData = {
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          email: data.email,
          password: data.password,
          phoneNumber: `91${data.phone}`,
          address: data.address,
          referralCode: data.referralCode,
          dateOfBirth: data.dateOfBirth,
          deviceId: fcmToken || 'ftyuuyhbuyhgj',
        };

        await register(apiData).unwrap();
        navigate('OTPVerify', {type: 'user-verify', phone: data.username});
      } catch (err: any) {
        //  showToast(err.data.message , 'error');
        }
    },
    [register],
  );

  const handleFormSubmit = useCallback(async () => {
    if (isLastStep) {
      const isValid = await validateCurrentStep();
      if (isValid) {
        handleSubmit(onSubmit)();
      }
    } else {
      await nextStep();
    }
  }, [isLastStep, validateCurrentStep, handleSubmit, onSubmit, nextStep]);

  return {
    // Form state
    control,
    errors,
    currentStep,
    currentStepData,
    isFirstStep,
    isLastStep,
    isLoading,
    error,

    // Form actions
    nextStep,
    prevStep,
    handleFormSubmit,
    getFieldValidationRules,
    getValues,

    // Computed values
    progress: ((currentStep + 1) / SIGNUP_STEPS.length) * 100,
  };
};
