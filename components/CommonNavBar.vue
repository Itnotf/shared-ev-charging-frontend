<template>
  <view>
    <uni-nav-bar
      :title="title"
      color="#333"
      backgroundColor="#fff"
      statusBar
    >
      <!-- 自定义返回按钮 -->
      <template v-slot:left>
        <view v-if="showBack" class="nav-left-btn" @click="onLeftClick">
          <uni-icons type="back" size="22" color="#333" />
        </view>
      </template>
    </uni-nav-bar>
  </view>
</template>

<script>
import uniNavBar from '@dcloudio/uni-ui/lib/uni-nav-bar/uni-nav-bar.vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
export default {
  name: 'CommonNavBar',
  components: { uniNavBar, uniIcons },
  props: {
    title: {
      type: String,
      default: ''
    },
    rightClick: {
      type: Function,
      default: null
    },
    showBack: {
      type: Boolean,
      default: false
    },
    backPath: {
      type: String,
      default: '/pages/index/index'
    }
  },
  methods: {
    onRightClick(e) {
      this.rightClick && this.rightClick(e);
    },
    onLeftClick() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack();
      } else {
        const tabPages = [
          '/pages/index/index',
          '/pages/reservations/index',
          '/pages/records/create',
          '/pages/profile/index'
        ];
        if (this.backPath && this.backPath.startsWith('/pages/')) {
          if (tabPages.includes(this.backPath)) {
            uni.switchTab({ url: this.backPath });
          } else {
            uni.redirectTo({ url: this.backPath });
          }
        } else {
          uni.switchTab({ url: '/pages/index/index' });
        }
      }
    }
  }
}
</script>

<style scoped>
.nav-left-btn {
  padding: 0 20rpx;
  display: flex;
  align-items: center;
}
</style> 