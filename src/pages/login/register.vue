<template>
    <view class="container">
      <view class="wave-bg"></view>
      
      <view class="register-card">
        <view class="register-header">
          <text class="welcome-title">创建账号</text>
          <text class="welcome-subtitle">加入我们的笔记社区</text>
        </view>
        
        <view class="form-container">
          <view class="form-group">
            <text class="form-label">姓名</text>
            <view class="input-group">
              <input 
                class="input" 
                type="text" 
                v-model="registerForm.name" 
                placeholder="请输入您的姓名"
              />
              <text class="input-icon">👤</text>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">邮箱</text>
            <view class="input-group">
              <input 
                class="input" 
                type="text" 
                v-model="registerForm.email" 
                placeholder="请输入您的邮箱"
              />
              <text class="input-icon">✉️</text>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">密码</text>
            <view class="input-group">
              <input 
                class="input" 
                :type="showPassword ? 'text' : 'password'" 
                v-model="registerForm.password" 
                placeholder="请输入密码"
              />
              <text class="eye-icon" @click="togglePasswordVisibility">{{showPassword ? '👁️' : '🔒'}}</text>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">确认密码</text>
            <view class="input-group">
              <input 
                class="input" 
                :type="showPassword ? 'text' : 'password'" 
                v-model="registerForm.confirmPassword" 
                placeholder="请再次输入密码"
              />
              <text class="eye-icon" @click="togglePasswordVisibility">{{showPassword ? '👁️' : '🔒'}}</text>
            </view>
          </view>
          
          <view class="error-message" v-if="registerError">{{ registerError }}</view>
          
          <button class="submit-btn" hover-class="btn-hover" @click="handleRegister" :disabled="isRegistering">
            <text v-if="!isRegistering">注册</text>
            <text v-else>注册中...</text>
          </button>
          
          <view class="login-link">
            已有账号? <text class="login-text" @click="goToLogin">立即登录</text>
          </view>
        </view>
      </view>
    </view>
  </template>
  
  <script>
  import { registerUser } from '@/utils/userService.js';
  
  export default {
    data() {
      return {
        registerForm: {
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        },
        registerError: '',
        showPassword: false,
        isRegistering: false
      }
    },
    methods: {
      togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
      },
      goToLogin() {
        uni.navigateBack();
      },
      async handleRegister() {
        this.registerError = '';
        
        // 验证输入
        if (!this.registerForm.name) {
          this.registerError = '请输入姓名';
          return;
        }
        
        if (!this.registerForm.email) {
          this.registerError = '请输入邮箱';
          return;
        }
        
        if (!this.validateEmail(this.registerForm.email)) {
          this.registerError = '请输入有效的邮箱地址';
          return;
        }
        
        if (!this.registerForm.password) {
          this.registerError = '请输入密码';
          return;
        }
        
        if (this.registerForm.password.length < 6) {
          this.registerError = '密码长度至少为6位';
          return;
        }
        
        if (this.registerForm.password !== this.registerForm.confirmPassword) {
          this.registerError = '两次输入的密码不一致';
          return;
        }
        
        // 设置注册中状态
        this.isRegistering = true;
        
        try {
          const result = await registerUser({
            name: this.registerForm.name,
            email: this.registerForm.email,
            password: this.registerForm.password,
          });
          
          if (result.success) {
            // 注册成功，显示提示并跳转
            uni.showToast({
              title: '注册成功',
              icon: 'success'
            });
            
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index'
              });
            }, 1500);
          } else {
            this.registerError = result.message || '注册失败，请重试';
          }
        } catch (error) {
          console.error('注册异常:', error);
          this.registerError = '注册时出现异常，请重试';
        } finally {
          // 无论成功失败，重置注册状态
          this.isRegistering = false;
        }
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
  
  .wave-bg {
    position: absolute;
    bottom: -100rpx;
    left: -10%;
    width: 120%;
    height: 300rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50% 50% 0 0;
  }
  
  .register-card {
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
  
  .register-header {
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
  
  .eye-icon {
    cursor: pointer;
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
  
  .submit-btn[disabled] {
    background: linear-gradient(45deg, #3e5c86, #6185b5);
    box-shadow: none;
    opacity: 0.7;
  }
  
  .login-link {
    text-align: center;
    margin-top: 40rpx;
    font-size: 26rpx;
    color: #666;
  }
  
  .login-text {
    color: #1a4b8c;
    font-weight: bold;
  }
  </style>