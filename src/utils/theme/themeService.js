// 主题管理服务
const defaultThemeSettings = {
  theme: 'light',  // light, dark, system
  color: 'blue'    // blue, purple, green, orange
};

// 主题颜色定义
const themeColors = {
  blue: {
    primary: '#1a4b8c',
    secondary: '#0d2d62',
    accent: '#6185b5',
    light: '#e6f0ff'
  },
  purple: {
    primary: '#9b5cff',
    secondary: '#764ad5',
    accent: '#cbb6ff',
    light: '#f5f0ff'
  },
  green: {
    primary: '#27ae60',
    secondary: '#2ecc71',
    accent: '#a5d6b7',
    light: '#e8f5e9'
  },
  orange: {
    primary: '#f39c12',
    secondary: '#e67e22',
    accent: '#ffcc80',
    light: '#fff3e0'
  }
};

// 获取系统主题模式
function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light'; // 默认浅色
}

// 保存主题设置到本地存储
export function saveThemeSettings(settings) {
  try {
    const mergedSettings = { ...getThemeSettings(), ...settings };
    uni.setStorageSync('themeSettings', JSON.stringify(mergedSettings));
    applyTheme(mergedSettings);
    return true;
  } catch (e) {
    console.error('保存主题设置失败:', e);
    return false;
  }
}

// 获取当前主题设置
export function getThemeSettings() {
  try {
    const savedSettings = uni.getStorageSync('themeSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (e) {
    console.error('读取主题设置失败:', e);
  }
  return { ...defaultThemeSettings };
}

// 应用主题设置
export function applyTheme(settings = null) {
  const themeSettings = settings || getThemeSettings();
  
  // 确定当前应该使用的主题模式
  let currentTheme = themeSettings.theme;
  if (currentTheme === 'system') {
    currentTheme = getSystemTheme();
  }
  
  // 获取主题颜色
  const colors = themeColors[themeSettings.color] || themeColors.blue;
  
  // 动态设置CSS变量
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    
    // 设置主题色变量
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--light-color', colors.light);
    
    // 设置主题模式相关变量
    if (currentTheme === 'dark') {
      root.style.setProperty('--background-color', '#121212');
      root.style.setProperty('--card-background', '#1e1e1e');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--text-secondary', '#b0b0b0');
      root.style.setProperty('--border-color', '#333333');
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      root.style.setProperty('--background-color', '#f5f5f5');
      root.style.setProperty('--card-background', '#ffffff');
      root.style.setProperty('--text-color', '#333333');
      root.style.setProperty('--text-secondary', '#666666');
      root.style.setProperty('--border-color', '#e0e0e0');
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }
  
  // 触发主题变更事件
  uni.$emit('themeChanged', { ...themeSettings, currentTheme });
  
  return { ...themeSettings, currentTheme };
}

// 监听系统主题变化
export function listenForSystemThemeChanges() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 添加媒体查询事件监听
    const listener = (e) => {
      const settings = getThemeSettings();
      if (settings.theme === 'system') {
        applyTheme(settings);
      }
    };
    
    try {
      // 使用新的 API
      mediaQuery.addEventListener('change', listener);
    } catch (e) {
      // 兼容旧版浏览器
      mediaQuery.addListener(listener);
    }
    
    return () => {
      // 清理函数
      try {
        mediaQuery.removeEventListener('change', listener);
      } catch (e) {
        mediaQuery.removeListener(listener);
      }
    };
  }
  
  // 如果不支持，返回空函数
  return () => {};
}

// 初始化主题
export function initTheme() {
  // 应用当前主题设置
  const themeSettings = applyTheme();
  
  // 监听系统主题变化
  listenForSystemThemeChanges();
  
  return themeSettings;
}

// 重置主题为默认设置
export function resetTheme() {
  saveThemeSettings(defaultThemeSettings);
  return defaultThemeSettings;
}