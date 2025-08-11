<template>
  <view class="hero-card" :class="[cardClass, `card-${type}`]">
    <slot />
  </view>
</template>

<script>
export default {
  name: 'HeroCard',
  props: {
    type: {
      type: String,
      default: 'default', // default, overview, reservation, add
      validator: (value) => ['default', 'overview', 'reservation', 'add'].includes(value),
    },
    cardClass: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.hero-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.08); // 统一更克制的阴影
  margin-bottom: 20rpx;

  &.card-overview {
    // 统一风格：白底卡片，无彩色边，不固定高度
    min-height: auto;
  }

  &.card-reservation {
    min-height: auto;
  }

  &.card-add {
    min-height: auto;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
    border: 1rpx solid rgba(0, 0, 0, 0.05);
  }
}

/* 供页面传入 class 控制不同场景的高度 */
.hero-card.tall {
  padding: 32rpx;
}

.hero-card.high {
  min-height: 200rpx;
}
</style>

