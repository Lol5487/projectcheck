<template>
  <view class="container">
    <view class="header">
      <text class="page-title">编辑笔记</text>
      <view class="header-right">
        <button class="save-btn" @click="saveNote">保存</button>
      </view>
    </view>
    <view class="form">
      <input 
        class="title-input" 
        type="text" 
        v-model="note.title" 
        placeholder="请输入标题" 
        maxlength="100"
      />
      <view class="form-item">
        <text class="form-label">负责人：</text>
        <input 
          class="form-input" 
          type="text" 
          v-model="note.personInCharge" 
          placeholder="请输入负责人姓名" 
          maxlength="50"
        />
      </view>
      
      <!-- 时间框架选择器 -->
      <view class="form-item time-frame-item">
        <text class="form-label">时间框架：</text>
        <view class="date-picker-container">
          <view class="date-range">
            <view class="date-picker-wrap">
            <picker 
              mode="date" 
              :value="note.timeFrame.startDate" 
              @change="onStartDateChange"
              class="date-picker"
            >
              <view class="picker-text" :class="{'placeholder': !note.timeFrame.startDate}">
                {{ note.timeFrame.startDate || '开始日期' }}
      </view>
            </picker>
            </view>
            <text class="date-separator">至</text>
            <view class="date-picker-wrap">
            <picker 
              mode="date" 
              :value="note.timeFrame.endDate" 
              @change="onEndDateChange"
              class="date-picker"
              :disabled="!note.timeFrame.startDate"
            >
              <view class="picker-text" :class="{'placeholder': !note.timeFrame.endDate}">
                {{ note.timeFrame.endDate || '结束日期' }}
              </view>
            </picker>
            </view>
          </view>
          <text v-if="dateError" class="date-error">{{ dateError }}</text>
        </view>
      </view>
      

      
      <!-- 添加事件按钮 -->
      <view class="add-event-button-container">
            <button class="add-event-btn" @click="showAddEventDialog">添加事件</button>
      </view>
      
      <!-- 进度事件列表 -->
      <view class="progress-events-section" v-if="note.progressEvents && note.progressEvents.length > 0">
        <view class="section-title">
          <text>进度事件</text>
          <view class="events-sort">
            <text class="sort-label">排序：</text>
            <picker 
              :value="sortEventsByIndex" 
              :range="sortOptions" 
              @change="onSortChange"
              class="sort-picker"
            >
              <text class="sort-text">{{ sortOptions[sortEventsByIndex] }}</text>
            </picker>
          </view>
        </view>
        
        <view class="events-list">
          <view 
            class="event-item" 
            v-for="event in sortedEvents" 
            :key="event.id"
            :class="{'event-completed': event.completed}"
          >
            <view class="event-header">
              <view class="event-status-indicator" :class="{'completed': event.completed}">
                {{ event.completed ? '已完成' : '进行中' }}
              </view>
              <view class="event-actions">
                <button class="event-action edit-event" @click="editEvent(event)">编辑</button>
                <button class="event-action delete-event" @click="confirmDeleteEvent(event)">删除</button>
              </view>
            </view>
            <view class="event-description">{{ event.description }}</view>
            
            <!-- 事件图片缩略图 -->
            <view class="event-images" v-if="event.images && event.images.length > 0">
              <image 
                v-for="(image, index) in event.images"
                :key="image.id"
                :src="image.path"
                mode="aspectFill"
                class="event-thumbnail"
                @click="previewEventImages(event, index)"
              ></image>
              <button class="add-image-btn" @click="editEvent(event)">
                <text class="add-image-icon">+</text>
              </button>
            </view>
            <button class="add-first-image-btn" v-else @click="editEvent(event)">
              <text class="add-first-image-icon">+</text>
              <text class="add-first-image-text">添加图片</text>
            </button>
            
            <!-- 子事项列表 -->
            <view class="event-things-list" v-if="event.things && event.things.length > 0">
              <view class="event-thing-item" v-for="(thing, thingIndex) in event.things" :key="thing.id">
                <view class="thing-checkbox" @click="toggleThingCompletedInEvent(event, thingIndex)">
                  <view class="checkbox-square" :class="{'checkbox-completed': thing.completed}">
                    <text v-if="thing.completed" class="checkbox-check">✓</text>
                  </view>
                </view>
                <text class="thing-bullet">•</text>
                <text class="thing-content" :class="{'completed-text': thing.completed}">{{ thing.content }}</text>
                <!-- 子事项图片 -->
                <view class="event-thing-images" v-if="thing.images && thing.images.length > 0">
                  <image 
                    v-for="(image, imgIndex) in thing.images" 
                    :key="image.id"
                    :src="image.path"
                    mode="aspectFill"
                    class="event-thing-image"
                    @click="previewThingImageInEvent(event, thingIndex, imgIndex)"
                  ></image>
                </view>
              </view>
            </view>
            
            <view class="event-meta">
              <text class="event-created-at">创建于: {{ formatDate(event.createdAt) }}</text>
              

            </view>
          </view>
        </view>
      </view>
      
      <textarea 
        class="content-input" 
        v-model="note.content" 
        placeholder="请输入笔记内容..." 
        maxlength="10000"
        auto-height
        :adjust-position="true"
        cursor-spacing="120"
      />
      
    </view>
    
    <!-- 添加/编辑事件对话框 -->
    <view class="modal" v-if="showEventDialog" style="z-index: 9000;">
      <view class="modal-mask" @click="cancelEventDialog" style="z-index: 9001;"></view>
      <view class="modal-content" style="z-index: 9002;">
        <view class="modal-header">
          <text class="modal-title">{{ isEditingEvent ? '编辑进度事件' : '添加进度事件' }}</text>
          <button class="add-thing-btn" @click="addNewThing">
            <text class="add-thing-icon">+</text>
            <text class="add-thing-text">添加子事项</text>
          </button>
          <button class="event-upload-btn" @click="uploadEventImage">
            <text class="event-upload-icon">+</text>
            <text class="event-upload-text">添加图片</text>
          </button>
          <text class="modal-close" @click="cancelEventDialog">×</text>
        </view>
        <scroll-view class="modal-body-scroll" scroll-y="true">
          
          <!-- 事件图片上传区域 -->
          <view class="form-item event-images-section">
            <text class="form-label">事件图片：</text>
            <view class="event-images-container">
              <!-- 横向滚动图片查看区 -->
              <view class="image-gallery-title" v-if="eventForm.images && eventForm.images.length > 0">
                <text>横向滑动查看图片</text>
              </view>
              <scroll-view 
                class="event-image-gallery" 
                scroll-x="true" 
                @scroll="onImageScroll"
                v-if="eventForm.images && eventForm.images.length > 0"
                :show-scrollbar="true"
              >
                <view class="event-image-item" v-for="(image, index) in eventForm.images" :key="image.id">
                  <image :src="image.path" mode="aspectFill" class="event-image" @click="previewEventImage(index)"></image>
                  <view class="event-image-delete" @click.stop="deleteEventImage(index)">×</view>
                </view>
              </scroll-view>
              
              <!-- 图片小点指示器 -->
              <view class="image-indicators" v-if="eventForm.images && eventForm.images.length > 1">
                <view 
                  v-for="(_, index) in eventForm.images" 
                  :key="index" 
                  :class="['indicator-dot', { active: currentImageIndex === index }]"
                  @click="scrollToImage(index)"
                ></view>
              </view>
              
              <!-- 上传按钮 -->
              <button 
                class="event-upload-btn" 
                @click="uploadEventImage"
              >
                <text class="event-upload-icon">+</text>
                <text class="event-upload-text">添加图片</text>
              </button>
              <text class="image-tip" v-if="eventForm.images && eventForm.images.length > 0">
                已添加 {{ eventForm.images.length }} 张图片
              </text>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">事件描述：</text>
            <view class="textarea-wrapper">
              <!-- 使用input代替textarea尝试解决问题 -->
              <input 
                class="event-description-input" 
                v-model="eventForm.description" 
                placeholder="请输入事件描述..." 
                maxlength="200"
                confirm-type="done"
                cursor-spacing="100"
                :adjust-position="true"
                @focus="onDescriptionFocus"
                @blur="onDescriptionBlur"
                style="z-index: 9010; padding: 20rpx;"
              />
              
              <!-- 备用文本区 -->
              <view v-if="eventForm.description" class="description-preview">
                {{ eventForm.description }}
        </view>
            </view>
          </view>
          
          <!-- 子事项列表 -->
          <view class="things-list" v-if="eventForm.things && eventForm.things.length > 0">
            <view class="things-header">
              <text class="things-title">事情列表</text>
            </view>
            <view class="thing-item" v-for="(thing, index) in eventForm.things" :key="index">
              <view class="thing-checkbox" @click="toggleThingCompleted(thing)">
                <view class="checkbox-square" :class="{'checkbox-completed': thing.completed}">
                  <text v-if="thing.completed" class="checkbox-check">✓</text>
                </view>
              </view>
              <view class="thing-add-image" @click="uploadThingImage(index)">
                <text class="add-image-icon">+</text>
              </view>
              <view class="thing-content">
                <input 
                  class="thing-input" 
                  v-model="thing.content" 
                  placeholder="请输入事情内容..."
                  :class="{'completed-text': thing.completed}"
                />
                <!-- 子事项图片展示 -->
                <view class="thing-images" v-if="thing.images && thing.images.length > 0">
                  <view class="thing-image-item" v-for="(image, imgIndex) in thing.images" :key="image.id">
                    <image 
                      :src="image.path" 
                      mode="aspectFill" 
                      class="thing-image" 
                      @click="previewThingImage(thing, imgIndex)"
                    ></image>
                    <text class="thing-image-delete" @click.stop="deleteThingImage(index, imgIndex)">×</text>
                  </view>
                </view>
              </view>
              <view class="thing-actions">
                <text class="thing-delete" @click="removeThing(index)">×</text>
              </view>
            </view>
          </view>

        </scroll-view>
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="cancelEventDialog">取消</button>
          <button class="modal-btn save-btn" @click="saveEvent">保存</button>
        </view>
      </view>
    </view>
    
    
  </view>
  
  <!-- 自定义图片预览组件 -->
  <image-preview ref="imagePreview"></image-preview>
  
  <!-- 删除事件确认对话框 -->
  <view class="modal" v-if="showDeleteDialog" style="z-index: 9800;">
    <view class="modal-mask" @click="cancelDeleteDialog" style="z-index: 9801;"></view>
    <view class="modal-content" style="z-index: 9802;">
      <view class="modal-header">
        <text class="modal-title">删除确认</text>
        <text class="modal-close" @click="cancelDeleteDialog">×</text>
      </view>
      <scroll-view class="modal-body-scroll" scroll-y="true">
        <view class="confirm-message">确定要删除这个进度事件吗？</view>
        <view class="event-preview" v-if="eventToDelete">
          <view class="event-preview-icon">⚠️</view>
          <view class="event-preview-content">
            <view class="event-preview-description">{{ eventToDelete.description }}</view>
          </view>
        </view>
      </scroll-view>
      <view class="modal-footer">
        <button class="modal-btn cancel-btn" @click="cancelDeleteDialog">取消</button>
        <button class="modal-btn delete-btn" @click="executeDeleteEvent">删除</button>
      </view>
    </view>
  </view>
  
  <!-- 保存确认对话框 -->
  <view class="modal" v-if="showSaveDialog" style="z-index: 9800;">
    <view class="modal-mask" @click="cancelSaveDialog" style="z-index: 9801;"></view>
    <view class="modal-content" style="z-index: 9802;">
      <view class="modal-header">
        <text class="modal-title">保存确认</text>
        <text class="modal-close" @click="cancelSaveDialog">×</text>
      </view>
      <scroll-view class="modal-body-scroll" scroll-y="true">
        <view class="confirm-message">需要先保存笔记才能继续操作，是否立即保存？</view>
        <view class="event-preview save-preview">
          <view class="event-preview-icon">ℹ️</view>
          <view class="event-preview-content">
            <view class="event-preview-description">您的笔记尚未保存，请先保存笔记后再继续操作。</view>
          </view>
        </view>
      </scroll-view>
      <view class="modal-footer">
        <button class="modal-btn cancel-btn" @click="cancelSaveDialog">取消</button>
        <button class="modal-btn save-btn" @click="executeSaveNote">保存</button>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getNote, 
  saveNote, 
  uploadImageToNote, 
  addProgressEvent,
  updateProgressEvent,
  deleteProgressEvent,
  getProgressEvents,
  calculateCompletionProgress
} from '@/utils/noteService.js';
import { checkAuth } from '@/utils/userService.js';
import ImagePreview from '@/components/ImagePreview.vue';

export default {
  components: {
    ImagePreview
  },
  data() {
    return {
      noteId: '',
      note: {
        title: '',
        content: '',
        personInCharge: '',
        timeFrame: {
          startDate: '',
          endDate: ''
        },

        images: [],
        progressEvents: []
      },
      dateError: '',
      // 进度事件相关
      showEventDialog: false,
      isEditingEvent: false,
      currentEventId: null,
      eventForm: {
        description: '',
        images: [],
        things: []
      },
      currentImageIndex: 0, // 当前显示的图片索引
      // 排序相关
      sortOptions: ['按时间正序', '按时间倒序', '按完成状态'],
      sortEventsByIndex: 0,
      // 用于检测是否注册description的点击焦点
      descriptionFocused: false,
      // 删除事件对话框相关
      showDeleteDialog: false,
      eventToDelete: null,
      // 保存确认对话框相关
      showSaveDialog: false,
      afterSaveCallback: null
    }
  },
  computed: {
    sortedEvents() {
      if (!this.note.progressEvents) return [];
      
      // 预处理事件列表，确保每个事件都有id属性
      const events = [...this.note.progressEvents].map(event => {
        // 如果没有id，生成一个新的id
        if (!event.id) {
          console.log('存在没有id的事件，添加随机id');
          event.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        }
        return event;
      });
      
      if (this.sortEventsByIndex === 0) { // 按时间正序
        return events.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (this.sortEventsByIndex === 1) { // 按时间倒序
        return events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (this.sortEventsByIndex === 2) { // 按完成状态分组
        // 未完成的事件在前，已完成的事件在后
        return events.sort((a, b) => {
          if (a.completed === b.completed) {
            // 如果完成状态相同，则按时间排序
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          // 完成状态不同，则未完成的优先
          return a.completed ? 1 : -1;
        });
      }
      
      return events;
    }
  },
  onLoad(options) {
    // 检查用户是否已登录
    if (!checkAuth()) return;
    
    if (options.id) {
      this.noteId = options.id;
      this.loadNote();
    }
  },
  methods: {
    loadNote() {
      const note = getNote(this.noteId);
      if (note) {
        this.note = { ...note };
        // 确保图片数组存在
        if (!this.note.images) {
          this.note.images = [];
        }

        // 确保timeFrame是对象格式
        if (!this.note.timeFrame || typeof this.note.timeFrame !== 'object') {
          this.note.timeFrame = {
            startDate: '',
            endDate: ''
          };
        }
        // 确保progressEvents数组存在
        if (!this.note.progressEvents) {
          this.note.progressEvents = [];
        }
      }
    },
    // 开始日期变更
    onStartDateChange(e) {
      this.note.timeFrame.startDate = e.detail.value;
      this.validateDateRange();
    },
    // 结束日期变更
    onEndDateChange(e) {
      this.note.timeFrame.endDate = e.detail.value;
      this.validateDateRange();
    },
    // 验证日期范围
    validateDateRange() {
      this.dateError = '';
      if (this.note.timeFrame.startDate && this.note.timeFrame.endDate) {
        const startDate = new Date(this.note.timeFrame.startDate);
        const endDate = new Date(this.note.timeFrame.endDate);
        
        if (endDate < startDate) {
          this.dateError = '结束日期不能早于开始日期';
          // 重置结束日期
          this.note.timeFrame.endDate = '';
        }
      }
    },
    // 获取格式化的时间框架字符串
    getFormattedTimeFrame() {
      if (this.note.timeFrame.startDate && this.note.timeFrame.endDate) {
        return `${this.note.timeFrame.startDate}至${this.note.timeFrame.endDate}`;
      } else if (this.note.timeFrame.startDate) {
        return `${this.note.timeFrame.startDate}起`;
      }
      return '';
    },

    // 显示添加事件对话框
    showAddEventDialog() {
      // 检查笔记是否已保存，未保存则先保存
      if (!this.noteId) {
        // 设置保存后的回调函数并显示保存确认对话框
        this.afterSaveCallback = this.openAddEventDialog;
        this.showSaveDialog = true;
      } else {
                this.openAddEventDialog();
      }
    },
    
    // 取消保存对话框
    cancelSaveDialog() {
      this.showSaveDialog = false;
      this.afterSaveCallback = null;
    },
    
    // 执行保存操作
    executeSaveNote() {
      const callback = this.afterSaveCallback;
      this.showSaveDialog = false;
      
      this.saveNote(() => {
        if (typeof callback === 'function') {
          callback();
        }
        this.afterSaveCallback = null;
      });
    },
    
    // 打开添加事件对话框
    openAddEventDialog() {
      this.isEditingEvent = false;
      this.currentEventId = null;
      this.eventForm = {
        description: '',
        completed: false,
        images: [],
        things: []
      };
      this.currentImageIndex = 0;
      this.showEventDialog = true;
      this.descriptionFocused = false;
      
      console.log('打开添加事件对话框，初始状态为未完成');
    },
    
    // 描述获得焦点
    onDescriptionFocus() {
      this.descriptionFocused = true;
      console.log('描述文本域获得焦点');
    },
    
    // 描述失去焦点
    onDescriptionBlur() {
      this.descriptionFocused = false;
      console.log('描述文本域失去焦点');
    },
    
    // 图片滑动事件
    onImageScroll(e) {
      // 根据滑动位置计算当前显示的是哪张图片
      if (!this.eventForm.images || this.eventForm.images.length <= 1) return;
      
      const scrollLeft = e.detail.scrollLeft;
      const itemWidth = 200; // 图片项宽度包括间距
      const index = Math.round(scrollLeft / itemWidth);
      
      if (index >= 0 && index < this.eventForm.images.length) {
        this.currentImageIndex = index;
      }
    },
    
    // 点击指示器滚动到对应图片
    scrollToImage(index) {
      this.currentImageIndex = index;
      // 模拟滑动到指定图片
      const selector = '.event-image-gallery';
      const query = uni.createSelectorQuery().in(this);
      query.select(selector).boundingClientRect(data => {
        if (data) {
          const itemWidth = 200; // 图片项宽度
          uni.pageScrollTo({
            scrollTop: 0,
            duration: 0
          });
          
          // 注意：这里需要用DOM API设置滑动位置，因为uni的API没有提供横向滑动的方法
          // 在uniapp中需要用不同的方式实现
          const scrollViewElement = uni.requireNativePlugin('dom').getComponentRect;
          scrollViewElement({
            ref: selector,
            scrollLeft: index * itemWidth
          });
        }
      }).exec();
    },

    // 增加新的子事项
    addNewThing() {
      if (!this.eventForm.things) {
        this.eventForm.things = [];
      }
      
      this.eventForm.things.push({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        content: '',
        createdAt: new Date().toISOString(),
        images: [], // 添加图片数组
        completed: false // 子事项完成状态
      });
    },
    
    // 切换子事项完成状态
    toggleThingCompleted(thing) {
      thing.completed = !thing.completed;
      
      // 如果正在编辑已存在的事件，立即更新笔记
      if (this.isEditingEvent && this.currentEventId && this.noteId) {
        // 更新事件对象
        const event = this.note.progressEvents.find(e => e.id === this.currentEventId);
        if (event) {
          // 更新主事件的完成状态
          const allCompleted = this.eventForm.things.every(t => t.completed);
          this.eventForm.completed = allCompleted;
        }
        
        this.saveNote(() => {
          uni.showToast({
            title: thing.completed ? '已完成' : '未完成',
            icon: 'none',
            duration: 1000
          });
        }, { stayOnPage: true });
      }
    },
    
    // 在事件列表中切换子事项完成状态
    toggleThingCompletedInEvent(event, thingIndex) {
      if (!event.things || thingIndex >= event.things.length) return;
      
      const thing = event.things[thingIndex];
      thing.completed = !thing.completed;
      
      // 更新主事件的完成状态
      this.updateEventCompletionStatus(event);
      
      // 更新笔记
      this.saveNote(() => {
        uni.showToast({
          title: thing.completed ? '已完成' : '未完成',
          icon: 'none',
          duration: 1000
        });
      }, { stayOnPage: true });
    },
    
    // 更新主事件的完成状态
    updateEventCompletionStatus(event) {
      // 如果没有子事项，不改变主事件状态
      if (!event.things || event.things.length === 0) return;
      
      // 如果所有子事项都标记为完成，则主事件也标记为完成
      const allCompleted = event.things.every(thing => thing.completed);
      event.completed = allCompleted;
      
      // 如果状态变为完成，设置完成时间
      if (allCompleted && !event.completedAt) {
        event.completedAt = new Date().toISOString();
      } else if (!allCompleted) {
        // 如果状态变为未完成，清除完成时间
        event.completedAt = null;
      }
      
      console.log(`事件"${event.description}"的完成状态已更新为: ${event.completed ? '已完成' : '未完成'}`);
    },
    
    // 移除子事项
    removeThing(index) {
      this.eventForm.things.splice(index, 1);
    },
    
    // 为子事项上传图片
    uploadThingImage(thingIndex) {
      if (thingIndex < 0 || thingIndex >= this.eventForm.things.length) return;
      
      uni.chooseImage({
        count: 9, // 最多可以选择的图片张数
        sizeType: ['compressed'], // 压缩图片
        sourceType: ['album', 'camera'], // 可以选择来源
        success: (res) => {
          const tempFilePaths = res.tempFilePaths;
          
          // 创建新图片数组
          const newImages = tempFilePaths.map(path => ({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            path: path,
            uploadTime: new Date().toISOString()
          }));
          
          // 确保子事项有图片数组
          if (!this.eventForm.things[thingIndex].images) {
            this.eventForm.things[thingIndex].images = [];
          }
          
          // 添加图片
          this.eventForm.things[thingIndex].images = [
            ...this.eventForm.things[thingIndex].images,
            ...newImages
          ];
        }
      });
    },
    
    // 删除子事项图片
    deleteThingImage(thingIndex, imageIndex) {
      if (thingIndex < 0 || thingIndex >= this.eventForm.things.length) return;
      if (!this.eventForm.things[thingIndex].images) return;
      if (imageIndex < 0 || imageIndex >= this.eventForm.things[thingIndex].images.length) return;
      
      this.eventForm.things[thingIndex].images.splice(imageIndex, 1);
      
      // 如果是编辑中的事件，保存更改
      if (this.isEditingEvent && this.currentEventId) {
        const eventIndex = this.note.progressEvents.findIndex(e => e.id === this.currentEventId);
        if (eventIndex !== -1 && this.note.progressEvents[eventIndex].things) {
          // 更新子事项的图片
          if (thingIndex < this.note.progressEvents[eventIndex].things.length) {
            this.note.progressEvents[eventIndex].things[thingIndex].images = this.eventForm.things[thingIndex].images;
            this.saveNote(() => {
              uni.showToast({
                title: '子事项图片已删除',
                icon: 'success'
              });
            }, { stayOnPage: true });
          }
        }
      }
    },
    
    // 预览子事项图片
    previewThingImage(thing, imageIndex) {
      if (!thing.images || thing.images.length === 0) return;
      
      const urls = thing.images.map(img => img.path);
      
      // 使用自定义组件预览图片
      this.$refs.imagePreview.show({
        current: urls[imageIndex],
        urls: urls
      });
    },
    
    // 在事件列表中预览子事项图片
    previewThingImageInEvent(event, thingIndex, imageIndex) {
      if (!event.things || thingIndex >= event.things.length) return;
      const thing = event.things[thingIndex];
      if (!thing.images || imageIndex >= thing.images.length) return;
      
      const urls = thing.images.map(img => img.path);
      this.$refs.imagePreview.show({
        current: urls[imageIndex],
        urls: urls
      });
    },
    
    // 取消事件对话框
    cancelEventDialog() {
      this.showEventDialog = false;
    },
    // 保存事件
    saveEvent() {
      // 验证输入
      if (!this.eventForm.description) {
        uni.showToast({
          title: '请输入事件描述',
          icon: 'none'
        });
        return;
      }
      
      // 检查子事项的完成状态，决定事件是否完成
      const validThings = this.eventForm.things.filter(t => t.content.trim());
      const completed = validThings.length > 0 ? validThings.every(t => t.completed) : false;
      
      // 创建事件对象
      const eventData = {
        description: this.eventForm.description,
        images: this.eventForm.images || [],
        things: validThings, // 去除空内容的事情
        completed: completed // 根据子事项完成状态决定
      };
      
      // 如果完成状态为true，添加完成时间
      if (completed) {
        eventData.completedAt = new Date().toISOString();
      }
      
      console.log(`保存事件，完成状态: ${completed ? '已完成' : '未完成'}`);
      
      // 保存事件
      if (this.isEditingEvent && this.currentEventId) {
        // 更新现有事件
        const result = updateProgressEvent(this.noteId, this.currentEventId, eventData);
        if (result.success) {
          this.note = result.note;
          uni.showToast({
            title: '事件已更新',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: result.message || '更新事件失败',
            icon: 'none'
          });
        }
      } else {
        // 添加新事件
        const result = addProgressEvent(this.noteId, eventData);
        if (result.success) {
          this.note = result.note;
          uni.showToast({
            title: '事件已添加',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: result.message || '添加事件失败',
            icon: 'none'
          });
        }
      }
      
      // 关闭对话框
      this.cancelEventDialog();
    },
    // 显示事件详情
    showEventDetails(event) {
      this.isEditingEvent = true;
      this.currentEventId = event.id;
      
      // 设置事件表单数据
      this.eventForm = {
        description: event.description,
        images: event.images || [],
        things: event.things || []
      };
      
      this.showEventDialog = true;
    },
    // 编辑事件
    editEvent(event) {
      this.isEditingEvent = true;
      this.currentEventId = event.id;
      
      // 设置表单值
      this.eventForm = {
        description: event.description,
        images: event.images || [],
        things: event.things || [],
        completed: event.completed || false // 保留完成状态
      };
      
      this.currentImageIndex = 0;
      this.showEventDialog = true;
      
      console.log(`编辑事件: ${event.description}, 完成状态: ${event.completed ? '已完成' : '未完成'}`);
    },
    // 确认删除事件
    confirmDeleteEvent(event) {
      console.log('confirmDeleteEvent被调用，事件信息:', event);
      
      if (!this.noteId) {
        // 如果笔记未保存，先保存笔记
        // 设置保存后的回调函数并显示保存确认对话框
        this.afterSaveCallback = () => {
          this.confirmDeleteEvent(event); // 保存完成后再次调用删除
        };
        this.showSaveDialog = true;
        return;
      }
      
      if (!event || !event.id) {
        console.error('事件或事件ID无效:', event);
        uni.showToast({
          title: '事件ID无效，无法删除',
          icon: 'none'
        });
        return;
      }
      
      // 设置要删除的事件并显示确认对话框
      this.eventToDelete = event;
      this.showDeleteDialog = true;
    },
    
    // 取消删除对话框
    cancelDeleteDialog() {
      this.showDeleteDialog = false;
      this.eventToDelete = null;
    },
    
    // 执行删除事件
    executeDeleteEvent() {
      if (!this.eventToDelete || !this.eventToDelete.id) {
        uni.showToast({
          title: '事件无效，无法删除',
          icon: 'none'
        });
        this.cancelDeleteDialog();
        return;
      }
      
      console.log('用户确认删除，noteId:', this.noteId, '事件ID:', this.eventToDelete.id);
      try {
        const result = deleteProgressEvent(this.noteId, this.eventToDelete.id);
        console.log('删除结果:', result);
        
        if (result && result.success) {
          this.note = { ...result.note }; // 使用对象展开语法创建新对象
              uni.showToast({
                title: '事件删除成功',
                icon: 'success'
              });
          // 保存笔记以确保更新已经持久化
          this.saveNote(null, { stayOnPage: true });
            } else {
              uni.showToast({
            title: (result && result.message) ? result.message : '删除失败',
                icon: 'none'
              });
            }
      } catch (error) {
        console.error('删除事件时发生错误:', error);
        uni.showToast({
          title: '删除失败: ' + error.message,
          icon: 'none'
        });
      }
      
      // 关闭删除对话框
      this.cancelDeleteDialog();
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    // 排序方式变化
    onSortChange(e) {
      this.sortEventsByIndex = parseInt(e.detail.value);
    },
    saveNote(callback, options = {}) {
      console.log('开始保存笔记', this.note);
      
      if (!this.note.title && !this.note.content) {
        uni.showToast({
          title: '笔记标题或内容不能为空',
          icon: 'none'
        });
        return;
      }
      
      // 验证日期范围
      if (this.dateError) {
        uni.showToast({
          title: this.dateError,
          icon: 'none'
        });
        return;
      }
      
      // 确保各个属性格式正确
      if (!this.note.images) {
        this.note.images = [];
      }
      
      if (!this.note.progressEvents) {
        this.note.progressEvents = [];
      }
      
      if (!this.note.timeFrame || typeof this.note.timeFrame !== 'object') {
        this.note.timeFrame = {
          startDate: '',
          endDate: ''
        };
      }
      
      try {
        console.log('调用saveNote前的笔记ID：', this.noteId);
        const noteToSave = {
        id: this.noteId,
        title: this.note.title,
        content: this.note.content,
        personInCharge: this.note.personInCharge,
        timeFrame: this.note.timeFrame,

          images: this.note.images,
          progressEvents: this.note.progressEvents
        };
        
        console.log('即将保存笔记：', noteToSave);
        // 调用导入的saveNote函数，而不是组件方法
        const savedNote = saveNote(noteToSave);
        console.log('保存后返回的笔记：', savedNote);
      
      if (savedNote) {
        this.noteId = savedNote.id;
          this.note = savedNote; // 更新整个笔记对象，确保数据一致
          
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 执行回调函数（如果存在）
        if (typeof callback === 'function') {
          callback();
        } else if (!options.stayOnPage) { // 如果没有要求留在当前页面
          // 延迟返回，让用户看到保存成功的提示
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }
      } else {
          throw new Error('保存笔记返回值为空');
        }
      } catch (error) {
        console.error('保存笔记失败：', error);
        uni.showToast({
          title: '保存失败: ' + (error.message || '未知错误'),
          icon: 'none',
          duration: 2000
        });
      }
    },
    // 预览图片
    previewImage(index) {
      if (!this.note.images || this.note.images.length === 0) return;
      
      const urls = this.note.images.map(img => img.path);
      uni.previewImage({
        current: urls[index],
        urls: urls
      });
    },
    // 删除图片
    deleteImage(index) {
      // 直接删除图片，不显示确认弹窗
            this.note.images.splice(index, 1);
            // 更新笔记以保存删除操作
      this.saveNote(() => {
        uni.showToast({
          title: '图片已删除',
          icon: 'success'
        });
      }, { stayOnPage: true });
    },
    // 上传图片
    uploadImage() {
      if (!this.noteId) {
        // 如果是新笔记，先保存
        if (!this.note.title && !this.note.content) {
          uni.showToast({
            title: '请先输入标题或内容',
            icon: 'none'
          });
          return;
        }
        
        // 使用组件的saveNote方法保存笔记
        this.saveNote(() => {
          // 直接使用uni.chooseImage而不是调用uploadImageToExistingNote
          uni.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
              const tempFilePath = res.tempFilePaths[0];
              
              // 生成图片ID
              const imageId = Date.now().toString(36) + Math.random().toString(36).substr(2);
              
              // 如果note.images不存在，创建一个空数组
              if (!this.note.images) {
                this.note.images = [];
              }
              
              // 添加图片信息到笔记
              this.note.images.push({
                id: imageId,
                path: tempFilePath,
                name: `${imageId}_${tempFilePath.split('/').pop()}`,
                createdAt: new Date().toISOString()
              });
              
              // 保存更新后的笔记
              this.saveNote(() => {
                uni.showToast({
                  title: '图片上传成功',
                  icon: 'success'
                });
              }, { stayOnPage: true });
            },
            fail: (err) => {
              uni.showToast({
                title: '选择图片失败',
                icon: 'none'
              });
            }
          });
        });
      } else {
        this.uploadImageToExistingNote();
      }
    },
    // 为已存在的笔记上传图片
    uploadImageToExistingNote() {
      uploadImageToNote(this.noteId, (updatedNote, error) => {
        if (error) {
          uni.showToast({
            title: error,
            icon: 'none'
          });
          return;
        }
        
        if (updatedNote) {
          this.note = updatedNote;
          uni.showToast({
            title: '图片上传成功',
            icon: 'success'
          });
        }
      });
    },
    // 预览事件图片
    previewEventImage(index) {
      if (!this.eventForm.images || this.eventForm.images.length === 0) return;
      
      const urls = this.eventForm.images.map(img => img.path);
      
      // 使用自定义组件预览图片
      this.$refs.imagePreview.show({
        current: urls[index],
        urls: urls
      });
    },
    // 删除事件图片
    deleteEventImage(index) {
      // 直接删除图片，不显示确认弹窗
              // 应用删除操作
              this.eventForm.images.splice(index, 1);
              
              // 更新事件以保存删除操作
              if (this.isEditingEvent && this.currentEventId) {
                const eventIndex = this.note.progressEvents.findIndex(e => e.id === this.currentEventId);
                if (eventIndex !== -1) {
                  this.note.progressEvents[eventIndex].images = this.eventForm.images;
          this.saveNote(() => {
            uni.showToast({
              title: '图片已删除',
              icon: 'success'
            });
          }, { stayOnPage: true });
        }
      }
    },
    // 上传事件图片
    uploadEventImage() {
      // 确保有noteId
      if (!this.noteId) {
        // 设置保存后的回调函数并显示保存确认对话框
        this.afterSaveCallback = this._chooseEventImages;
        this.showSaveDialog = true;
        return;
      }
      
      this._chooseEventImages();
    },
    
    // 选择事件图片
    _chooseEventImages() {
      // 使用新方法上传图片到事件
      uni.chooseImage({
        count: 9, // 每次最多选择9张
        sizeType: ['compressed'], // 压缩图片
        sourceType: ['album', 'camera'], // 相册或相机
        success: (res) => {
          const tempFilePaths = res.tempFilePaths;
          
          // 创建新图片数组
          const newImages = tempFilePaths.map(path => ({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            path: path,
            uploadTime: new Date().toISOString()
          }));
          
          // 添加到当前表单
          if (!this.eventForm.images) {
            this.eventForm.images = [];
          }
          
          this.eventForm.images = [...this.eventForm.images, ...newImages];
          
          // 如果是编辑中的事件，立即更新到note中
          if (this.isEditingEvent && this.currentEventId) {
            const eventIndex = this.note.progressEvents.findIndex(e => e.id === this.currentEventId);
            if (eventIndex !== -1) {
              this.note.progressEvents[eventIndex].images = this.eventForm.images;
              
              // 保存更新
              this.saveNote(() => {
              uni.showToast({
              title: `成功添加 ${tempFilePaths.length} 张图片`,
                icon: 'success'
              });
              }, { stayOnPage: true });
            }
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },
    // ... existing code ...
    // 添加事件图片
    quickAddEventImage(event) {
      // 确保有noteId
      if (!this.noteId) {
        // 设置保存后的回调函数并显示保存确认对话框
        this.afterSaveCallback = () => this._addImageToEvent(event);
        this.showSaveDialog = true;
        return;
      }
      
      this._addImageToEvent(event);
    },
    
    // 内部方法，用于向事件添加图片
    _addImageToEvent(event) {
      
      // 使用新方法上传图片到事件
      uni.chooseImage({
        count: 9, // 每次最多选择9张
        sizeType: ['compressed'], // 压缩图片
        sourceType: ['album', 'camera'], // 相册或相机
        success: (res) => {
          const tempFilePaths = res.tempFilePaths;
          
          // 创建新图片数组
          const newImages = tempFilePaths.map(path => ({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            path: path,
            uploadTime: new Date().toISOString()
          }));
          
          // 添加到当前事件
          if (!event.images) {
            event.images = [];
          }
          
          event.images = [...event.images, ...newImages];
          
          // 保存更新
          this.saveNote(() => {
          uni.showToast({
              title: `成功添加 ${tempFilePaths.length} 张图片`,
            icon: 'success'
          });
          }, { stayOnPage: true });
        },
        fail: (err) => {
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },
    // 预览事件图片
    previewEventImages(event, index) {
      if (!event.images || event.images.length === 0) return;
      
      const urls = event.images.map(img => img.path);
      this.$refs.imagePreview.show({
        current: urls[index],
        urls: urls
      });
    },

  }
}
</script>

<style>
/* 页面滚动容器 */
.page-scroll {
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #1a4b8c 0%, #0d2d62 100%);
}

/* 复选框样式 */
.thing-checkbox {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10rpx;
}

.checkbox-square {
  width: 30rpx;
  height: 30rpx;
  border: 2rpx solid #0d2d62;
  border-radius: 6rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  transition: all 0.2s;
}

.checkbox-completed {
  background-color: #0d2d62;
}

.checkbox-check {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
  line-height: 24rpx;
}

.completed-text {
  text-decoration: line-through;
  color: #999;
}

/* 图片预览层级提升 */
::v-deep(.uni-popup), ::v-deep(.uni-preview-image) {
  z-index: 9999999 !important;
}

/* 编辑事件模态框层级 */
.modal {
  z-index: 9000;
}

.modal-mask {
  z-index: 9001;
}

.modal-content {
  z-index: 9002;
}

/* 增加事情按钮 */
.add-thing-btn {
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
  color: white;
  border: none;
  border-radius: 20rpx;
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  margin-right: 20rpx;
  height: auto;
  line-height: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 8rpx rgba(13, 45, 98, 0.3);
  transition: all 0.2s ease;
}

.add-thing-icon {
  font-size: 28rpx;
  font-weight: bold;
  margin-right: 6rpx;
}

.add-thing-text {
  font-size: 24rpx;
}

.add-thing-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 4rpx rgba(13, 45, 98, 0.3);
  opacity: 0.9;
}

/* 事情列表样式 */
.things-list {
  margin: 20rpx 0;
  border-top: 1px solid #eee;
  padding-top: 20rpx;
}

.thing-add-image {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10rpx;
  background-color: #e6f0ff;
  border-radius: 8rpx;
  cursor: pointer;
}

.add-image-icon {
  color: #0d2d62;
  font-size: 30rpx;
  font-weight: bold;
}

.thing-images {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10rpx;
}

.thing-image-item {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
}

.thing-image {
  width: 100%;
  height: 100%;
  border-radius: 6rpx;
}

.thing-image-delete {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 35rpx;
  font-size: 30rpx;
}

.things-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.things-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #555;
}

.thing-item {
  display: flex;
  margin-bottom: 10rpx;
  padding: 10rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
  position: relative;
}

.thing-content {
  flex: 1;
}

.thing-input {
  width: 100%;
  height: 60rpx;
  font-size: 26rpx;
  border: none;
  background: transparent;
}

.thing-actions {
  display: flex;
  align-items: center;
}

.thing-delete {
  font-size: 40rpx;
  color: #999;
  width: 50rpx;
  text-align: center;
  line-height: 50rpx;
}

/* 事件列表中的子事项样式 */
.event-things-list {
  margin: 10rpx 0 16rpx;
  padding-left: 20rpx;
}

.event-thing-item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-bottom: 10rpx;
}

.thing-bullet {
  color: #0d2d62;
  margin-right: 10rpx;
  font-size: 32rpx;
  line-height: 36rpx;
}

.thing-content {
  font-size: 26rpx;
  color: #666;
  flex: 1;
  line-height: 36rpx;
}

.event-thing-images {
  display: flex;
  margin-top: 6rpx;
  margin-left: 30rpx;
  flex-basis: 100%;
}

.event-thing-image {
  width: 100rpx;
  height: 100rpx;
  margin-right: 10rpx;
  border-radius: 6rpx;
}

/* 事件图片画廊 */
.image-gallery-title {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  text-align: center;
}

.event-image-gallery {
  width: 100%;
  height: 220rpx;
  white-space: nowrap;
  margin-bottom: 10rpx;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.image-indicators {
  display: flex;
  justify-content: center;
  margin: 8rpx 0 16rpx;
}

.indicator-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
  background-color: #ddd;
  margin: 0 6rpx;
  transition: all 0.3s;
}

.indicator-dot.active {
  width: 24rpx;
  background-color: #0d2d62;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a4b8c 0%, #0d2d62 100%);
  position: relative;
  overflow: visible;
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

.form {
  flex: 1;
  padding: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  margin: 20rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;
  overflow-y: visible;
}

.title-input {
  font-size: 40rpx;
  font-weight: bold;
  padding: 20rpx 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 30rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20rpx;
}

.form-label {
  width: 180rpx;
  font-size: 30rpx;
  color: #666;
}

.form-input {
  flex: 1;
  font-size: 30rpx;
}

/* 时间框架日期选择器样式 */
.time-frame-item {
  align-items: flex-start;
}

.date-picker-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.date-range {
  display: flex;
  align-items: center;
  width: 100%;
}

.date-picker-wrap {
  flex: 1;
  position: relative;
  background-color: #f8f8f8;
  border-radius: 6rpx;
  overflow: hidden;
}

.date-picker {
  width: 100%;
  height: 60rpx;
}

.picker-text {
  height: 60rpx;
  line-height: 60rpx;
  font-size: 28rpx;
  padding: 0 16rpx;
  color: #333;
}

.placeholder {
  color: #999;
}

.date-separator {
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #666;
}

.date-error {
  font-size: 24rpx;
  color: #f44336;
  margin-top: 10rpx;
}



/* 添加事件按钮容器 */
.add-event-button-container {
  display: flex;
  justify-content: center;
  margin: 30rpx 0;
}

/* 添加事件按钮样式 */
.add-event-btn {
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
  color: #fff;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  box-shadow: 0 4rpx 10rpx rgba(13, 45, 98, 0.3);
  transition: all 0.3s;
}

.add-event-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 5rpx rgba(13, 45, 98, 0.3);
  opacity: 0.9;
}

/* 进度事件列表样式 */
.progress-events-section {
  margin: 30rpx 0;
  border-top: 1px solid #eee;
  padding-top: 20rpx;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}

.events-sort {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  font-weight: normal;
}

.sort-label {
  color: #666;
  margin-right: 10rpx;
}

.sort-picker {
  background-color: #f8f8f8;
  border-radius: 4rpx;
  padding: 4rpx 12rpx;
}

.sort-text {
  font-size: 24rpx;
  color: #333;
}

.events-list {
  margin-bottom: 20rpx;
}

.event-item {
  background-color: #f8f8f8;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-left: 6rpx solid #4CAF50;
}

.event-item.event-completed {
  border-left-color: #ccc;
  opacity: 0.8;
}



.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.event-status-indicator {
  font-size: 28rpx;
  font-weight: bold;
  padding: 4rpx 16rpx;
  border-radius: 30rpx;
  color: #fff;
  background-color: #FF9800;
  min-width: 120rpx;
  text-align: center;
}

.event-status-indicator.completed {
  background-color: #4CAF50;
}

.event-actions {
  display: flex;
  gap: 10rpx;
}

.event-action {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  margin: 0;
  line-height: 1.5;
  min-width: auto;
}

.edit-event {
  background-color: #E0E0E0;
  color: #333;
}

.delete-event {
  background-color: #FFEBEE;
  color: #F44336;
}

.event-description {
  font-size: 28rpx;
  line-height: 1.5;
  margin-bottom: 10rpx;
  color: #333;
}

.event-meta {
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: #999;
  flex-wrap: wrap;
}

.event-status {
  color: #4CAF50;
  margin-left: auto;
}



.content-input {
  font-size: 32rpx;
  line-height: 1.8;
  width: 100%;
  min-height: 300rpx;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
}

/* 图片上传区域样式 */
.image-section {
  margin-top: 60rpx;
  border-top: 1px solid #eee;
  padding-top: 30rpx;
}

.image-preview-container {
  white-space: nowrap;
  margin-bottom: 20rpx;
  height: 200rpx;
}

.image-preview {
  display: inline-block;
  position: relative;
  width: 180rpx;
  height: 180rpx;
  margin-right: 20rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.image-delete {
  position: absolute;
  top: 5rpx;
  right: 5rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
}

.upload-btn {
  background-color: #f0f0f0;
  color: #666;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

/* 对话框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
  to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #eee;
  background: linear-gradient(to right, #f8f8f8, #ffffff);
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  padding-left: 10rpx;
  border-left: 6rpx solid #0d2d62;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  padding: 0 10rpx;
  height: 50rpx;
  width: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 25rpx;
  transition: all 0.2s;
}

.modal-close:active {
  background-color: #f0f0f0;
  color: #666;
}

.modal-body-scroll {
  padding: 40rpx 30rpx;
  max-height: 60vh;
}

.confirm-message {
  font-size: 30rpx;
  line-height: 1.5;
  margin-bottom: 30rpx;
  color: #333;
  text-align: center;
}

.event-preview {
  background-color: #fff9f0;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: flex-start;
  border-left: 5rpx solid #ff9800;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);
}

.save-preview {
  background-color: #f0f8ff;
  border-left-color: #2196f3;
}

.event-preview-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
  line-height: 1.2;
}

.event-preview-content {
  flex: 1;
}

.event-preview-description {
  font-size: 28rpx;
  line-height: 1.5;
  color: #555;
  word-break: break-all;
  white-space: pre-wrap;
}

.event-slider {
  width: 100%;
  margin: 10rpx 0;
}

.textarea-wrapper {
  flex: 1;
  margin-top: 10rpx;
  position: relative;
  background-color: #f8f8f8;
  border-radius: 6rpx;
  z-index: 5;
}

.event-description-input {
  width: 100%;
  min-height: 80rpx;
  background-color: #f8f8f8;
  border-radius: 6rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  pointer-events: auto;
  z-index: 6;
  position: relative;
}

.description-preview {
  margin-top: 10rpx;
  width: 100%;
  min-height: 80rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

.modal-footer {
  display: flex;
  padding: 25rpx 30rpx;
  border-top: 1px solid #eee;
  background-color: #fafafa;
}

.modal-btn {
  flex: 1;
  margin: 0 10rpx;
  font-size: 28rpx;
  padding: 20rpx 0;
  border-radius: 12rpx;
  font-weight: 500;
  transition: all 0.3s;
  border: none;
  position: relative;
  overflow: hidden;
}

.modal-btn:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(100%);
  transition: transform 0.3s;
}

.modal-btn:active:after {
  transform: translateY(0);
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
}

.save-btn {
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-shadow: 0 4rpx 10rpx rgba(13, 45, 98, 0.3);
  border: none;
  transition: all 0.3s;
  margin: 0;
  height: auto;
  line-height: 1.8;
  min-width: auto;
}

.delete-btn {
  background: linear-gradient(45deg, #ff5252, #ff7676);
  color: #fff;
  box-shadow: 0 4rpx 10rpx rgba(255, 82, 82, 0.3);
}

.save-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 5rpx rgba(13, 45, 98, 0.3);
  opacity: 0.9;
}

/* 顶部标题栏 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  margin: 20rpx 20rpx 0;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 15rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

/* 适配不同尺寸的屏幕 */
@media screen and (min-width: 768px) {
  .form {
    padding: 40rpx;
    max-width: 960rpx;
    margin: 0 auto;
  }
  
  .date-picker {
    height: 80rpx;
  }
  
  .picker-text {
    height: 80rpx;
    line-height: 80rpx;
    font-size: 32rpx;
    padding: 0 20rpx;
  }
  
  .date-separator {
    padding: 0 30rpx;
    font-size: 32rpx;
  }
  
  .modal-content {
    max-width: 800rpx;
  }
}

/* 完成状态切换 */
.completion-switch {
  display: flex;
  margin-bottom: 10rpx;
  border-radius: 6rpx;
  overflow: hidden;
  border: 1px solid #eee;
}

.switch-option {
  flex: 1;
  text-align: center;
  padding: 12rpx 0;
  font-size: 26rpx;
  color: #666;
  background-color: #f8f8f8;
  border-right: 1px solid #eee;
  transition: all 0.2s;
}

.switch-option:last-child {
  border-right: none;
}

.switch-option.active {
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
  color: #fff;
  font-weight: bold;
}

.status-description {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
}

/* 事件图片上传区域样式 */
.event-images-section {
  margin-top: 20rpx;
}

.event-images-container {
  display: flex;
  align-items: center;
}

.event-image-list {
  white-space: nowrap;
  margin-right: 20rpx;
}

.event-image-item {
  display: inline-block;
  position: relative;
  width: 180rpx;
  height: 180rpx;
  margin-right: 20rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.event-image {
  width: 100%;
  height: 100%;
}

.event-image-delete {
  position: absolute;
  top: 5rpx;
  right: 5rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
}

.event-upload-btn {
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
  color: #fff;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  margin-left: 20rpx;
  box-shadow: 0 4rpx 10rpx rgba(13, 45, 98, 0.3);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  height: auto;
  line-height: 1.5;
  border: none;
}

.event-upload-icon {
  font-size: 28rpx;
  font-weight: bold;
  margin-right: 6rpx;
}

.event-upload-text {
  font-size: 24rpx;
}

.event-upload-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 5rpx rgba(13, 45, 98, 0.3);
  opacity: 0.9;
}

.image-tip {
  font-size: 22rpx;
  color: #999;
  margin-left: 20rpx;
}

/* 事件图片样式 */
.event-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin: 10rpx 0;
}

.event-thumbnail {
  width: 120rpx;
  height: 120rpx;
  border-radius: 6rpx;
  object-fit: cover;
}

.add-image-btn {
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
  color: #fff;
  font-size: 24rpx;
  width: 44rpx;
  height: 44rpx;
  padding: 0;
  border-radius: 50%;
  margin-left: 10rpx;
  box-shadow: 0 4rpx 10rpx rgba(13, 45, 98, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  border: none;
}

.add-image-icon {
  font-size: 28rpx;
  font-weight: bold;
}

.add-image-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 5rpx rgba(13, 45, 98, 0.3);
  opacity: 0.9;
}

.add-first-image-btn {
  background: linear-gradient(45deg, #0d2d62, #1a4b8c);
  color: #fff;
  font-size: 24rpx;
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  margin: 10rpx 0;
  box-shadow: 0 4rpx 10rpx rgba(13, 45, 98, 0.3);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  height: auto;
  line-height: 1.5;
  border: none;
}

.add-first-image-icon {
  font-size: 28rpx;
  font-weight: bold;
  margin-right: 6rpx;
}

.add-first-image-text {
  font-size: 24rpx;
}

.add-first-image-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 5rpx rgba(13, 45, 98, 0.3);
  opacity: 0.9;
}
</style>