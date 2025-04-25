<template>
  <!-- 侧边栏遮罩 -->
  <view class="sidebar-mask" v-if="visible" @click="close"></view>
  
  <!-- 侧边栏菜单 -->
  <view class="sidebar" :class="{active: visible}">
    <view class="sidebar-header">
      <view class="sidebar-title">设置</view>
      <view class="sidebar-close" @click="close">×</view>
    </view>
    <view class="sidebar-content">
      <view class="sidebar-item" @click="handleItem(0)">
        <view class="sidebar-icon">👤</view>
        <view class="sidebar-text">账号设置</view>
      </view>
      <view class="sidebar-item" @click="handleItem(1)">
        <view class="sidebar-icon">🔄</view>
        <view class="sidebar-text">数据同步</view>
      </view>
      <view class="sidebar-item" @click="handleItem(2)">
        <view class="sidebar-icon">🎨</view>
        <view class="sidebar-text">主题设置</view>
      </view>
      <view class="sidebar-item" @click="handleItem(3)">
        <view class="sidebar-icon">ℹ️</view>
        <view class="sidebar-text">关于应用</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AppSidebar',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    handleItem(index) {
      this.$emit('select', index);
      this.close();
    }
  }
}
</script>

<style>
/* 侧边菜单样式 */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 70%;
  max-width: 600rpx;
  height: 100vh;
  background: #fff;
  z-index: 9999;
  box-shadow: 0 0 40rpx rgba(0, 0, 0, 0.2);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar.active {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
}

.sidebar-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.sidebar-close {
  font-size: 48rpx;
  color: #fff;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.sidebar-close:active {
  background-color: rgba(255, 255, 255, 0.2);
}

.sidebar-content {
  flex: 1;
  padding: 20rpx 0;
  overflow-y: auto;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 30rpx 40rpx;
  transition: background-color 0.2s ease;
}

.sidebar-item:active {
  background-color: rgba(26, 75, 140, 0.1);
}

.sidebar-icon {
  font-size: 40rpx;
  margin-right: 30rpx;
  width: 60rpx;
  display: flex;
  justify-content: center;
}

.sidebar-text {
  font-size: 30rpx;
  color: #333;
}

.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>