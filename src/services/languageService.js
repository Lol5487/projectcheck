// 语言服务
import zhLang from '@/locales/zh.js';
import enLang from '@/locales/en.js';
import msLang from '@/locales/ms.js';

// 支持的语言列表
export const supportedLanguages = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'ms', name: 'Bahasa Melayu' }
];

// 语言包映射
const langPacks = {
  zh: zhLang,
  en: enLang,
  ms: msLang
};

// 默认语言
const defaultLang = 'zh';

// 获取当前语言
export function getCurrentLanguage() {
  const savedLang = uni.getStorageSync('language');
  return savedLang || defaultLang;
}

// 设置语言
export function setLanguage(langCode) {
  if (!langPacks[langCode]) {
    console.error(`Language not supported: ${langCode}`);
    return false;
  }
  
  try {
    uni.setStorageSync('language', langCode);
    return true;
  } catch (error) {
    console.error('Failed to save language preference', error);
    return false;
  }
}

// 获取翻译
export function t(key, params = {}) {
  const currentLang = getCurrentLanguage();
  const langPack = langPacks[currentLang] || langPacks[defaultLang];
  
  // 按 . 分割键值路径
  const keyPath = key.split('.');
  let value = langPack;
  
  // 遍历路径获取最终值
  for (let i = 0; i < keyPath.length; i++) {
    value = value && value[keyPath[i]];
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  // 如果值是字符串且有参数，进行替换
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{(\w+)\}/g, (match, paramName) => {
      return params[paramName] !== undefined ? params[paramName] : match;
    });
  }
  
  return value;
}

// 导出默认语言包，用于开发参考
export const defaultLangPack = langPacks[defaultLang];