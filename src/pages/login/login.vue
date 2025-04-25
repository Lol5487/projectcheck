<template>
  <view class="container">
    <view class="wave-bg"></view>
    
    <view class="login-card">
      <view class="login-header">
        <text class="welcome-title">欢迎回来</text>
        <text class="welcome-subtitle">请登录您的账号</text>
      </view>
      
      <view class="form-container">
        <view class="form-group">
          <text class="form-label">邮箱</text>
          <view class="input-group">
            <input 
              class="input" 
              type="text" 
              v-model="loginForm.email" 
              placeholder="请输入邮箱"
            />
            <text class="input-icon">👤</text>
          </view>
        </view>
        
        <view class="form-group">
          <text class="form-label">密码</text>
          <view class="input-group">
            <input 
              class="input" 
              :type="showPassword ? 'text' : 'password'" 
              v-model="loginForm.password" 
              placeholder="请输入密码"
            />
            <text class="eye-icon" @click="togglePasswordVisibility">{{showPassword ? '👁️' : '🔒'}}</text>
          </view>
        </view>
        
        <view class="remember-forgot">
          <label class="remember-label">
            <checkbox :checked="rememberMe" @click="rememberMe = !rememberMe" color="#1a4b8c" style="transform:scale(0.7)" />
            <text>记住我</text>
          </label>
          <text class="forgot-password" @click="forgotPassword">忘记密码?</text>
        </view>
        
        <view class="error-message" v-if="loginError">{{ loginError }}</view>
        
        <button class="submit-btn" hover-class="btn-hover" @click="handleLogin">登录</button>
        
        <view class="register-link">
          还没有账号? <text class="register-text" @click="goToRegister">立即注册</text>
          <text class="divider-dot">•</text>
          <text class="phone-login-text" @click="goToPhoneLogin">手机验证码登录</text>
        </view>
        
        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">或者</text>
          <view class="divider-line"></view>
        </view>
        
        <button class="phone-btn" @click="goToPhoneLogin">
          <text class="phone-icon">📱</text>
          <text>手机验证码登录</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { registerUser, loginUser } from '@/utils/userService.js';

export default {
  data() {
    return {
      activeTab: 'login',
      loginForm: {
        email: '',
        password: ''
      },
      registerForm: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      loginError: '',
      registerError: '',
      showPassword: false,
      rememberMe: false
    }
  },
  onLoad() {
    // 检查是否有保存的登录信息
    const savedEmail = uni.getStorageSync('rememberedEmail');
    if (savedEmail) {
      this.loginForm.email = savedEmail;
      this.rememberMe = true;
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    forgotPassword() {
      uni.showModal({
        title: '忘记密码',
        content: '请联系管理员或使用注册邮箱重置密码',
        showCancel: false,
        confirmText: '知道了'
      });
    },
    goToRegister() {
      // 跳转到注册页面
      uni.navigateTo({
        url: '/pages/login/register'
      });
    },
    
    goToPhoneLogin() {
      // 跳转到手机验证码登录页面
      uni.navigateTo({
        url: '/pages/login/phone-login'
      });
    },
    async handleLogin() {
      this.loginError = '';
      
      // 验证输入
      if (!this.loginForm.email) {
        this.loginError = '请输入邮箱';
        return;
      }
      
      if (!this.loginForm.password) {
        this.loginError = '请输入密码';
        return;
      }
      
      try {
        const result = await loginUser(this.loginForm.email, this.loginForm.password);
        
        if (result.success) {
          // 保存"记住我"设置
          if (this.rememberMe) {
            uni.setStorageSync('rememberedEmail', this.loginForm.email);
          } else {
            uni.removeStorageSync('rememberedEmail');
          }
          
          // 登录成功，跳转到首页
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          });
          
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/index/index'
            });
          }, 1000);
        } else {
          this.loginError = result.message || '登录失败，请重试';
        }
      } catch (error) {
        this.loginError = '登录失败，请重试';
      }
    },
    
    loginWithWhatsApp() {
      // 这里实现WhatsApp登录逻辑
      uni.showToast({
        title: '正在连接WhatsApp...',
        icon: 'none',
        duration: 2000
      });
      
      // 模拟成功登录，实际实现时需集成WhatsApp的API
      setTimeout(() => {
        uni.showToast({
          title: 'WhatsApp登录成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/index/index'
          });
        }, 1000);
      }, 2000);
    },
    validateEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a4b8c 0%, #0d2d62 100%);
  overflow: hidden;
}

/* 手机验证码登录按钮样式 */
.phone-btn {
  width: 100%;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3498db;
  color: white;
  font-size: 30rpx;
  border-radius: 8rpx;
  border: none;
  margin-top: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(52, 152, 219, 0.3);
  transition: all 0.3s;
  position: relative;
  padding: 0;
}

.phone-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(52, 152, 219, 0.3);
  opacity: 0.9;
}

.phone-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.divider-dot {
  margin: 0 10rpx;
  color: #999;
}

.phone-login-text {
  color: #1a4b8c;
}


.wave-bg {
  position: absolute;
  bottom: -100rpx;
  left: -10%;
  width: 120%;
  height: 300rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50% 50% 0 0;
}

.login-card {
  width: 80%;
  max-width: 700rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.15);
  padding: 60rpx 40rpx;
  position: relative;
  z-index: 10;
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.login-header {
  text-align: center;
  margin-bottom: 50rpx;
}

.welcome-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.welcome-subtitle {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.form-container {
  width: 100%;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 20rpx;
  background-color: #f8f8f8;
  transition: all 0.3s;
}

.input-group:focus-within {
  border-color: #1a4b8c;
  box-shadow: 0 0 0 2rpx rgba(26, 75, 140, 0.1);
  background-color: #ffffff;
}

.input {
  flex: 1;
  height: 80rpx;
  font-size: 28rpx;
  background-color: transparent;
  border: none;
  padding: 0;
  color: #333;
}

.input-icon, .eye-icon {
  font-size: 32rpx;
  color: #999;
  padding: 10rpx;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  font-size: 24rpx;
}

.remember-label {
  display: flex;
  align-items: center;
  color: #666;
}

.forgot-password {
  color: #1a4b8c;
}

.error-message {
  color: #ff5252;
  font-size: 24rpx;
  margin-bottom: 20rpx;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5rpx); }
  20%, 40%, 60%, 80% { transform: translateX(5rpx); }
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
  color: white;
  font-size: 32rpx;
  border-radius: 8rpx;
  margin-top: 20rpx;
  box-shadow: 0 6rpx 20rpx rgba(13, 45, 98, 0.3);
  transition: all 0.3s;
  border: none;
}

.btn-hover {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 10rpx rgba(13, 45, 98, 0.3);
  opacity: 0.9;
}

.register-link {
  text-align: center;
  margin-top: 40rpx;
  font-size: 26rpx;
  color: #666;
}

.register-text {
  color: #1a4b8c;
  font-weight: bold;
}

/* 分隔线样式 */
.divider {
  display: flex;
  align-items: center;
  margin: 40rpx 0 30rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background-color: #e0e0e0;
}

.divider-text {
  padding: 0 20rpx;
  font-size: 24rpx;
  color: #999;
}
</style>