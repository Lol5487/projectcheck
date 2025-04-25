/**
 * API服务 - 用于与后端API通信
 */

// 设置API基础URL
const API_URL = 'http://localhost:3000/api';

/**
 * 获取存储在localStorage中的令牌
 * @returns {string|null} 返回令牌或null
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * 设置令牌到localStorage
 * @param {string} token JWT令牌
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * 移除localStorage中的令牌
 */
export const removeToken = () => {
  localStorage.removeItem('token');
};

/**
 * 设置Authorization头部
 * @returns {Object} 包含Authorization头的对象
 */
export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * 用户注册
 * @param {Object} userData 包含username、email和password的对象
 * @returns {Promise<Object>} 包含用户信息和令牌的响应
 */
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '注册失败');
    }
    
    // 保存令牌到localStorage
    if (data.token) {
      setToken(data.token);
    }
    
    return data;
  } catch (error) {
    console.error('注册错误:', error);
    throw error;
  }
};

/**
 * 用户登录
 * @param {Object} credentials 包含email和password的对象
 * @returns {Promise<Object>} 包含用户信息和令牌的响应
 */
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '登录失败');
    }
    
    // 保存令牌到localStorage
    if (data.token) {
      setToken(data.token);
    }
    
    return data;
  } catch (error) {
    console.error('登录错误:', error);
    throw error;
  }
};

/**
 * 获取当前用户信息
 * @returns {Promise<Object>} 当前用户信息
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        ...authHeader(),
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '获取用户信息失败');
    }
    
    return data.user;
  } catch (error) {
    console.error('获取用户信息错误:', error);
    throw error;
  }
};

/**
 * 退出登录
 */
export const logout = () => {
  removeToken();
};

/**
 * 获取所有笔记
 * @returns {Promise<Array>} 笔记列表
 */
export const getNotes = async () => {
  try {
    const response = await fetch(`${API_URL}/notes`, {
      headers: {
        ...authHeader(),
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '获取笔记失败');
    }
    
    return data.notes;
  } catch (error) {
    console.error('获取笔记错误:', error);
    throw error;
  }
};

/**
 * 获取单个笔记
 * @param {string} id 笔记ID
 * @returns {Promise<Object>} 笔记对象
 */
export const getNote = async (id) => {
  try {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      headers: {
        ...authHeader(),
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '获取笔记失败');
    }
    
    return data.note;
  } catch (error) {
    console.error('获取笔记错误:', error);
    throw error;
  }
};

/**
 * 创建笔记
 * @param {Object} noteData 笔记数据
 * @returns {Promise<Object>} 创建的笔记
 */
export const createNote = async (noteData) => {
  try {
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(noteData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '创建笔记失败');
    }
    
    return data.note;
  } catch (error) {
    console.error('创建笔记错误:', error);
    throw error;
  }
};

/**
 * 更新笔记
 * @param {string} id 笔记ID
 * @param {Object} noteData 更新的笔记数据
 * @returns {Promise<Object>} 更新后的笔记
 */
export const updateNote = async (id, noteData) => {
  try {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(noteData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '更新笔记失败');
    }
    
    return data.note;
  } catch (error) {
    console.error('更新笔记错误:', error);
    throw error;
  }
};

/**
 * 删除笔记
 * @param {string} id 笔记ID
 * @returns {Promise<Object>} 成功信息
 */
export const deleteNote = async (id) => {
  try {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        ...authHeader(),
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '删除笔记失败');
    }
    
    return data;
  } catch (error) {
    console.error('删除笔记错误:', error);
    throw error;
  }
};

/**
 * 添加进度事件
 * @param {string} noteId 笔记ID
 * @param {Object} eventData 事件数据
 * @returns {Promise<Object>} 包含事件和更新的笔记
 */
export const addProgressEvent = async (noteId, eventData) => {
  try {
    const response = await fetch(`${API_URL}/notes/${noteId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(eventData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '添加事件失败');
    }
    
    return { success: true, note: data.note, event: data.event };
  } catch (error) {
    console.error('添加事件错误:', error);
    return { success: false, message: error.message };
  }
};

/**
 * 更新进度事件
 * @param {string} noteId 笔记ID
 * @param {string} eventId 事件ID
 * @param {Object} eventData 更新的事件数据
 * @returns {Promise<Object>} 包含事件和更新的笔记
 */
export const updateProgressEvent = async (noteId, eventId, eventData) => {
  try {
    const response = await fetch(`${API_URL}/notes/${noteId}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(eventData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '更新事件失败');
    }
    
    return { success: true, note: data.note, event: data.event };
  } catch (error) {
    console.error('更新事件错误:', error);
    return { success: false, message: error.message };
  }
};

/**
 * 删除进度事件
 * @param {string} noteId 笔记ID
 * @param {string} eventId 事件ID
 * @returns {Promise<Object>} 成功信息和更新的笔记
 */
export const deleteProgressEvent = async (noteId, eventId) => {
  try {
    const response = await fetch(`${API_URL}/notes/${noteId}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        ...authHeader(),
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '删除事件失败');
    }
    
    return { success: true, note: data.note };
  } catch (error) {
    console.error('删除事件错误:', error);
    return { success: false, message: error.message };
  }
};