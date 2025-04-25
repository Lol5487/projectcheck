<template>
  <view class="container">
    <view class="wave-bg"></view>
    
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="title">主题设置</view>
    </view>
    
    <view class="settings-card">
      <view class="theme-section">
        <view class="section-title">主题模式</view>
        <view class="theme-options">
          <view 
            class="theme-option" 
            :class="{active: selectedTheme === 'light'}"
            @click="selectTheme('light')"
          >
            <view class="theme-color-block light-theme"></view>
            <text class="theme-name">浅色</text>
          </view>
          
          <view 
            class="theme-option" 
            :class="{active: selectedTheme === 'dark'}"
            @click="selectTheme('dark')"
          >
            <view class="theme-color-block dark-theme"></view>
            <text class="theme-name">深色</text>
          </view>
          
          <view 
            class="theme-option" 
            :class="{active: selectedTheme === 'system'}"
            @click="selectTheme('system')"
          >
            <view class="theme-color-block system-theme"></view>
            <text class="theme-name">跟随系统</text>
          </view>
        </view>
      </view>
      
      <view class="divider"></view>
      
      <view class="color-section">
        <view class="section-title">主题颜色</view>
        <view class="color-options">
          <view 
            class="color-option" 
            :class="{active: selectedColor === 'blue'}"
            @click="selectColor('blue')"
          >
            <view class="color-circle blue-theme"></view>
            <text class="color-name">蓝色</text>
          </view>
          
          <view 
            class="color-option" 
            :class="{active: selectedColor === 'purple'}"
            @click="selectColor('purple')"
          >
            <view class="color-circle purple-theme"></view>
            <text class="color-name">紫色</text>
          </view>
          
          <view 
            class="color-option" 
            :class="{active: selectedColor === 'green'}"
            @click="selectColor('green')"
          >
            <view class="color-circle green-theme"></view>
            <text class="color-name">绿色</text>
          </view>
          
          <view 
            class="color-option" 
            :class="{active: selectedColor === 'orange'}"
            @click="selectColor('orange')"
          >
            <view class="color-circle orange-theme"></view>
            <text class="color-name">橙色</text>
          </view>
        </view>
      </view>
      
      <view class="divider"></view>
      
      <view class="preview-section">
        <view class="section-title">预览</view>
        <view class="preview-card" :class="[`${selectedTheme}-theme`, `${selectedColor}-accent`]">
          <view class="preview-header">
            <text class="preview-title">笔记预览</text>
          </view>
          <view class="preview-content">
            <view class="preview-button">按钮</view>
            <view class="preview-text">这是文本内容</view>
            <view class="preview-input">输入框</view>
          </view>
        </view>
      </view>
      
      <button class="save-btn" hover-class="btn-hover" @click="saveThemeSettings">
        应用设置
      </button>
      
      <view class="note-text">
        注意：主题修改将在下次启动应用时完全生效
      </view>
    </view>
  </view>
</template>

<script>
import { getThemeSettings, saveThemeSettings, applyTheme } from '@/utils/theme/themeService.js';

export default {
  data() {
    return {
      selectedTheme: 'light', // 默认浅色主题
      selectedColor: 'blue',  // 默认蓝色
      themeSettings: {
        theme: 'light',
        color: 'blue'
      }
    }
  },
  onLoad() {
    // 加载保存的主题设置
    this.loadThemeSettings();
  },
  methods: {
    // 加载主题设置
    loadThemeSettings() {
      try {
        const settings = getThemeSettings();
        this.themeSettings = settings;
        this.selectedTheme = settings.theme || 'light';
        this.selectedColor = settings.color || 'blue';
      } catch (e) {
        console.error('加载主题设置失败:', e);
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 选择主题模式
    selectTheme(theme) {
      this.selectedTheme = theme;
    },
    
    // 选择主题颜色
    selectColor(color) {
      this.selectedColor = color;
    },
    
    // 保存主题设置
    saveThemeSettings() {
      try {
        // 准备要保存的主题设置
        const settings = {
          theme: this.selectedTheme,
          color: this.selectedColor
        };
        
        // 使用主题服务保存设置
        const success = saveThemeSettings(settings);
        
        if (success) {
          uni.showToast({
            title: '主题设置已保存',
            icon: 'success'
          });
          
          // 延迟返回
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          throw new Error('保存主题设置失败');
        }
      } catch (e) {
        console.error('保存主题设置失败:', e);
        uni.showToast({
          title: '保存设置失败',
          icon: 'none'
        });
      }
    },
    
    // 预览主题效果
    previewTheme() {
      // 将当前选择应用到预览区域
      const settings = {
        theme: this.selectedTheme,
        color: this.selectedColor
      };
      
      // 只在预览卡片范围内应用主题
      // 这里可以添加对预览卡片的样式修改
      console.log('预览主题设置:', settings);
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

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.divider {
  height: 1rpx;
  background-color: #f0f0f0;
  margin: 30rpx 0;
}

/* 主题模式选择 */
.theme-options {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  transition: all 0.3s;
}

.theme-option.active {
  border-color: #1a4b8c;
  background-color: rgba(26, 75, 140, 0.05);
  box-shadow: 0 4rpx 12rpx rgba(26, 75, 140, 0.1);
}

.theme-color-block {
  width: 100%;
  height: 100rpx;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
}

.light-theme {
  background: linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%);
  border: 1rpx solid #e0e0e0;
}

.dark-theme {
  background: linear-gradient(135deg, #333333 0%, #1c1c1c 100%);
}

.system-theme {
  background: linear-gradient(45deg, #f8f8f8 0%, #ffffff 50%, #333333 50%, #1c1c1c 100%);
}

.theme-name {
  font-size: 26rpx;
  color: #333;
  margin-top: 8rpx;
}

/* 颜色选择 */
.color-options {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 30rpx;
}

.color-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx;
  transition: all 0.3s;
  border-radius: 8rpx;
}

.color-option.active {
  background-color: rgba(26, 75, 140, 0.05);
  transform: scale(1.05);
}

.color-circle {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-bottom: 10rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.blue-theme {
  background: linear-gradient(135deg, #1a4b8c 0%, #0d2d62 100%);
}

.purple-theme {
  background: linear-gradient(135deg, #9b5cff 0%, #764ad5 100%);
}

.green-theme {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
}

.orange-theme {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

.color-name {
  font-size: 24rpx;
  color: #666;
}

/* 预览卡片 */
.preview-section {
  margin-bottom: 30rpx;
}

.preview-card {
  background-color: #ffffff;
  border-radius: 12rpx;
  border: 1rpx solid #e0e0e0;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.preview-card.dark-theme {
  background-color: #333;
}

.preview-header {
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.dark-theme .preview-header {
  border-bottom-color: #444;
}

.preview-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.dark-theme .preview-title {
  color: #fff;
}

.preview-content {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.preview-button {
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
  color: white;
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  width: fit-content;
  text-align: center;
}

.preview-card.purple-accent .preview-button {
  background: linear-gradient(45deg, #764ad5, #9b5cff);
}

.preview-card.green-accent .preview-button {
  background: linear-gradient(45deg, #27ae60, #2ecc71);
}

.preview-card.orange-accent .preview-button {
  background: linear-gradient(45deg, #f39c12, #e67e22);
}

.preview-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.dark-theme .preview-text {
  color: #ccc;
}

.preview-input {
  padding: 10rpx 15rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 6rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f9f9f9;
}

.dark-theme .preview-input {
  border-color: #555;
  background-color: #444;
  color: #ccc;
}

/* 保存按钮 */
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

.note-text {
  font-size: 22rpx;
  color: #999;
  text-align: center;
  margin-top: 20rpx;
}
</style>