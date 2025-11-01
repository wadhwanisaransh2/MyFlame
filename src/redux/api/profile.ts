import {createApi} from '@reduxjs/toolkit/query/react';
import customBaseQuery from './baseQuery';
import {endpoint} from '../../Constants/endpoints';

// Define TypeScript interfaces for the data structures
export interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  privacySettings?: {
    profileVisibility: 'public' | 'private' | 'friends';
  };
}

export interface User {
  _id: string;
  bio: string;
  coins: number;
  firstName: string;
  gender: string;
  isVerified: boolean;
  lastName: string;
  // Friend status returned in some endpoints (optional)
  status?: 'accepted' | 'pending' | 'none' | 'pending_sent' | 'pending_received';
  privacy: string;
  profilePicture: string | null;
  username: string;
}

export interface ProfileResponse {
  user: User;
  friendsCount: number;
  postsCount: number;
  isFriend: boolean;
  friendStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
  isBlocked: boolean; // Added based on the logged data
  rank: number | null; // Assuming rank can be null
  Postcount: number; // Assuming this is the count of posts
  Reelcount: number; // Assuming this is the count of reels
  eventWon: number;
  // Optional fields returned by some endpoints
  friendRequestID?: string;
  message?: string;
}

export interface PostsResponse {
  posts: Post[];
  page: number;
  total: number;
  totalPage: number;
}

export interface Post {
  _id: string;
  imageUrl: string;
  description: string;
  location: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  user: User;
  // Some endpoints use userId instead of embedding user object
  userId?: string;
  // Post type (post or reel) may be present in some responses
  type?: 'post' | 'reel';
  // Views number for reels/posts
  views?: number;
  comments: any[];
  caption: string;
  likes: any[];
  isLiked?: boolean;
}

export interface FriendRequest {
  username: string;
}

export interface FriendListResponse {
  friends: User[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PendingUsersResponse {
  _id: string;
  senderId: User;
  status: string;
  createdAt: string;
}

export interface BlockListResponse {
  blockedUsers: User[];
  total: number;
  page: number;
  totalPages: number;
}

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Profile', 'Posts', 'Settings', 'UpdateProfileCurrentUser'],
  endpoints: builder => ({
    getUserProfile: builder.query<ProfileResponse, string | undefined>({
      query: userId => {
        return {
          url: `${endpoint.user.getUserProfile}?userId=${userId}`,
          method: 'GET',
        };
      },
      providesTags: ['Profile'],
    }),

    getCurrentUserProfile: builder.query<ProfileResponse, string | undefined>({
      query: () => ({
        url: `${endpoint.user.profile}`,
        method: 'GET',
      }),
      providesTags: ['UpdateProfileCurrentUser'],
    }),

    sendCoins: builder.mutation({
      query: data => ({
        url: endpoint.coin.sendCoins,
        method: 'POST',
        data,
      }),
    }),

    getUserPosts: builder.query<
      any,
      {page: number; userId?: string; type?: 'post' | 'reel'}
    >({
      query: ({page, userId, type}) => ({
        url: `${endpoint.post.getMyPosts}?userId=${userId}&type=${type}&page=${page}`,
        method: 'GET',
      }),
      providesTags: ['Posts'],
    }),

    getPendingUsers: builder.query<PendingUsersResponse[], {page: number}>({
      query: ({page}) => ({
        url: `${endpoint.friends.pending}?page=${page}`,
        method: 'GET',
      }),
      // providesTags: ['PendingUsers'],
    }),

    sendFriendRequest: builder.mutation<void, FriendRequest>({
      query: payload => ({
        url: `${endpoint.friends.sendRequest}`,
        method: 'POST',
        data: payload,
      }),
      invalidatesTags: ['Profile'],
    }),

    cancelFriendRequest: builder.mutation<void, {receiverId: string}>({
      query: payload => ({
        url: `${endpoint.friends.cancelRequest}?receiverId=${payload.receiverId}`,
        method: 'DELETE',
        data: payload,
      }),
      invalidatesTags: ['Profile'],
    }),

    removeFriend: builder.mutation<void, {userId: string}>({
      query: payload => ({
        url: `${endpoint.friends.remove}${payload.userId}`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Profile'],
    }),

    getFriendList: builder.query<
      FriendListResponse,
      {userId: string; page: number; search?: string}
    >({
      query: ({userId, page, search}) => ({
        url: `${endpoint.friends.friends}?userId=${userId}&page=${page}${
          search ? `&username=${search}` : ''
        }`,
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),
    blockUser: builder.mutation<void, {userId: string}>({
      query: payload => ({
        url: endpoint.friends.block(payload.userId),
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Profile'],
    }),
    unblockUser: builder.mutation<void, {userId: string}>({
      query: payload => ({
        url: `${endpoint.friends.unblock}${payload.userId}`,
        method: 'DELETE',
        body: payload,
      }),
      invalidatesTags: ['Profile'],
    }),

    acceptFriendRequest: builder.mutation<void, {friendRequestId: string}>({
      query: payload => ({
        url: `${endpoint.friends.acceptRequest}${payload.friendRequestId}`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Profile'],
    }),

    rejectFriendRequest: builder.mutation<void, {friendRequestId: string}>({
      query: payload => ({
        url: `${endpoint.friends.rejectRequest}${payload.friendRequestId}`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Profile'],
    }),

    getAllNotifications: builder.query({
      query: () => ({
        url: `${endpoint.notification.all}`,
        method: 'GET',
      }),
    }),
    markNotificationsRead: builder.mutation({
      query: () => ({
        url: endpoint.notification.markAsRead,
        method: 'PATCH',
      }),
    }),

    getNearbyUsers: builder.query<any, {distanceKm: number}>({
      query: (payload: {distanceKm: number}) => ({
        url:
          endpoint.friends.getNearbyUsers + `?distanceKm=${payload.distanceKm}`,
        data: payload,
        method: 'GET',
      }),
    }),

    admobCallback: builder.mutation({
      query: payload => ({
        url: endpoint.coin.AdsCallBack + `?reward=${payload.amount}`,
        method: 'POST',
        //  data: payload,
      }),
    }),

    getUserCoins: builder.query({
      query: () => ({
        url: endpoint.coin.getUserCoins,
        method: 'GET',
      }),
      providesTags: ['UpdateProfileCurrentUser'],
    }),
    updateSetting: builder.mutation<void, {}>({
      query: payload => ({
        url: `${endpoint.user.settings}`,
        method: 'PATCH',
        data: payload,
      }),
      invalidatesTags: ['Settings'],
    }),

    getSetting: builder.query({
      query: () => ({
        url: endpoint.user.settings,
        method: 'GET',
      }),
      providesTags: ['Settings'],
    }),

    getBlockList: builder.query<
      BlockListResponse,
      {userId: string; page: number}
    >({
      query: ({userId, page}) => ({
        url: `${endpoint.friends.getBlockList}?page=${page}`,
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),

    searchUsers: builder.query<any, {username: string}>({
      query: ({username}) => {
        return {
          url: `${endpoint.friends.search}?username=${username}`,
          method: 'GET',
        };
      },
    }),

    updateProfile: builder.mutation({
      query: profileData => ({
        url: endpoint.user.updateProfile,
        method: 'PATCH',
        data: profileData,
      }),
      invalidatesTags: ['UpdateProfileCurrentUser'],
    }),

    updateProfilePicture: builder.mutation({
      query: payload => ({
        url: `${endpoint.user.updateProfilePicture}`,
        method: 'PATCH',
        data: payload,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        invalidatesTags: ['UpdateProfileCurrentUser'],
      }),
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useGetUserPostsQuery,
  useGetCurrentUserProfileQuery,
  useLazyGetUserPostsQuery,
  useGetPendingUsersQuery,
  useSendFriendRequestMutation,
  useRemoveFriendMutation,
  useGetFriendListQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useMarkNotificationsReadMutation,
  useGetAllNotificationsQuery,
  useCancelFriendRequestMutation,
  useGetNearbyUsersQuery,
  useAdmobCallbackMutation,
  useUpdateSettingMutation,
  useGetSettingQuery,
  useGetBlockListQuery,
  useLazySearchUsersQuery,
  useSendCoinsMutation,
  useLazyGetUserCoinsQuery,
  useGetUserCoinsQuery,
  useUpdateProfileMutation,
  useUpdateProfilePictureMutation,
} = profileApi;
