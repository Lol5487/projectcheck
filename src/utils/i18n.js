import { getCurrentLanguage } from './languageService.js';

// 导入语言包
import zh from '../locales/zh.js';
import en from '../locales/en.js';
import ms from '../locales/ms.js';

// 语言包映射
const messages = {
  zh,
  en,
  ms
};

// 简单的i18n实现
export default {
  install: (app) => {
    // 添加全局属性
    app.config.globalProperties.$t = (key, params = {}) => {
      const currentLang = getCurrentLanguage();
      const langPack = messages[currentLang] || messages.zh;
      
      // 通过路径获取嵌套对象的值
      const getValue = (obj, path) => {
        if (!path) return obj;
        
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
          if (result && result[key] !== undefined) {
            result = result[key];
          } else {
            // 如果找不到对应的键，返回键名称
            return key;
          }
        }
        
        return result;
      };
      
      // 获取翻译文本
      let text = getValue(langPack, key);
      
      // 替换参数
      if (typeof text === 'string' && Object.keys(params).length > 0) {
        for (const [param, value] of Object.entries(params)) {
          text = text.replace(new RegExp(`{${param}}`, 'g'), value);
        }
      }
      
      return text;
    };
    
    // 为模板提供访问
    app.provide('i18n', {
      t: app.config.globalProperties.$t
    });
  }
};