<template>
  <view class="license-plate-card" :class="[{ 'is-default': isDefault }, { 'is-highlight': highlight }]">
    <view class="plate-display">
      <view class="plate-number">{{ plateNumber }}</view>
      <view v-if="isDefault" class="default-badge">默认</view>
    </view>
    <view v-if="showActions" class="card-actions">
      <button v-if="!isDefault" class="action-btn set-default" @click="handleSetDefault">
        设为默认
      </button>
      <button class="action-btn edit" @click="handleEdit">编辑</button>
      <button class="action-btn delete" @click="handleDelete">删除</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LicensePlateCard',
  props: {
    // 车牌号
    plateNumber: {
      type: String,
      required: true,
    },
    // 是否为默认车牌
    isDefault: {
      type: Boolean,
      default: false,
    },
    // 是否显示操作按钮
    showActions: {
      type: Boolean,
      default: false,
    },
    // 车牌号ID
    plateId: {
      type: [String, Number],
      default: null,
    },
    // 是否高亮（例如新添加后短暂高亮）
    highlight: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleSetDefault() {
      this.$emit('set-default', this.plateId);
    },
    handleEdit() {
      this.$emit('edit', this.plateId);
    },
    handleDelete() {
      this.$emit('delete', this.plateId);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.license-plate-card {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-base;
  padding: 24rpx;
  border: 2rpx solid $uni-border-color;
  position: relative; // 让默认标识可绝对定位而不影响布局

  &.is-default {
    border-color: rgba($uni-color-success, 0.4);
    box-shadow: 0 8rpx 24rpx rgba(52, 179, 83, 0.18);
  }

  &.is-highlight {
    animation: plateHighlight 1.2s ease-out 1;
  }

  .plate-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    margin-bottom: 24rpx;
    position: relative; // 供默认标识定位

    .plate-number {
      font-size: 36rpx;
      font-weight: 700;
      letter-spacing: 4rpx;
      font-family: 'Arial', sans-serif;
      // 新能源车牌风格（贴近实物）：浅黄绿 -> 中绿，黑色文字
      background: linear-gradient(135deg, $plate-ev-gradient-start 0%, $plate-ev-gradient-end 100%);
      color: #111;
      padding: 16rpx 32rpx;
      border-radius: 12rpx;
      text-align: center;
      min-width: 280rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.12);
      border: 2rpx solid rgba(0, 0, 0, 0.06);
      text-shadow: 0 1rpx 2rpx rgba(255, 255, 255, 0.25);
    }

    .default-badge {
      position: absolute;
      top: 8rpx;
      right: 8rpx;
      font-size: 22rpx;
      color: $uni-color-primary;
      background-color: rgba($uni-color-primary, 0.1);
      padding: 6rpx 12rpx;
      border-radius: 999rpx;
      border: 2rpx solid rgba($uni-color-primary, 0.6);
      line-height: 1;
      box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.06);
      pointer-events: none; // 避免遮挡点击
    }
  }

  .card-actions {
    display: flex;
    gap: 16rpx;
    justify-content: center;

    .action-btn {
      flex: 1;
      height: 64rpx;
      font-size: 28rpx;
      border-radius: $uni-border-radius-base;
      border: none;

      &::after {
        border: none;
      }

      &.set-default {
        background-color: rgba($uni-color-primary, 0.1);
        color: $uni-color-primary;
      }

      &.edit {
        background-color: rgba($uni-color-success, 0.1);
        color: $uni-color-success;
      }

      &.delete {
        background-color: rgba($uni-color-error, 0.1);
        color: $uni-color-error;
      }
    }
  }
}

@keyframes plateHighlight {
  0% { box-shadow: 0 0 0 rgba(52, 179, 83, 0); }
  30% { box-shadow: 0 0 0 12rpx rgba(52, 179, 83, 0.25); }
  100% { box-shadow: 0 0 0 rgba(52, 179, 83, 0); }
}
</style>
