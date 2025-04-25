import { v4 as uuidv4 } from 'uuid';

// 模拟服务器API，实际项目中应替换为后端API调用
const API_BASE_URL = 'https://api.example.com';
let isLocal = true; // 是否使用本地存储模拟服务器

// 用户数据本地存储
function saveUsersToLocal(users) {
  uni.setStorageSync('users', users);
}

function getUsersFromLocal() {
  return uni.getStorageSync('users') || [];
}

// 当前登录用户
function saveCurrentUser(user) {
  uni.setStorageSync('currentUser', user);
}

export function getCurrentUser() {
  return uni.getStorageSync('currentUser');
}

// 用户注册
export async function registerUser(userData) {
  if (isLocal) {
    const users = getUsersFromLocal();
    const existingUser = users.find(u => u.email === userData.email);
    
    if (existingUser) {
      return { success: false, message: '该邮箱已被注册' };
    }
    
    const newUser = {
      id: uuidv4(),
      name: userData.name,
      email: userData.email,
      password: userData.password, // 实际项目中应加密存储
      avatar: userData.avatar || '',
      createdAt: new Date().toISOString(),
      teams: []
    };
    
    users.push(newUser);
    saveUsersToLocal(users);
    
    // 注册后自动登录
    const { password, ...safeUserData } = newUser;
    saveCurrentUser(safeUserData);
    
    return { success: true, user: safeUserData };
  } else {
    try {
      const response = await uni.request({
        url: `${API_BASE_URL}/users/register`,
        method: 'POST',
        data: userData
      });
      
      const result = response.data;
      if (result.success) {
        saveCurrentUser(result.user);
      }
      return result;
    } catch (error) {
      return { success: false, message: '注册失败，请重试' };
    }
  }
}

// 用户登录
export async function loginUser(email, password) {
  if (isLocal) {
    const users = getUsersFromLocal();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { success: false, message: '邮箱或密码错误' };
    }
    
    // 不返回密码
    const { password: pwd, ...safeUserData } = user;
    saveCurrentUser(safeUserData);
    
    return { success: true, user: safeUserData };
  } else {
    try {
      const response = await uni.request({
        url: `${API_BASE_URL}/users/login`,
        method: 'POST',
        data: { email, password }
      });
      
      const result = response.data;
      if (result.success) {
        saveCurrentUser(result.user);
      }
      return result;
    } catch (error) {
      return { success: false, message: '登录失败，请重试' };
    }
  }
}

// 用户登出
export function logoutUser() {
  uni.removeStorageSync('currentUser');
  return { success: true };
}

// 更新用户信息
export async function updateUserProfile(userData) {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return { success: false, message: '用户未登录' };
  }
  
  if (isLocal) {
    const users = getUsersFromLocal();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
      return { success: false, message: '用户不存在' };
    }
    
    // 保留密码字段
    const password = users[userIndex].password;
    users[userIndex] = { ...users[userIndex], ...userData, password };
    saveUsersToLocal(users);
    
    // 更新当前用户信息
    saveCurrentUser(users[userIndex]);
    
    return { success: true, user: users[userIndex] };
  } else {
    try {
      const response = await uni.request({
        url: `${API_BASE_URL}/users/${currentUser.id}`,
        method: 'PUT',
        data: userData
      });
      
      const result = response.data;
      if (result.success) {
        saveCurrentUser(result.user);
      }
      return result;
    } catch (error) {
      return { success: false, message: '更新失败，请重试' };
    }
  }
}

// 获取用户列表（用于共享和团队添加成员）
export async function getUsers(searchTerm = '') {
  if (isLocal) {
    const users = getUsersFromLocal();
    const currentUser = getCurrentUser();
    
    // 过滤掉当前用户，并根据搜索词筛选
    const filteredUsers = users
      .filter(u => u.id !== currentUser.id)
      .filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(({ password, ...user }) => user); // 不返回密码
    
    return { success: true, users: filteredUsers };
  } else {
    try {
      const response = await uni.request({
        url: `${API_BASE_URL}/users?search=${searchTerm}`,
        method: 'GET'
      });
      
      return response.data;
    } catch (error) {
      return { success: false, message: '获取用户列表失败', users: [] };
    }
  }
}

// 检查用户是否登录
export function isLoggedIn() {
  return !!getCurrentUser();
}

// 修改密码
export async function changePassword(userId, currentPassword, newPassword) {
  if (isLocal) {
    const users = getUsersFromLocal();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return { success: false, message: '用户不存在' };
    }
    
    // 验证当前密码
    if (users[userIndex].password !== currentPassword) {
      return { success: false, message: '当前密码错误' };
    }
    
    // 更新密码
    users[userIndex].password = newPassword;
    saveUsersToLocal(users);
    
    return { success: true, message: '密码修改成功' };
  } else {
    try {
      const response = await uni.request({
        url: `${API_BASE_URL}/users/change-password`,
        method: 'POST',
        data: { userId, currentPassword, newPassword }
      });
      
      return response.data;
    } catch (error) {
      return { success: false, message: '修改密码失败，请重试' };
    }
  }
}

// 手机验证码相关方法

// 存储验证码
 function saveVerificationCode(phone, code) {
  const codes = uni.getStorageSync('verification_codes') || {};
  codes[phone] = {
    code,
    timestamp: Date.now(),
    attempts: 0
  };
  uni.setStorageSync('verification_codes', codes);
}

// 验证手机验证码
async function verifyCode(phone, code) {
  const codes = uni.getStorageSync('verification_codes') || {};
  const codeData = codes[phone];
  
  if (!codeData) {
    return { success: false, message: '验证码不存在或已过期' };
  }
  
  // 验证码过期时间设置为10分钟
  const expiryTime = 10 * 60 * 1000;
  const isExpired = (Date.now() - codeData.timestamp) > expiryTime;
  
  if (isExpired) {
    // 删除过期验证码
    delete codes[phone];
    uni.setStorageSync('verification_codes', codes);
    return { success: false, message: '验证码已过期' };
  }
  
  // 记录验证尝试次数
  codeData.attempts += 1;
  codes[phone] = codeData;
  uni.setStorageSync('verification_codes', codes);
  
  // 超过5次尝试，验证码失效
  if (codeData.attempts > 5) {
    delete codes[phone];
    uni.setStorageSync('verification_codes', codes);
    return { success: false, message: '验证码尝试次数过多，请重新获取' };
  }
  
  // 验证码比对
  if (codeData.code === code) {
    // 验证通过后删除验证码
    delete codes[phone];
    uni.setStorageSync('verification_codes', codes);
    return { success: true };
  } else {
    return { success: false, message: '验证码错误' };
  }
}

// 生成随机验证码
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 发送手机验证码
export async function sendPhoneVerificationCode(phone) {
  // 确保电话号码有正确的+60前缀
  if (!phone.startsWith('+60')) {
    phone = '+60' + phone;
  }
  
  if (isLocal) {
    // 生成验证码
    const code = generateVerificationCode();
    
    // 存储验证码
    saveVerificationCode(phone, code);
    
    console.log(`发送验证码到${phone}: ${code}`);
    return { success: true };
  } else {
    try {
      // 实际API调用，这里仅为示例
      const response = await uni.request({
        url: `${API_BASE_URL}/auth/send-code`,
        method: 'POST',
        data: { phone }
      });
      
      return response.data;
    } catch (error) {
      return { success: false, message: '发送验证码失败，请重试' };
    }
  }
}

// 使用手机号和验证码登录
export async function loginWithPhoneCode(phone, code) {
  // 确保电话号码有正确的+60前缀
  if (!phone.startsWith('+60')) {
    phone = '+60' + phone;
  }
  
  if (isLocal) {
    // 验证码验证
    const verifyResult = await verifyCode(phone, code);
    if (!verifyResult.success) {
      return verifyResult;
    }
    
    // 检查用户是否存在
    let users = getUsersFromLocal();
    let user = users.find(u => u.phone === phone);
    
    // 如果用户不存在，创建新用户
    if (!user) {
      const newUser = {
        id: uuidv4(),
        phone: phone,
        name: `用户${phone.substr(phone.length - 4)}`,
        email: '',
        createdAt: new Date().toISOString(),
        teams: []
      };
      
      users.push(newUser);
      saveUsersToLocal(users);
      user = newUser;
    }
    
    // 将用户设置为当前登录用户
    saveCurrentUser(user);
    
    return { success: true, user: user };
  } else {
    try {
      // 实际API调用
      const response = await uni.request({
        url: `${API_BASE_URL}/auth/login-with-phone`,
        method: 'POST',
        data: { phone, code }
      });
      
      const result = response.data;
      if (result.success) {
        saveCurrentUser(result.user);
      }
      return result;
    } catch (error) {
      return { success: false, message: '登录失败，请重试' };
    }
  }
}

// 验证会话状态并重定向到登录页（页面守卫）
export function checkAuth() {
  if (!isLoggedIn()) {
    uni.redirectTo({
      url: '/pages/login/login'
    });
    return false;
  }
  return true;
}

// 获取团队成员
export async function getTeamMembers(teamId) {
  if (isLocal) {
    const users = getUsersFromLocal();
    const team = getTeamById(teamId);
    
    if (!team) {
      return { success: false, message: '团队不存在', members: [] };
    }
    
    const members = team.members.map(memberId => {
      const user = users.find(u => u.id === memberId);
      if (user) {
        const { password, ...safeUser } = user;
        return { ...safeUser, role: team.roles[memberId] || 'member' };
      }
      return null;
    }).filter(Boolean);
    
    return { success: true, members };
  } else {
    try {
      const response = await uni.request({
        url: `${API_BASE_URL}/teams/${teamId}/members`,
        method: 'GET'
      });
      
      return response.data;
    } catch (error) {
      return { success: false, message: '获取团队成员失败', members: [] };
    }
  }
}

// 获取用户团队列表
export function getUserTeams() {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return { success: false, message: '用户未登录', teams: [] };
  }
  
  if (isLocal) {
    const teams = getTeamsFromLocal();
    const userTeams = teams.filter(team => 
      team.members.includes(currentUser.id)
    );
    
    return { success: true, teams: userTeams };
  } else {
    // 实际API调用
    return { success: false, message: '暂未实现', teams: [] };
  }
}

// 创建团队
export async function createTeam(teamData) {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return { success: false, message: '用户未登录' };
  }
  
  const newTeam = {
    id: uuidv4(),
    name: teamData.name,
    description: teamData.description || '',
    createdAt: new Date().toISOString(),
    createdBy: currentUser.id,
    members: [currentUser.id],
    roles: {
      [currentUser.id]: 'admin' // 创建者为管理员
    },
    notes: []
  };
  
  if (isLocal) {
    // 本地存储团队
    const teams = getTeamsFromLocal();
    teams.push(newTeam);
    saveTeamsToLocal(teams);
    
    // 更新用户的团队关联
    updateUserTeams(currentUser.id, [...(currentUser.teams || []), newTeam.id]);
    
    return { success: true, team: newTeam };
  } else {
    // 实际API调用
    return { success: false, message: '暂未实现', team: null };
  }
}

function getTeamsFromLocal() {
  return uni.getStorageSync('teams') || [];
}

function saveTeamsToLocal(teams) {
  uni.setStorageSync('teams', teams);
}

function getTeamById(teamId) {
  const teams = getTeamsFromLocal();
  return teams.find(t => t.id === teamId);
}

function updateUserTeams(userId, teamIds) {
  const users = getUsersFromLocal();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex].teams = teamIds;
    saveUsersToLocal(users);
  }
} 