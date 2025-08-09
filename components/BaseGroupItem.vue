<template>
  <view class="base-group-item" @click="handleClick">
    <uni-icons v-if="icon" :type="icon" size="24" class="base-group-item-icon" />
    <view class="base-group-item-content">
      <text class="base-group-item-title">{{ title }}</text>
      <text v-if="subtitle" class="base-group-item-subtitle">{{ subtitle }}</text>
    </view>
    <view class="base-group-item-right">
      <slot name="right">
        <uni-icons
          v-if="rightIcon"
          :type="rightIcon"
          size="16"
          class="base-group-item-right-icon"
        />
      </slot>
    </view>
  </view>
</template>

<script>
  export default {
    name: 'BaseGroupItem',
    props: {
      icon: {
        type: String,
        default: '',
      },
      title: {
        type: String,
        default: '',
      },
      subtitle: {
        type: String,
        default: '',
      },
      rightIcon: {
        type: String,
        default: '',
      },
    },
    methods: {
      handleClick() {
        this.$emit('click');
      },
    },
  };
</script>

<style lang="scss">
  @import '@/uni.scss';

  .base-group-item {
    display: flex;
    align-items: center;
    padding: $uni-spacing-col-base $uni-spacing-row-base;
    background-color: $uni-bg-color;
    border-bottom: 1rpx solid $uni-border-color;

    &:last-child {
      border-bottom: none;
    }

    .base-group-item-icon {
      color: $uni-color-primary;
      margin-right: $uni-spacing-row-sm;
    }

    .base-group-item-content {
      flex: 1;
      display: flex;
      flex-direction: column;

      .base-group-item-title {
        font-size: $uni-font-size-base;
        color: $uni-text-color;
        margin-bottom: 4rpx;
      }

      .base-group-item-subtitle {
        font-size: $uni-font-size-sm;
        color: $uni-text-color-grey;
      }
    }

    .base-group-item-right {
      display: flex;
      align-items: center;

      .base-group-item-right-icon {
        color: $uni-text-color-grey;
      }
    }
  }
</style>
