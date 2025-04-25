// 网络请求工具

// API基础URL，根据环境配置
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api' 
  : 'https://api.noteapp.com/api';

// 请求超时时间 (ms)
const TIMEOUT = 30000;

// 登录令牌存储键
const LOGIN_TOKEN_KEY = 'login_token';

/**
 * 基础请求函数
 * @param {String} url 请求路径
 * @param {Object} options 请求选项
 * @returns {Promise} 请求结果Promise
 */
export function baseRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    // 构建完整URL
    const fullUrl = /^(http|https):\/\//.test(url) ? url : BASE_URL + url;
    
    // 获取登录令牌
    const token = uni.getStorageSync(LOGIN_TOKEN_KEY);
    
    // 默认headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // 如果有登录令牌，添加到请求头
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 请求配置
    const requestOptions = {
      url: fullUrl,
      header: headers,
      timeout: TIMEOUT,
      method: options.method || 'GET',
      dataType: 'json',
      ...options
    };
    
    // 特殊处理POST、PUT请求中的data
    if (['POST', 'PUT'].includes(requestOptions.method) && options.data) {
      if (headers['Content-Type'].includes('application/json')) {
        requestOptions.data = JSON.stringify(options.data);
      } else {
        requestOptions.data = options.data;
      }
    }
    
    // 发起请求
    uni.request({
      ...requestOptions,
      success: (response) => {
        const { statusCode, data } = response;
        
        // 处理HTTP状态码
        if (statusCode >= 200 && statusCode < 300) {
          resolve(data);
        } else if (statusCode === 401) {
          // 未授权，可能是令牌失效
          uni.removeStorageSync(LOGIN_TOKEN_KEY);
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          
          // 跳转到登录页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }, 1500);
          
          reject({ code: statusCode, message: '登录已过期' });
        } else {
          // 其他错误
          const errorMsg = data && data.message ? data.message : '请求失败';
          uni.showToast({
            title: errorMsg,
            icon: 'none'
          });
          reject({ 
            code: statusCode,
            message: errorMsg,
            data
          });
        }
      },
      fail: (error) => {
        console.error('Request failed:', error);
        const errorMsg = '网络请求失败，请检查您的网络连接';
        uni.showToast({
          title: errorMsg,
          icon: 'none'
        });
        reject({ 
          code: -1, 
          message: errorMsg,
          error
        });
      }
    });
  });
}

/**
 * GET请求
 * @param {String} url 请求路径
 * @param {Object} params 查询参数
 * @param {Object} options 其他请求选项
 * @returns {Promise}
 */
export function get(url, params = {}, options = {}) {
  // 构建查询字符串
  let queryString = '';
  if (Object.keys(params).length > 0) {
    queryString = '?' + Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }
  
  return baseRequest(url + queryString, {
    method: 'GET',
    ...options
  });
}

/**
 * POST请求
 * @param {String} url 请求路径
 * @param {Object} data 请求数据
 * @param {Object} options 其他请求选项
 * @returns {Promise}
 */
export function post(url, data = {}, options = {}) {
  return baseRequest(url, {
    method: 'POST',
    data,
    ...options
  });
}

/**
 * PUT请求
 * @param {String} url 请求路径
 * @param {Object} data 请求数据
 * @param {Object} options 其他请求选项
 * @returns {Promise}
 */
export function put(url, data = {}, options = {}) {
  return baseRequest(url, {
    method: 'PUT',
    data,
    ...options
  });
}

/**
 * DELETE请求
 * @param {String} url 请求路径
 * @param {Object} params 查询参数
 * @param {Object} options 其他请求选项
 * @returns {Promise}
 */
export function del(url, params = {}, options = {}) {
  // 构建查询字符串
  let queryString = '';
  if (Object.keys(params).length > 0) {
    queryString = '?' + Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }
  
  return baseRequest(url + queryString, {
    method: 'DELETE',
    ...options
  });
}

/**
 * 上传文件
 * @param {String} url 上传路径
 * @param {String} filePath 文件路径
 * @param {String} name 文件字段名
 * @param {Object} formData 附加表单数据
 * @param {Object} options 其他请求选项
 * @returns {Promise}
 */
export function uploadFile(url, filePath, name = 'file', formData = {}, options = {}) {
  return new Promise((resolve, reject) => {
    // 构建完整URL
    const fullUrl = /^(http|https):\/\//.test(url) ? url : BASE_URL + url;
    
    // 获取登录令牌
    const token = uni.getStorageSync(LOGIN_TOKEN_KEY);
    
    // 默认headers
    const header = {
      ...options.header
    };
    
    // 如果有登录令牌，添加到请求头
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }
    
    // 发起上传请求
    const uploadTask = uni.uploadFile({
      url: fullUrl,
      filePath,
      name,
      formData,
      header,
      success: (response) => {
        const statusCode = response.statusCode;
        let responseData;
        
        try {
          responseData = JSON.parse(response.data);
        } catch (e) {
          responseData = response.data;
        }
        
        if (statusCode >= 200 && statusCode < 300) {
          resolve(responseData);
        } else if (statusCode === 401) {
          // 未授权，可能是令牌失效
          uni.removeStorageSync(LOGIN_TOKEN_KEY);
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          
          // 跳转到登录页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }, 1500);
          
          reject({ code: statusCode, message: '登录已过期' });
        } else {
          // 其他错误
          const errorMsg = responseData && responseData.message ? responseData.message : '上传失败';
          uni.showToast({
            title: errorMsg,
            icon: 'none'
          });
          reject({ 
            code: statusCode,
            message: errorMsg,
            data: responseData
          });
        }
      },
      fail: (error) => {
        console.error('Upload failed:', error);
        const errorMsg = '文件上传失败，请重试';
        uni.showToast({
          title: errorMsg,
          icon: 'none'
        });
        reject({ 
          code: -1, 
          message: errorMsg,
          error
        });
      }
    });
    
    // 返回上传任务，可用于监听进度
    if (options.onProgressUpdate) {
      uploadTask.onProgressUpdate(options.onProgressUpdate);
    }
  });
}

export default {
  baseRequest,
  get,
  post,
  put,
  del,
  uploadFile
};