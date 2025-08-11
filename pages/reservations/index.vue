<template>
  <view class="container">
    <!-- 轻量级页面标题区域 - 只在有当前预约时显示 -->
    <view v-if="currentReservation" class="page-header">
      <view class="header-content">
        <view class="current-status">
          <text class="status-text">当前预约中</text>
          <view class="status-dot"></view>
        </view>
      </view>
    </view>

    <view class="content">
      <!-- 日历视图 -->
      <CommonCard customClass="card calendar-card">
        <view class="calendar-header-bar">
          <uni-icons
            type="left"
            size="22"
            :color="currentReservation ? '#ccc' : '#333'"
            class="calendar-nav-icon"
            @click="!currentReservation && prevMonth()"
          />
          <text class="calendar-header-title">{{ currentYear }}年{{ currentMonth + 1 }}月</text>
          <uni-icons
            type="right"
            size="22"
            :color="currentReservation ? '#ccc' : '#333'"
            class="calendar-nav-icon"
            @click="!currentReservation && nextMonth()"
          />
        </view>
        <!-- 移除选择日期标题 -->
        <view class="calendar">
          <view class="calendar-header">
            <view v-for="(day, index) in weekDays" :key="index" class="week-day">{{ day }}</view>
          </view>
          <view class="calendar-body">
            <view
              v-for="day in daysInMonth"
              :key="day.date + '-' + day.isCurrentMonth"
              :class="[
                'calendar-day',
                {
                  selected: day.date === selectedDate,
                  disabled: currentReservation && day.date !== selectedDate,
                  full: getReservedSlots(day.date).length === 2,
                  today: day.date === today,
                  'not-current-month': !day.isCurrentMonth,
                  weekend: isWeekend(day),
                  'has-reservation': getReservedSlots(day.date).length > 0,
                },
              ]"
              @click="!currentReservation && selectDate(day.date)"
            >
              <view class="calendar-day-inner">
                <text
                  :class="[
                    'calendar-day-number',
                    { 'not-current-month': !day.isCurrentMonth, weekend: isWeekend(day) },
                  ]"
                  >{{ day.day }}</text
                >
                <!-- 今日角标 -->
                <view v-if="day.date === today" class="today-corner">今</view>
                <!-- 图标标记 -->
                <view class="icon-row">
                  <text
                    v-if="getReservedSlots(day.date).includes('day')"
                    :class="['icon-sun', { 'icon-selected': day.date === selectedDate }]"
                    >☀️</text
                  >
                  <text
                    v-if="getReservedSlots(day.date).includes('night')"
                    :class="['icon-moon', { 'icon-selected': day.date === selectedDate }]"
                    >🌙</text
                  >
                </view>
                <!-- 预约状态指示器 -->
                <view v-if="getReservedSlots(day.date).length > 0" class="reservation-indicator"></view>
              </view>
            </view>
          </view>
        </view>
      </CommonCard>
      
      <!-- 时段选择 -->
      <CommonCard v-if="selectedDate" customClass="card time-slot-card">
        <!-- 移除选择时段标题 -->
        <view class="time-slots">
          <view
            :class="[
              'time-slot',
              {
                selected: selectedTimeSlot === 'day',
                disabled: currentReservation && selectedTimeSlot !== 'day',
                available: !reservations[selectedDate + '_day'],
                reserved: reservations[selectedDate + '_day'],
              },
            ]"
            @click="!currentReservation && selectTimeSlot('day')"
            style="position: relative"
          >
            <view class="time-slot-info-block">
              <view class="info-row">
                <text class="time-slot-name">{{ TIMESLOTS.day.name }}</text>
                <!-- 白班预约信息 -->
                <view v-if="reservations[selectedDate + '_day']" class="reserved-info-avatar-tag">
                  <image
                    v-if="reservations[selectedDate + '_day'].user_avatar"
                    :src="getAvatarUrl(reservations[selectedDate + '_day'].user_avatar)"
                    class="avatar-img"
                  />
                  <view class="reserved-tag">
                    {{
                      reservations[selectedDate + '_day'].user_name ||
                      reservations[selectedDate + '_day'].userName ||
                      'XXX'
                    }}已预约
                    <text v-if="reservations[selectedDate + '_day'].license_plate" class="license-plate-tag">
                      {{ reservations[selectedDate + '_day'].license_plate.plate_number }}
                    </text>
                  </view>
                </view>
                <uni-icons
                  v-if="selectedTimeSlot === 'day'"
                  type="checkmarkempty"
                  size="20"
                  :color="PRIMARY_COLOR"
                  class="time-slot-check"
                ></uni-icons>
              </view>
              <view class="time-row">
                <text class="time-slot-time-block">{{ TIMESLOTS.day.time }}</text>
              </view>
            </view>
            <!-- 预约状态徽章 -->
            <view v-if="reservations[selectedDate + '_day']" class="reserved-badge">已预约</view>
          </view>
          <view
            :class="[
              'time-slot',
              {
                selected: selectedTimeSlot === 'night',
                disabled: currentReservation && selectedTimeSlot !== 'night',
                available: !reservations[selectedDate + '_night'],
                reserved: reservations[selectedDate + '_night'],
              },
            ]"
            @click="!currentReservation && selectTimeSlot('night')"
            style="position: relative"
          >
            <view class="time-slot-info-block">
              <view class="info-row">
                <text class="time-slot-name">{{ TIMESLOTS.night.name }}</text>
                <!-- 夜班预约信息 -->
                <view v-if="reservations[selectedDate + '_night']" class="reserved-info-avatar-tag">
                  <image
                    v-if="reservations[selectedDate + '_night'].user_avatar"
                    :src="getAvatarUrl(reservations[selectedDate + '_night'].user_avatar)"
                    class="avatar-img"
                  />
                  <view class="reserved-tag">
                    {{
                      reservations[selectedDate + '_night'].user_name ||
                      reservations[selectedDate + '_night'].userName ||
                      'XXX'
                    }}已预约
                    <text v-if="reservations[selectedDate + '_night'].license_plate" class="license-plate-tag">
                      {{ reservations[selectedDate + '_night'].license_plate.plate_number }}
                    </text>
                  </view>
                </view>
                <uni-icons
                  v-if="selectedTimeSlot === 'night'"
                  type="checkmarkempty"
                  size="20"
                  :color="PRIMARY_COLOR"
                  class="time-slot-check"
                ></uni-icons>
              </view>
              <view class="time-row">
                <text class="time-slot-time-block">{{ TIMESLOTS.night.time }}</text>
              </view>
            </view>
            <!-- 预约状态徽章 -->
            <view v-if="reservations[selectedDate + '_night']" class="reserved-badge">已预约</view>
          </view>
        </view>
      </CommonCard>
      
      <!-- 车牌号选择 -->
      <CommonCard v-if="selectedDate && selectedTimeSlot && !currentReservation" customClass="card license-card">
        <!-- 移除选择车牌号标题 -->
        <LicensePlateSelector v-model="selectedLicensePlate" @change="onLicensePlateChange" />
      </CommonCard>

      <!-- 操作按钮区域 - 在内容区域内 -->
      <view v-if="(selectedDate && selectedTimeSlot && !currentReservation) || currentReservation" class="action-section-fixed">
        <!-- 确认按钮 -->
        <button
          v-if="selectedDate && selectedTimeSlot && selectedLicensePlate && !currentReservation"
          class="confirm-btn"
          @click="confirmReservation"
        >
          确认预约
        </button>
        
        <!-- 提示信息 - 当选择了时段但还没选择车牌时 -->
        <view v-if="selectedDate && selectedTimeSlot && !selectedLicensePlate && !currentReservation" class="action-hint">
          <text class="hint-text">请选择车牌号完成预约</text>
        </view>
        
        <!-- 取消预约按钮 -->
        <button
          v-if="currentReservation"
          class="cancel-btn"
          @click="cancelCurrentReservation"
        >
          取消预约
        </button>
      </view>
    </view>
  </view>
</template>

<script>
  import {
    getReservations,
    createReservation,
    getCurrentReservationStatus,
    cancelReservation,
  } from '@/api/reservation';
  import {
    // formatDate, // 未使用
    // getCurrentDate, // 未使用
    checkAndHandleNeedUploadRecord,
    // getWeekday, // 未使用
    goTo,
    checkAndFetchUserProfile,
    getAvatarUrl,
    getPayload,
  } from '@/utils';
  import { TIMESLOTS, PRIMARY_COLOR } from '@/config';
  import { getUnsubmittedRecord } from '@/api/record';
  import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';

  import CommonCard from '@/components/CommonCard.vue';
  import LicensePlateSelector from '@/components/LicensePlateSelector.vue';

  export default {
    components: {
      uniIcons,
      CommonCard,
      LicensePlateSelector,
    },
    data() {
      return {
        TIMESLOTS,
        PRIMARY_COLOR,
        weekDays: ['日', '一', '二', '三', '四', '五', '六'],
        currentYear: 0,
        currentMonth: 0,
        selectedDate: '',
        selectedTimeSlot: '',
        selectedLicensePlate: null,
        reservations: {},
        daysInMonth: [],
        forbidReservation: false,
        currentReservation: null,
        today: '',
        firstEnter: true,
      };
    },
    async onLoad() {
      const now = new Date();
      this.currentYear = now.getFullYear();
      this.currentMonth = now.getMonth();
      // 记录今日日期字符串
      this.today = this.formatDate(now);
      // this.initReservationState(); // 移除，避免重复请求
    },
    onShow() {
      this.firstEnter = true;
      this.initReservationState();
    },
    onHide() {
      if (this.pollingTimer) clearInterval(this.pollingTimer);
    },
    onUnload() {
      if (this.pollingTimer) clearInterval(this.pollingTimer);
    },
    methods: {
      onLicensePlateChange(licensePlate) {
        this.selectedLicensePlate = licensePlate;
      },
      async initReservationState() {
        // 获取当前预约状态
        const res = await getCurrentReservationStatus();
        const data = getPayload(res);

        // 公共处理未上传充电记录
        if (checkAndHandleNeedUploadRecord(data)) {
          return;
        }

        if (data && data.currentReservation) {
          this.currentReservation = data.currentReservation;
          this.selectedDate = data.currentReservation.date.slice(0, 10);
          this.selectedTimeSlot = data.currentReservation.timeslot;
          // 跳转到预约对应的年月
          const [year, month] = this.selectedDate.split('-').map(Number);
          this.currentYear = year;
          this.currentMonth = month - 1;
          await this.loadReservations();
          // 合并当前预约
          const key = this.selectedDate + '_' + this.selectedTimeSlot;
          this.reservations[key] = {
            ...data.currentReservation,
            date: this.selectedDate,
          };
        } else {
          if (this.firstEnter) {
            // 只有首次进入页面才跳回当月
            const now = new Date();
            this.currentYear = now.getFullYear();
            this.currentMonth = now.getMonth();
            const today = this.formatDate(now);
            this.selectedDate = today;
            this.selectedTimeSlot = '';
            this.currentReservation = null;
            this.firstEnter = false;
          }
          await this.loadReservations();
        }
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
            await this.initReservationState(); // 全量刷新
            this.selectedDate = '';
            this.selectedTimeSlot = '';
            this.currentReservation = null;
            uni.showToast({ title: '已取消预约', icon: 'none' });
          } catch (error) {
            uni.showToast({ title: '取消失败', icon: 'none' });
          } finally {
            uni.hideLoading();
          }
        }
      },
      async checkUnsubmittedRecord() {
        try {
          const res = await getUnsubmittedRecord();
          const list = getPayload(res);
          if (Array.isArray(list) && list.length > 0) {
            this.forbidReservation = true;
            uni.showModal({
              title: '温馨提示',
              content: '您有上次充电记录未提交，请先提交后再预约！',
              showCancel: false,
            });
          } else {
            this.forbidReservation = false;
          }
        } catch (e) {
          this.forbidReservation = false;
        }
      },
      // 加载预约数据并刷新日历
      async loadReservations() {
        uni.showLoading({ title: '加载中' });
        try {
          // 获取本月所有预约
          const monthStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}`;
          const res = await getReservations(monthStr);
          const reservations = {};
          const list = getPayload(res);
          if (Array.isArray(list)) {
            list.forEach((item) => {
              // 只记录未取消的预约
              if (item.status !== 'cancelled') {
                // 只保留年月日部分
                const dateStr = item.date.slice(0, 10);
                reservations[dateStr + '_' + item.timeslot] = {
                  ...item,
                  date: dateStr,
                };
              }
            });
          }
          this.reservations = reservations;
          this.loadCalendarData();
        } catch (error) {
          uni.showToast({ title: '获取预约数据失败', icon: 'none' });
          console.error('获取预约数据失败', error);
        } finally {
          uni.hideLoading();
        }
      },
      // 加载日历数据
      loadCalendarData() {
        const year = this.currentYear;
        const month = this.currentMonth;
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const days = [];
        const prevMonthLastDate = new Date(year, month, 0).getDate();
        // 上月补齐
        for (let i = firstDay - 1; i >= 0; i--) {
          const day = prevMonthLastDate - i;
          const dateObj = new Date(year, month - 1, day);
          const date = this.formatDate(dateObj);
          days.push({
            day,
            date,
            isCurrentMonth: dateObj.getFullYear() === year && dateObj.getMonth() === month,
            isReserved: this.isDateReserved(date),
            reservedSlots: this.getReservedSlots(date),
          });
        }
        // 本月
        for (let i = 1; i <= lastDate; i++) {
          const dateObj = new Date(year, month, i);
          const date = this.formatDate(dateObj);
          days.push({
            day: i,
            date,
            isCurrentMonth: dateObj.getFullYear() === year && dateObj.getMonth() === month,
            isReserved: this.isDateReserved(date),
            reservedSlots: this.getReservedSlots(date),
          });
        }
        // 下月补齐
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
          const dateObj = new Date(year, month + 1, i);
          const date = this.formatDate(dateObj);
          days.push({
            day: i,
            date,
            isCurrentMonth: dateObj.getFullYear() === year && dateObj.getMonth() === month,
            isReserved: this.isDateReserved(date),
            reservedSlots: this.getReservedSlots(date),
          });
        }
        this.daysInMonth = days;
      },
      getReservedSlots(date) {
        // 返回该日期已预约的时间段数组
        return Object.values(this.reservations)
          .filter((r) => r.date === date && r.status !== 'cancelled')
          .map((r) => r.timeslot);
      },
      // 判断某天是否已被预约（任意时段）
      isDateReserved(date) {
        // 只要有一个时间段被预约就算已预约
        return this.getReservedSlots(date).length > 0;
      },
      // 选择日期
      selectDate(date) {
        if (this.forbidReservation) {
          uni.showToast({ title: '请先提交上次充电记录', icon: 'none' });
          return;
        }
        const [year, month] = date.split('-').map(Number);
        if (year !== this.currentYear || month !== this.currentMonth + 1) {
          this.currentYear = year;
          this.currentMonth = month - 1;
          this.selectedDate = date;
          this.initReservationState().then(() => {
            this.selectedDate = date;
          });
          return;
        }
        this.selectedDate = date;
        // 如果有预约且选中的日期等于预约日期，自动选中班次
        if (this.currentReservation && this.currentReservation.date === date) {
          this.selectedTimeSlot = this.currentReservation.timeslot;
        } else {
          this.selectedTimeSlot = '';
        }
      },
      // 选择时段
      selectTimeSlot(slot) {
        // 禁止选择已被预约的时间段
        const reserved = this.getReservedSlots(this.selectedDate);
        if (reserved.includes(slot)) {
          uni.showToast({ title: '该时段已被预约', icon: 'none' });
          return;
        }
        this.selectedTimeSlot = slot;
      },
      async beforeCreateReservation() {
        const res = await getCurrentReservationStatus();
        if (res && res.data) {
          if (checkAndHandleNeedUploadRecord(res.data)) {
            return false;
          }
          if (
            res.data.currentReservation &&
            !this.isCurrentReservationExpired(res.data.currentReservation)
          ) {
            uni.showToast({
              title: '当前有未结束预约，不能重复预约',
              icon: 'none',
            });
            return false;
          }
        }
        return true;
      },
      async confirmReservation() {
        const profileComplete = await checkAndFetchUserProfile();
        if (!profileComplete) {
          uni.showToast({ title: '请设置头像和昵称', icon: 'none' });
          return;
        }
        if (!(await this.beforeCreateReservation())) return;
        if (this.forbidReservation) {
          uni.showToast({ title: '请先提交上次充电记录', icon: 'none' });
          return;
        }
        if (!this.selectedDate || !this.selectedTimeSlot) {
          uni.showToast({ title: '请选择日期和时段', icon: 'none' });
          return;
        }
        if (!this.selectedLicensePlate) {
          uni.showToast({ title: '请选择车牌号', icon: 'none' });
          return;
        }
        // 校验冲突
        const reserved = this.getReservedSlots(this.selectedDate);
        if (reserved.includes(this.selectedTimeSlot)) {
          uni.showToast({ title: '该时段已被预约', icon: 'none' });
          return;
        }
        uni.showLoading({ title: '预约中' });
        try {
          await createReservation({ 
            date: this.selectedDate, 
            timeslot: this.selectedTimeSlot,
            license_plate_id: this.selectedLicensePlate.id
          });
          // 只跳转首页，不再弹窗，首页会自动检测未上传充电记录
          uni.showToast({ title: '预约成功', icon: 'success' });
          setTimeout(() => {
            goTo('/pages/index/index');
          }, 1000);
        } catch (error) {
          if (error && error.data && error.data.message) {
            uni.showModal({
              title: '提示',
              content: error.data.message,
              showCancel: false,
            });
          } else {
            uni.showToast({ title: '预约失败', icon: 'none' });
          }
        } finally {
          uni.hideLoading();
        }
      },
      isCurrentReservationExpired(reservation) {
        // 判断当前预约是否已过期
        const now = new Date();
        const endTime = new Date(reservation.endTime); // 需后端返回 endTime 字段
        return now > endTime;
      },
      // 返回
      navigateBack() {
        uni.navigateBack();
      },
      formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      },
      prevMonth() {
        if (this.currentMonth === 0) {
          this.currentYear -= 1;
          this.currentMonth = 11;
        } else {
          this.currentMonth -= 1;
        }
        this.selectedDate = '';
        this.initReservationState(); // 全量刷新
      },
      nextMonth() {
        if (this.currentMonth === 11) {
          this.currentYear += 1;
          this.currentMonth = 0;
        } else {
          this.currentMonth += 1;
        }
        this.selectedDate = '';
        this.initReservationState(); // 全量刷新
      },
      isWeekend(day) {
        // 0:周日, 6:周六
        const d = new Date(day.date);
        return d.getDay() === 0 || d.getDay() === 6;
      },
      // 导航栏右侧点击事件
      rightClick() {
        goTo('/pages/profile/index');
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
    },
  };
</script>

<style scoped lang="scss">
  @import '@/uni.scss';
  .container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: $bg;
  }

  .page-header {
    padding: 16rpx 20rpx 0;
    background-color: $uni-bg-color;
    border-bottom: 1rpx solid $uni-border-color;
    box-shadow: $charging-shadow-sm;
  }

  .header-content {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-bottom: 8rpx;
  }

  .current-status {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, rgba(255, 165, 0, 0.1), rgba(255, 165, 0, 0.05));
    border: 1rpx solid rgba(255, 165, 0, 0.2);
    border-radius: 20rpx;
    padding: 4rpx 12rpx;
    font-size: 24rpx;
    font-weight: 500;
    color: $uni-color-warning;
    box-shadow: 0 2rpx 8rpx rgba(255, 165, 0, 0.1);
  }

  .status-dot {
    width: 12rpx;
    height: 12rpx;
    background-color: $uni-color-warning;
    border-radius: 50%;
    margin-left: 8rpx;
  }

  .content {
    flex: 1;
    padding: 20rpx;
    overflow-y: auto;
    
    /* 按钮现在在内容区域内，不需要额外的底部空间 */
  }

  .card {
    background-color: $uni-bg-color;
    border-radius: $uni-border-radius-base;
    margin-bottom: $uni-spacing-col-base;
    padding: $uni-spacing-col-base;
    box-shadow: $charging-shadow-sm;
    border: 1rpx solid $uni-border-color;
  }

  .card-header {
    margin-bottom: 20rpx;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -8rpx;
      left: 0;
      width: 40rpx;
      height: 4rpx;
      background: linear-gradient(90deg, $uni-color-primary, #f39c12);
      border-radius: 2rpx;
    }
  }

  .card-title {
    font-size: $uni-font-size-lg;
    font-weight: bold;
    color: $uni-text-color;
    position: relative;
  }

  .calendar {
    width: 100%;
  }

  .calendar-header {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20rpx;
  }

  .week-day {
    width: 14.28%;
    text-align: center;
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
    font-weight: 500;
  }

  .calendar-body {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8rpx;
    width: 100%;
  }

  .calendar-day {
    aspect-ratio: 1;
    min-height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: $uni-bg-color;
    border-radius: $uni-border-radius-sm;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
    cursor: pointer;
    box-sizing: border-box;
    
    &:hover {
      transform: translateY(-2rpx);
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    }
    
    &.has-reservation {
      border-color: rgba(255, 165, 0, 0.3);
      background: linear-gradient(135deg, #fff8f0, #fff0e0);
      
      &:hover {
        border-color: rgba(255, 165, 0, 0.6);
        box-shadow: 0 6rpx 16rpx rgba(255, 165, 0, 0.2);
      }
    }
  }

  .calendar-day.full {
    background: linear-gradient(135deg, #f5f5f5, #e8e8e8) !important;
    border-color: #ddd;
    
    &::after {
      content: '满';
      position: absolute;
      top: 4rpx;
      right: 4rpx;
      background: $uni-text-color-disable;
      color: white;
      font-size: 18rpx;
      padding: 2rpx 6rpx;
      border-radius: 8rpx;
      line-height: 1;
      z-index: 3;
    }
  }

  .calendar-day.disabled {
    background-color: $uni-bg-color-hover;
    color: $uni-text-color-disable;
    cursor: not-allowed;
    opacity: 0.6;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }

  .calendar-day.selected {
    border: 2rpx solid $uni-color-success !important;
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border-radius: $uni-border-radius-sm;
    box-sizing: border-box;
    transform: scale(1.05);
    box-shadow: 0 6rpx 20rpx rgba(103, 194, 58, 0.3);
    z-index: 2;
    
    .calendar-day-number {
      color: $uni-color-success;
      font-weight: 600;
    }
  }
  
  .calendar-day.not-current-month {
    color: $uni-text-color-disable;
    background: $uni-bg-color-hover;
    opacity: 0.5;
  }
  
  .calendar-day.weekend {
    color: $uni-color-error;
    
    .calendar-day-number {
      font-weight: 500;
    }
  }
  
  .calendar-day.today {
    border: 2rpx solid $uni-color-info;
    box-sizing: border-box;
    border-radius: 8rpx;
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    z-index: 2;
    
    .calendar-day-number {
      color: $uni-color-info;
      font-weight: 600;
    }
  }

  .calendar-day-inner {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  .calendar-day-number {
    font-size: 30rpx;
    color: $uni-text-color;
    font-weight: 500;
    transition: all 0.2s ease;
    line-height: 1;
  }

  .calendar-day-number.weekend {
    color: $uni-color-error;
  }

  .calendar-day-number.not-current-month {
    color: $uni-text-color-disable !important;
  }

  .today-corner {
    position: absolute;
    left: 2rpx;
    top: 2rpx;
    font-size: 18rpx;
    color: $uni-text-color-inverse;
    background: linear-gradient(135deg, $uni-color-success, #52c41a);
    border-radius: $uni-border-radius-sm;
    padding: 0 6rpx;
    z-index: 3;
    line-height: 1.2;
    box-shadow: 0 2rpx 4rpx rgba(103, 194, 58, 0.3);
  }

  .icon-row {
    position: absolute;
    left: 50%;
    bottom: 2rpx;
    transform: translateX(-50%);
    display: flex;
    flex-direction: row;
    gap: 4rpx;
    z-index: 2;
  }

  .icon-sun {
    font-size: 22rpx;
    color: $uni-color-primary;
    margin-right: 2rpx;
    text-shadow: none;
    transition: all 0.2s ease;
  }

  .icon-moon {
    font-size: 22rpx;
    color: $uni-color-info;
    text-shadow: none;
    transition: all 0.2s ease;
  }

  .icon-selected {
    color: $uni-color-warning !important;
    text-shadow:
      0 0 4rpx $uni-bg-color,
      0 0 2rpx $uni-bg-color;
    transform: scale(1.2);
  }

  .reservation-indicator {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: $uni-border-radius-sm;
    background-color: rgba(255, 165, 0, 0.1);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    z-index: 1;
  }

  .calendar-day:hover .reservation-indicator {
    opacity: 1;
  }

  .time-slots {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }

  .time-slot {
    padding: $uni-spacing-col-base;
    border: 2rpx solid transparent;
    border-radius: $uni-border-radius-sm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &.available {
      border-color: #e8f5e8;
      background: linear-gradient(135deg, #f8fff8, #f0fff0);
      
      &:hover {
        border-color: $uni-color-success;
        transform: translateY(-2rpx);
        box-shadow: 0 8rpx 24rpx rgba(103, 194, 58, 0.15);
      }
      
      &:active {
        transform: translateY(0);
        box-shadow: 0 4rpx 12rpx rgba(103, 194, 58, 0.15);
      }
    }
    
    &.reserved {
      background: linear-gradient(135deg, #fff8f0, #fff0e0);
      border-color: #ffe0b2;
      opacity: 0.9;
      
      &:hover {
        opacity: 1;
        transform: translateY(-1rpx);
      }
    }
    
    &.selected {
      border-color: $uni-color-primary;
      background: linear-gradient(135deg, #fff8f0, #fff0e0);
      box-shadow: 0 8rpx 24rpx rgba(255, 165, 0, 0.2);
      transform: translateY(-2rpx);
    }
    
    &.disabled {
      background: $uni-bg-color-hover;
      opacity: 0.6;
      cursor: not-allowed;
      
      &:hover {
        transform: none;
        box-shadow: none;
      }
    }
  }

  .time-slot-name {
    font-size: $uni-font-size-lg;
    font-weight: bold;
    color: $uni-text-color;
    margin-right: 8rpx;
  }

  .time-slot-time {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
  }

  .action-section {
    display: flex;
    justify-content: center;
    margin-top: 40rpx;
  }

  .calendar-card,
  .time-slot-card,
  .license-card {
    animation: slideInUp 0.5s ease-out;
    border: 1rpx solid rgba(255, 165, 0, 0.1);
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    
    &:hover {
      box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.12);
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30rpx);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .calendar-header-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12rpx;
    padding: 16rpx 0;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-radius: 12rpx;
    margin: 0 -16rpx 20rpx -16rpx;
  }

  .calendar-header-title {
    flex: 1;
    text-align: center;
    font-size: 30rpx;
    font-weight: bold;
    color: $uni-text-color;
    text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
  }

  .calendar-nav-icon {
    color: $uni-text-color;
    padding: 8rpx;
    border-radius: 8rpx;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 165, 0, 0.1);
      color: $uni-color-primary;
    }
    
    &.disabled {
      color: $uni-text-color-disable;
      cursor: not-allowed;
      
      &:hover {
        background: transparent;
        color: $uni-text-color-disable;
      }
    }
  }

  .reserved-info-avatar-tag {
    display: flex;
    align-items: center;
    margin-left: 8rpx;
    animation: fadeIn 0.3s ease-out;
  }

  .avatar-img {
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    margin-right: 8rpx;
    background: $uni-bg-color-hover;
    object-fit: cover;
    border: 2rpx solid rgba(255, 165, 0, 0.3);
  }

  .reserved-tag {
    display: inline-block;
    background: linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 165, 0, 0.1));
    color: $uni-color-warning;
    border-radius: 16rpx;
    padding: 4rpx 16rpx;
    font-size: 22rpx;
    font-weight: 500;
    border: 1rpx solid rgba(255, 165, 0, 0.3);
    transition: all 0.2s ease;
    
    &:hover {
      background: linear-gradient(135deg, rgba(255, 165, 0, 0.3), rgba(255, 165, 0, 0.2));
      transform: translateY(-1rpx);
    }

    .license-plate-tag {
      display: block;
      font-size: 20rpx;
      color: $uni-text-color-grey;
      margin-top: 4rpx;
    }
  }

  .time-slot-check {
    color: $uni-color-primary;
    animation: bounceIn 0.3s ease-out;
  }

  // 添加缺失的样式
  .time-slot-info-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1;
  }

  .info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .time-row {
    margin-top: 2rpx;
  }

  .time-slot-time-block {
    color: $uni-text-color-disable;
    font-size: $uni-font-size-sm;
    line-height: 1.6;
  }

  .reserved-badge {
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    background-color: $uni-color-warning;
    color: $uni-text-color-inverse;
    border-radius: $uni-border-radius-sm;
    padding: 4rpx 10rpx;
    font-size: 20rpx;
    font-weight: bold;
    z-index: 2;
    box-shadow: 0 2rpx 8rpx rgba(230, 162, 60, 0.3);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10rpx);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  // 响应式优化
  @media (max-width: 750rpx) {
    .action-section-fixed {
      padding: 16rpx 20rpx;
      box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.1);
    }
    
    .calendar-day {
      height: 70rpx;
      
      .calendar-day-number {
        font-size: 26rpx;
      }
    }
    
    .time-slot {
      padding: 24rpx;
      
      .time-slot-name {
        font-size: 32rpx;
      }
    }
    
    .confirm-btn,
    .cancel-btn {
      height: 72rpx;
      padding: 0 32rpx;
      font-size: 30rpx;
      max-width: none;
      border-radius: 36rpx;
      
      &:hover {
        transform: none;
      }
      
      &:active {
        transform: scale(0.98);
      }
    }
    
    .page-header {
      padding: 16rpx 16rpx 0;
    }
    
    .page-subtitle {
      font-size: $uni-font-size-sm;
    }
    
    .content {
      padding: 16rpx 20rpx;
    }
  }

  // 触摸优化
  .calendar-day,
  .time-slot {
    -webkit-tap-highlight-color: transparent;
    
    &:active {
      -webkit-tap-highlight-color: rgba(255, 165, 0, 0.1);
    }
  }

  // 卡片间距优化
  .card {
    margin-bottom: 16rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  // 紧凑布局优化
  .compact-section {
    .card {
      margin-bottom: 0;
    }
  }

  // 按钮区域优化 - 在内容区域内
  .action-section-fixed {
    background: $uni-bg-color;
    border-radius: $uni-border-radius-lg;
    padding: 24rpx;
    box-shadow: $charging-shadow-sm;
    border: 1rpx solid $uni-border-color;
    display: flex;
    justify-content: center;
    margin-top: 20rpx; /* 与上方内容保持间距 */
  }

  // 确认按钮样式优化
  .confirm-btn {
    width: 100%;
    max-width: 500rpx;
    @include btn-primary;
    height: 80rpx;
    padding: 0 40rpx;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 40rpx;
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
    
    // 禁用状态
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
      
      &:hover {
        transform: none;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
      }
    }
  }

  // 取消按钮样式优化
  .cancel-btn {
    width: 100%;
    max-width: 500rpx;
    background: $uni-bg-color;
    color: $main-color-dark;
    border: 2rpx solid $main-color-dark;
    border-radius: 40rpx;
    font-size: 32rpx;
    font-weight: 600;
    height: 80rpx;
    padding: 0 40rpx;
    transition: all 0.2s ease;
    box-shadow: $charging-shadow-sm;
    letter-spacing: 1rpx;
    cursor: pointer;
    
    // 悬停效果
    &:hover {
      background: $main-color-dark;
      color: $uni-text-color-inverse;
      box-shadow: $charging-shadow-md;
      transform: translateY(-1rpx);
    }
    
    // 点击效果
    &:active {
      transform: translateY(1rpx) scale(0.98);
      box-shadow: $charging-shadow-sm;
      transition: all 0.1s ease;
    }
    
    // 禁用状态
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
      
      &:hover {
        transform: none;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
      }
    }
  }

  // 提示信息样式
  .action-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16rpx 24rpx;
    background: linear-gradient(135deg, rgba(255, 165, 0, 0.1), rgba(255, 165, 0, 0.05));
    border: 1rpx solid rgba(255, 165, 0, 0.2);
    border-radius: 16rpx;
    margin: 0 20rpx;
    
    .hint-text {
      font-size: $uni-font-size-base;
      color: $uni-color-warning;
      font-weight: 500;
      text-align: center;
    }
  }

  // 页面内容区域优化
  .content {
    flex: 1;
    padding: 20rpx;
    overflow-y: auto;
    
    /* 按钮现在在内容区域内，不需要额外的底部空间 */
  }

  // 日历卡片特殊样式
  .calendar-card {
    margin-bottom: 20rpx;
    
    .calendar {
      margin-top: 0; /* 去掉标题后，日历直接显示 */
    }
  }

  // 时段选择卡片优化
  .time-slot-card {
    .time-slots {
      gap: 16rpx;
      margin-top: 0; /* 去掉标题后，时段选择直接显示 */
    }
    
    .time-slot {
      padding: 20rpx;
      
      &.selected {
        transform: translateY(-1rpx);
      }
    }
  }

  // 车牌选择卡片优化
  .license-card {
    .card-header {
      margin-bottom: 16rpx;
    }
    
    /* 去掉标题后，车牌选择器直接显示 */
    .license-plate-selector {
      margin-top: 0;
    }
  }

  // 状态指示器优化
  .current-status {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  // 页面标题区域优化
  .page-header {
    position: relative;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1rpx;
      background: linear-gradient(90deg, transparent, rgba(255, 165, 0, 0.3), transparent);
    }
  }
</style>
