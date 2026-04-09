import axios from 'axios'
import router from '@/router'
import { Message } from 'element-ui'
import StorageUtil from './storage'

// 核心修复：本地开发走 /api 代理，生产环境直接走域名（适配APK）
const service = axios.create({
  // 本地：/api → 代理到https://qguom.youtekeji.com；生产：直接用域名
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://qguom.youtekeji.com/api'
    : '/api',
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  },
  withCredentials: false
})

// 以下token逻辑保留不变...
let tokenCache = null;
if (window.tokenCache) {
  tokenCache = window.tokenCache;
} else {
  const storedToken = StorageUtil.getItemSync('token');
  if (storedToken) {
    tokenCache = storedToken;
    window.tokenCache = storedToken;
  } else {
    window.tokenCache = null;
  }
}

export function setTokenCache(token) {
  tokenCache = token;
  window.tokenCache = token;
  if (token) StorageUtil.setItem('token', token);
  else StorageUtil.removeItem('token');
}

service.interceptors.request.use(
  config => {
    let effectiveToken = tokenCache || window.tokenCache || StorageUtil.getItemSync('token');
    if (effectiveToken) {
      tokenCache = effectiveToken;
      window.tokenCache = effectiveToken;
      config.headers['Authorization'] = `Bearer ${effectiveToken}`;
      config.headers['token'] = effectiveToken;
    }
    // console.log('请求配置：', config);
    return config;
  },
  error => { return Promise.reject(error); }
)

service.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.code !== 200 && res.code !== "0000") {
      Message.error(res.message || res.msg || '请求失败');
      return Promise.reject(res);
    }
    return res;
  },
  error => {
    if (error.response?.status === 401 || error.response?.data?.code === 401) {
      tokenCache = null;
      window.tokenCache = null;
      StorageUtil.removeItem('token');
      if (router.currentRoute.path !== '/login') {
        Message.error('登录过期，请重新登录');
        setTimeout(() => router.push('/login'), 300);
      }
    } else if (error.response) {
      Message.error(error.response.data?.message || `服务器错误[${error.response.status}]`);
    } else {
      // setTimeout(() => router.push('/login'), 300);
      Message.error('网络异常，请检查网络或后端配置');
    }
    // setTimeout(() => router.push('/login'), 300);
    return Promise.reject(error);
  }
)

export default service;
