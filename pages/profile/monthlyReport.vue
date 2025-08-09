<template>
  <view class="monthly-report">
    <view class="content">
      <CommonCard customClass="month-picker-row" padding="16rpx" margin="0 0 12rpx 0">
        <picker mode="date" fields="month" :value="selectedMonth" @change="onMonthChange">
          <view class="month-picker">{{ selectedMonth }}</view>
        </picker>
        <button class="copy-btn" @click="copyAll">一键复制</button>
      </CommonCard>
      <CommonCard v-for="user in users" :key="user.id" customClass="user-report-card" padding="16rpx" margin="0 0 8rpx 0">
        <image :src="getAvatarUrl(user.avatar)" class="user-avatar" />
        <view class="user-info">
          <text class="user-name">{{ user.user_name }}</text>
          <text class="user-amount" v-if="user.has_uploaded"
            >{{ user.total_amount.toFixed(2) }}元</text
          >
          <text class="user-amount not-uploaded" v-else>未上传</text>
        </view>
      </CommonCard>
    </view>
  </view>
</template>

<script>

  import { getMonthlyReport } from '@/api/admin';
  import { getPayload, getAvatarUrl } from '@/utils';
  import CommonCard from '@/components/CommonCard.vue';

  export default {
    name: 'MonthlyReport',
    components: { CommonCard },
    data() {
      return {
        users: [],
        selectedMonth: '',
        reportData: null,
      };
    },
    onLoad() {
      this.selectedMonth = this.getCurrentMonth();
      this.loadReport();
    },
    methods: {
      getAvatarUrl,
      getCurrentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      },
      async loadReport() {
        uni.showLoading({ title: '加载中' });
        try {
          const res = await getMonthlyReport(this.selectedMonth);
          const payload = getPayload(res);
          this.users = payload.users || [];
          this.reportData = payload.report || {};
        } catch (error) {
          uni.showToast({ title: '加载失败', icon: 'none' });
          console.error('加载月度报告失败:', error);
        } finally {
          uni.hideLoading();
        }
      },
      onMonthChange(e) {
        this.selectedMonth = e.detail.value;
        this.loadReport();
      },
      copyAll() {
        const text = this.users
          .map(
            (u) => `${u.user_name}：${u.has_uploaded ? u.total_amount.toFixed(2) + '元' : '未上传'}`
          )
          .join('\n');
        uni.setClipboardData({ data: text });
      },
    },
  };
</script>

<style lang="scss">
  @import '@/uni.scss';

  .monthly-report {
    min-height: 100vh;
    background-color: $uni-bg-color-grey;

    .content {
      padding: 16rpx;
    }

    .month-picker-row {
      @include card;
      display: flex;
      align-items: center;
      gap: 16rpx;
    }

    .month-picker {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 24rpx;
      height: 56rpx;
      min-width: 120rpx;
      background: #fff7e6;
      border: 2rpx solid #ffa500;
      border-radius: 28rpx;
      font-size: 30rpx;
      color: #ffa500;
      font-weight: bold;
      box-shadow: 0 2rpx 8rpx rgba(255, 165, 0, 0.08);
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
      border-top: 10rpx solid #ffa500;
    }

    .copy-btn {
      @include btn-primary;
      padding: 0 20rpx;
      height: 52rpx;
      line-height: 52rpx;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      font-size: 26rpx;
    }

    .user-report-card {
      @include card;
      display: flex;
      align-items: center;
    }

    .user-avatar {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      margin-right: 16rpx;
      background-color: $uni-bg-color-grey;
    }

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6rpx;
    }

    .user-name {
      font-size: 30rpx;
      color: $uni-text-color;
      font-weight: bold;
    }

    .user-amount {
      font-size: 26rpx;
      color: $uni-text-color;
    }

    .user-amount.not-uploaded {
      color: $uni-color-error;
    }
  }
</style>
