<template>
  <view class="base-group">
    <slot />
  </view>
</template>

<script>
  export default {
    name: 'BaseGroup',
  };
</script>

<style lang="scss" scoped>
  @import '@/uni.scss';
  .base-group {
    background: $white;
    border-radius: 0;
    margin: $uni-spacing-row-sm 0;
    /* 不加阴影 */
  }
</style>
