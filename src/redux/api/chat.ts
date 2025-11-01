import {createApi} from '@reduxjs/toolkit/query/react';
import customBaseQuery from './baseQuery';
import {endpoint} from '../../Constants/endpoints';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    getChat: builder.query({
      query: ({conversationId, nextCursor, limit}) => ({
        url: `${endpoint.chat.getMessages(conversationId, nextCursor, limit)}`,
        method: 'GET',
      }),
    }),
    getUserConversations: builder.query({
      query: ({searchText, cursor, limit}) => ({
        url: `${endpoint.chat.Chatlist(searchText, cursor, limit)}`,
        method: 'GET',
      }),
    }),
    deleteChat: builder.mutation({
      query: chatId => ({
        url: `${endpoint.chat.delete(chatId)}`,
        method: 'DELETE',
      }),
    }),
    recoverStreak: builder.mutation({
      query: (conversationId: string) => ({
        url: endpoint.chat.recoverStreak(conversationId),
        method: 'POST',
      }),
    }),
    markMessagesRead: builder.mutation({
      query: (conversationId: string) => ({
        url: endpoint.chat.markAsRead(conversationId),
        method: 'POST',
      }),
    }),
    changeMessageDeletionSettings: builder.mutation({
      query: settingsData => ({
        url: endpoint.chat.deleteConversationMessagesSettings(
          settingsData.id,
          settingsData.messagesDisappear,
        ),
        method: 'PATCH',
      }),
    }),
    getUrlFromImageBase64String: builder.mutation({
      query: ({data}) => ({
        url: endpoint.general.getUrlFromBase64,
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data,
      }),
    }),
    // Events/leaderboard related queries and mutations
    getEventData: builder.query({
      query: ({mode, search, limit, page = 1}) => ({
        url: `${endpoint.event.getFilteredEvents(mode, search, page, limit)}`,
        method: 'GET',
      }),
    }),
    getEventCategoryLeaderboard: builder.query({
      query: ({eventId, categoryName, cursor, limit = 10, search = ''}) => {
        const params = new URLSearchParams();
        if (cursor) params.append('cursor', cursor);
        if (limit) params.append('limit', limit.toString());
        if (search) params.append('search', search);

        return {
          url: `${endpoint.event.getEventCategoryLeaderboard(
            eventId,
            categoryName,
          )}?${params.toString()}`,
          method: 'GET',
        };
      },
    }),

    // feedback
    submitFeedback: builder.mutation({
      query: feedbackData => ({
        url: endpoint.feedback.submitFeedback,
        method: 'POST',
        data: feedbackData,
      }),
    }),
    // support
    submitSupportRequest: builder.mutation({
      query: supportRequestData => ({
        url: endpoint.support.submitTicket,
        method: 'POST',
        data: supportRequestData,
      }),
    }),
    // report
    report: builder.mutation({
      query: reportData => ({
        url: endpoint.report,
        method: 'POST',
        data: reportData,
      }),
    }),
  }),
});

export const {
  useGetChatQuery,
  useGetUserConversationsQuery,
  useRecoverStreakMutation,
  useMarkMessagesReadMutation,
  useChangeMessageDeletionSettingsMutation,
  useGetEventDataQuery,
  useGetEventCategoryLeaderboardQuery,
  useDeleteChatMutation,
  useSubmitFeedbackMutation,
  useSubmitSupportRequestMutation,
  useReportMutation,
  useGetUrlFromImageBase64StringMutation,
} = chatApi;
