export const endpoint = {
  auth: {
    register: 'auth/customer/register',
    verify_otp: 'auth/customer/verify-otp',
    resend_otp: 'auth/customer/resend-otp',
    reset_password_verify_otp: 'auth/customer/reset-password/verify-otp',
    google : 'auth/customer/google',
    login: 'auth/customer/login',
    forgot_password: 'auth/customer/forgot-password',
    change_password: 'auth/customer/change-password',
    reset_password: '/auth/customer/reset-password',
    addRefer: '/auth/customer/add-refer',
    logout: '/auth/customer/logout',
  },
  user: {
    profile: 'customer/profile',
    settings: '/customer/settings',
    getUserProfile: 'customer/user-profile/',
    updateProfile: 'customer/update',
    updateProfilePicture: 'customer/profile-picture',
    updateLocation: '/location/update',
  },
  friends: {
    search: 'friends/search',
    sendRequest: 'friends/request',
    acceptRequest: 'friends/accept/',
    rejectRequest: 'friends/reject/',
    pending: 'friends/pending',
    friends: 'friends/list',
    remove: 'friends/remove/',
    block: (id: string) => `customer/block/${id}`,
    unblock: 'customer/unblock/',
    getBlockList: 'customer/blocked-users',
    cancelRequest: 'friends/cancel-request',
    getNearbyUsers: '/location/nearby',
  },
  coin: {
    sendCoins: 'transactions/send-coins',
    getUserCoinsTransactions: 'transactions/user',
    getRefferData: 'referral/user',
    getCoinConfig: '/coin-config/user',
    AdsCallBack: 'ads/admob-callback',
    getUserCoins: 'customer/coins',
  },
  chat: {
    getMessages: (conversationId: string, cursor: string, limit: number) =>
      `message/getmessage/${conversationId}?cursor=${cursor}&limit=${limit}`,
    Chatlist: (search: string, cursor: number, limit: number) => {
      let url = `message/conversations?cursor=${cursor}&limit=${limit}`;
      if (search) {
        url += `&search=${search}`;
      }
      return url;
    },
    deleteConversationMessagesSettings: (
      id: string,
      messagesDisappear: boolean,
    ) =>
      `/message/updateConversationSettings/${id}?messagesDisappear=${messagesDisappear}`,
    conversation: '',
    messages: '',
    send: '',
    delete: (id: string) => `/message/${id}`,
    recoverStreak: (id: string) => `message/${id}/recover-streak`,
    markAsRead: (id: string) => `message/markAsRead/${id}`,
  },
  support: {
    submitTicket: '/support/',
  },
  feedback: {
    submitFeedback: '/feedback/',
  },
  event: {
    getFilteredEvents: (
      mode: string,
      search: string,
      page: number,
      limit: number,
    ) => {
      let url = `/events/user/filter?page=${page}&limit=${limit}&`;
      if (mode) {
        url += `mode=${mode}`;
      }
      if (search) {
        url += `search=${search}`;
      }
      return url;
    },
    getEventCategoryLeaderboard: (eventId: string, categoryName: string) =>
      `/events/category/leaderboard/${eventId}/${categoryName}`,
  },
  post: {
    create: 'post/create',
    getMyPosts: 'post/my-post',
    likePost: 'post/like/',
    unlikePost: 'post/unlike/',
    commentOnPost: 'post/comment/',
    deletePost: 'post/delete/',
    archivePost: 'post/archive/',
    getArchivedPosts: '/post/getarchive',
    unarchivePost: '/post/restore/',
    getFeed: '/post/feed',
    getPostComments: '/post/getCommentsOnPost/',
    postReel: 'post/create-reel',
    getPostById: (id: string) => `/post/getPostById/${id}`,
  },
  notification: {
    markAsRead: '/notification/mark-all-read',
    all: '/notification/',
  },
  general: {
    admobCallback: '/ads/admob-callback',
    getUrlFromBase64: '/message/uploadImage',
  },
  report: '/report',
};
