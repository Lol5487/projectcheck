import {
	createSSRApp
} from "vue";
import App from "./App.vue";
// 导入全局样式
import "./static/css/global.css";
// 导入国际化工具
import i18nPlugin from './utils/i18n.js';

export function createApp() {
	const app = createSSRApp(App);
	
	// 注册i18n插件
	app.use(i18nPlugin);
	
	return {
		app,
	};
}
