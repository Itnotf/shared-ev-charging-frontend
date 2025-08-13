<template>
  <view class="container">
    <!-- 顶部英雄区：品牌与快捷操作 -->
    <PageHero 
      title="澜充小站" 
      subtitle="共享预约 · 绿色充电" 
      :height="200"
      bgClass="gradient-purple"
    >
      <template #actions>
        <button class="primary-action" @click="goToReservationPage">快速预约</button>
      </template>
    </PageHero>

    <PageContent :overlapOffset="16">
      <!-- 内容区域原有内容全部移入此处 -->
      <HeroCard type="overview" cardClass="overview-card high">
        <view class="card-header card-header-flex overview-header">
          <picker mode="date" fields="month" :value="selectedMonth" @change="onMonthChange">
            <view class="month-picker">{{ selectedMonth }}</view>
          </picker>
          <text class="card-title">用电总览</text>
          <view class="card-link" @click="goToRecordsPageWithMonth">
            <text>查看详情</text>
            <text class="link-arrow">></text>
          </view>
        </view>
        <!-- 用电总览卡片数据区块（简洁版） -->
        <view class="overview-data">
          <view class="data-item">
            <view class="data-row">
              <text class="data-value big main-color">{{ formattedKwh }}</text>
              <text class="data-unit">kWh</text>
            </view>
            <text class="data-label">累计度数</text>
          </view>
          <view class="data-item">
            <view class="data-row">
              <text class="data-value big blue-color">¥{{ formattedCost }}</text>
              <text class="data-unit">元</text>
            </view>
            <text class="data-label">累计费用</text>
          </view>
        </view>
      </HeroCard>
      <!-- 当前预约卡片 -->
      <view class="reservation-container">
        <transition name="reservation-fade" mode="out-in">
          <HeroCard
            v-if="currentReservation"
            type="reservation"
            cardClass="reservation-card high"
            key="with-reservation"
          >
            <view class="card-header reservation-header" @click="handleReservationClick">
              <text class="card-title">当前预约</text>
              <text class="status-badge" :class="reservationStatusClass">{{ reservationStatusText }}</text>
            </view>
            <view class="reservation-info">
              <view class="reservation-info-main" @click="handleReservationClick">
                <image
                  v-if="currentReservation.user_avatar"
                  :src="getAvatarUrl(currentReservation.user_avatar)"
                  class="avatar-img"
                />
                <view v-else class="avatar-default">👤</view>
                <view class="reservation-detail">
                  <view class="reservation-user">{{ currentReservation.user_name || '用户' }}</view>
                  <view class="reservation-meta">
                    <text
                      >{{ currentReservation.date }}（{{ getWeekday(currentReservation.date) }}）</text
                    >
                    <text class="reservation-slot slot-tag">{{
                      TIMESLOTS[currentReservation.timeslot].name
                    }}</text>
                  </view>
                </view>
              </view>
              <button class="cancel-reservation-btn" @click.stop="handleCancelReservation">
                取消预约
              </button>
            </view>
            <view class="reservation-progress" v-if="currentReservation">
              <view class="progress-header">
                <text class="progress-time">{{ reservationTimeRange }}</text>
                <text class="progress-percent">{{ reservationProgressPercent }}%</text>
              </view>
              <view class="progress-bar">
                <view class="progress-bar-fill" :style="{ width: reservationProgressPercent + '%' }"></view>
              </view>
            </view>
          </HeroCard>
          <HeroCard v-else type="reservation" cardClass="empty-reservation-card high" key="without-reservation">
            <view class="empty-reservation">
              <text class="empty-text">暂无预约</text>
              <text class="empty-desc">点击顶部快速预约按钮开始预约</text>
            </view>
          </HeroCard>
        </transition>
      </view>
            <!-- 功能宫格区域 -->
      <view class="function-section-wrapper">
        <view class="function-grid-new">
          <view
            v-for="item in functionList"
            :key="item.title"
            class="function-item-new"
            :class="item.bgClass"
            @click="item.onClick"
          >
            <view class="function-icon-bg-new" :class="item.bgClass">
              <SvgIcon :name="item.icon" size="56" :color="item.iconColor" style="font-weight: bold" />
            </view>
            <text class="function-title-new">{{ item.title }}</text>
          </view>
        </view>
      </view>
    </PageContent>
  </view>
</template>

<script>
  import {
    checkAndHandleNeedUploadRecord,
    getWeekday as utilGetWeekday,
    goTo,
    goToAuth,
    getCurrentDate,
    getAvatarUrl,
    getPayload,
  } from '@/utils';
  import { TIMESLOTS, PRIMARY_COLOR, INFO_COLOR } from '@/config';
  import { getCurrentReservationStatus, cancelReservation } from '@/api/reservation';
  import { getMonthlyStatistics } from '@/api/statistics';
  import SvgIcon from '@/components/SvgIcon.vue';

  import PageHero from '@/components/PageHero.vue';
  import PageContent from '@/components/PageContent.vue';
  import HeroCard from '@/components/HeroCard.vue';
  import { checkAndFetchUserProfile } from '@/utils';

  export default {
    components: {
      SvgIcon,
      PageHero,
      PageContent,
      HeroCard,
    },
    data() {
      return {
        TIMESLOTS,
        // 颜色常量，供模板使用
        primaryColor: PRIMARY_COLOR,
        infoColor: INFO_COLOR,
        monthlyData: {
          totalKwh: 0,
          totalCost: 0,
        },
        selectedMonth: '',
        currentReservation: null,
        pollingTimer: null,
        // 宫格功能项配置，使用样式类以避免硬编码颜色
        functionList: [
          {
            title: '充电预约',
            icon: 'calendar',
            bgClass: 'bg-soft-1',
            iconColor: PRIMARY_COLOR,
            onClick: () => this.handleFunctionClick('/pages/reservations/index', '充电预约'),
          },
          {
            title: '电量上传',
            icon: 'camera',
            bgClass: 'bg-soft-2',
            iconColor: PRIMARY_COLOR,
            onClick: () => this.handleFunctionClick('/pages/records/create', '电量上传'),
          },
          {
            title: '充电记录',
            icon: 'list',
            bgClass: 'bg-soft-3',
            iconColor: PRIMARY_COLOR,
            onClick: () => this.handleFunctionClick(`/pages/records/list?month=${this.selectedMonth}`, '充电记录'),
          },
          {
            title: '电量分析',
            icon: 'compose',
            bgClass: 'bg-soft-4',
            iconColor: PRIMARY_COLOR,
            onClick: () => this.handleFunctionClick(`/pages/records/index?month=${this.selectedMonth}`, '电量分析'),
          },
        ],
      };
    },
    computed: {
      // 供模板直接使用的派生字段（避免在模板中做计算）
      formattedKwh() {
        const n = Number(this.monthlyData.totalKwh || 0);
        return n.toFixed(1);
      },
      formattedCost() {
        const n = Number(this.monthlyData.totalCost || 0);
        // 千分位与两位小数
        return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
      reservationStatusText() {
        const map = { upcoming: '即将开始', ongoing: '进行中', ended: '已结束', none: '' };
        return map[this.reservationStatus()] || '';
      },
      reservationStatusClass() {
        const cls = { upcoming: 'status-upcoming', ongoing: 'status-ongoing', ended: 'status-ended' };
        return cls[this.reservationStatus()] || '';
      },
      reservationProgressPercent() {
        return this.reservationProgress();
      },
      reservationTimeRange() {
        return this.reservationRangeText();
      },
    },
    async onShow() {
      const token = uni.getStorageSync('token');
      if (token) {
        this.selectedMonth = getCurrentDate('YYYY-MM');
        this.startPolling();
        this.fetchData();
        // 检查并获取用户头像和昵称
        const profileComplete = await checkAndFetchUserProfile();
        if (!profileComplete) {
          uni.showToast({ title: '请设置头像和昵称', icon: 'none' });
        }
      } else {
        // 未登录时，清空数据或显示默认内容
        this.monthlyData = { totalKwh: '0.00', totalCost: '0.00' };
        this.currentReservation = null;
      }
    },
    async onLoad() {
      // 移除未登录时的重定向逻辑
      this.selectedMonth = getCurrentDate('YYYY-MM');
    },
    onUnload() {
      this.clearPollingTimer();
    },
    methods: {
      
      
      // 预约状态文本
      reservationStatus(now = new Date()) {
        if (!this.currentReservation) return 'none';
        const dateStr = this.currentReservation.date; // YYYY-MM-DD
        const timeslot = this.currentReservation.timeslot; // 'day' | 'night'
        if (!dateStr || !timeslot || !this.TIMESLOTS[timeslot]) return 'upcoming';
        const startEnd = this._getSlotStartEnd(dateStr, timeslot);
        if (!startEnd) return 'upcoming';
        const { start, end } = startEnd;
        if (now < start) return 'upcoming';
        if (now >= start && now <= end) return 'ongoing';
        return 'ended';
      },

      // 百分比进度（0-100）
      reservationProgress(now = new Date()) {
        if (!this.currentReservation) return 0;
        const dateStr = this.currentReservation.date;
        const timeslot = this.currentReservation.timeslot;
        const startEnd = this._getSlotStartEnd(dateStr, timeslot);
        if (!startEnd) return 0;
        const { start, end } = startEnd;
        if (now <= start) return 0;
        if (now >= end) return 100;
        const total = end - start;
        const done = now - start;
        return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
      },

      // 时间范围文本
      reservationRangeText() {
        if (!this.currentReservation) return '';
        const slot = this.TIMESLOTS[this.currentReservation.timeslot];
        const date = this.currentReservation.date;
        if (!slot || !date) return '';
        return `${date} ${slot.time}`;
      },

      // 解析日间/夜间时段的起止时间
      _getSlotStartEnd(dateStr, timeslot) {
        try {
          if (!dateStr || !timeslot) return null;
          const [y, m, d] = dateStr.split('-').map((v) => parseInt(v));
          const isDay = timeslot === 'day';
          if (isDay) {
            const start = new Date(y, m - 1, d, 8, 0, 0, 0);
            const end = new Date(y, m - 1, d, 20, 0, 0, 0);
            return { start, end };
          }
          // night: 20:00 - 次日 08:00
          const start = new Date(y, m - 1, d, 20, 0, 0, 0);
          const end = new Date(y, m - 1, d + 1, 8, 0, 0, 0);
          return { start, end };
        } catch (_e) {
          return null;
        }
      },
      clearPollingTimer() {
        if (this.pollingTimer) clearTimeout(this.pollingTimer);
        this.pollingTimer = null;
      },
      async fetchData() {
        uni.showLoading({ title: '加载中' });
        try {
          const statRes = await getMonthlyStatistics(this.selectedMonth);
          const stat = getPayload(statRes) || { totalKwh: 0, totalCost: 0 };
          // 金额单位由分转元
          this.monthlyData = {
            totalKwh: Number(stat.totalKwh).toFixed(1),
            totalCost: (Number(stat.totalCost) / 100).toFixed(2),
          };
        } catch (error) {
          uni.showToast({ title: '数据加载失败', icon: 'none' });
        } finally {
          uni.hideLoading();
        }
      },
      startPolling() {
        if (this.pollingTimer) clearTimeout(this.pollingTimer);
        this.pollingTimer = setTimeout(
          async function poll() {
            const shouldContinue = await this.checkReservationStatus();
            if (shouldContinue) {
              this.pollingTimer = setTimeout(poll.bind(this), 20000); // 20秒轮询
            } else {
              this.pollingTimer = null;
            }
          }.bind(this),
          0
        );
      },
      async checkReservationStatus() {
        try {
          const res = await getCurrentReservationStatus();
          const data = getPayload(res);

          // 1. 有未上传充电记录，弹窗并停止轮询
          if (data && data.needUploadRecord) {
            checkAndHandleNeedUploadRecord(data);
            this.clearPollingTimer();
            return false;
          }

          // 2. 有当前预约，更新状态，继续轮询
          if (data && data.currentReservation) {
            this.currentReservation = data.currentReservation;
            return true;
          }

          // 3. 没有 currentReservation 也没有 lastReservation，停止轮询
          if (!data || (!data.currentReservation && !data.lastReservation)) {
            this.currentReservation = null;
            this.clearPollingTimer();
            return false;
          }

          // 4. 其他情况，继续轮询
          return true;
        } catch (e) {
          // 网络异常等，建议继续轮询
          return true;
        }
      },
      onMonthChange(e) {
        this.selectedMonth = e.detail.value;
        this.fetchData();
      },
      async cancelCurrentReservation() {
        if (!this.currentReservation) return;
        const res = await new Promise((resolve) => {
          uni.showModal({
            title: '提示',
            content: '确定要取消当前预约吗？',
            confirmColor: PRIMARY_COLOR,
            success: (r) => resolve(r),
          });
        });
        if (res.confirm) {
          uni.showLoading({ title: '取消中' });
          try {
            await cancelReservation(this.currentReservation.id);
            this.currentReservation = null;
            this.fetchData();
            uni.showToast({ title: '已取消预约', icon: 'none' });
          } catch (error) {
            uni.showToast({ title: '取消失败', icon: 'none' });
          } finally {
            uni.hideLoading();
          }
        }
      },
      goToReservationPage() {
        goToAuth('/pages/reservations/index');
      },
      goToRecordsPageWithMonth() {
        goToAuth(`/pages/records/index?month=${this.selectedMonth}`);
      },
      getWeekday(dateStr) {
        return utilGetWeekday(dateStr);
      },
      getUserProfile() {
        wx.getUserProfile({
          desc: '用于完善用户资料',
          success: (res) => {
            const userInfo = res.userInfo;
            // 将头像和昵称发送到后端
            this.syncUserInfo(userInfo);
          },
          fail: () => {
            uni.showToast({ title: '获取头像和昵称失败', icon: 'none' });
          },
        });
      },
      syncUserInfo(_userInfo) {
        // 将用户信息发送到后端的逻辑
        // 这里可以调用一个API来同步用户信息
      },
      getAvatarUrl,
      handleFunctionClick(url, title) {
        // 检查是否已登录
        const token = uni.getStorageSync('token');
        if (!token) {
          // 未登录时，显示功能预览和登录提示
          this.showFunctionPreview(title, url);
        } else {
          // 已登录时，直接跳转
          goTo(url);
        }
      },
      
      // 显示功能预览和登录提示
      showFunctionPreview(title, url) {
        uni.showModal({
          title: `${title}功能预览`,
          content: `体验${title}功能需要登录账号。您可以先了解功能，再决定是否登录使用。`,
          confirmText: '立即登录',
          cancelText: '继续浏览',
          success: (res) => {
            if (res.confirm) {
              // 用户选择登录
              uni.navigateTo({ url: '/pages/login/login' });
            } else {
              // 用户选择继续浏览，可以显示功能说明
              this.showFunctionDescription(title);
            }
          }
        });
      },
      
      // 显示功能说明
      showFunctionDescription(title) {
        const descriptions = {
          '充电预约': '选择充电日期和时段，预约充电桩使用时间。支持日间和夜间不同时段选择。',
          '电量上传': '上传充电截图，填写用电量，系统自动计算费用。支持备注和关联预约。',
          '充电记录': '查看历史充电记录，包括用电量、费用、时间等详细信息。',
          '电量分析': '分析用电趋势，查看日/夜用电分布，帮助了解充电习惯。'
        };
        
        uni.showModal({
          title: `${title}功能说明`,
          content: descriptions[title] || '该功能正在完善中，敬请期待！',
          showCancel: false,
          confirmText: '知道了'
        });
      },
      handleReservationClick() {
        const token = uni.getStorageSync('token');
        if (token) {
          this.goToReservationPage();
        } else {
          this.showFunctionPreview('充电预约', '/pages/reservations/index');
        }
      },
      
      // 处理取消预约
      handleCancelReservation() {
        const token = uni.getStorageSync('token');
        if (token) {
          this.cancelCurrentReservation();
        } else {
          uni.showModal({
            title: '功能提示',
            content: '取消预约需要登录账号。您可以先了解功能，再决定是否登录使用。',
            confirmText: '立即登录',
            cancelText: '继续浏览',
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({ url: '/pages/login/login' });
              }
            }
          });
        }
      },
    },
  };
  // 预约卡片、宫格区块、数据区块建议抽成独立组件，便于复用
</script>

<style lang="scss">
  @import '@/uni.scss';

  .container {
    @extend .page-bg;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  // 顶部英雄区样式（已迁移到PageHero组件）
  .primary-action {
    @include btn-primary;
    height: 72rpx;
    padding: 0 28rpx;
    font-size: 28rpx;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 20rpx 20rpx 20rpx;
    overflow-y: auto;
    align-items: stretch;
    // 与顶部英雄区形成悬浮卡片效果，参考车牌管理页面
    margin-top: -40rpx;
    position: relative;
    z-index: 3;
  }

  // 卡片样式（已迁移到HeroCard组件）

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }

  .card-header-flex {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .card-header-flex .month-picker {
    min-width: 120rpx;
    text-align: left;
    margin: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 20rpx;
    height: 48rpx;
    background: $uni-bg-color;
    border: 1rpx solid $uni-border-color;
    border-radius: 28rpx;
    font-size: 28rpx;
    color: $text-main;
    font-weight: 600;
    box-shadow: none;
    cursor: pointer;
    position: relative;
  }
  .card-header-flex   .month-picker::after {
    content: '';
    display: inline-block;
    margin-left: 8rpx;
    width: 0;
    height: 0;
    border-left: 8rpx solid transparent;
    border-right: 8rpx solid transparent;
    border-top: 8rpx solid $uni-color-primary;
  }
  .card-header-flex .card-title {
    flex: 1;
    text-align: center;
    margin: 0;
  }
  .card-link {
    min-width: 100rpx;
    text-align: right;
    margin: 0;
    font-size: 26rpx;
    color: $uni-text-color;
    opacity: 0.8;
    display: flex;
    align-items: center;
    gap: 4rpx;
    cursor: pointer;
    
    .link-arrow {
      font-size: 20rpx;
      color: $uni-text-color;
      opacity: 0.6;
    }
  }

  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-main;
  }

  .card-more {
    font-size: 26rpx;
    color: $primary;
  }

  .overview-data {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 8rpx 12rpx 16rpx;
    min-height: 120rpx; // 确保最小高度
  }

  .data-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;
    flex: 1;
    min-height: 100rpx; // 确保每个数据项有最小高度
  }
  // 移除图标容器与分隔线（回归简洁）
  .data-icon-wrapper,
  .data-content,
  .data-divider { display: none; }

  .data-value {
    font-size: 40rpx;
    font-weight: bold;
    color: $text-main;
    margin-bottom: 10rpx;
  }

  .data-value.big,
  .data-value.big.main-color {
    font-size: 48rpx;
    font-weight: bold;
    color: $main-color-deep;
    margin-bottom: 0;
    line-height: 1.2;
  }
  .data-value.big.blue-color {
    font-size: 48rpx;
    font-weight: bold;
    color: $text-main; // 收敛颜色，避免与主题色冲突
    margin-bottom: 0;
    line-height: 1.2;
  }
  .data-row {
    display: flex;
    align-items: baseline; // 数值与单位基线对齐
    gap: 8rpx;
  }
  

  .data-unit {
    font-size: 24rpx;
    color: $text-sub;
    font-weight: 500;
    margin-bottom: 0;
  }

  .data-label {
    font-size: 24rpx;
    color: $text-sub;
    font-weight: 500;
  }
  .gray-label { color: $text-sub; }

  .month-picker {
    display: inline-block;
    margin: 0 16rpx;
    font-size: 26rpx;
    color: $primary;
    font-weight: bold;
  }

  .reservation-info {
    flex: 1;
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    flex-shrink: 1;
    max-height: 100%;
    overflow: hidden; // 改为hidden，防止内容溢出
    min-height: 48rpx; // 进一步减少最小高度，确保适配
    padding: 6rpx 0; // 进一步减少内边距，节省空间
  }
  
  .reservation-header {
    margin-bottom: 6rpx; // 进一步减少头部间距，节省空间
    min-height: 32rpx; // 进一步减少头部高度，节省空间
  }
  
  .reservation-progress {
    padding: 6rpx 20rpx 10rpx; // 进一步使用紧凑的内边距
    margin-top: 2rpx; // 进一步减少与上方内容的间距
    min-height: 40rpx; // 进一步减少进度条区域高度，确保适配卡片高度
    border-top: 1rpx solid rgba(0, 0, 0, 0.06); // 保留顶部分隔线
  }
  
  .reservation-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx; // 进一步减少间距
    padding-top: 4rpx; // 进一步减少顶部内边距
    min-height: 36rpx; // 进一步减少详情区域最小高度
  }
  
  .reservation-meta {
    font-size: 26rpx;
    color: $text-sub;
    display: flex;
    padding-top: 4rpx; // 进一步减少顶部内边距
    gap: 16rpx;
    align-items: center;
    min-height: 24rpx; // 进一步减少元数据区域高度
  }
  .status-badge {
    font-size: 22rpx;
    font-weight: 600;
    padding: 6rpx 12rpx;
    border-radius: 999rpx;
    color: #fff;
  }
  .status-upcoming {
    background: linear-gradient(135deg, #409eff, #2f7bd1);
  }
  .status-ongoing {
    background: linear-gradient(135deg, #67c23a, #4cab2f);
  }
  .status-ended {
    background: linear-gradient(135deg, #909399, #707276);
  }

  .progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4rpx; // 进一步减少底部间距
    font-size: 20rpx; // 进一步减少字体大小
    color: $text-sub;
  }
  .progress-time {
    color: $text-main;
    font-weight: 600;
  }
  .progress-percent {
    color: $uni-color-primary;
    font-weight: 700;
  }
  .progress-bar {
    width: 100%;
    height: 5rpx; // 进一步减少进度条高度
    background: rgba(0, 0, 0, 0.06);
    border-radius: 5rpx; // 调整圆角
    overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%;
    background: $charging-gradient-primary;
    width: 0;
    transition: width 0.3s ease;
  }
  .reservation-info-main {
    display: flex;
    align-items: center;
    flex: 1;
    cursor: pointer;
  }
  .avatar-img {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    background: $uni-bg-color-hover;
    object-fit: cover;
    border: 2rpx solid $uni-color-primary;
  }
  .avatar-default {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    background: $uni-bg-color-hover;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    color: $uni-color-primary;
    border: 2rpx solid $uni-color-primary;
  }
  .reservation-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    padding-top: 16rpx;
  }
  .reservation-user {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-main;
  }
  .reservation-meta {
    font-size: 26rpx;
    color: $text-sub;
    display: flex;
    padding-top: 16rpx;
    gap: 16rpx;
  }
  .reservation-slot {
    color: $uni-color-primary;
    font-weight: bold;
  }
  .cancel-reservation-btn {
    background: $uni-bg-color;
    color: $main-color-dark;
    border: 2rpx solid $main-color-dark;
    border-radius: 24rpx;
    font-size: 24rpx;
    font-weight: bold;
    padding: 8rpx 24rpx;
    margin-left: 16rpx;
    box-shadow: $charging-shadow-sm;
    transition:
      background 0.2s,
      color 0.2s,
      box-shadow 0.2s;
  }
  .cancel-reservation-btn:active {
    background: $main-color-dark;
    color: $uni-text-color-inverse;
    box-shadow: $charging-shadow-md;
  }
  .empty-reservation-card {
    height: 200rpx; /* 使用合理的固定高度 */
    min-height: 200rpx; /* 确保最小高度一致 */
    display: flex;
    align-items: center;
    justify-content: center;
    background: $uni-bg-color;
    border: 1rpx solid $uni-border-color;
    box-shadow: $card-shadow;
    padding: 24rpx 20rpx;
    transition: all 0.3s ease; /* 添加平滑过渡 */
  }
  
  .reservation-card {
    height: 200rpx; /* 使用合理的固定高度，与无预约的卡片保持一致 */
    min-height: 200rpx; /* 确保最小高度一致 */
    transition: all 0.3s ease; /* 添加平滑过渡 */
  }
  
  .reservation-container {
    height: 240rpx; /* 使用合理的固定高度，包含卡片和间距 */
    min-height: 240rpx; /* 确保最小高度一致 */
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease; /* 添加平滑过渡 */
    margin-bottom: 20rpx; /* 减少底部外边距 */
  }
  
  .empty-reservation {
    width: 100%;
    height: 100%; /* 占满整个卡片高度 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16rpx; /* 增加间距 */
    padding: 0; /* 移除内边距，让内容完全居中 */
  }
  
  .empty-text {
    font-size: 32rpx; /* 增大字体 */
    color: $uni-color-primary;
    margin-bottom: 0;
    font-weight: 600;
    line-height: 1.2; /* 确保行高一致 */
  }
  
  .empty-desc {
    font-size: 26rpx; /* 增大字体 */
    color: $text-sub;
    text-align: center;
    line-height: 1.4;
    max-width: 200rpx; /* 限制描述文字宽度，确保居中效果 */
  }

  // 重要按钮主色高亮，禁用态灰色
  button,
  .card-more-btn {
    background: $charging-gradient-primary;
    color: $uni-text-color-inverse;
    border: none;
    border-radius: 24rpx;
    font-size: 28rpx;
    font-weight: bold;
    padding: 12rpx 36rpx;
    box-shadow: $charging-shadow-sm;
    transition: opacity 0.2s;
  }
  button:disabled,
  .card-more-btn:disabled {
    background: $uni-bg-color-hover;
    color: $uni-text-color-disable;
    box-shadow: none;
  }
  .slot-tag {
    background: $uni-color-primary;
    color: $uni-text-color-inverse;
    border-radius: 12rpx;
    padding: 2rpx 12rpx;
    font-size: 22rpx;
    margin-left: 8rpx;
  }

  .function-section-wrapper {
    margin-top: 8rpx; // 减少顶部间距
    padding-top: 8rpx; // 减少内边距
    // 移除分隔线
  }

  .function-grid-new {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24rpx; // 上下列间距略小
    margin-top: 8rpx; // 减少顶部间距
    margin-bottom: 0;
    min-height: 280rpx; // 增加grid高度
    height: auto;
  }
  .function-item-new {
    background: #fff;
    border-radius: $card-radius;
    box-shadow: $card-shadow;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200rpx; // 增加每个功能项的高度
    padding: 32rpx 0 24rpx 0;
    transition: box-shadow 0.2s, transform 0.2s;
    cursor: pointer;
    margin-bottom: 0;
  }
  .function-item-new:active {
    box-shadow: 0 6rpx 18rpx rgba(212, 107, 8, 0.15);
    transform: scale(0.97);
  }
  .function-icon-bg-new {
    width: $icon-size;
    height: $icon-size;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8rpx;
    color: $main-color;
  }
  .function-title-new {
    font-size: 26rpx;
    color: $text-main;
    font-weight: bold;
    margin-top: 0;
  }
  // 响应式适配
  @media (max-width: 400px) {
    .content {
      padding: 0 4rpx 12rpx 4rpx;
    }
    .card {
      padding: 16rpx 8rpx;
      border-radius: 12rpx;
    }
    .function-item-new {
      padding: 20rpx;
    }
    .function-icon-bg-new {
      width: 64rpx;
      height: 64rpx;
      margin-right: 16rpx;
    }
    .function-title-new {
      font-size: 28rpx;
    }
    .function-desc {
      font-size: 22rpx;
    }
    .data-value.big {
      font-size: 40rpx;
    }
  }

  @media (min-height: 700px) {
    .overview-card {
      height: 20vh; // 减少高度，避免太空旷
      max-height: 380rpx;
    }
    .overview-card .overview-data {
      gap: 60rpx;
    }
    .reservation-card,
    .empty-reservation-card {
      height: 200rpx; // 保持固定高度
      min-height: 200rpx;
    }
  }

  @media (max-height: 600px) {
    // 小屏幕高度适配
    .overview-card {
      height: 18vh;
      max-height: 320rpx;
    }
    .reservation-card,
    .empty-reservation-card {
      height: 180rpx; // 使用更紧凑的高度
      min-height: 180rpx;
    }
    .reservation-container {
      height: 220rpx; // 使用更紧凑的容器高度
      min-height: 220rpx;
    }
    .function-grid-new {
      min-height: 240rpx;
    }
    .function-item-new {
      min-height: 180rpx;
      padding: 24rpx 0 20rpx 0;
    }
  }
  // 按钮active反馈
  button:active,
  .card-more-btn:active {
    background: $charging-gradient-primary;
    color: $uni-text-color-inverse;
    transform: scale(0.97);
    box-shadow: $charging-shadow-md;
  }
  // 主要数据色彩更深
  .data-value.big.main-color {
    color: $main-color-deep;
  }
  .data-value.big.blue-color {
    color: $uni-color-info;
  }

  // 功能宫格背景柔和橙色系（统一变量）
  .bg-soft-1 {
    background: $main-color-bg1;
  }
  .bg-soft-2 {
    background: $main-color-bg2;
  }
  .bg-soft-3 {
    background: $main-color-bg3;
  }
  .bg-soft-4 {
    background: $main-color-lightest;
  }

  // 预约卡片切换过渡动画
  .reservation-fade-enter-active,
  .reservation-fade-leave-active {
    transition: all 0.3s ease;
  }
  
  .reservation-fade-enter-from {
    opacity: 0;
    transform: translateY(10rpx);
  }
  
  .reservation-fade-leave-to {
    opacity: 0;
    transform: translateY(-10rpx);
  }
  
  .reservation-fade-enter-to,
  .reservation-fade-leave-from {
    opacity: 1;
    transform: translateY(0);
  }

  // 通用响应式优化
  @media (max-width: 375px) {
    // 超小屏幕优化
    .overview-card {
      height: auto;
      min-height: 200rpx;
    }
    .reservation-container {
      height: 220rpx; // 使用紧凑的容器高度
      min-height: 220rpx;
    }
  }

  @media (min-width: 414px) {
    // 大屏幕优化
    .overview-card {
      height: auto;
      min-height: 240rpx;
    }
    .reservation-container {
      height: 240rpx; // 保持标准容器高度
      min-height: 240rpx;
    }
  }

  // 横屏适配
  @media (orientation: landscape) and (max-height: 500px) {
    .overview-card {
      height: auto;
      min-height: 180rpx;
    }
    .reservation-container {
      height: 200rpx; // 使用紧凑的容器高度
      min-height: 200rpx;
    }
    .function-grid-new {
      min-height: 220rpx;
    }
  }
</style>
