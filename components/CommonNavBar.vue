<template>
  <view class="nav-bar">
    <view v-if="showBack" class="nav-left" @click="goBack">
      <uni-icons type="back" size="22" class="nav-icon" />
    </view>
    <view v-else class="nav-left"></view>
    <text class="nav-title">{{ title }}</text>
    <view class="nav-right">
      <slot name="right"></slot>
    </view>
  </view>
</template>

<script>
  export default {
    name: 'CommonNavBar',
    props: {
      title: {
        type: String,
        default: '',
      },
      showBack: {
        type: Boolean,
        default: true,
      },
    },
    methods: {
      goBack() {
        uni.navigateBack({
          delta: 1,
        });
      },
    },
  };
</script>

<style lang="scss">
  @import '@/uni.scss';

  .nav-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 88rpx;
    background-color: $uni-bg-color;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $uni-spacing-row-base;
    z-index: 1000;
    box-shadow: $charging-shadow-sm;

    .nav-left {
      display: flex;
      align-items: center;
      width: 80rpx;
      height: 100%;
    }

    .nav-icon {
      color: $uni-text-color;
    }

    .nav-title {
      font-size: $uni-font-size-lg;
      font-weight: bold;
      color: $uni-text-color;
      flex: 1;
      text-align: center;
    }

    .nav-right {
      width: 80rpx;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
</style>
