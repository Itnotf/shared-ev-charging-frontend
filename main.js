import App from './App';

// #ifndef VUE3
import Vue from 'vue';
import './uni.promisify.adaptor';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import uniNavBar from '@dcloudio/uni-ui/lib/uni-nav-bar/uni-nav-bar.vue';
Vue.config.productionTip = false;
App.mpType = 'app';
const app = new Vue({
  ...App,
});
app.$mount();
Vue.component('uni-icons', uniIcons);
Vue.component('uni-nav-bar', uniNavBar);
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import uniNavBar from '@dcloudio/uni-ui/lib/uni-nav-bar/uni-nav-bar.vue';

export function createApp() {
  const app = createSSRApp(App);
  
  // 注册全局组件
  app.component('uni-icons', uniIcons);
  app.component('uni-nav-bar', uniNavBar);
  
  return {
    app,
  };
}
// #endif
