<template>
  <view :class="['common-card', customClass]" :style="cardStyle">
    <slot />
  </view>
</template>
<script>
export default {
  name: 'CommonCard',
  props: {
    padding: {
      type: String,
      default: '32rpx'
    },
    margin: {
      type: String,
      default: '0 0 16rpx 0'
    },
    radius: {
      type: String,
      default: '20rpx'
    },
    customClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    cardStyle() {
      return {
        padding: this.padding,
        margin: this.margin,
        'border-radius': this.radius,
        'box-shadow': '0 4rpx 24rpx rgba(0,0,0,0.06)'
      };
    }
  }
}
</script>
<style scoped>
.common-card {
  width: 100%;
  box-sizing: border-box;
}
</style> 