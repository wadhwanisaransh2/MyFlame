import {createApi} from '@reduxjs/toolkit/query/react';
import customBaseQuery from './baseQuery';
import {endpoint} from '../../Constants/endpoints';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    login: builder.mutation({
      query: credentials => ({
        url: endpoint.auth.login,
        method: 'POST',
        data: credentials,
      }),
    }),
    register: builder.mutation({
      query: userData => ({
        url: `${endpoint.auth.register}?deviceId=${userData.deviceId}`,
        method: 'POST',
        data: userData,
      }),
    }),
    verifyOtp: builder.mutation({
      query: otpData => ({
        url: endpoint.auth.verify_otp,
        method: 'POST',
        data: otpData,
      }),
    }),
    resendOtp: builder.mutation({
      query: phoneData => ({
        url: endpoint.auth.resend_otp,
        method: 'POST',
        data: phoneData,
      }),
    }),
    forgotPassword: builder.mutation({
      query: userData => ({
        url: endpoint.auth.forgot_password,
        method: 'POST',
        data: userData,
      }),
    }),

    getProfile: builder.query({
      query: userId => ({
        url: `${endpoint.user.getUserProfile}${userId}`,
        method: 'GET',
      }),
    }),

    updateLocation: builder.mutation({
      query: payload => ({
        url: `${endpoint.user.updateLocation}`,
        method: 'PATCH',
        data: payload,
      }),
    }),

    resetPasswordVerifyOtp: builder.mutation({
      query: otpData => ({
        url: endpoint.auth.reset_password_verify_otp,
        method: 'POST',
        data: otpData,
      }),
    }),

    resetPassword: builder.mutation({
      query: ({token, password}) => ({
        url: endpoint.auth.reset_password + '?token=' + token,
        method: 'POST',
        data: {newpassword: password},
      }),
    }),

    googleLogin: builder.mutation({
      query: ({token, deviceId}) => ({
        url: endpoint.auth.google,
        method: 'POST',
        data: {token, deviceId},
      }),
    }),

    addRefer: builder.mutation({
      query: ({referralCode}) => ({
        url: endpoint.auth.addRefer,
        method: 'POST',
        data: {referralCode},
      }),
    }),

    logout: builder.mutation<any, {deviceId: string}>({
      query: ({deviceId}) => ({
        url: endpoint.auth.logout,
        method: 'POST',
        data: {deviceId},
      }),
    }),



    chnagePassword: builder.mutation({
      query: ({oldpassword, newpassword}) => ({
        url: endpoint.auth.change_password,
        method: 'POST',
        data: {oldpassword, newpassword},
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useGetProfileQuery,
  useUpdateLocationMutation,
  useResetPasswordVerifyOtpMutation,
  useResetPasswordMutation,
  useGoogleLoginMutation,
  useAddReferMutation,
  useChnagePasswordMutation,
  useLogoutMutation,
} = authApi;
