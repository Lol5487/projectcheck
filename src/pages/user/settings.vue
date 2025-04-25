<template>
  <view class="container">
    <view class="wave-bg"></view>
    
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="title">账号设置</view>
    </view>
    
    <view class="settings-card">
      <view class="avatar-section">
        <view class="avatar-wrapper" @click="chooseAvatar">
          <image 
            class="avatar" 
            :src="userInfo.avatar || defaultAvatar" 
            mode="aspectFill"
          ></image>
          <view class="change-avatar">
            <text class="change-text">更换头像</text>
          </view>
        </view>
        <text class="username">{{ userInfo.name }}</text>
        <text class="email">{{ userInfo.email }}</text>
      </view>
      
      <view class="divider"></view>
      
      <view class="form-container">
        <view class="form-group">
          <text class="form-label">姓名</text>
          <view class="input-group">
            <input 
              class="input" 
              type="text" 
              v-model="userForm.name" 
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
              :value="userInfo.email" 
              disabled
            />
            <text class="input-icon">✉️</text>
          </view>
          <text class="hint-text">邮箱为登录账号，无法修改</text>
        </view>
        
        <view class="form-group">
          <text class="form-label">手机号 <text class="optional">(选填)</text></text>
          <view class="input-group">
            <text class="phone-prefix">+60</text>
            <input 
              class="input phone-input" 
              type="text" 
              v-model="phoneNumber" 
              placeholder="请输入手机号码"
            />
            <text class="input-icon">📱</text>
          </view>
        </view>
      </view>
      
      <view class="divider"></view>
      
      <view class="password-section">
        <view class="section-title">密码设置</view>
        
        <view class="form-group" v-if="!isChangingPassword">
          <button class="change-password-btn" @click="togglePasswordChange">修改密码</button>
        </view>
        
        <view v-if="isChangingPassword">
          <view class="form-group">
            <text class="form-label">当前密码</text>
            <view class="input-group">
              <input 
                class="input" 
                :type="showCurrentPassword ? 'text' : 'password'" 
                v-model="passwordForm.currentPassword" 
                placeholder="请输入当前密码"
              />
              <text class="eye-icon" @click="toggleCurrentPasswordVisibility">{{showCurrentPassword ? '👁️' : '🔒'}}</text>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">新密码</text>
            <view class="input-group">
              <input 
                class="input" 
                :type="showNewPassword ? 'text' : 'password'" 
                v-model="passwordForm.newPassword" 
                placeholder="请输入新密码"
              />
              <text class="eye-icon" @click="toggleNewPasswordVisibility">{{showNewPassword ? '👁️' : '🔒'}}</text>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">确认新密码</text>
            <view class="input-group">
              <input 
                class="input" 
                :type="showNewPassword ? 'text' : 'password'" 
                v-model="passwordForm.confirmPassword" 
                placeholder="请再次输入新密码"
              />
              <text class="eye-icon" @click="toggleNewPasswordVisibility">{{showNewPassword ? '👁️' : '🔒'}}</text>
            </view>
          </view>
          
          <view class="password-actions">
            <button class="cancel-btn" @click="cancelPasswordChange">取消</button>
            <button class="confirm-btn" @click="changePassword">确认修改</button>
          </view>
        </view>
      </view>
      
      <view class="divider"></view>
      
      <view class="account-section">
        <view class="section-title">账号操作</view>
        
        <view class="account-actions">
          <button class="logout-btn" @click="logout">退出登录</button>
          <button class="delete-account-btn" @click="confirmDeleteAccount">注销账号</button>
        </view>
      </view>
      
      <view class="error-message" v-if="errorMessage">{{ errorMessage }}</view>
      
      <button class="save-btn" hover-class="btn-hover" @click="saveSettings" :disabled="isSaving">
        <text v-if="!isSaving">保存修改</text>
        <text v-else>保存中...</text>
      </button>
    </view>
  </view>
</template>

<script>
import { getCurrentUser, updateUserProfile, logoutUser, changePassword } from '@/utils/userService.js';

export default {
  data() {
    return {
      userInfo: {},
      userForm: {
        name: '',
        phone: ''
      },
      phoneNumber: '', // 不带+60前缀的手机号
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      isChangingPassword: false,
      showCurrentPassword: false,
      showNewPassword: false,
      errorMessage: '',
      isSaving: false,
      defaultAvatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231a4b8c"/><text x="50" y="50" font-size="50" text-anchor="middle" alignment-baseline="central" fill="white">👤</text></svg>'
    }
  },
  onLoad() {
    this.loadUserInfo();
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const user = getCurrentUser();
      if (!user) {
        uni.redirectTo({
          url: '/pages/login/login'
        });
        return;
      }
      
      this.userInfo = user;
      this.userForm.name = user.name || '';
      
      // 如果有手机号，去除前缀+60并设置到phoneNumber
      if (user.phone && user.phone.startsWith('+60')) {
        this.phoneNumber = user.phone.substring(3); // 去除+60前缀
      } else {
        this.phoneNumber = user.phone || '';
        this.userForm.phone = user.phone || '';
      }
    },
    
    // 返回上一页
    goBack() {
      // 直接重定向到首页
      uni.reLaunch({
        url: '/pages/index/index',
        fail: (err) => {
          console.error('返回首页失败:', err);
          // 尝试使用浏览器原生历史API
          if (window && window.history) {
            window.history.back();
          }
        }
      });
    },
    
    // 选择头像
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          
          // 在实际应用中，这里应该上传头像到服务器
          // 这里只是简单地将临时路径赋值给userInfo.avatar
          this.userInfo.avatar = tempFilePath;
        }
      });
    },
    
    // 切换密码修改区域
    togglePasswordChange() {
      this.isChangingPassword = !this.isChangingPassword;
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    },
    
    // 取消密码修改
    cancelPasswordChange() {
      this.isChangingPassword = false;
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    },
    
    // 切换当前密码可见性
    toggleCurrentPasswordVisibility() {
      this.showCurrentPassword = !this.showCurrentPassword;
    },
    
    // 切换新密码可见性
    toggleNewPasswordVisibility() {
      this.showNewPassword = !this.showNewPassword;
    },
    
    // 修改密码
    async changePassword() {
      // 表单验证
      if (!this.passwordForm.currentPassword) {
        this.errorMessage = '请输入当前密码';
        return;
      }
      
      if (!this.passwordForm.newPassword) {
        this.errorMessage = '请输入新密码';
        return;
      }
      
      if (this.passwordForm.newPassword.length < 6) {
        this.errorMessage = '新密码至少需要6个字符';
        return;
      }
      
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.errorMessage = '两次输入的新密码不一致';
        return;
      }
      
      uni.showLoading({
        title: '修改密码中...'
      });
      
      try {
        // 调用changePassword函数更新密码
        const result = await changePassword(
          this.userInfo.id,
          this.passwordForm.currentPassword,
          this.passwordForm.newPassword
        );
        
        uni.hideLoading();
        
        if (result.success) {
          uni.showToast({
            title: '密码修改成功',
            icon: 'success'
          });
          
          this.isChangingPassword = false;
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
        } else {
          this.errorMessage = result.message || '密码修改失败，请重试';
        }
      } catch (error) {
        uni.hideLoading();
        this.errorMessage = '密码修改失败，请重试';
      }
    },
    
    // 保存设置
    async saveSettings() {
      // 表单验证
      if (!this.userForm.name) {
        this.errorMessage = '请输入姓名';
        return;
      }
      
      // 如果phoneNumber有值，编译成带+60前缀的手机号格式
      if (this.phoneNumber) {
        // 验证手机号格式
        if (!/^\d{8,11}$/.test(this.phoneNumber)) {
          this.errorMessage = '请输入有效的手机号码';
          return;
        }
        // 设置正确的带前缀手机号
        this.userForm.phone = '+60' + this.phoneNumber;
      } else {
        this.userForm.phone = '';
      }
      
      this.isSaving = true;
      this.errorMessage = '';
      
      try {
        const updateData = {
          name: this.userForm.name,
          phone: this.userForm.phone,
          avatar: this.userInfo.avatar
        };
        
        const result = await updateUserProfile(updateData);
        
        if (result.success) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          // 重新加载用户信息
          this.loadUserInfo();
        } else {
          this.errorMessage = result.message || '保存失败，请重试';
        }
      } catch (error) {
        this.errorMessage = '保存过程中发生错误，请重试';
      } finally {
        this.isSaving = false;
      }
    },
    
    // 退出登录
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出当前账号吗？',
        success: (res) => {
          if (res.confirm) {
            logoutUser();
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }
        }
      });
    },
    
    // 确认注销账号
    confirmDeleteAccount() {
      uni.showModal({
        title: '注销账号',
        content: '注销后，您的所有数据都将被删除且无法恢复，确定要继续吗？',
        confirmColor: '#FF0000',
        success: (res) => {
          if (res.confirm) {
            this.deleteAccount();
          }
        }
      });
    },
    
    // 注销账号
    async deleteAccount() {
      uni.showLoading({
        title: '处理中...'
      });
      
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 实际应用中应该调用API删除账号
        
        uni.hideLoading();
        uni.showToast({
          title: '账号已注销',
          icon: 'success'
        });
        
        // 清除登录状态并跳转到登录页
        logoutUser();
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/login/login'
          });
        }, 1500);
      } catch (error) {
        uni.hideLoading();
        this.errorMessage = '注销账号失败，请重试';
      }
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a4b8c 0%, #0d2d62 100%);
  overflow: hidden;
  padding: 20rpx;
}

.wave-bg {
  position: absolute;
  bottom: -100rpx;
  left: -10%;
  width: 120%;
  height: 300rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50% 50% 0 0;
  z-index: 0;
}

.header {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  position: relative;
  z-index: 10;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.back-icon {
  color: #ffffff;
  font-size: 32rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.settings-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.15);
  padding: 40rpx;
  position: relative;
  z-index: 10;
  flex: 1;
  animation: fadeIn 0.6s ease-in-out;
  margin-bottom: 30rpx;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0 40rpx;
}

.avatar-wrapper {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 20rpx rgba(13, 45, 98, 0.3);
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.change-avatar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50rpx;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.change-text {
  color: #ffffff;
  font-size: 20rpx;
}

.username {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 6rpx;
}

.email {
  font-size: 24rpx;
  color: #666;
}

.divider {
  height: 1rpx;
  background-color: #f0f0f0;
  margin: 20rpx 0;
}

.form-container {
  margin: 20rpx 0;
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

.optional {
  color: #999;
  font-size: 22rpx;
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

.input[disabled] {
  color: #999;
}

.input-icon, .eye-icon {
  font-size: 32rpx;
  color: #999;
  padding: 10rpx;
}

.hint-text {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.change-password-btn {
  background-color: #f5f5f5;
  color: #1a4b8c;
  font-size: 28rpx;
  padding: 16rpx 0;
  border-radius: 8rpx;
  width: 100%;
  text-align: center;
  border: none;
}

.password-actions {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 30rpx;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
  border: none;
}

.confirm-btn {
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(13, 45, 98, 0.3);
  border: none;
}

.account-actions {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.logout-btn, .delete-account-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 8rpx;
  font-size: 28rpx;
  border: none;
}

.logout-btn {
  background-color: #f5f5f5;
  color: #666;
}

.delete-account-btn {
  background-color: #fff0f0;
  color: #e53935;
  border: 1rpx solid #ffcdd2;
}

.error-message {
  color: #ff5252;
  font-size: 24rpx;
  margin: 20rpx 0;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5rpx); }
  20%, 40%, 60%, 80% { transform: translateX(5rpx); }
}

.save-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
  color: white;
  font-size: 32rpx;
  border-radius: 8rpx;
  margin-top: 30rpx;
  box-shadow: 0 6rpx 20rpx rgba(13, 45, 98, 0.3);
  transition: all 0.3s;
  border: none;
}

.btn-hover {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 10rpx rgba(13, 45, 98, 0.3);
  opacity: 0.9;
}

.save-btn[disabled] {
  background: linear-gradient(45deg, #3e5c86, #6185b5);
  box-shadow: none;
  opacity: 0.7;
}
</style>