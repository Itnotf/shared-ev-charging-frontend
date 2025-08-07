<template>
  <view class="container">
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
          <text class="user-amount" v-if="user.has_uploaded">{{ user.total_amount.toFixed(2) }}元</text>
          <text class="user-amount not-uploaded" v-else>未上传</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CommonNavBar from '@/components/CommonNavBar.vue';
import { getMonthlyReport } from '@/api/admin';
import { getAvatarUrl } from '@/utils';

export default {
  components: { CommonNavBar },
  data() {
    return {
      selectedMonth: '',
      users: []
    };
  },
  async onShow() {
    this.selectedMonth = this.getCurrentMonth();
    await this.loadReport();
  },
  methods: {
    getAvatarUrl,
    getCurrentMonth() {
      const d = new Date();
      return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
    },
    async onMonthChange(e) {
      this.selectedMonth = e.detail.value;
      await this.loadReport();
    },
    async loadReport() {
      const res = await getMonthlyReport(this.selectedMonth);
      this.users = res.users || [];
    },
    copyAll() {
      const text = this.users.map(u => `${u.user_name}：${u.has_uploaded ? (u.total_amount.toFixed(2) + '元') : '未上传'}`).join('\n');
      uni.setClipboardData({ data: text });
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f8f8;
}
.content {
  flex: 1;
  padding: 24rpx;
  overflow-y: auto;
}
.month-picker-row {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  gap: 24rpx;
}
.month-picker {
  font-size: 28rpx;
  padding: 8rpx 24rpx;
  background: #fff;
  border-radius: 8rpx;
  border: 1rpx solid #eee;
  margin-right: 12rpx;
}
.user-report-card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
  align-items: center;
}
.user-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-right: 24rpx;
  background: #eee;
}
.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.user-name {
  font-size: 32rpx;
  font-weight: bold;
}
.user-amount {
  font-size: 28rpx;
  color: #333;
}
.user-amount.not-uploaded {
  color: #FF6B6B;
}
</style>