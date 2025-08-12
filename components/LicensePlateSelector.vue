<template>
  <view class="license-plate-selector">
    <view class="selector-header" @click="showPicker">
      <view class="selected-plate">
        <view v-if="selectedPlate" class="plate-display">
          <text class="plate-number">{{ selectedPlate.plate_number }}</text>
          <text v-if="selectedPlate.is_default" class="default-tag">默认</text>
        </view>
        <text v-else class="placeholder">请选择车牌号</text>
      </view>
      <uni-icons type="down" size="16" class="arrow-icon" />
    </view>

    <!-- 车牌号选择弹窗 -->
    <uni-popup ref="popup" type="bottom" background-color="#fff">
      <view class="picker-content">
        <view class="picker-header">
          <text class="picker-title">选择车牌号</text>
          <text class="picker-close" @click="closePicker">取消</text>
        </view>
        
        <view class="plates-list">
          <view
            v-for="plate in licensePlates"
            :key="plate.id"
            :class="['plate-item', { selected: selectedPlate && selectedPlate.id === plate.id }]"
            @click="selectPlate(plate)"
          >
            <view class="plate-info">
              <text class="plate-number">{{ plate.plate_number }}</text>
              <text v-if="plate.is_default" class="default-tag">默认</text>
            </view>
            <uni-icons
              v-if="selectedPlate && selectedPlate.id === plate.id"
              type="checkmarkempty"
              size="20"
              color="#FFA500"
            />
          </view>
        </view>

        <view class="picker-actions">
          <button class="add-plate-btn" @click="goToManagePage">管理车牌号</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { getLicensePlates } from '@/api/licensePlate';
import { getPayload, goToAuth } from '@/utils';

export default {
  name: 'LicensePlateSelector',
  props: {
    // 当前选中的车牌号
    value: {
      type: Object,
      default: null,
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    // 是否静默模式（不显示错误提示）
    silent: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      licensePlates: [],
      selectedPlate: null,
      loading: false,
    };
  },
  watch: {
    value: {
      handler(newVal) {
        this.selectedPlate = newVal;
      },
      immediate: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.loadLicensePlates();
    });
  },
  onReady() {
    // 确保组件完全准备好后再加载数据
    if (this.licensePlates.length === 0) {
      this.loadLicensePlates();
    }
  },
  methods: {
    async loadLicensePlates() {
      try {
        this.loading = true;
        const res = await getLicensePlates();
        const payload = getPayload(res);
        
        // 确保 licensePlates 始终是一个数组
        if (Array.isArray(payload)) {
          this.licensePlates = payload;
        } else if (payload && typeof payload === 'object') {
          // 如果返回的是对象，尝试提取数组
          this.licensePlates = Array.isArray(payload.data) ? payload.data : [];
        } else {
          this.licensePlates = [];
        }
        
        console.log('加载的车牌号列表:', this.licensePlates);
        
        // 如果没有选中的车牌号，自动选择默认车牌号
        if (!this.selectedPlate && Array.isArray(this.licensePlates) && this.licensePlates.length > 0) {
          const defaultPlate = this.licensePlates.find(plate => plate.is_default);
          if (defaultPlate) {
            this.selectPlate(defaultPlate);
          }
        }
      } catch (error) {
        console.error('加载车牌号列表失败:', error);
        this.licensePlates = []; // 出错时设置为空数组
        
        // 只在非静默模式下显示错误提示
        if (!this.silent) {
          uni.showToast({
            title: '加载车牌号失败',
            icon: 'none',
          });
        }
      } finally {
        this.loading = false;
      }
    },

    showPicker() {
      if (this.disabled) return;
      
      if (!Array.isArray(this.licensePlates) || this.licensePlates.length === 0) {
        uni.showModal({
          title: '提示',
          content: '您还没有添加车牌号，是否前往添加？',
          success: (res) => {
            if (res.confirm) {
              this.goToManagePage();
            }
          },
        });
        return;
      }
      
      if (this.$refs.popup) {
        this.$refs.popup.open();
      }
    },

    closePicker() {
      if (this.$refs.popup) {
        this.$refs.popup.close();
      }
    },

    selectPlate(plate) {
      this.selectedPlate = plate;
      this.$emit('input', plate);
      this.$emit('change', plate);
      
      // 延迟关闭弹窗，确保事件先被处理
      this.$nextTick(() => {
        this.closePicker();
      });
    },

    goToManagePage() {
      this.closePicker();
      goToAuth('/pages/profile/licensePlates');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.license-plate-selector {
  .selector-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 32rpx;
    background-color: $uni-bg-color;
    border-radius: $uni-border-radius-base;
    border: 2rpx solid $uni-border-color;
    min-height: 88rpx;
    box-sizing: border-box;

    .selected-plate {
      flex: 1;

      .plate-display {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .plate-number {
          font-size: 32rpx;
          font-weight: 600;
          color: $uni-text-color;
          letter-spacing: 2rpx;
        }

        .default-tag {
          font-size: 24rpx;
          color: $uni-color-primary;
          background-color: rgba($uni-color-primary, 0.1);
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
        }
      }

      .placeholder {
        font-size: 32rpx;
        color: $uni-text-color-placeholder;
      }
    }

    .arrow-icon {
      color: $uni-text-color-grey;
    }
  }
}

.picker-content {
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;

  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 2rpx solid $uni-border-color;

    .picker-title {
      font-size: 36rpx;
      font-weight: 600;
      color: $uni-text-color;
    }

    .picker-close {
      font-size: 32rpx;
      color: $uni-text-color-grey;
    }
  }

  .plates-list {
    max-height: 400rpx;
    overflow-y: auto;

    .plate-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 32rpx;
      border-bottom: 2rpx solid $uni-border-color;

      &.selected {
        background-color: rgba($uni-color-primary, 0.05);
      }

      &:last-child {
        border-bottom: none;
      }

      .plate-info {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .plate-number {
          font-size: 32rpx;
          font-weight: 600;
          color: $uni-text-color;
          letter-spacing: 2rpx;
        }

        .default-tag {
          font-size: 24rpx;
          color: $uni-color-primary;
          background-color: rgba($uni-color-primary, 0.1);
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
        }
      }
    }
  }

  .picker-actions {
    padding: 32rpx;
    border-top: 2rpx solid $uni-border-color;

    .add-plate-btn {
      width: 100%;
      height: 88rpx;
      background-color: transparent;
      border: 2rpx solid $uni-color-primary;
      color: $uni-color-primary;
      font-size: 32rpx;
      border-radius: $uni-border-radius-base;

      &::after {
        border: none;
      }
    }
  }
}
</style>
