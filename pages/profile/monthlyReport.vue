<template>
  <view class="monthly-report">
    <CommonNavBar title="月度对账" :showBack="true" />
    <view class="content">
      <view class="month-picker-row">
        <picker mode="date" fields="month" :value="selectedMonth" @change="onMonthChange">
          <view class="month-picker">{{ selectedMonth }}</view>
        </picker>
        <button size="mini" @click="copyAll">一键复制</button>
      </view>
      <view v-for="user in users" :key="user.id" class="user-report-card">
        <image :src="getAvatarUrl(user.avatar)" class="user-avatar" />
        <view class="user-info">
          <text class="user-name">{{ user.user_name }}</text>
          <text class="user-amount" v-if="user.has_uploaded"
            >{{ user.total_amount.toFixed(2) }}元</text
          >
          <text class="user-amount not-uploaded" v-else>未上传</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import CommonNavBar from '@/components/CommonNavBar.vue';
  import { getMonthlyReport } from '@/api/admin';
  import { getPayload, getAvatarUrl } from '@/utils';

  export default {
    name: 'MonthlyReport',
    components: {
      CommonNavBar,
    },
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
      padding: $uni-spacing-row-base;
    }

    .month-picker-row {
      display: flex;
      align-items: center;
      margin-bottom: $uni-spacing-row-base;
      gap: $uni-spacing-row-base;
    }

    .month-picker {
      font-size: $uni-font-size-lg;
      padding: $uni-spacing-col-base $uni-spacing-row-base;
      background-color: $uni-bg-color;
      border-radius: $uni-border-radius-base;
      border: 1rpx solid $uni-border-color;
      margin-right: $uni-spacing-row-base;
    }

    .user-report-card {
      display: flex;
      background-color: $uni-bg-color;
      border-radius: $uni-border-radius-lg;
      margin-bottom: $uni-spacing-row-base;
      padding: $uni-spacing-row-base;
      box-shadow: $charging-shadow-sm;
      align-items: center;
    }

    .user-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: $uni-spacing-row-base;
      background-color: $uni-bg-color-grey;
    }

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: $uni-spacing-col-base;
    }

    .user-name {
      font-size: $uni-font-size-lg;
      color: $uni-text-color;
      font-weight: bold;
    }

    .user-amount {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
    }

    .user-amount.not-uploaded {
      color: $uni-color-error;
    }
  }
</style>
