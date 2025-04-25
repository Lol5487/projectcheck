const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const Note = require('../models/Note');
const router = express.Router();

// 应用认证中间件到所有路由
router.use(protect);

// 获取用户的所有笔记
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id })
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error('获取笔记错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
});

// 获取单个笔记
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '笔记未找到'
      });
    }
    
    res.json({
      success: true,
      note
    });
  } catch (error) {
    console.error('获取笔记错误:', error);
    
    // 检查是否是无效ID格式
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: '无效的笔记ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
});

// 创建笔记
router.post('/', async (req, res) => {
  try {
    // 添加用户ID到笔记中
    req.body.userId = req.user._id;
    
    const note = await Note.create(req.body);
    
    res.status(201).json({
      success: true,
      note
    });
  } catch (error) {
    console.error('创建笔记错误:', error);
    
    // 验证错误
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
});

// 更新笔记
router.put('/:id', async (req, res) => {
  try {
    let note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '笔记未找到'
      });
    }
    
    // 更新笔记
    note = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.json({
      success: true,
      note
    });
  } catch (error) {
    console.error('更新笔记错误:', error);
    
    // 检查是否是无效ID格式
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: '无效的笔记ID'
      });
    }
    
    // 验证错误
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
});

// 删除笔记
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '笔记未找到'
      });
    }
    
    await note.deleteOne();
    
    res.json({
      success: true,
      message: '笔记已删除'
    });
  } catch (error) {
    console.error('删除笔记错误:', error);
    
    // 检查是否是无效ID格式
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: '无效的笔记ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
});

// 添加进度事件
router.post('/:id/events', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '笔记未找到'
      });
    }
    
    // 创建新事件
    const newEvent = {
      id: new mongoose.Types.ObjectId().toString(),
      description: req.body.description,
      completed: req.body.completed || false,
      createdAt: new Date(),
      images: req.body.images || [],
      things: req.body.things || []
    };
    
    // 如果事件完成，添加完成时间
    if (newEvent.completed) {
      newEvent.completedAt = new Date();
    }
    
    // 添加到笔记中
    note.progressEvents.push(newEvent);
    await note.save();
    
    res.status(201).json({
      success: true,
      event: newEvent,
      note
    });
  } catch (error) {
    console.error('添加事件错误:', error);
    
    // 检查是否是无效ID格式
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: '无效的笔记ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
});

// 更新进度事件
router.put('/:noteId/events/:eventId', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.noteId,
      userId: req.user._id
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '笔记未找到'
      });
    }
    
    // 查找事件
    const eventIndex = note.progressEvents.findIndex(
      event => event.id === req.params.eventId
    );
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '事件未找到'
      });
    }
    
    // 更新事件
    note.progressEvents[eventIndex] = {
      ...note.progressEvents[eventIndex].toObject(),
      ...req.body,
      id: req.params.eventId // 确保ID不变
    };
    
    // 如果状态变为已完成，设置完成时间
    if (req.body.completed && !note.progressEvents[eventIndex].completedAt) {
      note.progressEvents[eventIndex].completedAt = new Date();
    } else if (req.body.completed === false) {
      note.progressEvents[eventIndex].completedAt = null;
    }
    
    await note.save();
    
    res.json({
      success: true,
      event: note.progressEvents[eventIndex],
      note
    });
  } catch (error) {
    console.error('更新事件错误:', error);
    
    // 检查是否是无效ID格式
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: '无效的ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
});

// 删除进度事件
router.delete('/:noteId/events/:eventId', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.noteId,
      userId: req.user._id
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '笔记未找到'
      });
    }
    
    // 查找事件
    const eventIndex = note.progressEvents.findIndex(
      event => event.id === req.params.eventId
    );
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '事件未找到'
      });
    }
    
    // 删除事件
    note.progressEvents.splice(eventIndex, 1);
    await note.save();
    
    res.json({
      success: true,
      message: '事件已删除',
      note
    });
  } catch (error) {
    console.error('删除事件错误:', error);
    
    // 检查是否是无效ID格式
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: '无效的ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
});

module.exports = router;