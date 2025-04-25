// 用户服务
import { baseRequest } from '@/utils/request.js';

// 用户状态存储键
const USER_INFO_KEY = 'user_info';
const LOGIN_TOKEN_KEY = 'login_token';

/**
 * 用户登录
 * @param {Object} data {email, password}
 * @returns {Promise}
 */
export function loginUser(data) {
  // 测试开发阶段可以使用模拟数据
  if (process.env.NODE_ENV === 'development') {
    return new Promise((resolve) => {
      // 模拟登录成功
      setTimeout(() => {
        const mockUser = {
          id: '12345',
          name: '测试用户',
          email: data.email,
          avatar: '',
          phone: '+60123456789'
        };
        
        const mockResponse = {
          success: true,
          token: 'mock-jwt-token',
          user: mockUser
        };
        
        // 保存登录令牌
        uni.setStorageSync(LOGIN_TOKEN_KEY, mockResponse.token);
        // 保存用户信息
        uni.setStorageSync(USER_INFO_KEY, mockResponse.user);
        
        resolve(mockResponse);
      }, 500);
    });
  }
  
  // 真实环境调用API
  return baseRequest('/auth/login', {
    method: 'POST',
    data
  }).then(res => {
    if (res && res.token) {
      // 保存登录令牌
      uni.setStorageSync(LOGIN_TOKEN_KEY, res.token);
      // 保存用户信息
      if (res.user) {
        uni.setStorageSync(USER_INFO_KEY, res.user);
      }
    }
    return res;
  });
}

/**
 * 用户注册
 * @param {Object} data {name, email, password, confirmPassword, phone}
 * @returns {Promise}
 */
export function registerUser(data) {
  return baseRequest('/auth/register', {
    method: 'POST',
    data
  });
}

/**
 * 退出登录
 */
export function logoutUser() {
  uni.removeStorageSync(USER_INFO_KEY);
  uni.removeStorageSync(LOGIN_TOKEN_KEY);
  
  // 可能需要调用后端登出接口
  return baseRequest('/auth/logout', {
    method: 'POST'
  }).catch(err => {
    console.log('Logout API error (may be expected if token is expired):', err);
  }).finally(() => {
    // 无论如何，清除本地状态
    uni.reLaunch({
      url: '/pages/login/login'
    });
  });
}

/**
 * 获取当前登录用户信息
 * @returns {Object|null} 用户信息对象，未登录时返回null
 */
export function getCurrentUser() {
  return uni.getStorageSync(USER_INFO_KEY) || null;
}

/**
 * 更新用户资料
 * @param {Object} data 要更新的用户资料
 * @returns {Promise}
 */
export function updateUserProfile(data) {
  return baseRequest('/user/profile', {
    method: 'PUT',
    data
  }).then(res => {
    if (res) {
      // 更新本地存储的用户信息
      const currentUser = getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...data };
        uni.setStorageSync(USER_INFO_KEY, updatedUser);
      }
    }
    return res;
  });
}

/**
 * 修改密码
 * @param {Object} data {currentPassword, newPassword, confirmNewPassword}
 * @returns {Promise}
 */
export function changePassword(data) {
  return baseRequest('/user/password', {
    method: 'PUT',
    data
  });
}

/**
 * 删除账号
 * @returns {Promise}
 */
export function deleteAccount() {
  return baseRequest('/user/account', {
    method: 'DELETE'
  }).then(res => {
    if (res) {
      // 清除本地存储
      uni.removeStorageSync(USER_INFO_KEY);
      uni.removeStorageSync(LOGIN_TOKEN_KEY);
    }
    return res;
  });
}

/**
 * 请求密码重置链接
 * @param {Object} data {email}
 * @returns {Promise}
 */
export function requestPasswordReset(data) {
  return baseRequest('/auth/password/reset-request', {
    method: 'POST',
    data
  });
}

/**
 * 检查登录状态
 * @returns {Boolean} 是否已登录
 */
export function isLoggedIn() {
  const user = getCurrentUser();
  const token = uni.getStorageSync(LOGIN_TOKEN_KEY);
  return !!user && !!token;
}

export default {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  changePassword,
  deleteAccount,
  requestPasswordReset,
  isLoggedIn
};