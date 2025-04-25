<template>
  <view class="container">
    <view class="wave-bg"></view>
    
    <view class="login-card">
      <view class="login-header">
        <text class="welcome-title">手机验证登录</text>
        <text class="welcome-subtitle">请输入您的手机号码</text>
      </view>
      
      <view class="form-container">
        <view class="form-group">
          <text class="form-label">手机号码</text>
          <view class="input-group">
            <text class="phone-prefix">+60</text>
            <input 
              class="input phone-input" 
              type="number" 
              v-model="phoneNumber" 
              placeholder="请输入手机号码"
              maxlength="11"
            />
            <text class="input-icon">📱</text>
          </view>
        </view>
        
        <view class="form-group">
          <text class="form-label">验证码</text>
          <view class="code-group">
            <view class="input-group code-input-group">
              <input 
                class="input" 
                type="number" 
                v-model="verificationCode" 
                placeholder="请输入验证码"
                maxlength="6"
              />
              <text class="input-icon">🔢</text>
            </view>
            <button 
              class="send-code-btn" 
              :disabled="isSending || !isValidPhone" 
              @click="sendVerificationCode"
            >
              {{ isSending ? `${countdown}s` : '发送验证码' }}
            </button>
          </view>
        </view>
        
        <view class="error-message" v-if="loginError">{{ loginError }}</view>
        
        <button class="submit-btn" hover-class="btn-hover" @click="handleLogin" :disabled="!canLogin">登录</button>
        
        <view class="register-link">
          <text class="back-text" @click="goToPasswordLogin">使用密码登录</text>
          <text class="divider-dot">•</text>
          <text class="register-text" @click="goToRegister">立即注册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { loginWithPhoneCode, sendPhoneVerificationCode } from '@/utils/userService.js';

export default {
  data() {
    return {
      phoneNumber: '',
      verificationCode: '',
      loginError: '',
      isSending: false,
      countdown: 60
    }
  },
  computed: {
    isValidPhone() {
      return /^\d{8,11}$/.test(this.phoneNumber);
    },
    canLogin() {
      return this.isValidPhone && this.verificationCode.length === 6;
    }
  },
  methods: {
    // 发送验证码
    async sendVerificationCode() {
      if (!this.isValidPhone) {
        this.loginError = '请输入正确的手机号码';
        return;
      }
      
      this.isSending = true;
      this.startCountdown();
      
      try {
        // 调用API发送验证码
        const result = await this.callSendCodeAPI();
        
        if (result.success) {
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          });
        } else {
          this.loginError = result.message || '发送验证码失败';
          // 如果发送失败，重置倒计时
          this.isSending = false;
          this.countdown = 60;
          clearInterval(this.timer);
        }
      } catch (error) {
        this.loginError = '发送验证码失败，请重试';
        this.isSending = false;
        this.countdown = 60;
        clearInterval(this.timer);
      }
    },
    
    // 验证码倒计时
    startCountdown() {
      // 清除可能存在的旧定时器
      if (this.timer) {
        clearInterval(this.timer);
      }
      
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          clearInterval(this.timer);
          this.isSending = false;
          this.countdown = 60;
        }
      }, 1000);
    },
    
    // 调用发送验证码API
    async callSendCodeAPI() {
      try {
        const result = await sendPhoneVerificationCode(this.phoneNumber);
        return result;
      } catch (error) {
        console.error('发送验证码失败:', error);
        return { success: false, message: '发送验证码失败' };
      }
    },
    
    // 处理登录
    async handleLogin() {
      if (!this.isValidPhone) {
        this.loginError = '请输入正确的手机号码';
        return;
      }
      
      if (!this.verificationCode || this.verificationCode.length !== 6) {
        this.loginError = '请输入6位验证码';
        return;
      }
      
      try {
        // 调用登录API验证手机号和验证码
        const result = await loginWithPhoneCode(this.phoneNumber, this.verificationCode);
        
        if (result.success) {
          // 登录成功，保存用户信息并跳转
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
          this.loginError = result.message || '验证码错误';
        }
      } catch (error) {
        this.loginError = '登录失败，请重试';
      }
    },
    
    // 跳转到密码登录
    goToPasswordLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    },
    
    // 跳转到注册页面
    goToRegister() {
      uni.navigateTo({
        url: '/pages/login/register'
      });
    }
  },
  // 在组件销毁时清除定时器
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
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

.phone-prefix {
  font-size: 28rpx;
  color: #666;
  margin-right: 8rpx;
  padding: 0 8rpx;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 4rpx;
  line-height: 80rpx;
}

.phone-input {
  padding-left: 8rpx;
}

.input-icon {
  font-size: 32rpx;
  color: #999;
  padding: 10rpx;
}

.code-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.code-input-group {
  flex: 1;
  margin-right: 20rpx;
}

.send-code-btn {
  width: 220rpx;
  height: 84rpx;
  line-height: 84rpx;
  text-align: center;
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
  color: white;
  font-size: 26rpx;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 10rpx rgba(13, 45, 98, 0.3);
  border: none;
  padding: 0;
  margin: 0;
}

.send-code-btn[disabled] {
  background: linear-gradient(45deg, #3e5c86, #6185b5);
  opacity: 0.7;
  color: rgba(255, 255, 255, 0.8);
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

.submit-btn[disabled] {
  background: linear-gradient(45deg, #3e5c86, #6185b5);
  opacity: 0.7;
}

.btn-hover {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 10rpx rgba(13, 45, 98, 0.3);
  opacity: 0.9;
}

.register-link {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40rpx;
  font-size: 26rpx;
  color: #666;
}

.register-text {
  color: #1a4b8c;
  font-weight: bold;
}

.back-text {
  color: #1a4b8c;
}

.divider-dot {
  margin: 0 10rpx;
  color: #999;
}
</style>