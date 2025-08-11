<template>
  <view class="page-content" :class="contentClass" :style="contentStyle">
    <slot />
  </view>
</template>

<script>
export default {
  name: 'PageContent',
  props: {
    overlap: {
      type: Boolean,
      default: true,
    },
    overlapOffset: {
      type: Number,
      default: 40,
    },
    padding: {
      type: String,
      default: '0 24rpx 40rpx',
    },
  },
  computed: {
    contentClass() {
      return {
        'content-overlap': this.overlap,
      };
    },
    contentStyle() {
      return {
        padding: this.padding,
        marginTop: this.overlap ? `-${this.overlapOffset}rpx` : '0',
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  align-items: stretch;

  &.content-overlap {
    position: relative;
    z-index: 3;
  }
}
</style>

