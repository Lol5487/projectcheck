// 语言设置服务
const STORAGE_KEY = 'app_language';

// 支持的语言
export const supportedLanguages = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'ms', name: 'Bahasa Melayu' }
];

// 获取当前语言设置
export function getCurrentLanguage() {
  try {
    // 先尝试从本地存储获取
    const storedLanguage = uni.getStorageSync(STORAGE_KEY);
    if (storedLanguage) {
      return storedLanguage;
    }
    
    // 如果没有存储过语言设置，返回默认语言(中文)
    return 'zh';
  } catch (e) {
    console.error('获取语言设置失败:', e);
    return 'zh';
  }
}

// 设置语言
export function setLanguage(langCode) {
  try {
    // 验证语言代码是否支持
    const isValid = supportedLanguages.some(lang => lang.code === langCode);
    if (!isValid) {
      console.error('不支持的语言代码:', langCode);
      return false;
    }
    
    // 保存语言设置
    uni.setStorageSync(STORAGE_KEY, langCode);
    
    // 返回成功
    return true;
  } catch (e) {
    console.error('设置语言失败:', e);
    return false;
  }
}

// 获取语言名称
export function getLanguageName(langCode) {
  const language = supportedLanguages.find(lang => lang.code === langCode);
  return language ? language.name : '未知语言';
}