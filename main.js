import App from './App'
import { userAuth, redirectToLogin } from '@/utils';

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import uniNavBar from '@dcloudio/uni-ui/lib/uni-nav-bar/uni-nav-bar.vue'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
Vue.component('uni-icons', uniIcons)
Vue.component('uni-nav-bar', uniNavBar)
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif

// 全局路由守卫
['navigateTo', 'switchTab', 'redirectTo', 'reLaunch'].forEach(method => {
  uni.addInterceptor(method, {
    invoke(e) {
      const whiteList = ['/pages/login/login', '/pages/profile/agreement', '/pages/profile/privacy'];
      if (!whiteList.includes(e.url.split('?')[0]) && !userAuth.check()) {
        redirectToLogin();
        return false;
      }
      return true;
    }
  });
});