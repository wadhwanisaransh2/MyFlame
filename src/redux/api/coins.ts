import {createApi} from '@reduxjs/toolkit/query/react';
import customBaseQuery from './baseQuery';
import {endpoint} from '../../Constants/endpoints';

export const coinsApi = createApi({
  reducerPath: 'coinsApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Coins', 'UpdateProfileCurrentUser'],
  endpoints: builder => ({
   

    getUserCoinsTransactions: builder.query({
      query: (data: {page: number; limit: number}) => ({
        url: `${endpoint.coin.getUserCoinsTransactions}?page=${data?.page}&limit=${data?.limit}`,
        method: 'GET',
        // params: data,
      }),
      providesTags: ['Coins', 'UpdateProfileCurrentUser'],
    }),

    getRefferData: builder.query({
      query: data => ({
        url: endpoint.coin.getRefferData,
        method: 'GET',
        // data,
      }),
      providesTags: ['Coins'],
    }),

    getCoinConfig: builder.query({
      query: data => ({
        url: endpoint.coin.getCoinConfig,
        method: 'GET',
        // data,
      }),
      providesTags: ['Coins'],
    }),

   
  }),
});

export const {
  
  useGetUserCoinsTransactionsQuery,
  useGetRefferDataQuery,
  useGetCoinConfigQuery,

} = coinsApi;
