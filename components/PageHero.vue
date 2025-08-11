<template>
  <view class="page-hero" :style="{ height: height + 'rpx' }">
    <view class="hero-bg" :class="bgClass"></view>
    <view class="hero-content">
      <view class="hero-title">
        <text class="title-text">{{ title }}</text>
        <text v-if="subtitle" class="title-subtitle">{{ subtitle }}</text>
      </view>
      <view class="hero-actions">
        <slot name="actions">
          <view v-if="!hasActions" class="hero-icon">
            <uni-icons :type="iconType" :size="iconSize" color="#fff" />
          </view>
        </slot>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PageHero',
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    height: {
      type: Number,
      default: 240,
    },
    bgClass: {
      type: String,
      default: 'gradient-blue',
    },
    iconType: {
      type: String,
      default: 'location',
    },
    iconSize: {
      type: Number,
      default: 48,
    },
  },
  computed: {
    hasActions() {
      return !!this.$slots.actions;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.page-hero {
  position: relative;
  overflow: hidden;

  .hero-bg {
    position: absolute;
    inset: 0;

    &.gradient-blue {
      background: $charging-gradient-navbar;
    }

    &.gradient-purple {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        opacity: 0.3;
      }
    }
  }

  .hero-content {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 60rpx 40rpx 48rpx; // 加大底部内边距，避免按钮贴近下方卡片
    box-sizing: border-box;
  }

  .hero-title {
    display: flex;
    flex-direction: column;
    gap: 6rpx;

    .title-text {
      font-size: 48rpx;
      font-weight: 700;
      color: $uni-text-color-inverse;
      text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
    }

    .title-subtitle {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 400;
    }
  }

  .hero-actions {
    display: flex;
    align-items: center;

    .hero-icon {
      width: 96rpx;
      height: 96rpx;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10rpx);
      border: 2rpx solid rgba(255, 255, 255, 0.3);
    }
  }
}
</style>

