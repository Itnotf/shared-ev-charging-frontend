<template>
  <view class="container">
    <!-- 内容区域 -->
    <view class="content">
      <!-- 图片展示区域 -->
      <view v-if="record.image_url" class="image-section">
        <image
          :src="getRecordImageUrl(record.image_url)"
          class="record-image"
          mode="aspectFit"
          @click="previewImage"
        />
        <view class="image-overlay">
          <text class="image-tip">点击查看大图</text>
        </view>
      </view>

      <view v-else class="no-image-section">
        <uni-icons type="image" size="48" class="no-image-icon" />
        <text class="no-image-text">暂无图片</text>
      </view>

      <!-- 记录信息卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">充电信息</text>
        </view>

        <view class="info-list">
          <view class="info-item">
            <text class="info-label">日期</text>
            <text class="info-value">{{ formatDate(record.date, 'YYYY年MM月DD日') }}</text>
          </view>

          <view class="info-item">
            <text class="info-label">时段</text>
            <text class="info-value">{{ getTimeslotLabel(record.timeslot) }}</text>
          </view>

          <view class="info-item">
            <text class="info-label">充电度数</text>
            <text class="info-value highlight">{{ record.kwh }} kWh</text>
          </view>

          <view class="info-item">
            <text class="info-label">费用</text>
            <text class="info-value highlight">¥{{ formatAmount(record.amount) }}</text>
          </view>

          <view v-if="record.license_plate" class="info-item">
            <text class="info-label">车牌号</text>
            <text class="info-value license-plate">{{ record.license_plate.plate_number }}</text>
          </view>

          <view v-if="record.remark" class="info-item">
            <text class="info-label">备注</text>
            <text class="info-value">{{ record.remark }}</text>
          </view>

          <view class="info-item">
            <text class="info-label">创建时间</text>
            <text class="info-value">{{ formatDateTime(record.created_at) }}</text>
          </view>

          <view
            v-if="record.updated_at && record.updated_at !== record.created_at"
            class="info-item"
          >
            <text class="info-label">更新时间</text>
            <text class="info-value">{{ formatDateTime(record.updated_at) }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="edit-btn" @click="goToEdit">
          <uni-icons type="compose" size="20" class="edit-icon" />
          <text class="btn-text">编辑记录</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>

  import { getRecordDetail } from '@/api/record';
  import { formatDate, getFullImageUrl, getRecordImageUrl, goToAuth, getPayload } from '@/utils';
  import { TIMESLOTS } from '@/config';

  export default {

    data() {
      return {
        TIMESLOTS,
        recordId: '',
        record: {
          id: '',
          date: '',
          timeslot: '',
          kwh: 0,
          amount: 0,
          remark: '',
          image_url: '',
          created_at: '',
          updated_at: '',
        },
        loading: false,
      };
    },
    onLoad(options) {
      if (options && options.id) {
        this.recordId = options.id;
        this.loadRecordDetail();
      }
    },
    onShow() {
      if (this.recordId) {
        this.loadRecordDetail();
      }
    },
    methods: {
      async loadRecordDetail() {
        this.loading = true;
        try {
          const res = await getRecordDetail(this.recordId);
          console.log('API返回原始数据:', res);
          const data = getPayload(res);
          console.log('getPayload解析后数据:', data);
          if (data) {
            this.record = {
              ...data,
              amount: Number(data.amount) / 100, // 分转元
            };
            console.log('最终record数据:', this.record);
          } else {
            console.log('getPayload返回空数据');
          }
        } catch (error) {
          console.error('加载记录详情失败:', error);
          uni.showToast({ title: '加载记录详情失败', icon: 'none' });
        } finally {
          this.loading = false;
        }
      },

      goToEdit() {
        goToAuth(`/pages/records/edit?id=${this.recordId}`);
      },

      previewImage() {
        if (this.record.image_url) {
          const url = getFullImageUrl(this.record.image_url);
          uni.previewImage({
            urls: [url],
            current: url,
          });
        }
      },

      formatDate(date, format) {
        return formatDate(date, format);
      },

      formatDateTime(dateTime) {
        if (!dateTime) return '';
        const date = new Date(dateTime);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      },

      formatAmount(amount) {
        return Number(amount).toFixed(2);
      },

      getTimeslotLabel(timeslot) {
        if (this.TIMESLOTS && this.TIMESLOTS[timeslot]) {
          return this.TIMESLOTS[timeslot].name;
        }
        return timeslot || '';
      },
      getRecordImageUrl,
    },
  };
</script>

<style lang="scss">
  @import '@/uni.scss';
  .container {
    background: $bg;
    min-height: 100vh;
  }

  .content {
    padding: 20rpx;
  }

  .image-section {
    position: relative;
    background: $white;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
  }

  .record-image {
    width: 100%;
    height: 400rpx;
    background: $uni-bg-color-hover;
  }

  .image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
    padding: 20rpx;
    display: flex;
    justify-content: center;
  }

  .image-tip {
    color: $uni-text-color-inverse;
    font-size: $uni-font-size-sm;
    opacity: 0.8;
  }

  .no-image-section {
    background: $white;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    padding: 80rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
  }

  .no-image-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
    margin-top: 16rpx;
  }

  .info-card {
    background: $white;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    padding: 24rpx 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
  }

  .card-header {
    margin-bottom: 20rpx;
  }

  .card-title {
    font-size: 28rpx;
    font-weight: bold;
    color: $text-main;
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;
    border-bottom: 1rpx solid $uni-border-color;
  }

  .info-item:last-child {
    border-bottom: none;
  }

  .info-label {
    font-size: 26rpx;
    color: $text-sub;
  }

  .info-value {
    font-size: 26rpx;
    color: $text-main;
    font-weight: 500;
  }

  .info-value.highlight {
    color: $primary;
    font-weight: bold;
  }

  .info-value.license-plate {
    background-color: rgba($uni-color-primary, 0.1);
    color: $uni-color-primary;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    font-weight: 600;
    letter-spacing: 2rpx;
  }

  .action-buttons {
    padding: 20rpx 0;
  }

  .edit-btn {
    @extend .btn;
    width: 100%;
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: $charging-shadow-sm;
    letter-spacing: 1rpx;
    cursor: pointer;
    
    // 悬停效果
    &:hover {
      box-shadow: $charging-shadow-md;
      transform: translateY(-1rpx);
    }
    
    // 点击效果
    &:active {
      transform: translateY(1rpx) scale(0.98);
      box-shadow: $charging-shadow-sm;
      transition: all 0.1s ease;
    }
  }

  // 图标样式类
  .no-image-icon {
    color: $uni-text-color-disable;
  }

  .edit-icon {
    color: $uni-text-color-inverse;
  }
</style>
