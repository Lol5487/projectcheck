<<<<<<< HEAD
# projectcheck
=======
# 笔记同步服务器

这是一个用于跨设备笔记同步的Node.js API服务器。

## 功能

- 用户注册和登录
- JWT认证
- 笔记的CRUD操作
- 进度事件管理
- 跨设备数据同步

## 技术栈

- Node.js
- Express
- MongoDB/Mongoose
- JWT认证

## 安装

1. 克隆仓库
```
git clone <repo-url>
cd server
```

2. 安装依赖
```
npm install
```

3. 配置环境变量
创建一个`.env`文件并添加以下内容：
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/notesapp
JWT_SECRET=your_jwt_secret_change_this_in_production
NODE_ENV=development
```

4. 启动MongoDB
确保MongoDB服务正在运行。

5. 启动服务器
```
npm run dev
```

## API接口

### 认证

- `POST /api/auth/register` - 注册新用户
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 笔记

- `GET /api/notes` - 获取用户的所有笔记
- `GET /api/notes/:id` - 获取单个笔记
- `POST /api/notes` - 创建新笔记
- `PUT /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记

### 进度事件

- `POST /api/notes/:id/events` - 添加进度事件
- `PUT /api/notes/:noteId/events/:eventId` - 更新进度事件
- `DELETE /api/notes/:noteId/events/:eventId` - 删除进度事件

## 部署到云服务器

### 部署到Heroku

1. 创建Heroku账户并安装Heroku CLI
2. 登录到Heroku
```
heroku login
```

3. 创建Heroku应用
```
heroku create your-app-name
```

4. 添加MongoDB附加组件
```
heroku addons:create mongodb:sandbox
```

5. 设置环境变量
```
heroku config:set JWT_SECRET=your_secure_jwt_secret
heroku config:set NODE_ENV=production
```

6. 部署代码
```
git push heroku main
```

### 部署到Vercel

1. 安装Vercel CLI
```
npm i -g vercel
```

2. 登录到Vercel
```
vercel login
```

3. 部署
```
vercel
```

4. 设置环境变量
在Vercel控制面板中设置以下环境变量：
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`

### 部署到阿里云/腾讯云

1. 创建云服务器实例
2. 安装Node.js和MongoDB
3. 将代码上传到服务器
4. 安装依赖并配置环境变量
5. 使用PM2启动服务
```
npm install -g pm2
pm2 start app.js
```

## 安全提示

- 在生产环境中使用更强的JWT密钥
- 启用HTTPS
- 实现速率限制
- 定期备份数据
- 使用环境变量存储敏感信息

## 前端集成

请参阅前端代码中的`apiService.js`文件，了解如何与此API服务器集成。
>>>>>>> a493dfb (初始化后端API)
