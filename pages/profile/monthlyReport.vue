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
        <view class="user-header" @click="toggleUserExpand(user.id)">
          <image :src="getAvatarUrl(user.avatar)" class="user-avatar" />
          <view class="user-info">
            <text class="user-name">{{ user.user_name }}</text>
            <text class="user-amount" v-if="user.has_uploaded"
              >{{ user.total_amount.toFixed(2) }}元</text
            >
            <text class="user-amount not-uploaded" v-else>未上传</text>
          </view>
          <uni-icons 
            :type="expandedUsers.includes(user.id) ? 'up' : 'down'" 
            size="16" 
            class="expand-icon" 
          />
        </view>
        
        <!-- 车牌号详情 -->
        <view v-if="expandedUsers.includes(user.id) && user.license_plates && user.license_plates.length > 0" class="license-plates-detail">
          <view v-for="plate in user.license_plates" :key="plate.plate_number" class="plate-item">
            <view class="plate-info">
              <text class="plate-number">{{ plate.plate_number }}</text>
              <text class="plate-amount" v-if="plate.has_uploaded">
                {{ plate.total_amount.toFixed(2) }}元 ({{ plate.record_count }}条)
              </text>
              <text class="plate-amount not-uploaded" v-else>
                未上传 ({{ plate.record_count }}条)
              </text>
            </view>
          </view>
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
        expandedUsers: [], // 展开的用户ID列表
      };
    },
    onLoad() {
      this.selectedMonth = this.getCurrentMonth();
      this.loadReport();
    },
    methods: {
      getAvatarUrl,
      toggleUserExpand(userId) {
        const index = this.expandedUsers.indexOf(userId);
        if (index > -1) {
          this.expandedUsers.splice(index, 1);
        } else {
          this.expandedUsers.push(userId);
        }
      },
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
        let text = '';
        this.users.forEach((user) => {
          if (user.license_plates && user.license_plates.length > 1) {
            // 多个车牌号的用户，分别显示每个车牌
            text += `${user.user_name}：\n`;
            user.license_plates.forEach((plate) => {
              text += `  ${plate.plate_number}：${plate.has_uploaded ? plate.total_amount.toFixed(2) + '元' : '未上传'}\n`;
            });
            text += `  合计：${user.has_uploaded ? user.total_amount.toFixed(2) + '元' : '未上传'}\n`;
          } else {
            // 单个车牌号或无车牌号的用户
            const plateInfo = user.license_plates && user.license_plates.length > 0 
              ? ` (${user.license_plates[0].plate_number})` 
              : '';
            text += `${user.user_name}${plateInfo}：${user.has_uploaded ? user.total_amount.toFixed(2) + '元' : '未上传'}\n`;
          }
        });
        uni.setClipboardData({ data: text.trim() });
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
    }

    .user-header {
      display: flex;
      align-items: center;
      cursor: pointer;
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

    .expand-icon {
      color: $uni-text-color-grey;
      margin-left: 16rpx;
    }

    .license-plates-detail {
      margin-top: 24rpx;
      padding-top: 24rpx;
      border-top: 2rpx solid $uni-border-color;

      .plate-item {
        padding: 16rpx 0;
        border-bottom: 1rpx solid rgba($uni-border-color, 0.5);

        &:last-child {
          border-bottom: none;
        }

        .plate-info {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .plate-number {
            font-size: 28rpx;
            font-weight: 600;
            color: $uni-color-primary;
            background-color: rgba($uni-color-primary, 0.1);
            padding: 8rpx 16rpx;
            border-radius: 8rpx;
            letter-spacing: 2rpx;
          }

          .plate-amount {
            font-size: 28rpx;
            font-weight: 600;
            color: $uni-color-success;

            &.not-uploaded {
              color: $uni-color-warning;
            }
          }
        }
      }
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
