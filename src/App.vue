<script>
import { isLoggedIn } from './utils/userService.js';

export default {
  onLaunch: function () {
    console.log('App Launch');
    
    // 初始化检查storage
    try {
      const notes = uni.getStorageSync('notes');
      console.log('启动时检查存储 - 笔记数量:', notes ? notes.length : 0);
      
      // 验证存储中的笔记格式
      if (notes && !Array.isArray(notes)) {
        console.error('存储中的笔记不是数组，将重置');
        uni.setStorageSync('notes', []);
      }
    } catch (error) {
      console.error('启动时检查存储出错:', error);
      // 重置存储
      uni.setStorageSync('notes', []);
    }
    
    // 设置全局错误处理
    uni.onError(err => {
      console.error('全局错误:', err);
    });
    
    // 检查用户是否已登录
    this.checkLoginStatus();
  },
  onShow: function () {
    console.log('App Show');
    // 每次应用显示时检查登录状态
    this.checkLoginStatus();
  },
  onHide: function () {
    console.log('App Hide');
  },
  methods: {
    checkLoginStatus() {
      // 获取当前页面路径
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1]?.route || '';
      
      // 如果当前不在登录页面且用户未登录，则跳转到登录页面
      if (!isLoggedIn() && currentPage !== 'pages/login/login') {
        uni.redirectTo({
          url: '/pages/login/login'
        });
      }
    },
    
    // 添加全局存储工具方法，确保安全存储
    safeSetStorage(key, data) {
      try {
        // 确保数据可以被序列化
        JSON.stringify(data);
        uni.setStorageSync(key, data);
        return true;
      } catch (error) {
        console.error(`存储${key}失败:`, error);
        return false;
      }
    }
  }
}
</script>

<style>
/*每个页面公共css */
/* 全局背景色设置 */
page {
  background: linear-gradient(135deg, #1a4b8c 0%, #0d2d62 100%);
  min-height: 100vh;
}

/* 确保图片预览始终显示在最顶层 */
.uni-popup, .uni-modal, .uni-image-viewer {
  z-index: 99999 !important;
}

/* 将图片预览层级提高 */
:deep(.uni-image-viewer), :deep(.uni-previewimage) {
  z-index: 999999 !important;
}
/* 确保确认删除对话框始终显示在最顶层 */
.uni-modal {
  z-index: 99999 !important;
}

.uni-modal .uni-modal__hd,
.uni-modal .uni-modal__bd,
.uni-modal .uni-modal__ft {
  z-index: 100000 !important;
}
</style>
