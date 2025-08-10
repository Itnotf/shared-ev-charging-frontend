<template>
  <view class="container">

    <!-- 内容区域 -->
    <view class="content">
      <!-- 月份选择 -->
      <view class="month-bar-row" @click="openMonthPicker">
        <picker mode="date" fields="month" :value="selectedMonth" @change="onMonthChange">
          <view class="month-picker">{{ selectedMonth }}</view>
        </picker>
      </view>

      <!-- 统计概览卡片 -->
      <view class="stats-card">
        <view class="stats-header">
          <text class="stats-title">本月统计</text>
        </view>
        <view class="stats-content">
          <view class="stats-item">
            <text class="stats-value">{{ monthlyStats.totalKwh || '0.0' }}</text>
            <text class="stats-label">总度数 (kWh)</text>
          </view>
          <view class="stats-item">
            <text class="stats-value">¥{{ monthlyStats.totalCost || '0.00' }}</text>
            <text class="stats-label">总费用</text>
          </view>
        </view>
      </view>

      <!-- 记录列表 -->
      <view class="records-container">
        <view class="records-header">
          <text class="records-title">充电记录</text>
          <text class="records-count">共 {{ records.length }} 条</text>
        </view>

        <view v-if="records.length > 0" class="records-list">
          <view
            v-for="record in records"
            :key="record.id"
            class="record-item"
            @click="goToDetail(record.id)"
          >
            <view class="record-left">
              <view class="record-date-row">
                <text class="record-date">{{ formatDate(record.date, 'MM-DD') }}</text>
                <text class="record-timeslot">{{ getTimeslotLabel(record.timeslot) }}</text>
              </view>
              <view class="record-info">
                <text class="record-kwh">{{ record.kwh }} kWh</text>
                <text class="record-amount">¥{{ formatAmount(record.amount) }}</text>
              </view>
              <view v-if="record.license_plate" class="record-license-plate">
                <text class="license-plate-text">{{ record.license_plate.plate_number }}</text>
              </view>
              <text v-if="record.remark" class="record-remark">{{ record.remark }}</text>
            </view>
            <view class="record-right">
              <image
                v-if="record.image_url"
                :src="getRecordImageUrl(record.image_url)"
                class="record-thumbnail"
                mode="aspectFill"
              />
              <view v-else class="record-no-image">无图</view>
              <uni-icons type="right" size="16" class="record-arrow" />
            </view>
          </view>
        </view>

        <view v-else class="empty-state">
          <uni-icons type="info" size="48" class="empty-icon" />
          <text class="empty-text">本月暂无充电记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>

  import { getRecordsList } from '@/api/record';
  import { getMonthlyStatistics } from '@/api/statistics';
  import { formatDate, getCurrentDate, getRecordImageUrl, getPayload } from '@/utils';
  import { TIMESLOTS } from '@/config';

  export default {

    data() {
      return {
        TIMESLOTS,
        selectedMonth: getCurrentDate('YYYY-MM'),
        records: [],
        monthlyStats: {
          totalKwh: 0,
          totalCost: 0,
        },
        loading: false,
      };
    },
    onLoad(options) {
      if (options && options.month) {
        this.selectedMonth = options.month;
      }
    },
    onShow() {
      this.loadData();
    },
    methods: {
      onMonthChange(e) {
        this.selectedMonth = e.detail.value;
        this.loadData();
      },

      async loadData() {
        this.loading = true;
        try {
          // 并行加载记录列表和统计数据
          const [recordsRes, statsRes] = await Promise.all([
            getRecordsList(this.selectedMonth),
            getMonthlyStatistics(this.selectedMonth),
          ]);

          // 处理记录列表
          const records = getPayload(recordsRes);
          if (Array.isArray(records)) {
            this.records = records
              .map((record) => ({
                ...record,
                amount: Number(record.amount) / 100, // 分转元
              }))
              .sort((a, b) => new Date(b.date) - new Date(a.date)); // 日期倒序
          } else {
            this.records = [];
          }

          // 处理统计数据
          const stat = getPayload(statsRes);
          if (stat) {
            this.monthlyStats = {
              totalKwh: Number(stat.totalKwh).toFixed(1),
              totalCost: (Number(stat.totalCost) / 100).toFixed(2),
            };
          }
        } catch (error) {
          uni.showToast({ title: '加载数据失败', icon: 'none' });
        } finally {
          this.loading = false;
        }
      },

      goToDetail(recordId) {
        uni.navigateTo({
          url: `/pages/records/detail?id=${recordId}`,
        });
      },

      formatDate(date, format) {
        return formatDate(date, format);
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

      openMonthPicker() {
        // 月份选择器已通过picker组件实现
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
    padding: 16rpx;
  }

  .month-bar-row {
    display: flex;
    align-items: center;
    padding: 16rpx 20rpx 0 20rpx;
    font-size: 30rpx;
    color: $uni-color-primary;
    font-weight: bold;
    cursor: pointer;
    position: relative;
    z-index: 10;
  }

  .month-picker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 24rpx;
    height: 56rpx;
    min-width: 120rpx;
    background: rgba(255, 165, 0, 0.1);
    border: 2rpx solid $uni-color-primary;
    border-radius: 28rpx;
    font-size: 30rpx;
    color: $uni-color-primary;
    font-weight: bold;
    box-shadow: $charging-shadow-sm;
    cursor: pointer;
    position: relative;
  }

  .month-picker::after {
    content: '';
    display: inline-block;
    margin-left: 10rpx;
    width: 0;
    height: 0;
    border-left: 10rpx solid transparent;
    border-right: 10rpx solid transparent;
    border-top: 10rpx solid $uni-color-primary;
  }

  .stats-card {
    background: $white;
    border-radius: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
    margin: 12rpx 20rpx 16rpx 20rpx;
    padding: 20rpx 16rpx;
  }

  .stats-header {
    margin-bottom: 16rpx;
  }

  .stats-title {
    font-size: 28rpx;
    font-weight: bold;
    color: $text-main;
  }

  .stats-content {
    display: flex;
    justify-content: space-around;
  }

  .stats-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stats-value {
    font-size: 36rpx;
    font-weight: bold;
    color: $primary;
    margin-bottom: 8rpx;
  }

  .stats-label {
    font-size: 24rpx;
    color: $text-sub;
  }

  .records-container {
    background: $white;
    border-radius: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
    margin: 0 20rpx;
    padding: 20rpx 16rpx;
  }

  .records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }

  .records-title {
    font-size: 28rpx;
    font-weight: bold;
    color: $text-main;
  }

  .records-count {
    font-size: 24rpx;
    color: $text-sub;
  }

  .records-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 20rpx;
    background: $uni-bg-color-hover;
    border-radius: $uni-border-radius-base;
    border: 1rpx solid $uni-border-color;
    transition: background 0.2s;
  }

  .record-item:active {
    background: $uni-bg-color-grey;
  }

  .record-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .record-date-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .record-date {
    font-size: 28rpx;
    font-weight: bold;
    color: $text-main;
  }

  .record-timeslot {
    background: $uni-color-primary;
    color: $uni-text-color-inverse;
    border-radius: $uni-border-radius-base;
    padding: 4rpx 12rpx;
    font-size: 22rpx;
  }

  .record-license-plate {
    margin-top: 8rpx;

    .license-plate-text {
      font-size: 24rpx;
      color: $uni-text-color-grey;
      background-color: rgba($uni-color-primary, 0.1);
      padding: 4rpx 12rpx;
      border-radius: 8rpx;
      letter-spacing: 1rpx;
    }
  }

  .record-info {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .record-kwh {
    font-size: 26rpx;
    color: $text-sub;
  }

  .record-amount {
    font-size: 26rpx;
    color: $primary;
    font-weight: bold;
  }

  .record-remark {
    font-size: 24rpx;
    color: $text-sub;
    font-style: italic;
  }

  .record-right {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .record-thumbnail {
    width: 60rpx;
    height: 60rpx;
    border-radius: $uni-border-radius-sm;
    background: $uni-bg-color-hover;
  }

  .record-no-image {
    width: 60rpx;
    height: 60rpx;
    border-radius: $uni-border-radius-sm;
    background: $uni-bg-color-hover;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20rpx;
    color: $uni-text-color-grey;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 0;
  }

  .empty-text {
    font-size: 28rpx;
    color: $uni-text-color-grey;
    margin-top: 16rpx;
  }

  // 图标样式类
  .record-arrow {
    color: $uni-text-color-disable;
  }

  .empty-icon {
    color: $uni-text-color-disable;
  }
</style>
