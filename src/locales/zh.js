// 中文语言包
export default {
  // 应用信息
  app: {
    name: '笔记应用',
    slogan: '高效记录与管理',
    version: '版本 1.0.0'
  },
  
  // 公共部分
  common: {
    confirm: '确认',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    save: '保存',
    loading: '加载中...',
    success: '成功',
    failed: '失败',
    back: '返回',
    next: '下一步',
    unknown: '未知',
    search: '搜索',
    noData: '暂无数据',
    tips: '提示',
    retry: '重试',
    logout: '退出登录',
    logoutConfirm: '确定要退出当前账号吗？',
    optional: '(选填)',
    more: '更多',
    all: '全部',
    close: '关闭',
    open: '打开',
    welcome: '欢迎'
  },
  
  // 登录注册
  login: {
    login: '登录',
    register: '注册',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    forgotPassword: '忘记密码？',
    rememberMe: '记住我',
    name: '姓名',
    phone: '手机号',
    registerSuccess: '注册成功',
    loginSuccess: '登录成功',
    emailRequired: '请输入邮箱',
    passwordRequired: '请输入密码',
    emailFormat: '请输入有效的邮箱地址',
    passwordLength: '密码至少需要6个字符',
    passwordMismatch: '两次输入的密码不一致',
    nameRequired: '请输入姓名',
    alreadyHaveAccount: '已有账号？立即登录',
    noAccount: '没有账号？立即注册'
  },
  
  // 首页
  home: {
    myNotes: '我的笔记',
    addNote: '新建笔记',
    noNoteTips: '暂无笔记，点击右上角添加',
    sortOptions: {
      latestUpdate: '最近更新',
      earliestUpdate: '最早更新',
      byProgress: '按完成进度',
      byEventCount: '按报告数量',
      byTitle: '按标题'
    },
    noteTips: {
      progress: '完成进度: {percent}%',
      completed: '已完成 {completed} / {total} 个事件',
      noEvents: '暂无进度事件'
    },
    justNow: '刚刚',
    minutesAgo: '{minutes}分钟前',
    hoursAgo: '{hours}小时前',
    deleteNoteConfirm: '确定要删除这条笔记吗？',
    viewImage: '查看图片',
    untitled: '无标题',
    noContent: '无内容'
  },
  
  // 编辑页面
  edit: {
    editNote: '编辑笔记',
    newNote: '新建笔记',
    title: '标题',
    content: '内容',
    noteTitle: '笔记标题',
    noteContent: '笔记内容...',
    personInCharge: '负责人',
    timeFrame: '时间框架',
    startDate: '开始日期',
    endDate: '结束日期',
    addEvent: '添加事件',
    noEvents: '暂无添加的事件',
    progressEvents: '进度事件',
    eventDescription: '事件描述',
    eventTime: '事件时间',
    eventCompleted: '已完成',
    eventImages: '事件图片',
    uploadImage: '上传图片',
    deleteEventConfirm: '确定要删除这个事件吗？',
    saveSuccess: '保存成功',
    discardChanges: '放弃更改？',
    unsavedChanges: '您有未保存的更改，确定要离开吗？',
    stay: '留在此页',
    leave: '离开'
  },
  
  // 用户设置
  settings: {
    accountSettings: '账号设置',
    profile: '个人资料',
    changeAvatar: '更换头像',
    name: '姓名',
    email: '邮箱',
    emailTip: '邮箱为登录账号，无法修改',
    phone: '手机号',
    password: '密码',
    passwordSettings: '密码设置',
    changePassword: '修改密码',
    currentPassword: '当前密码',
    newPassword: '新密码',
    confirmNewPassword: '确认新密码',
    saveChanges: '保存修改',
    saving: '保存中...',
    accountOptions: '账号操作',
    deleteAccount: '注销账号',
    deleteAccountConfirm: '注销后，您的所有数据都将被删除且无法恢复，确定要继续吗？',
    processing: '处理中...',
    accountDeleted: '账号已注销',
    saveSuccess: '保存成功',
    saveFailed: '保存失败，请重试',
    passwordSuccess: '密码修改成功',
    passwordFailed: '密码修改失败，请重试',
    currentPasswordError: '当前密码错误',
    passwordRule: '新密码至少需要6个字符',
    nameRequired: '请输入姓名',
    invalidPhone: '请输入有效的手机号码'
  },
  
  // 侧边栏菜单
  sidebar: {
    settings: '设置',
    accountSettings: '账号设置',
    dataSync: '数据同步',
    themeSettings: '主题设置',
    languageSettings: '语言设置',
    aboutApp: '关于应用',
    currentLanguage: '当前语言',
    selectLanguage: '选择语言',
    aboutContent: '笔记应用 v1.0.0\\n一个简单易用的笔记和待办事项管理工具',
    comingSoon: '{feature}功能即将上线',
    restartNeeded: '语言设置已更改',
    restartContent: '需要重启应用以完全应用新的语言设置，是否立即重启？',
    restartNow: '立即重启',
    restartLater: '稍后重启',
    languageUpdateSuccess: '语言设置已更新',
    languageUpdateFailed: '语言设置失败'
  }
};