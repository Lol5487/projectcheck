<template>
  <view v-if="visible" class="custom-image-preview">
    <view class="preview-mask" @click="close"></view>
    <view class="preview-content">
      <image 
        :src="currentImage" 
        mode="aspectFit" 
        class="preview-image"
        @click.stop
      ></image>
      
      <view class="preview-controls">
        <view class="preview-arrow left-arrow" @click.stop="prevImage" v-if="urls.length > 1">&lt;</view>
        <view class="preview-arrow right-arrow" @click.stop="nextImage" v-if="urls.length > 1">&gt;</view>
      </view>
      
      <view class="preview-close" @click.stop="close">×</view>
      
      <view class="preview-indicator" v-if="urls.length > 1">
        {{ currentIndex + 1 }}/{{ urls.length }}
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      urls: [],
      currentIndex: 0
    }
  },
  computed: {
    currentImage() {
      return this.urls[this.currentIndex] || '';
    }
  },
  methods: {
    show(options) {
      this.urls = options.urls || [];
      this.currentIndex = this.urls.indexOf(options.current || this.urls[0]);
      if (this.currentIndex < 0) this.currentIndex = 0;
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
    prevImage() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      } else {
        this.currentIndex = this.urls.length - 1;
      }
    },
    nextImage() {
      if (this.currentIndex < this.urls.length - 1) {
        this.currentIndex++;
      } else {
        this.currentIndex = 0;
      }
    }
  }
}
</script>

<style scoped>
.custom-image-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999999; /* 非常高的z-index值确保在最上层 */
}

.preview-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 99999998;
}

.preview-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999999;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  z-index: 100000000;
}

.preview-close {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 60rpx;
  height: 60rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  z-index: 100000001;
}

.preview-controls {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100000000;
  pointer-events: none;
}

.preview-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 80rpx;
  height: 80rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  pointer-events: auto;
}

.left-arrow {
  left: 30rpx;
}

.right-arrow {
  right: 30rpx;
}

.preview-indicator {
  position: absolute;
  bottom: 30rpx;
  left: 0;
  width: 100%;
  text-align: center;
  color: white;
  font-size: 28rpx;
  z-index: 100000001;
}
</style>