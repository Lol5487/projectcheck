const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

// 导入路由
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');

// 创建Express应用
const app = express();

// 中间件
app.use(express.json());
app.use(cors());

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// 处理未找到的路由
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: '请求的资源未找到'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 连接到MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('已连接到MongoDB');
    
    // 启动服务器
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`服务器运行在端口: ${PORT}`);
    });
  })
  .catch(err => {
    console.error('连接MongoDB失败:', err);
    process.exit(1);
  });

// 用于正常关闭的处理程序
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB连接已关闭');
  process.exit(0);
});