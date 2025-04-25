<template>
  <!-- 使用侧边栏组件 -->
  <app-sidebar :visible="showSidebar" @close="closeSidebar" @select="handleSidebarItem" />
  
  <view class="container">
    <view class="header">
      <view class="header-left">
        <button class="settings-btn" @click="toggleSidebar">
          <text class="settings-icon">⚙</text>
        </button>
        <text class="title">我的笔记</text>
      </view>
      <view class="header-right">
        <view class="sort-container">
          <picker 
            :value="sortTypeIndex" 
            :range="sortOptions" 
            @change="onSortChange"
            class="sort-picker"
          >
            <view class="sort-button">
              <text class="sort-text">{{ sortOptions[sortTypeIndex] }}</text>
              <text class="sort-icon">▼</text>
            </view>
          </picker>
        </view>
        <button class="add-btn" @click="createNote">新建笔记</button>
      </view>
    </view>
    
    <view class="notes-list">
      <view v-if="notes.length === 0" class="empty-tips">
        <text>暂无笔记，点击右上角添加</text>
      </view>
      
      <view 
        v-for="note in notes" 
        :key="note.id" 
        class="note-item"
        :data-note-id="note.id"
      >
        <view class="note-header">
          <view class="note-title">{{ note.title || '无标题' }}</view>
          <button class="edit-btn" @click.stop="editNote(note.id)">
            <text class="edit-icon">✎</text>
          </button>
        </view>
        <view class="note-preview">{{ note.content ? note.content.substring(0, 50) : '无内容' }}</view>
        
        <!-- 笔记图片预览 -->
        <scroll-view class="note-images" scroll-x="true" v-if="note.images && note.images.length > 0">
          <image 
            v-for="(image, index) in note.images" 
            :key="image.id" 
            :src="image.path" 
            mode="aspectFill" 
            class="note-image"
            @click.stop="previewImage(note.images, index)"
            @longpress.stop="editImageMode(note.id)"
            @contextmenu.prevent.stop="handleRightClick($event, note.id)"
          ></image>
        </scroll-view>
        
        <!-- 事件图片预览 -->
        <view class="events-images-container" v-if="getEventImages(note).length > 0">
          <text class="events-images-label">事件图片:</text>
          <scroll-view class="events-images" scroll-x="true">
            <image 
              v-for="(image, index) in getEventImages(note)" 
              :key="image.id" 
              :src="image.path" 
              mode="aspectFill" 
              class="event-note-image"
              @click.stop="previewEventImage(note, image)"
            ></image>
          </scroll-view>
        </view>
        

        
        <!-- 进度条展示 -->
        <view class="progress-section">
          <view class="progress-header">
            <text class="progress-label">完成进度: {{ note.completionPercentage || 0 }}%</text>
            <text class="events-count" v-if="note.progressEvents && note.progressEvents.length > 0">
              {{ getCompletedEventsCount(note) }}/{{ note.progressEvents.length }} 事件
            </text>
          </view>
          <view 
            class="progress-bar-container" 
            @mouseenter="showProgressTooltip(note)" 
            @mouseleave="hideProgressTooltip"
          >
            <view class="progress-bar-bg"></view>
            <view 
              class="progress-bar-fill" 
              :style="{width: (note.completionPercentage || 0) + '%'}"
            ></view>
            
            <!-- 进度提示工具提示 -->
            <view class="progress-tooltip" v-if="currentTooltipNote && currentTooltipNote.id === note.id">
              <view class="tooltip-content">
                <text class="tooltip-text">完成进度: {{ note.completionPercentage || 0 }}%</text>
                <text class="tooltip-text" v-if="note.progressEvents && note.progressEvents.length > 0">
                  已完成 {{ getCompletedEventsCount(note) }} / {{ note.progressEvents.length }} 个事件
                </text>
                <text class="tooltip-text" v-else>暂无进度事件</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="note-info" v-if="note.personInCharge || (note.timeFrame && (note.timeFrame.startDate || note.timeFrame.endDate))">
          <text class="note-person" v-if="note.personInCharge">负责人: {{ note.personInCharge }}</text>
          <text class="note-timeframe" v-if="note.timeFrame && (note.timeFrame.startDate || note.timeFrame.endDate)">
            时间框架: {{ formatTimeFrame(note.timeFrame) }}
          </text>
        </view>
        <view class="note-footer">
          <text class="note-time">{{ formatTime(note.updatedAt || note.createdAt) }}</text>
          <view class="note-actions">


            <button class="action-btn delete-btn" @click.stop="confirmDelete(note.id)">删除</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getNotes, deleteNote, calculateCompletionProgress } from '@/utils/noteService.js';
import { checkAuth } from '@/utils/userService.js';
import AppSidebar from './sidebar.vue';

export default {
  components: {
    AppSidebar
  },
  data() {
    return {
      notes: [],
      isMobileView: false,
      currentTooltipNote: null, // 当前正在显示提示的笔记
      sortOptions: ['最近更新', '最早更新', '按完成进度', '按报告数量', '按标题'],
      sortTypeIndex: 0, // 默认按最近更新排序
      showSidebar: false // 侧边栏显示状态
    }
  },
  created() {
    // 检测是否是移动端
    this.detectMobileView();
    // 替换window事件监听为uni.onWindowResize
    uni.onWindowResize(() => {
      this.detectMobileView();
    });
  },
  onLoad() {
    // 检查用户是否已登录
    if (!checkAuth()) return;
    
    // 首次加载页面时加载笔记列表
    this.loadNotes();
  },
  onShow() {
    // 检查用户是否已登录
    if (!checkAuth()) return;
    
    // 每次页面显示时刷新笔记列表
    this.loadNotes();
  },
  destroyed() {
    // 移除窗口大小变化监听
    uni.offWindowResize();
  },
  methods: {
    // 显示进度提示
    showProgressTooltip(note) {
      this.currentTooltipNote = note;
    },
    
    // 隐藏进度提示
    hideProgressTooltip() {
      this.currentTooltipNote = null;
    },
  
    // 获取已完成事件数量
    getCompletedEventsCount(note) {
      if (!note.progressEvents || note.progressEvents.length === 0) {
        return 0;
      }
      return note.progressEvents.filter(event => event.completed).length;
    },
    
    // 检测是否是移动设备视图
    detectMobileView() {
      // 使用uni-app系统信息API替代window对象
      const systemInfo = uni.getSystemInfoSync();
      this.isMobileView = systemInfo.windowWidth < 768;
    },
    loadNotes() {
      try {
        console.log('开始加载笔记列表');
        const allNotes = getNotes();
        console.log('获取到的笔记数量:', allNotes.length);
        
        if (!Array.isArray(allNotes)) {
          console.error('获取到的笔记不是数组:', allNotes);
          this.notes = [];
          return;
        }
        
        // 确保每个笔记都有正确的完成进度
        const processedNotes = allNotes.map(note => {
          // 如果笔记没有计算过进度或进度需要重新计算，则计算完成进度
          if (note.progressEvents && note.progressEvents.length > 0) {
            note.completionPercentage = calculateCompletionProgress(note);
          } else {
            note.completionPercentage = 0;
          }
          return note;
        });
        
        // 根据排序类型对笔记进行排序
        this.notes = this.sortNotes(processedNotes, this.sortTypeIndex);
        
        console.log('笔记列表加载完成，排序后数量:', this.notes.length);
      } catch (error) {
        console.error('加载笔记列表出错:', error);
        uni.showToast({
          title: '加载笔记失败',
          icon: 'none'
        });
        this.notes = [];
      }
    },
    
    // 排序笔记
    sortNotes(notes, sortType) {
      if (!Array.isArray(notes)) return [];
      
      switch (sortType) {
        case 0: // 最近更新
          return notes.sort((a, b) => {
            const timeA = a.updatedAt || a.createdAt;
            const timeB = b.updatedAt || b.createdAt;
            return new Date(timeB) - new Date(timeA);
          });
          
        case 1: // 最早更新
          return notes.sort((a, b) => {
            const timeA = a.updatedAt || a.createdAt;
            const timeB = b.updatedAt || b.createdAt;
            return new Date(timeA) - new Date(timeB);
          });
          
        case 2: // 按完成进度
          return notes.sort((a, b) => {
            // 从高到低排序进度
            const completionA = a.completionPercentage || 0;
            const completionB = b.completionPercentage || 0;
            return completionB - completionA;
          });
          
        case 3: // 按报告数量
          return notes.sort((a, b) => {
            const eventsA = (a.progressEvents && a.progressEvents.length) || 0;
            const eventsB = (b.progressEvents && b.progressEvents.length) || 0;
            return eventsB - eventsA;
          });
          
        case 4: // 按标题
          return notes.sort((a, b) => {
            const titleA = (a.title || '').toLowerCase();
            const titleB = (b.title || '').toLowerCase();
            return titleA.localeCompare(titleB);
          });
          
        default:
          return notes;
      }
    },
    
    // 排序方式变化处理
    onSortChange(e) {
      const sortIndex = parseInt(e.detail.value);
      if (this.sortTypeIndex !== sortIndex) {
        this.sortTypeIndex = sortIndex;
        
        // 重新排序当前笔记列表
        this.notes = this.sortNotes([...this.notes], this.sortTypeIndex);
        
        uni.showToast({
          title: `已按${this.sortOptions[this.sortTypeIndex]}排序`,
          icon: 'none',
          duration: 1500
        });
      }
    },
    createNote() {
      uni.navigateTo({
        url: '/pages/edit/edit'
      });
    },
    editNote(id) {
      uni.navigateTo({
        url: `/pages/edit/edit?id=${id}`
      });
    },

    confirmDelete(id) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条笔记吗？',
        success: (res) => {
          if (res.confirm) {
            deleteNote(id);
            this.loadNotes(); // 刷新列表
          }
        }
      });
    },
    // 预览图片
    previewImage(images, index) {
      const urls = images.map(img => img.path);
      uni.previewImage({
        current: urls[index],
        urls: urls
      });
    },
    
    // 获取笔记中所有事件的图片
    getEventImages(note) {
      if (!note.progressEvents || note.progressEvents.length === 0) {
        return [];
      }
      
      // 从所有事件中提取图片
      const eventImages = [];
      note.progressEvents.forEach(event => {
        if (event.images && event.images.length > 0) {
          // 给每个图片添加所属事件信息，便于预览时显示
          event.images.forEach(image => {
            eventImages.push({
              ...image,
              eventId: event.id,
              eventDescription: event.description
            });
          });
        }
      });
      
      return eventImages;
    },
    
    // 预览事件图片
    previewEventImage(note, image) {
      // 找出该图片所属的事件
      const event = note.progressEvents.find(e => e.id === image.eventId);
      if (!event) return;
      
      // 收集该事件的所有图片路径
      const urls = event.images.map(img => img.path);
      
      // 找出当前图片在该事件图片中的索引
      const currentIndex = event.images.findIndex(img => img.id === image.id);
      
      // 预览图片
      uni.previewImage({
        current: urls[currentIndex >= 0 ? currentIndex : 0],
        urls: urls
      });
      
      // 显示事件信息
      uni.showToast({
        title: `事件: ${event.description}`,
        icon: 'none',
        position: 'bottom'
      });
    },
    // 长按图片进入编辑模式
    editImageMode(noteId) {
      uni.vibrateLong(); // 提供触觉反馈
      
      uni.showActionSheet({
        itemList: ['编辑笔记', '查看图片', '取消'],
        success: (res) => {
          switch(res.tapIndex) {
            case 0: // 编辑笔记
              this.editNote(noteId);
              break;
            case 1: // 查看图片
              const note = this.notes.find(n => n.id === noteId);
              if (note && note.images && note.images.length > 0) {
                this.previewImage(note.images, 0);
              }
              break;
          }
        }
      });
    },
    // 处理右键点击事件（电脑端）
    handleRightClick(event, noteId) {
      // 创建自定义菜单
      const menuOptions = [
        { text: '编辑笔记', action: () => this.editNote(noteId) },
        { text: '查看图片', action: () => {
          const note = this.notes.find(n => n.id === noteId);
          if (note && note.images && note.images.length > 0) {
            this.previewImage(note.images, 0);
          }
        }}
      ];
      
      // 计算菜单位置
      const menuX = event.clientX;
      const menuY = event.clientY;
      
      // 如果支持原生上下文菜单，则使用uni原生API
      uni.showActionSheet({
        itemList: menuOptions.map(option => option.text),
        success: (res) => {
          if (res.tapIndex >= 0 && res.tapIndex < menuOptions.length) {
            menuOptions[res.tapIndex].action();
          }
        }
      });
    },

    // 格式化时间框架
    formatTimeFrame(timeFrame) {
      if (!timeFrame) return '';
      
      if (typeof timeFrame === 'string') {
        return timeFrame;
      }
      
      if (timeFrame.startDate && timeFrame.endDate) {
        return `${timeFrame.startDate}至${timeFrame.endDate}`;
      } else if (timeFrame.startDate) {
        return `${timeFrame.startDate}起`;
      } else if (timeFrame.endDate) {
        return `截至${timeFrame.endDate}`;
      }
      
      return '';
    },
    // 格式化日期（简短格式）
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    formatTime(timeString) {
      if (!timeString) return '';
      
      const date = new Date(timeString);
      const now = new Date();
      const diff = now - date;
      
      // 小于1天，显示相对时间
      if (diff < 24 * 60 * 60 * 1000) {
        if (diff < 60 * 1000) return '刚刚';
        if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`;
        return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
      }
      
      // 大于1天，显示日期
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    
    // 切换侧边栏显示状态
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },
    
    // 关闭侧边栏
    closeSidebar() {
      this.showSidebar = false;
    },
    
    // 处理侧边栏菜单项选择
    handleSidebarItem(index) {
      switch(index) {
        case 0: // 账号设置
          uni.navigateTo({
            url: '/pages/user/settings'
          });
          break;
        case 1: // 同步数据
          uni.showToast({
            title: '同步数据功能即将上线',
            icon: 'none'
          });
          break;
        case 2: // 主题设置
          uni.showToast({
            title: '主题设置功能即将上线',
            icon: 'none'
          });
          break;
        case 3: // 关于应用
          uni.showModal({
            title: '关于应用',
            content: '笔记应用 v1.0.0\n一个简单易用的笔记和待办事项管理工具',
            showCancel: false,
            confirmText: '确定'
          });
          break;
      }
    },
    
    // 显示消息提示
    showToast(message) {
      uni.showToast({
        title: message,
        icon: 'none'
      });
    },


  }
}
</script>

<style>

.container {
  padding: 20rpx;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a4b8c 0%, #0d2d62 100%);
  position: relative;
  overflow: hidden;
}

.container:before {
  content: '';
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 20rpx 30rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.settings-btn {
  background: rgba(26, 75, 140, 0.08);
  width: 60rpx;
  height: 60rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  margin: 0;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
}

.settings-btn:active {
  background-color: rgba(13, 45, 98, 0.15);
  transform: scale(0.95);
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.settings-icon {
  font-size: 34rpx;
  color: #1a4b8c;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15rpx;
}

.sort-container {
  position: relative;
}

.sort-picker {
  height: 100%;
}

.sort-button {
  display: flex;
  align-items: center;
  background: rgba(26, 75, 140, 0.1);
  border-radius: 30rpx;
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  color: #0d2d62;
  transition: all 0.2s ease;
}

.sort-button:active {
  background: rgba(26, 75, 140, 0.2);
}

.sort-text {
  margin-right: 6rpx;
}

.sort-icon {
  font-size: 20rpx;
  color: #0d2d62;
  opacity: 0.7;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.add-btn {
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
  color: #fff;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(13, 45, 98, 0.3);
  transition: all 0.3s;
  border: none;
}

.add-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(13, 45, 98, 0.3);
  opacity: 0.9;
}

.empty-tips {
  text-align: center;
  color: #999;
  padding: 100rpx 0;
  font-size: 28rpx;
  animation: fadeIn 0.5s ease-in-out;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  margin: 40rpx 0;
  padding: 60rpx 20rpx;
}

.note-item {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-in-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 1;
}

.note-item:hover {
  box-shadow: 0 10rpx 25rpx rgba(0, 0, 0, 0.15);
  transform: translateY(-2rpx);
}

.note-item:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
  border-bottom: 2rpx solid #f0f0f0;
  padding-bottom: 10rpx;
}

.note-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.edit-btn {
  background: transparent;
  padding: 6rpx 12rpx;
  border: none;
  font-size: 32rpx;
  color: #0a3b7c;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin: 0;
  min-width: auto;
  width: auto;
  height: auto;
  line-height: 1;
}

.edit-btn:hover, .edit-btn:active {
  transform: scale(1.1);
  color: #0d2d62;
}

.edit-icon {
  font-size: 36rpx;
}

.note-preview {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; /* 限制文本显示为3行，使笔记预览能够展示更多内容 */
  line-clamp: 3; /* 标准属性，增强兼容性 */
  overflow: hidden;
}

.note-info {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10rpx;
  font-size: 24rpx;
}

.note-person, .note-timeframe {
  background-color: rgba(26, 75, 140, 0.1);
  color: #0d2d62;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  margin-right: 10rpx;
  margin-bottom: 6rpx;
}

/* 笔记图片样式 */
.note-images {
  white-space: nowrap;
  margin: 10rpx 0 20rpx;
  height: 150rpx;
  background-color: rgba(248, 248, 248, 0.6);
  border-radius: 8rpx;
  padding: 5rpx;
}

.note-image {
  display: inline-block;
  width: 140rpx;
  height: 140rpx;
  margin-right: 10rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.note-image:active {
  transform: scale(0.98);
}

/* 事件图片容器样式 */
.events-images-container {
  margin: 5rpx 0 15rpx;
}

.events-images-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 6rpx;
  display: block;
  padding-left: 5rpx;
}

.events-images {
  white-space: nowrap;
  height: 120rpx;
  background-color: rgba(248, 248, 248, 0.6);
  border-radius: 8rpx;
  padding: 5rpx;
}

.event-note-image {
  display: inline-block;
  width: 110rpx;
  height: 110rpx;
  margin-right: 10rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  border: 1px solid #e8e8e8;
}

.event-note-image:active {
  transform: scale(0.95);
}


.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6rpx;
}

.progress-label {
  font-size: 24rpx;
  color: #666;
}

.events-count {
  font-size: 22rpx;
  color: #1a4b8c;
  font-weight: bold;
}

.progress-section {
  margin: 15rpx 0;
}

.progress-bar-container {
  position: relative;
  height: 12rpx;
  border-radius: 6rpx;
  overflow: hidden;
  background-color: #f5f5f5;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.progress-bar-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}

.progress-bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
  transition: width 0.5s ease;
  box-shadow: 0 0 5px rgba(26, 75, 140, 0.5);
}

/* 进度条颜色变化 */
.note-item .progress-bar-fill[style*="width: 0%"] {
  background: linear-gradient(45deg, #cccccc, #dddddd);
  box-shadow: none;
}

.note-item .progress-bar-fill[style*="width: 100%"] {
  background: linear-gradient(45deg, #4CAF50, #8BC34A);
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
}

/* 添加鼠标悬浮高亮效果 */
.note-item:hover .progress-bar-fill {
  animation: progress-pulse 1.5s infinite;
}

@keyframes progress-pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.progress-markers {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  z-index: 1;
}

.progress-marker {
  position: absolute;
  top: 5rpx;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  transform: translateX(-50%);
  z-index: 2;
  background-color: #4CAF50;
  border: 2rpx solid #fff;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.progress-marker:active {
  transform: translateX(-50%) scale(1.2);
}

/* 手动设置的标记样式 */
.progress-marker.event-manual {
  background-color: #757575;
}

.progress-marker.event-manual::after {
  content: '';
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  width: 8rpx;
  height: 8rpx;
  background-color: #FF9800;
  border-radius: 50%;
  border: 1px solid #fff;
}

/* 悬停样式事件工具提示 */
.event-tooltip-hover {
  position: absolute;
  top: -80rpx;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  width: 280rpx;
  max-width: 90vw;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
}

.event-tooltip-hover.show-tooltip {
  visibility: visible;
  opacity: 1;
}

.event-tooltip-hover .tooltip-content {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 16rpx;
  box-shadow: 0 2rpx 15rpx rgba(0, 0, 0, 0.2);
  border: 2rpx solid #eee;
  position: relative;
}

.event-tooltip-hover .tooltip-content::after {
  content: '';
  position: absolute;
  bottom: -15rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 16rpx solid transparent;
  border-right: 16rpx solid transparent;
  border-top: 16rpx solid #fff;
  filter: drop-shadow(0 2rpx 2rpx rgba(0, 0, 0, 0.1));
}

/* 移动设备上的点击式工具提示 */
.event-tooltip {
  position: absolute;
  left: 0;
  right: 0;
  margin-top: 10rpx;
  z-index: 10;
  animation: fadeIn 0.2s ease;
}

.event-tooltip .tooltip-content {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 16rpx;
  box-shadow: 0 2rpx 15rpx rgba(0, 0, 0, 0.2);
  border: 2rpx solid #eee;
  position: relative;
}

.tooltip-content {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
  border-left: 4rpx solid #1a4b8c;
}

.tooltip-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.tooltip-percentage {
  font-size: 28rpx;
  font-weight: bold;
  margin-right: 10rpx;
  color: #0d2d62;
}

.tooltip-date {
  font-size: 22rpx;
  color: #999;
  margin-right: auto;
}

.tooltip-close {
  margin-left: auto;
  font-size: 32rpx;
  color: #999;
  padding: 0 10rpx;
  cursor: pointer;
}

.tooltip-description {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 10rpx;
  line-height: 1.5;
}

.tooltip-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.tooltip-status {
  font-size: 22rpx;
  color: #4CAF50;
}

.tooltip-manual {
  font-size: 22rpx;
  color: #FF9800;
  margin-left: auto;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
  color: #999;
  margin-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 10rpx;
}

.note-time {
  color: #999;
}

.note-actions {
  display: flex;
  gap: 10rpx;
}

.action-btn {
  font-size: 24rpx;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.action-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}



.delete-btn {
  background: linear-gradient(45deg, #e53935, #f44336);
  color: white;
}

/* 适配不同尺寸的屏幕 */
@media screen and (min-width: 768px) {
  .container {
    padding: 40rpx;
  }
  
  .note-item {
    padding: 30rpx;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .note-item:hover {
    transform: translateY(-5rpx);
    box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.1);
  }
  
  .edit-btn {
    padding: 10rpx 16rpx;
  }
  
  .edit-icon {
    font-size: 40rpx;
  }
}

.tooltip-images {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  margin: 10rpx 0;
  padding: 4rpx 0;
  background-color: rgba(248, 248, 248, 0.6);
  border-radius: 8rpx;
}

.tooltip-image {
  width: 100rpx;
  height: 100rpx;
  margin-right: 8rpx;
  border-radius: 8rpx;
  object-fit: cover;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.tooltip-image:active {
  transform: scale(0.95);
}

/* 进度提示工具提示 */
.progress-tooltip {
  position: absolute;
  top: -60rpx;
  right: 10rpx;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.progress-tooltip .tooltip-content {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 10rpx;
  padding: 12rpx 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  min-width: 180rpx;
  border-left: 4rpx solid #0d2d62;
}

.progress-tooltip .tooltip-text {
  font-size: 22rpx;
  color: #333;
  margin: 2rpx 0;
}

/* 已完成事件标记样式 */
.progress-marker.event-completed {
  background-color: #4CAF50;
  border-color: #388E3C;
}

.progress-marker.event-completed::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 10rpx;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 笔记更新动画 */
@keyframes noteUpdateAnimation {
  0% { background-color: rgba(76, 175, 80, 0.2); }
  50% { background-color: rgba(76, 175, 80, 0.3); }
  100% { background-color: rgba(255, 255, 255, 1); }
}

.note-update-animation {
  animation: noteUpdateAnimation 1s ease-out;
}
</style>
