/**
 * 笔记服务
 */

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 获取所有笔记
export function getNotes() {
  const notes = uni.getStorageSync('notes') || [];
  
  // 兼容处理：将旧的timeFrame字符串转换为对象格式
  notes.forEach(note => {
    if (typeof note.timeFrame === 'string' && note.timeFrame) {
      const parts = note.timeFrame.split('至');
      if (parts.length === 2) {
        note.timeFrame = {
          startDate: parts[0].trim(),
          endDate: parts[1].trim()
        };
      } else {
        note.timeFrame = {
          startDate: '',
          endDate: ''
        };
      }
    } else if (!note.timeFrame || typeof note.timeFrame !== 'object') {
      note.timeFrame = {
        startDate: '',
        endDate: ''
      };
    }
    
    // 确保每个笔记都有progressEvents数组
    if (!note.progressEvents) {
      note.progressEvents = [];
    }
  });
  
  return notes;
}

// 获取单个笔记
export function getNote(id) {
  const notes = getNotes();
  return notes.find(note => note.id === id);
}

// 保存笔记
export function saveNote(note) {
  console.log('noteService.saveNote 开始保存笔记:', note);
  
  try {
    let notes = getNotes();
    console.log('当前所有笔记数量:', notes.length);
    
    if (!note.id) {
      // 新建笔记
      console.log('创建新笔记');
      note.id = generateId();
      console.log('生成的ID:', note.id);
      note.createdAt = new Date().toISOString();
      note.personInCharge = note.personInCharge || '';
      
      // 处理timeFrame字段，确保是对象格式
      if (typeof note.timeFrame === 'string') {
        const parts = note.timeFrame.split('至');
        if (parts.length === 2) {
          note.timeFrame = {
            startDate: parts[0].trim(),
            endDate: parts[1].trim()
          };
        } else {
          note.timeFrame = {
            startDate: '',
            endDate: ''
          };
        }
      } else if (!note.timeFrame || typeof note.timeFrame !== 'object') {
        note.timeFrame = {
          startDate: '',
          endDate: ''
        };
      }
      
      note.isCompleted = note.isCompleted || false;
      note.completionPercentage = note.completionPercentage || 0; // 添加完成进度百分比
      note.images = note.images || []; // 添加图片数组
      note.trackingFormat = note.trackingFormat || '';
      note.reminderTime = note.reminderTime || null;
      note.progressEvents = note.progressEvents || []; // 添加进度事件数组
      notes.push(note);
      console.log('新笔记已添加到数组，当前笔记数量:', notes.length);
    } else {
      // 更新笔记
      console.log('更新已有笔记, ID:', note.id);
      const index = notes.findIndex(n => n.id === note.id);
      console.log('找到的笔记索引:', index);
      
      if (index !== -1) {
        note.updatedAt = new Date().toISOString();
        
        // 确保所有必需的属性存在
        note.personInCharge = note.personInCharge || notes[index].personInCharge || '';
        
        // 处理timeFrame字段，确保是对象格式
        if (typeof note.timeFrame === 'string') {
          const parts = note.timeFrame.split('至');
          if (parts.length === 2) {
            note.timeFrame = {
              startDate: parts[0].trim(),
              endDate: parts[1].trim()
            };
          } else {
            note.timeFrame = notes[index].timeFrame || {
              startDate: '',
              endDate: ''
            };
          }
        } else if (!note.timeFrame || typeof note.timeFrame !== 'object') {
          note.timeFrame = notes[index].timeFrame || {
            startDate: '',
            endDate: ''
          };
        }
        
        note.completionPercentage = note.completionPercentage !== undefined ? note.completionPercentage : (notes[index].completionPercentage || 0);
        note.images = note.images || notes[index].images || [];
        note.progressEvents = note.progressEvents || notes[index].progressEvents || [];
        notes[index] = note;
        console.log('已更新笔记');
      } else {
        console.warn('未找到要更新的笔记，将作为新笔记添加');
        note.createdAt = new Date().toISOString();
        notes.push(note);
      }
    }
    
    console.log('准备保存到存储，笔记数量:', notes.length);
    // 保存前检查notes是否为有效数组
    if (!Array.isArray(notes)) {
      console.error('笔记数组无效:', notes);
      notes = [];
    }
    
    // 使用JSON序列化检查notes数组是否包含循环引用
    try {
      JSON.stringify(notes);
    } catch (e) {
      console.error('笔记数组序列化失败，可能包含循环引用:', e);
      // 尝试深拷贝清理数据
      notes = JSON.parse(JSON.stringify(notes));
    }
    
    uni.setStorageSync('notes', notes);
    console.log('笔记已保存到存储');
    
    return note;
  } catch (error) {
    console.error('保存笔记时发生错误:', error);
    // 尝试恢复或清除存储
    try {
      const existingNotes = uni.getStorageSync('notes');
      if (!Array.isArray(existingNotes)) {
        uni.setStorageSync('notes', []);
      }
    } catch (e) {
      console.error('恢复笔记存储失败:', e);
      uni.setStorageSync('notes', []);
    }
    
    throw error;
  }
}

// 删除笔记
export function deleteNote(id) {
  let notes = getNotes();
  notes = notes.filter(note => note.id !== id);
  uni.setStorageSync('notes', notes);
}



// 上传图片并添加到笔记中
export function uploadImageToNote(noteId, callback) {
  // 检查笔记是否存在
  const note = getNote(noteId);
  if (!note) {
    callback(null, '笔记不存在');
    return;
  }
  
  // 调用uni-app的选择图片API
  uni.chooseImage({
    count: 1, // 默认一次选择一张图片
    sizeType: ['compressed'], // 压缩图片
    sourceType: ['album', 'camera'], // 从相册或相机选择
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      
      // 生成图片ID
      const imageId = generateId();
      
      try {
        // 直接使用临时路径作为图片路径
        // 更新笔记
        const updatedNote = { ...note };
        if (!updatedNote.images) {
          updatedNote.images = [];
        }
        
        // 添加图片信息到笔记
        updatedNote.images.push({
          id: imageId,
          path: tempFilePath, // 直接使用临时路径
          name: `${imageId}_${tempFilePath.split('/').pop()}`,
          createdAt: new Date().toISOString()
        });
        
        // 保存更新后的笔记
        saveNote(updatedNote);
        
        // 回调成功
        callback(updatedNote, null);
      } catch (error) {
        callback(null, '保存图片失败：' + JSON.stringify(error));
      }
    },
    fail: (err) => {
      callback(null, '选择图片失败：' + JSON.stringify(err));
    }
  });
}

// 根据事件数量计算完成进度
export function calculateCompletionProgress(note) {
  if (!note || !note.progressEvents || note.progressEvents.length === 0) {
    return 0; // 如果没有事件，完成度为0
  }
  
  const totalEvents = note.progressEvents.length;
  const completedEvents = note.progressEvents.filter(event => event.completed).length;
  
  // 计算完成百分比
  return Math.round((completedEvents / totalEvents) * 100);
}

// 添加进度事件
export function addProgressEvent(noteId, event) {
  // 获取笔记
  const note = getNote(noteId);
  if (!note) {
    return { success: false, message: '笔记不存在' };
  }
  
  // 处理手动设置的完成状态
  let isCompleted = event.completed || false;
  let completedAt = isCompleted ? (event.completedAt || new Date().toISOString()) : null;
  
  // 创建事件对象
  const newEvent = {
    id: generateId(),
    description: event.description,
    createdAt: new Date().toISOString(),
    completed: isCompleted,
    completedAt: completedAt,
    isManualStatus: event.isManualStatus || false,
    images: event.images || [], // 添加图片数组
    things: event.things || [] // 添加子事项列表
  };
  
  // 如果没有progressEvents数组，则创建
  if (!note.progressEvents) {
    note.progressEvents = [];
  }
  
  // 添加新事件
  note.progressEvents.push(newEvent);
  
  // 按创建时间排序（从新到旧）
  note.progressEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // 更新笔记的完成进度
  note.completionPercentage = calculateCompletionProgress(note);
  
  // 保存更新后的笔记
  saveNote(note);
  
  return { success: true, note: note };
}

// 更新进度事件
export function updateProgressEvent(noteId, eventId, eventData) {
  // 获取笔记
  const note = getNote(noteId);
  if (!note) {
    return { success: false, message: '笔记不存在' };
  }
  
  // 找到要更新的事件
  const eventIndex = note.progressEvents.findIndex(e => e.id === eventId);
  if (eventIndex === -1) {
    return { success: false, message: '事件不存在' };
  }
  
  // 处理手动设置的完成状态
  let updatedEvent = {
    ...note.progressEvents[eventIndex],
    ...eventData,
    updatedAt: new Date().toISOString()
  };
  
  // 处理完成状态变化
  if (updatedEvent.completed && !note.progressEvents[eventIndex].completed) {
    // 如果由未完成变为完成，设置完成时间
    updatedEvent.completedAt = updatedEvent.completedAt || new Date().toISOString();
  } else if (!updatedEvent.completed) {
    // 如果设置为未完成，清除完成时间
    updatedEvent.completedAt = null;
  }
  
  // 确保图片数组存在
  if (!updatedEvent.images) {
    updatedEvent.images = [];
  }
  
  // 确保子事项数组存在
  if (!updatedEvent.things) {
    updatedEvent.things = [];
  }
  
  // 更新事件
  note.progressEvents[eventIndex] = updatedEvent;
  
  // 更新笔记的完成进度
  note.completionPercentage = calculateCompletionProgress(note);
  
  // 保存更新后的笔记
  saveNote(note);
  
  return { success: true, note: note };
}

// 上传图片到进度事件
export function uploadImageToEvent(noteId, eventId, callback) {
  // 检查笔记是否存在
  const note = getNote(noteId);
  if (!note) {
    callback(null, '笔记不存在');
    return;
  }
  
  // 找到事件
  const eventIndex = note.progressEvents.findIndex(e => e.id === eventId);
  if (eventIndex === -1) {
    callback(null, '事件不存在');
    return;
  }
  
  // 调用uni-app的选择图片API
  uni.chooseImage({
    count: 4, // 最多可选择4张图片
    sizeType: ['compressed'], // 压缩图片
    sourceType: ['album', 'camera'], // 从相册或相机选择
    success: (res) => {
      const tempFilePaths = res.tempFilePaths;
      
      // 确保事件有图片数组
      if (!note.progressEvents[eventIndex].images) {
        note.progressEvents[eventIndex].images = [];
      }
      
      // 已移除图片数量上限检查
      const currentImageCount = note.progressEvents[eventIndex].images.length;
      
      try {
        // 添加所有选择的图片
        const newImages = tempFilePaths.map(path => ({
          id: generateId(),
          path: path,
          uploadTime: new Date().toISOString()
        }));
        
        // 添加图片到事件
        note.progressEvents[eventIndex].images = [
          ...note.progressEvents[eventIndex].images,
          ...newImages
        ];
        
        // 保存更新后的笔记
        saveNote(note);
        
        // 回调成功
        callback(note.progressEvents[eventIndex], null);
      } catch (error) {
        callback(null, '保存图片失败：' + JSON.stringify(error));
      }
    },
    fail: (err) => {
      callback(null, '选择图片失败：' + JSON.stringify(err));
    }
  });
}

// 删除进度事件中的图片
export function deleteEventImage(noteId, eventId, imageId) {
  // 获取笔记
  const note = getNote(noteId);
  if (!note) {
    return { success: false, message: '笔记不存在' };
  }
  
  // 找到事件
  const eventIndex = note.progressEvents.findIndex(e => e.id === eventId);
  if (eventIndex === -1) {
    return { success: false, message: '事件不存在' };
  }
  
  // 确保事件有图片数组
  if (!note.progressEvents[eventIndex].images) {
    return { success: false, message: '事件没有图片' };
  }
  
  // 查找并删除图片
  const imageIndex = note.progressEvents[eventIndex].images.findIndex(img => img.id === imageId);
  if (imageIndex === -1) {
    return { success: false, message: '图片不存在' };
  }
  
  // 删除图片
  note.progressEvents[eventIndex].images.splice(imageIndex, 1);
  
  // 保存更新后的笔记
  saveNote(note);
  
  return { success: true, note: note };
}

// 删除进度事件
export function deleteProgressEvent(noteId, eventId) {
  // 获取笔记
  const note = getNote(noteId);
  if (!note) {
    return { success: false, message: '笔记不存在' };
  }
  
  // 找到要删除的事件索引
  const eventIndex = note.progressEvents.findIndex(e => e.id === eventId);
  if (eventIndex === -1) {
    return { success: false, message: '事件不存在' };
  }
  
  // 删除事件
  note.progressEvents.splice(eventIndex, 1);
  
  // 更新笔记的完成进度
  note.completionPercentage = calculateCompletionProgress(note);
  
  // 保存更新后的笔记
  saveNote(note);
  
  return { success: true, note: note };
}

// 获取进度事件列表（根据排序方式）
export function getProgressEvents(noteId, sortBy = 'time') {
  // 获取笔记
  const note = getNote(noteId);
  if (!note || !note.progressEvents) {
    return [];
  }
  
  // 复制数组以避免修改原始数据
  const events = [...note.progressEvents];
  
  // 根据排序方式排序
  if (sortBy === 'time') {
    events.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortBy === 'time_desc') {
    events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  return events;
}

