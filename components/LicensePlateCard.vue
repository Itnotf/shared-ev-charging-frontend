<template>
  <view class="license-plate-card">
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

  .plate-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    margin-bottom: 24rpx;

    .plate-number {
      font-size: 36rpx;
      font-weight: 700;
      color: $uni-text-color;
      letter-spacing: 4rpx;
      font-family: 'Arial', sans-serif;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      padding: 16rpx 32rpx;
      border-radius: 12rpx;
      text-align: center;
      min-width: 280rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    }

    .default-badge {
      font-size: 24rpx;
      color: $uni-color-primary;
      background-color: rgba($uni-color-primary, 0.1);
      padding: 8rpx 16rpx;
      border-radius: 16rpx;
      border: 2rpx solid $uni-color-primary;
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
</style>
