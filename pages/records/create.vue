<template>
  <view class="container">
    <!-- 内容区域 -->
    <view class="content">
      <!-- 无预约ID时的提示 -->
      <view v-if="!reservationId" class="no-reservation-warning">
        <uni-icons type="info" size="22" color="#FF6B6B" class="warning-icon" />
        <text class="warning-text">请先预约充电时段，然后才能上传记录</text>
      </view>

      <!-- 补交预约信息美观展示 -->
      <view
        v-if="reservationId || reservationDate || reservationTimeslot"
        class="supplement-reservation-info"
      >
        <uni-icons type="calendar" size="22" :color="PRIMARY_COLOR" class="calendar-icon" />
        <text class="supplement-label">本次预约信息：</text>
        <text class="supplement-date">{{ reservationDate }}</text>
        <text class="supplement-timeslot" v-if="reservationTimeslot">
          （{{
            reservationTimeslot === 'day'
              ? TIMESLOTS.day.name
              : reservationTimeslot === 'night'
                ? TIMESLOTS.night.name
                : reservationTimeslot
          }}）
        </text>
      </view>
      <!-- 照片上传 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">上传电量截图</text>
        </view>
        <view class="upload-area" @click="chooseImage">
          <block v-if="imageUrl">
            <image :src="imageUrl" mode="aspectFill" class="upload-image"></image>
          </block>
          <block v-else>
            <uni-icons type="camera" size="32" class="camera-icon"></uni-icons>
            <text class="upload-text">点击上传电量截图</text>
          </block>
        </view>
      </view>

      <!-- 车牌号选择 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">选择车牌号</text>
        </view>
        <LicensePlateSelector v-model="selectedLicensePlate" @change="onLicensePlateChange" />
      </view>

      <!-- 电量输入 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">电量与费用</text>
        </view>
        <view class="form-group">
          <text class="form-label">充电度数 (kWh)</text>
          <input
            type="digit"
            v-model="kwh"
            class="form-input"
            placeholder="请输入充电度数"
            @input="calculateCost"
          />
        </view>

        <view class="form-group">
          <text class="form-label">预估费用</text>
          <view class="cost-display">
            <text class="cost-value">¥{{ cost }}</text>
            <text class="cost-note">按 {{ userPrice }}元/kWh 计算</text>
          </view>
        </view>

        <view class="form-group">
          <text class="form-label">备注 (可选)</text>
          <textarea v-model="remark" class="form-textarea" placeholder="如：特殊情况充到12点" />
        </view>
      </view>

      <!-- 提交按钮 -->
      <button
        class="submit-btn"
        @click="submitRecord"
        :disabled="!reservationId || !kwh || parseFloat(kwh) <= 0 || !selectedLicensePlate"
      >
        <uni-icons type="wallet" size="20" class="wallet-icon"></uni-icons>
        <text class="btn-text">提交记录 ¥{{ cost }}</text>
      </button>

      <!-- 历史记录 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">最近记录</text>
        </view>
        <view class="records-list">
          <view class="record-item" v-for="(record, index) in recentRecords" :key="index">
            <view class="record-left">
              <view class="record-date-row">
                <text class="record-date">{{ formatDate(record.date, 'MM月DD日') }}</text>
                <text class="record-timeslot-label">{{ record.timeslotLabel }}</text>
              </view>
              <text class="record-kwh">{{ record.kwh }} kWh</text>
            </view>
            <view class="record-right">
              <text class="record-amount">¥{{ record.amount }}</text>
              <!-- 状态字段已移除 -->
            </view>
          </view>
          <view class="empty-records" v-if="recentRecords.length === 0">
            <text class="empty-text">暂无记录</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { getRecords, createRecord } from '@/api/record';
  import {
    formatDate,
    // calculateAmount, // 未使用，已注释
    getStatusStyle,
    goTo,
    compressImage,
    getPayload,
  } from '@/utils';
  import { TIMESLOTS, PRIMARY_COLOR } from '@/config';
  import { uploadFile } from '@/api/index';

  import { getCurrentReservationStatus } from '@/api/reservation';
  import { getUserPrice } from '@/api/auth';
  import LicensePlateSelector from '@/components/LicensePlateSelector.vue';

  export default {
    components: {
      LicensePlateSelector,
    },
    data() {
      return {
        TIMESLOTS,
        PRIMARY_COLOR,
        userPrice: 0, // 只保留 userPrice
        imageUrl: '',
        tempFilePath: '',
        kwh: '',
        cost: '0.00',
        remark: '',
        selectedLicensePlate: null,
        recentRecords: [],
        reservationId: '',
        reservationDate: '',
        reservationTimeslot: '',
        skipCheck: false,
      };
    },
    onLoad(options) {
      // onLoad options: 调试信息
      // 解析预约参数
      if (options && (options.id || options.date || options.timeslot)) {
        // 只保留数字id
        this.reservationId =
          options.id && !isNaN(Number(options.id)) ? String(Number(options.id)) : '';
        this.reservationDate = options.date || '';
        this.reservationTimeslot = options.timeslot || '';
      } else {
        this.reservationId = '';
        this.reservationDate = '';
        this.reservationTimeslot = '';
      }
      this.loadUserPrice();
      this.loadRecentRecords();
    },
    onTabItemTap() {
      this.skipCheck = false; // 每次点击tab时重置跳过检查
    },
    onShow() {
      if (this.skipCheck) {
        this.skipCheck = false;
        return;
      }
      this.checkCurrentStatusLogic();
      this.loadRecentRecords(); // 每次进入页面都刷新最近记录
    },
    methods: {
      onLicensePlateChange(licensePlate) {
        this.selectedLicensePlate = licensePlate;
      },
      async chooseImage() {
        this.skipCheck = true; // 选择图片时不弹框
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: async (res) => {
            try {
              // 压缩图片
              const compressedPath = await compressImage(res.tempFilePaths[0], 0.8);
              this.tempFilePath = compressedPath;
              this.imageUrl = compressedPath;
            } catch (error) {
              console.error('图片压缩失败，使用原图:', error);
              this.tempFilePath = res.tempFilePaths[0];
              this.imageUrl = res.tempFilePaths[0];
            }
          },
        });
      },
      async loadUserPrice() {
        try {
          const res = await getUserPrice();
          if (res && res.data && res.data.unit_price) {
            this.userPrice = res.data.unit_price;
          } else {
            this.userPrice = 0;
          }
        } catch (e) {
          this.userPrice = 0;
        }
      },
      calculateCost() {
        this.cost = this.kwh
          ? (parseFloat(this.kwh) * parseFloat(this.userPrice)).toFixed(2)
          : '0.00';
      },
      async loadRecentRecords() {
        uni.showLoading({ title: '加载中' });
        try {
          const res = await getRecords();
          const list = getPayload(res);
          if (Array.isArray(list) && list.length > 0) {
            // 直接取前5条，金额单位分转元，班次美化
            this.recentRecords = list.slice(0, 5).map((record) => {
              return {
                ...record,
                amount: (Number(record.amount) / 100).toFixed(2),
                timeslotLabel:
                  this.TIMESLOTS && record.timeslot && this.TIMESLOTS[record.timeslot]
                    ? this.TIMESLOTS[record.timeslot].name
                    : record.timeslot || '',
              };
            });
          } else {
            this.recentRecords = [];
          }
        } catch (error) {
          uni.showToast({ title: '获取记录失败', icon: 'none' });
        } finally {
          uni.hideLoading();
        }
      },
      async submitRecord() {
        // 检查是否有预约ID
        if (!this.reservationId) {
          uni.showToast({ title: '请先预约充电时段', icon: 'none' });
          return;
        }

        if (!this.kwh || parseFloat(this.kwh) <= 0) {
          uni.showToast({ title: '请输入有效的充电度数', icon: 'none' });
          return;
        }

        if (!this.selectedLicensePlate) {
          uni.showToast({ title: '请选择车牌号', icon: 'none' });
          return;
        }
        uni.showLoading({ title: '提交中' });
        try {
          let imageUrl = '';
          if (this.tempFilePath) {
            // 开始上传图片
            const uploadRes = await uploadFile(this.tempFilePath);
            // 图片上传结果返回
            if (uploadRes && uploadRes.data && uploadRes.data.url) {
              imageUrl = uploadRes.data.url;
            }
          }
          // imageUrl 调试
          const recordData = {
            date: this.reservationDate,
            kwh: parseFloat(this.kwh),
            image_url: imageUrl,
            remark: this.remark,
            reservation_id: this.reservationId, // 始终传递
            license_plate_id: this.selectedLicensePlate.id,
          };
          // 提交 recordData 调试
          await createRecord(recordData);
          // createRecord 已调用
          uni.showToast({ title: '提交成功', icon: 'success' });
          // 清空表单字段
          this.imageUrl = '';
          this.tempFilePath = '';
          this.kwh = '';
          this.cost = '0.00';
          this.remark = '';
          this.selectedLicensePlate = null;
          this.reservationId = '';
          this.reservationDate = '';
          this.reservationTimeslot = '';
          setTimeout(() => {
            uni.switchTab({ url: '/pages/index/index' });
          }, 1000);
        } catch (error) {
          console.error('[日志] 提交失败:', error);
          uni.showToast({ title: '提交失败', icon: 'none' });
        } finally {
          uni.hideLoading();
        }
      },
      async checkCurrentStatusLogic() {
        try {
          const res = await getCurrentReservationStatus();
          const data = res && res.data ? res.data.data || res.data : null;
          if (!data) {
            uni.showModal({
              title: '提示',
              content: '暂无待上传的预约，去预约',
              confirmText: '去预约',
              showCancel: true,
              success: (r) => {
                if (r.confirm) goTo('/pages/reservations/index');
              },
            });
            return;
          }
          if (data.needUploadRecord && data.lastReservation) {
            // 展示上传表单，填充 lastReservation 数据
            this.reservationId = data.lastReservation.id;
            this.reservationDate = data.lastReservation.date
              ? data.lastReservation.date.slice(0, 10)
              : '';
            this.reservationTimeslot = data.lastReservation.timeslot;
            // 继续展示上传表单
            return;
          }
          if (data.currentReservation) {
            // 当前预约还未到上传时机
            uni.showModal({
              title: '提示',
              content: '当前预约时段还未结束，确定已经充电完成？',
              confirmText: '确定',
              cancelText: '取消',
              success: (r) => {
                if (r.confirm) {
                  this.reservationId = data.currentReservation.id;
                  this.reservationDate = data.currentReservation.date
                    ? data.currentReservation.date.slice(0, 10)
                    : '';
                  this.reservationTimeslot = data.currentReservation.timeslot;
                  // 继续展示上传表单
                } else {
                  // 取消则返回首页或不做处理
                  goTo('/pages/index/index');
                }
              },
            });
            return;
          }
          // 兜底：无未上传记录、无当前预约
          uni.showModal({
            title: '提示',
            content: '暂无待上传的预约，去预约',
            confirmText: '去预约',
            showCancel: true,
            success: (r) => {
              if (r.confirm) goTo('/pages/reservations/index');
            },
          });
        } catch (e) {
          uni.showToast({ title: '获取预约状态失败', icon: 'none' });
        }
      },
      formatDate,
      getStatusStyle,
      navigateBack() {
        uni.navigateBack();
      },
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

  .card {
    background: $white;
    border-radius: 12rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    margin-bottom: 30rpx;
    padding: 30rpx 24rpx;
  }

  .card-header {
    margin-bottom: 20rpx;
  }

  .card-title {
    font-size: $uni-font-size-lg;
    font-weight: bold;
    color: $uni-text-color;
  }

  .upload-area {
    height: 240rpx;
    border: 2rpx dashed $uni-border-color;
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: $uni-bg-color-grey;
    cursor: pointer;
  }

  .upload-image {
    width: 100%;
    height: 100%;
    border-radius: 8rpx;
  }

  .upload-text {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: $text-sub;
  }

  .form-group {
    margin-bottom: 30rpx;
  }

  .form-label {
    font-size: 28rpx;
    color: $text-sub;
    margin-bottom: 10rpx;
    display: block;
  }

  .form-input {
    height: 80rpx;
    border: 1rpx solid $uni-border-color;
    border-radius: 8rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    background-color: $uni-bg-color-hover;
  }

  .cost-display {
    display: flex;
    flex-direction: column;
  }

  .cost-value {
    font-size: 48rpx;
    font-weight: bold;
    color: $text-main;
  }

  .cost-note {
    font-size: 24rpx;
    color: $text-sub;
    margin-top: 10rpx;
  }

  .form-textarea {
    height: 160rpx;
    border: 1rpx solid $uni-border-color;
    border-radius: 8rpx;
    padding: 20rpx;
    font-size: 28rpx;
    width: 100%;
    box-sizing: border-box;
    background-color: $uni-bg-color-hover;
  }

  .submit-btn {
    background-color: $uni-color-primary;
    color: $uni-text-color-inverse;
    border: none;
    border-radius: $uni-border-radius-sm;
    font-size: $uni-font-size-lg;
    font-weight: bold;
    padding: $uni-spacing-col-base 0;
    margin-top: $uni-spacing-col-base;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .submit-btn:active {
    opacity: 0.8;
  }

  .submit-btn[disabled] {
    background-color: $uni-text-color-disable;
    opacity: 0.6;
  }

  .btn-text {
    margin-left: 10rpx;
  }

  .records-list {
    padding: 10rpx 0;
  }

  .record-item {
    display: flex;
    justify-content: space-between;
    padding: 20rpx 0;
    border-bottom: 1rpx solid $uni-border-color;
  }

  .record-item:last-child {
    border-bottom: none;
  }

  .record-left,
  .record-right {
    display: flex;
    flex-direction: column;
  }

  .record-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .record-date-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .record-date {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    font-weight: bold;
  }

  .record-kwh {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
    margin-top: 8rpx;
  }

  .record-amount {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    font-weight: bold;
    text-align: right;
  }

  .record-status {
    font-size: 24rpx;
    margin-top: 8rpx;
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
    text-align: center;
  }

  .empty-records {
    text-align: center;
    color: $uni-text-color-grey;
    margin-top: 40rpx;
  }

  .empty-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
  }

  .supplement-reservation-info {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 165, 0, 0.1);
    border-radius: $uni-border-radius-base;
    margin: 30rpx 0 20rpx 0;
    padding: 18rpx 30rpx;
    font-size: 30rpx;
    color: $uni-color-primary;
    box-shadow: $charging-shadow-sm;
  }

  .supplement-label {
    font-weight: bold;
    margin-right: 8rpx;
  }

  .supplement-date {
    font-weight: bold;
    color: $uni-text-color;
  }

  .supplement-timeslot {
    margin-left: 4rpx;
    color: $uni-color-primary;
  }

  .record-timeslot-label {
    display: inline-block;
    margin-left: 10rpx;
    margin-right: 10rpx;
    padding: 2rpx 12rpx;
    background: $uni-color-primary;
    color: $uni-text-color-inverse;
    border-radius: $uni-border-radius-base;
    font-size: 22rpx;
    vertical-align: middle;
  }

  .no-reservation-warning {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 107, 107, 0.1);
    border: 1rpx solid rgba(255, 107, 107, 0.3);
    border-radius: $uni-border-radius-base;
    margin: 30rpx 0 20rpx 0;
    padding: 18rpx 30rpx;
    font-size: $uni-font-size-base;
    color: $uni-color-error;
    box-shadow: $charging-shadow-sm;
  }

  .warning-text {
    font-weight: 500;
  }

  // 图标样式类
  .warning-icon {
    color: $uni-color-error;
    margin-right: 8rpx;
  }

  .calendar-icon {
    color: $uni-color-primary;
    margin-right: 8rpx;
  }

  .camera-icon {
    color: $uni-text-color-disable;
  }

  .wallet-icon {
    color: $uni-text-color-inverse;
  }
</style>
