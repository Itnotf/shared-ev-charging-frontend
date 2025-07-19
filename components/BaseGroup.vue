<template>
  <view class="base-group">
    <slot />
  </view>
</template>

<script>
export default {
  name: 'BaseGroup'
};
</script>

<style scoped>
.base-group {
  background: #fff;
  border-radius: 0;
  margin: 24rpx 0;
  /* 不加阴影 */
}
</style> 