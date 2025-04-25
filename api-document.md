# 笔记应用API文档

## 目录

- [基础信息](#基础信息)
- [状态码说明](#状态码说明)
- [1. 用户认证接口](#1-用户认证接口)
- [2. 笔记管理接口](#2-笔记管理接口)
- [3. 进度事件管理接口](#3-进度事件管理接口)
- [4. 图片管理接口](#4-图片管理接口)
- [5. 笔记分享接口](#5-笔记分享接口)
- [6. 团队管理接口](#6-团队管理接口)
- [7. 团队笔记管理接口](#7-团队笔记管理接口)
- [8. 用户共享管理接口](#8-用户共享管理接口)
- [9. 用户资料管理接口](#9-用户资料管理接口)
- [10. 密码找回接口](#10-密码找回接口)
- [11. 数据导入导出接口](#11-数据导入导出接口)
- [12. 批量操作接口](#12-批量操作接口)
- [13. 离线同步策略](#13-离线同步策略)
- [14. 推送通知接口](#14-推送通知接口)
- [15. 附件管理接口](#15-附件管理接口)
- [16. 错误响应格式](#16-错误响应格式)

## 基础信息

- 基础URL: `/api/v1`
- 返回格式: JSON
- 认证方式: Bearer Token (JWT)
- API版本: v1.0
- 请求限制: 100次/分钟/IP

## 状态码说明

| 状态码 | 说明 |
|-------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 认证失败 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 1. 用户认证接口

### 1.1 用户注册

- **URL**: `/auth/register`
- **Method**: `POST`
- **Description**: 创建新用户账号
- **请求参数**:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "userId": "user123",
    "name": "用户名",
    "email": "user@example.com",
    "token": "jwt_token_here"
  }
}
```

### 1.2 用户登录

- **URL**: `/auth/login`
- **Method**: `POST`
- **Description**: 用户登录并获取认证令牌
- **请求参数**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "userId": "user123",
    "name": "用户名",
    "email": "user@example.com",
    "token": "jwt_token_here"
  }
}
```

### 1.3 退出登录

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Description**: 用户退出登录，使当前token失效
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "message": "退出成功"
}
```

### 1.4 获取当前用户信息

- **URL**: `/auth/me`
- **Method**: `GET`
- **Description**: 获取当前登录用户的详细信息
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "name": "用户名",
    "email": "user@example.com",
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
```

## 2. 笔记管理接口

### 2.1 获取笔记列表

- **URL**: `/notes`
- **Method**: `GET`
- **Description**: 获取当前用户的所有笔记
- **请求头**: 
  - Authorization: Bearer {token}
- **查询参数**:
  - `sort`: 排序字段，可选值为 `updatedAt`(默认)、`createdAt`、`title`
  - `order`: 排序顺序，可选值为 `desc`(默认)、`asc`
  - `limit`: 每页数量，默认20
  - `page`: 页码，默认1
- **响应**:

```json
{
  "success": true,
  "data": {
    "total": 100,
    "notes": [
      {
        "id": "note123",
        "title": "笔记标题",
        "content": "笔记内容",
        "personInCharge": "负责人",
        "timeFrame": {
          "startDate": "2023-01-01",
          "endDate": "2023-01-31"
        },
        "completionPercentage": 70,
        "isCompleted": false,
        "images": [
          {
            "id": "img123",
            "path": "/uploads/images/img123.jpg",
            "createdAt": "2023-01-01T00:00:00Z"
          }
        ],
        "progressEvents": [
          {
            "id": "event123",
            "percentage": 30,
            "description": "事件描述",
            "createdAt": "2023-01-01T00:00:00Z",
            "completed": true,
            "completedAt": "2023-01-02T00:00:00Z",
            "isManualStatus": false,
            "images": [
              {
                "id": "evtimg123",
                "path": "/uploads/images/evtimg123.jpg",
                "uploadTime": "2023-01-01T00:00:00Z"
              }
            ]
          }
        ],
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-10T00:00:00Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### 2.2 获取单个笔记

- **URL**: `/notes/{noteId}`
- **Method**: `GET`
- **Description**: 获取特定笔记的详细信息
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "data": {
    "id": "note123",
    "title": "笔记标题",
    "content": "笔记内容",
    "personInCharge": "负责人",
    "timeFrame": {
      "startDate": "2023-01-01",
      "endDate": "2023-01-31"
    },
    "completionPercentage": 70,
    "isCompleted": false,
    "images": [
      {
        "id": "img123",
        "path": "/uploads/images/img123.jpg",
        "createdAt": "2023-01-01T00:00:00Z"
      }
    ],
    "progressEvents": [
      {
        "id": "event123",
        "percentage": 30,
        "description": "事件描述",
        "createdAt": "2023-01-01T00:00:00Z",
        "completed": true,
        "completedAt": "2023-01-02T00:00:00Z",
        "isManualStatus": false,
        "images": [
          {
            "id": "evtimg123",
            "path": "/uploads/images/evtimg123.jpg",
            "uploadTime": "2023-01-01T00:00:00Z"
          }
        ]
      }
    ],
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-10T00:00:00Z"
  }
}
```

### 2.3 创建笔记

- **URL**: `/notes`
- **Method**: `POST`
- **Description**: 创建新笔记
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "title": "笔记标题",
  "content": "笔记内容",
  "personInCharge": "负责人",
  "timeFrame": {
    "startDate": "2023-01-01",
    "endDate": "2023-01-31"
  },
  "completionPercentage": 0
}
```

- **响应**:

```json
{
  "success": true,
  "message": "笔记创建成功",
  "data": {
    "id": "note123",
    "title": "笔记标题",
    "content": "笔记内容",
    "personInCharge": "负责人",
    "timeFrame": {
      "startDate": "2023-01-01",
      "endDate": "2023-01-31"
    },
    "completionPercentage": 0,
    "isCompleted": false,
    "images": [],
    "progressEvents": [],
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

### 2.4 更新笔记

- **URL**: `/notes/{noteId}`
- **Method**: `PUT`
- **Description**: 更新已有笔记
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "title": "更新的标题",
  "content": "更新的内容",
  "personInCharge": "新负责人",
  "timeFrame": {
    "startDate": "2023-02-01",
    "endDate": "2023-02-28"
  },
  "completionPercentage": 50
}
```

- **响应**:

```json
{
  "success": true,
  "message": "笔记更新成功",
  "data": {
    "id": "note123",
    "title": "更新的标题",
    "content": "更新的内容",
    "personInCharge": "新负责人",
    "timeFrame": {
      "startDate": "2023-02-01",
      "endDate": "2023-02-28"
    },
    "completionPercentage": 50,
    "isCompleted": false,
    "images": [],
    "progressEvents": [],
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-02-01T00:00:00Z"
  }
}
```

### 2.5 删除笔记

- **URL**: `/notes/{noteId}`
- **Method**: `DELETE`
- **Description**: 删除特定笔记
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "message": "笔记删除成功"
}
```

## 3. 进度事件管理接口

### 3.1 获取笔记的进度事件

- **URL**: `/notes/{noteId}/events`
- **Method**: `GET`
- **Description**: 获取特定笔记的所有进度事件
- **请求头**: 
  - Authorization: Bearer {token}
- **查询参数**:
  - `sort`: 排序方式，可选值为 `percentage`(默认)、`time`
- **响应**:

```json
{
  "success": true,
  "data": [
    {
      "id": "event123",
      "percentage": 30,
      "description": "事件描述",
      "createdAt": "2023-01-01T00:00:00Z",
      "completed": true,
      "completedAt": "2023-01-02T00:00:00Z",
      "isManualStatus": false,
      "images": [
        {
          "id": "evtimg123",
          "path": "/uploads/images/evtimg123.jpg",
          "uploadTime": "2023-01-01T00:00:00Z"
        }
      ]
    }
  ]
}
```

### 3.2 添加进度事件

- **URL**: `/notes/{noteId}/events`
- **Method**: `POST`
- **Description**: 为特定笔记添加新的进度事件
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "percentage": 50,
  "description": "新的事件描述",
  "isManualStatus": false,
  "completed": false
}
```

- **响应**:

```json
{
  "success": true,
  "message": "事件添加成功",
  "data": {
    "id": "event456",
    "percentage": 50,
    "description": "新的事件描述",
    "createdAt": "2023-02-01T00:00:00Z",
    "completed": false,
    "completedAt": null,
    "isManualStatus": false,
    "images": []
  }
}
```

### 3.3 更新进度事件

- **URL**: `/notes/{noteId}/events/{eventId}`
- **Method**: `PUT`
- **Description**: 更新特定进度事件
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "percentage": 60,
  "description": "更新的事件描述",
  "isManualStatus": true,
  "completed": true
}
```

- **响应**:

```json
{
  "success": true,
  "message": "事件更新成功",
  "data": {
    "id": "event123",
    "percentage": 60,
    "description": "更新的事件描述",
    "createdAt": "2023-01-01T00:00:00Z",
    "completed": true,
    "completedAt": "2023-02-01T00:00:00Z",
    "isManualStatus": true,
    "images": []
  }
}
```

### 3.4 删除进度事件

- **URL**: `/notes/{noteId}/events/{eventId}`
- **Method**: `DELETE`
- **Description**: 删除特定进度事件
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "message": "事件删除成功"
}
```

### 3.5 按序完成下一个事件

- **URL**: `/notes/{noteId}/events/complete-next`
- **Method**: `POST`
- **Description**: 自动完成笔记中按百分比排序的下一个未完成事件
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "message": "事件已完成",
  "data": {
    "completedEvent": {
      "id": "event123",
      "percentage": 30,
      "description": "事件描述",
      "completed": true,
      "completedAt": "2023-02-15T00:00:00Z"
    },
    "isLastEvent": false,
    "isLastUncompletedEvent": false,
    "note": {
      "id": "note123",
      "completionPercentage": 30
    }
  }
}
```

## 4. 图片管理接口

### 4.1 上传笔记图片

- **URL**: `/notes/{noteId}/images`
- **Method**: `POST`
- **Description**: 为笔记上传图片
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: multipart/form-data
- **请求参数**:
  - `image`: 图片文件(表单字段)
- **响应**:

```json
{
  "success": true,
  "message": "图片上传成功",
  "data": {
    "id": "img789",
    "path": "/uploads/images/img789.jpg",
    "createdAt": "2023-02-01T00:00:00Z",
    "note": {
      "id": "note123",
      "images": [
        {
          "id": "img789",
          "path": "/uploads/images/img789.jpg",
          "createdAt": "2023-02-01T00:00:00Z"
        }
      ]
    }
  }
}
```

### 4.2 删除笔记图片

- **URL**: `/notes/{noteId}/images/{imageId}`
- **Method**: `DELETE`
- **Description**: 删除笔记中的图片
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "message": "图片删除成功"
}
```

### 4.3 上传事件图片

- **URL**: `/notes/{noteId}/events/{eventId}/images`
- **Method**: `POST`
- **Description**: 为特定进度事件上传图片
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: multipart/form-data
- **请求参数**:
  - `image`: 图片文件(表单字段)
- **响应**:

```json
{
  "success": true,
  "message": "图片上传成功",
  "data": {
    "id": "evtimg456",
    "path": "/uploads/images/evtimg456.jpg",
    "uploadTime": "2023-02-01T00:00:00Z",
    "event": {
      "id": "event123",
      "images": [
        {
          "id": "evtimg456",
          "path": "/uploads/images/evtimg456.jpg",
          "uploadTime": "2023-02-01T00:00:00Z"
        }
      ]
    }
  }
}
```

### 4.4 删除事件图片

- **URL**: `/notes/{noteId}/events/{eventId}/images/{imageId}`
- **Method**: `DELETE`
- **Description**: 删除进度事件中的图片
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "message": "图片删除成功"
}
```

## 5. 笔记分享接口

### 5.1 创建分享链接

- **URL**: `/notes/{noteId}/share`
- **Method**: `POST`
- **Description**: 为特定笔记创建分享链接
- **请求头**: 
  - Authorization: Bearer {token}
- **请求参数**:

```json
{
  "expiresIn": 7 // 过期天数，默认7天
}
```

- **响应**:

```json
{
  "success": true,
  "message": "分享链接创建成功",
  "data": {
    "shareCode": "abc123",
    "shareUrl": "https://example.com/share/abc123",
    "expiresAt": "2023-02-08T00:00:00Z",
    "noteId": "note123"
  }
}
```

### 5.2 获取分享笔记

- **URL**: `/share/{shareCode}`
- **Method**: `GET`
- **Description**: 根据分享码获取笔记信息(无需认证)
- **响应**:

```json
{
  "success": true,
  "data": {
    "id": "note123",
    "title": "笔记标题",
    "content": "笔记内容",
    "personInCharge": "负责人",
    "timeFrame": {
      "startDate": "2023-01-01",
      "endDate": "2023-01-31"
    },
    "completionPercentage": 70,
    "images": [
      {
        "id": "img123",
        "path": "/uploads/images/img123.jpg"
      }
    ],
    "progressEvents": [
      {
        "id": "event123",
        "percentage": 30,
        "description": "事件描述",
        "completed": true,
        "images": [
          {
            "id": "evtimg123",
            "path": "/uploads/images/evtimg123.jpg"
          }
        ]
      }
    ],
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
```

### 5.3 取消分享

- **URL**: `/notes/{noteId}/share/{shareCode}`
- **Method**: `DELETE`
- **Description**: 取消特定的笔记分享
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "message": "分享已取消"
}
```

## 6. 团队管理接口

### 6.1 创建团队

- **URL**: `/teams`
- **Method**: `POST`
- **Description**: 创建新团队
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "name": "团队名称",
  "description": "团队描述"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "团队创建成功",
  "data": {
    "id": "team123",
    "name": "团队名称",
    "description": "团队描述",
    "createdBy": "user123",
    "createdAt": "2023-02-01T00:00:00Z",
    "updatedAt": "2023-02-01T00:00:00Z",
    "members": [
      {
        "id": "user123",
        "name": "用户名",
        "role": "owner"
      }
    ]
  }
}
```

### 6.2 获取用户的团队列表

- **URL**: `/teams`
- **Method**: `GET`
- **Description**: 获取当前用户参与的所有团队
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "data": [
    {
      "id": "team123",
      "name": "团队名称",
      "description": "团队描述",
      "createdBy": "user123",
      "createdAt": "2023-02-01T00:00:00Z",
      "updatedAt": "2023-02-01T00:00:00Z",
      "memberCount": 5,
      "userRole": "owner"
    }
  ]
}
```

### 6.3 获取团队详情

- **URL**: `/teams/{teamId}`
- **Method**: `GET`
- **Description**: 获取特定团队的详细信息
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "data": {
    "id": "team123",
    "name": "团队名称",
    "description": "团队描述",
    "createdBy": "user123",
    "createdAt": "2023-02-01T00:00:00Z",
    "updatedAt": "2023-02-01T00:00:00Z",
    "members": [
      {
        "id": "user123",
        "name": "用户名",
        "email": "user@example.com",
        "role": "owner",
        "joinedAt": "2023-02-01T00:00:00Z"
      }
    ],
    "userRole": "owner"
  }
}
```

### 6.4 更新团队信息

- **URL**: `/teams/{teamId}`
- **Method**: `PUT`
- **Description**: 更新团队基本信息
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "name": "新团队名称",
  "description": "新团队描述"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "团队信息更新成功",
  "data": {
    "id": "team123",
    "name": "新团队名称",
    "description": "新团队描述",
    "updatedAt": "2023-02-15T00:00:00Z"
  }
}
```

### 6.5 添加团队成员

- **URL**: `/teams/{teamId}/members`
- **Method**: `POST`
- **Description**: 向团队添加新成员
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "email": "member@example.com",
  "role": "member" // 可选值: "member", "admin", "owner"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "成员添加成功",
  "data": {
    "id": "user456",
    "name": "成员名",
    "email": "member@example.com",
    "role": "member",
    "joinedAt": "2023-02-15T00:00:00Z"
  }
}
```

### 6.6 更新成员角色

- **URL**: `/teams/{teamId}/members/{userId}`
- **Method**: `PUT`
- **Description**: 更新团队成员角色
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "role": "admin" // 可选值: "member", "admin", "owner"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "成员角色更新成功",
  "data": {
    "id": "user456",
    "name": "成员名",
    "role": "admin"
  }
}
```

### 6.7 移除团队成员

- **URL**: `/teams/{teamId}/members/{userId}`
- **Method**: `DELETE`
- **Description**: 移除团队成员
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "message": "成员已移除"
}
```

### 6.8 离开团队

- **URL**: `/teams/{teamId}/leave`
- **Method**: `POST`
- **Description**: 当前用户离开团队
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "message": "已成功离开团队"
}
```

### 6.9 解散团队

- **URL**: `/teams/{teamId}`
- **Method**: `DELETE`
- **Description**: 解散团队(仅团队所有者可操作)
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "message": "团队已解散"
}
```

## 7. 团队笔记管理接口

### 7.1 获取团队笔记列表

- **URL**: `/teams/{teamId}/notes`
- **Method**: `GET`
- **Description**: 获取团队中的所有笔记
- **请求头**: 
  - Authorization: Bearer {token}
- **查询参数**:
  - `sort`: 排序字段，可选值为 `updatedAt`(默认)、`createdAt`、`title`
  - `order`: 排序顺序，可选值为 `desc`(默认)、`asc`
  - `limit`: 每页数量，默认20
  - `page`: 页码，默认1
- **响应**:

```json
{
  "success": true,
  "data": {
    "total": 50,
    "notes": [
      {
        "id": "note789",
        "title": "团队笔记标题",
        "content": "团队笔记内容",
        "personInCharge": "负责人",
        "timeFrame": {
          "startDate": "2023-01-01",
          "endDate": "2023-01-31"
        },
        "completionPercentage": 30,
        "isCompleted": false,
        "createdBy": {
          "id": "user123",
          "name": "用户名"
        },
        "createdAt": "2023-02-01T00:00:00Z",
        "updatedAt": "2023-02-10T00:00:00Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### 7.2 将笔记添加到团队

- **URL**: `/notes/{noteId}/team`
- **Method**: `POST`
- **Description**: 将个人笔记添加到团队
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "teamId": "team123"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "笔记已添加到团队",
  "data": {
    "id": "note123",
    "title": "笔记标题",
    "teamId": "team123",
    "teamName": "团队名称"
  }
}
```

### 7.3 从团队中移除笔记

- **URL**: `/notes/{noteId}/team`
- **Method**: `DELETE`
- **Description**: 将笔记从团队中移除
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "message": "笔记已从团队中移除"
}
```

## 8. 用户共享管理接口

### 8.1 获取笔记的共享用户列表

- **URL**: `/notes/{noteId}/users`
- **Method**: `GET`
- **Description**: 获取笔记的所有共享用户
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "data": [
    {
      "userId": "user456",
      "name": "共享用户名",
      "email": "shared@example.com",
      "permission": "view", // "view"或"edit"
      "sharedAt": "2023-02-01T00:00:00Z"
    }
  ]
}
```

### 8.2 共享笔记给用户

- **URL**: `/notes/{noteId}/users`
- **Method**: `POST`
- **Description**: 将笔记共享给特定用户
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "userId": "user456",
  "permission": "view" // "view"或"edit"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "笔记共享成功",
  "data": {
    "userId": "user456",
    "name": "共享用户名",
    "email": "shared@example.com",
    "permission": "view"
  }
}
```

### 8.3 更新用户的笔记权限

- **URL**: `/notes/{noteId}/users/{userId}`
- **Method**: `PUT`
- **Description**: 更新用户对特定笔记的权限
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "permission": "edit" // "view"或"edit"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "权限更新成功",
  "data": {
    "userId": "user456",
    "permission": "edit"
  }
}
```

### 8.4 取消用户的笔记共享

- **URL**: `/notes/{noteId}/users/{userId}`
- **Method**: `DELETE`
- **Description**: 取消与特定用户的笔记共享
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "message": "共享已取消"
}
```

### 8.5 搜索用户

- **URL**: `/users/search`
- **Method**: `GET`
- **Description**: 根据关键词搜索用户
- **请求头**: 
  - Authorization: Bearer {token}
- **查询参数**:
  - `query`: 搜索关键词（用户名或邮箱）
  - `limit`: 返回结果数量限制，默认10
- **响应**:

```json
{
  "success": true,
  "data": [
    {
      "id": "user789",
      "name": "搜索结果用户",
      "email": "search@example.com"
    }
  ]
}
```

## 9. 用户资料管理接口

### 9.1 更新用户信息

- **URL**: `/users/profile`
- **Method**: `PUT`
- **Description**: 更新当前用户的个人信息
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "name": "新用户名",
  "avatar": "头像图片URL",
  "phone": "+60123456789"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "个人信息更新成功",
  "data": {
    "id": "user123",
    "name": "新用户名",
    "email": "user@example.com",
    "avatar": "头像图片URL",
    "phone": "+60123456789",
    "updatedAt": "2023-02-15T00:00:00Z"
  }
}
```

### 9.2 上传用户头像

- **URL**: `/users/avatar`
- **Method**: `POST`
- **Description**: 上传用户头像图片
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: multipart/form-data
- **请求参数**:
  - `avatar`: 头像图片文件(表单字段)
- **响应**:

```json
{
  "success": true,
  "message": "头像上传成功",
  "data": {
    "avatar": "/uploads/avatars/user123.jpg"
  }
}
```

### 9.3 修改密码

- **URL**: `/users/password`
- **Method**: `PUT`
- **Description**: 修改当前用户的密码
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "currentPassword": "当前密码",
  "newPassword": "新密码"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "密码修改成功"
}
```

## 10. 密码找回接口

### 10.1 发送密码重置邮件

- **URL**: `/auth/forgot-password`
- **Method**: `POST`
- **Description**: 发送密码重置链接到用户邮箱
- **请求参数**:

```json
{
  "email": "user@example.com"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "密码重置邮件已发送到您的邮箱"
}
```

### 10.2 验证重置令牌

- **URL**: `/auth/verify-reset-token`
- **Method**: `GET`
- **Description**: 验证密码重置令牌是否有效
- **查询参数**:
  - `token`: 重置令牌
- **响应**:

```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "valid": true
  }
}
```

### 10.3 重置密码

- **URL**: `/auth/reset-password`
- **Method**: `POST`
- **Description**: 使用重置令牌设置新密码
- **请求参数**:

```json
{
  "token": "重置令牌",
  "newPassword": "新密码"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "密码重置成功",
  "data": {
    "redirectUrl": "/login"
  }
}
```

## 11. 数据导入导出接口

### 11.1 导出用户数据

- **URL**: `/users/export`
- **Method**: `GET`
- **Description**: 导出当前用户的所有笔记和设置
- **请求头**: 
  - Authorization: Bearer {token}
- **查询参数**:
  - `format`: 导出格式，默认 "json"，可选 "json" 或 "csv"
- **响应**:

```json
{
  "success": true,
  "message": "数据导出成功",
  "data": {
    "downloadUrl": "/downloads/exports/user123_20230301.json",
    "expiresAt": "2023-03-08T00:00:00Z"
  }
}
```

### 11.2 导入用户数据

- **URL**: `/users/import`
- **Method**: `POST`
- **Description**: 导入笔记数据
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: multipart/form-data
- **请求参数**:
  - `file`: 数据文件(表单字段)
  - `mode`: 导入模式，"merge"(合并数据)或"replace"(替换现有数据)
- **响应**:

```json
{
  "success": true,
  "message": "数据导入成功",
  "data": {
    "imported": {
      "notes": 15,
      "events": 42,
      "images": 8
    },
    "errors": []
  }
}
```

## 12. 批量操作接口

### 12.1 批量编辑笔记

- **URL**: `/notes/batch`
- **Method**: `PUT`
- **Description**: 批量更新多个笔记的情况
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "noteIds": ["note123", "note456", "note789"],
  "updates": {
    "personInCharge": "新负责人"
  }
}
```

- **响应**:

```json
{
  "success": true,
  "message": "笔记批量更新成功",
  "data": {
    "updated": 3,
    "failed": 0
  }
}
```

### 12.2 批量删除笔记

- **URL**: `/notes/batch`
- **Method**: `DELETE`
- **Description**: 批量删除多个笔记
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "noteIds": ["note123", "note456", "note789"]
}
```

- **响应**:

```json
{
  "success": true,
  "message": "笔记批量删除成功",
  "data": {
    "deleted": 3,
    "failed": 0
  }
}
```

## 13. 离线同步策略

- **URL**: `/sync`
- **Method**: `POST`
- **Description**: 客户端离线操作同步到服务器
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "lastSyncTimestamp": "2023-02-15T12:30:45Z",
  "changes": [
    {
      "type": "note",
      "action": "create",
      "data": {
        "clientId": "temp123",
        "title": "新笔记",
        "content": "笔记内容",
        "timestamp": "2023-02-15T14:20:00Z"
      }
    },
    {
      "type": "note",
      "action": "update",
      "data": {
        "id": "note456",
        "title": "更新的标题",
        "timestamp": "2023-02-15T15:10:00Z"
      }
    }
  ]
}
```

- **响应**:

```json
{
  "success": true,
  "data": {
    "serverChanges": [
      {
        "type": "note",
        "action": "create",
        "clientId": "temp123",
        "serverId": "note789",
        "timestamp": "2023-02-15T14:20:05Z"
      }
    ],
    "conflicts": [],
    "lastSyncTimestamp": "2023-02-15T15:15:00Z"
  }
}
```

## 14. 推送通知接口

### 14.1 设置推送设备

- **URL**: `/notifications/devices`
- **Method**: `POST`
- **Description**: 注册设备以接收推送通知
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "deviceToken": "fcm_token_or_apns_token", 
  "platform": "android", // android, ios, web
  "model": "设备型号"
}
```

- **响应**:

```json
{
  "success": true,
  "message": "设备注册成功",
  "data": {
    "deviceId": "dev123"
  }
}
```

### 14.2 获取通知设置

- **URL**: `/notifications/settings`
- **Method**: `GET`
- **Description**: 获取用户的通知偏好设置
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "data": {
    "teamInvites": true,
    "noteShares": true,
    "commentNotifications": true,
    "eventReminders": true
  }
}
```

### 14.3 更新通知设置

- **URL**: `/notifications/settings`
- **Method**: `PUT`
- **Description**: 更新用户的通知偏好设置
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **请求参数**:

```json
{
  "teamInvites": true,
  "noteShares": false,
  "commentNotifications": true,
  "eventReminders": false
}
```

- **响应**:

```json
{
  "success": true,
  "message": "通知设置更新成功"
}
```

## 15. 附件管理接口

### 15.1 上传笔记附件

- **URL**: `/notes/{noteId}/attachments`
- **Method**: `POST`
- **Description**: 为笔记上传附件文件
- **请求头**: 
  - Authorization: Bearer {token}
  - Content-Type: multipart/form-data
- **请求参数**:
  - `file`: 附件文件(表单字段)
  - `description`: 附件描述(可选)
- **响应**:

```json
{
  "success": true,
  "message": "附件上传成功",
  "data": {
    "id": "att123",
    "filename": "document.pdf",
    "path": "/uploads/attachments/document.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "description": "附件描述",
    "createdAt": "2023-03-01T00:00:00Z"
  }
}
```

### 15.2 获取笔记附件列表

- **URL**: `/notes/{noteId}/attachments`
- **Method**: `GET`
- **Description**: 获取笔记的所有附件
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "data": [
    {
      "id": "att123",
      "filename": "document.pdf",
      "path": "/uploads/attachments/document.pdf",
      "size": 1024000,
      "mimeType": "application/pdf",
      "description": "附件描述",
      "createdAt": "2023-03-01T00:00:00Z"
    }
  ]
}
```

### 15.3 删除附件

- **URL**: `/notes/{noteId}/attachments/{attachmentId}`
- **Method**: `DELETE`
- **Description**: 删除笔记中的附件
- **请求头**: 
  - Authorization: Bearer {token}
- **响应**:

```json
{
  "success": true,
  "message": "附件删除成功"
}
```

## 16. 错误响应格式

当请求出现错误时，API将返回统一格式的错误信息：

```json
{
  "success": false,
  "message": "错误描述信息",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

常见错误代码：

| 错误代码 | 说明 |
|---------|------|
| INVALID_REQUEST | 请求参数无效 |
| UNAUTHORIZED | 未授权访问 |
| FORBIDDEN | 无操作权限 |
| NOT_FOUND | 资源不存在 |
| ALREADY_EXISTS | 资源已存在 |
| SERVER_ERROR | 服务器内部错误 | 
| RATE_LIMIT_EXCEEDED | 接口请求频率超限 |