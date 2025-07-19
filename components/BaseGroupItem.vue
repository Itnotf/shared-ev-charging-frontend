<template>
  <view class="base-group-item" @click="handleClick">
    <slot name="icon">
      <uni-icons v-if="icon" :type="icon" size="24" color="#FFA500" class="base-group-item-icon" />
    </slot>
    <view class="base-group-item-main">
      <text class="base-group-item-title">{{ title }}</text>
      <text v-if="desc" class="base-group-item-desc">{{ desc }}</text>
      <slot />
    </view>
    <view class="base-group-item-right">
      <slot name="right">
        <uni-icons v-if="rightIcon" :type="rightIcon" size="16" color="#ccc" />
      </slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BaseGroupItem',
  props: {
    icon: String,
    title: String,
    desc: String,
    rightIcon: String
  },
  methods: {
    handleClick(e) {
      this.$emit('click', e);
    }
  }
};
</script>

<style scoped>
.base-group-item {
  display: flex;
  align-items: center;
  height: 104rpx;
  padding: 0 32rpx;
  border-bottom: 2rpx solid #e0e0e0;
  background: #fff;
}
.base-group-item:last-child {
  border-bottom: none;
}
.base-group-item-icon {
  margin-right: 24rpx;
}
.base-group-item-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.base-group-item-title {
  font-size: 34rpx;
  color: #222;
  font-weight: 500;
}
.base-group-item-desc {
  font-size: 26rpx;
  color: #999;
  margin-top: 6rpx;
}
.base-group-item-right {
  display: flex;
  align-items: center;
  margin-left: 16rpx;
}
</style> 