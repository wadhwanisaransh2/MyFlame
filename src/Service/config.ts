const LOCAL_BACKEND_SERVER_TUSHAR = 'https://szzddvq6-3000.inc1.devtunnels.ms';
const LOCAL_BACKEND_SERVER_NEHA = 'https://kx5pm9ff-3000.inc1.devtunnels.ms';
const DEV_BACKEND = 'https://myflama-backend-api-2march.onrender.com';
const PROD_BACKEND = 'https://backend.myflama.in';

// For Android emulator, 10.0.2.2 points to host machine's localhost
const ServerUrl = 'http://10.0.2.2:3000';
export const BASE_URL = `${ServerUrl}/api/`;
export const SOCKET_URL = ServerUrl;
export const ANDROID_GIPHY_KEY = 'j6Qq42qk4ra1PKm3hu4wUtara7mXep4u';
export const IOS_GIPHY_KEY = 'iybphqSuB4FdMbSRmMy3Ri9RCJkNdLSv';
export const GIF_API_URL = (id: string, apiKey: string) =>
  `https://api.giphy.com/v1/gifs/${id}?api_key=${apiKey}`;
