import {BaseQueryFn} from '@reduxjs/toolkit/query/react';
import client from '../../Service';

const customBaseQuery: BaseQueryFn<
  {url: string; method: string; data?: any; params?: any; headers?: any},
  unknown,
  unknown
> = async ({url, method, data, params, headers}) => {
  // Debug: log requested URL and method
  try {
    // eslint-disable-next-line no-console
    console.log('API Request:', method, url, { hasData: !!data, hasParams: !!params });
  } catch {}
  try {
    const result = await client.request({url, method, data, params, headers});
    return {data: result};
  } catch (error: any) {
    if (typeof error === 'string') {
      return { error: { status: undefined, message: error } };
    }
    return {
      error: {
        status: error?.statusCode,
        message: error?.message,
        data: error?.data,
      },
    };
  }
};

export default customBaseQuery;
