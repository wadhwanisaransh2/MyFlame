import axios, {InternalAxiosRequestConfig} from 'axios';
import {BASE_URL} from './config';
import {ASYNC_KEYS} from '../Utils/constant';
import {getAsyncStorage} from '../Utils/general';
import {handleSessionExpired} from '../Utils/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

let client = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const token = await getAsyncStorage(ASYNC_KEYS.ACCESS_TOKEN);

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
});

client.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    const {response} = error;
    if (response) {
      if (response.status === 401) {
        handleSessionExpired();
      }
      // Reject a structured error so callers can surface proper messages/status
      return Promise.reject({
        statusCode: response.status,
        message: response.data?.message || error.message,
        data: response.data,
      });
    }
    return Promise.reject({
      statusCode: undefined,
      message: error.message,
      data: undefined,
    });
  },
);

export default client;

export const _makeAxiosGetRequest = async (url: string, data: {}) => {
  const getRequest = await client.get(url, {params: data});
  return getRequest;
};

export const _makeAxiosPostRequest = async (
  url: string,
  payload = {},
  contentType = 'multipart/form-data',
) => {
  let headers = {
    'Content-Type': contentType,
  };

  const postRequest = await client.post(url, payload, {headers});
  return postRequest;
};

export const _makeAxiosDeleteRequest = async (url: string, payload = {}) => {
  const postRequest = await client.delete(url, payload);
  return postRequest;
};

export const _makeAxiosPostRequestWithoutAuth = async (
  url: string,
  payload = {},
) => {
  const postRequest = await client.post(url, payload);
  return postRequest;
};

export const _makeAxiosPatchRequest = async (
  url: string,
  payload = {},
  contentType = 'multipart/form-data',
) => {
  let headers = {
    'Content-Type': contentType,
  };

  const postRequest = await client.patch(url, payload, {headers});
  return postRequest;
};
