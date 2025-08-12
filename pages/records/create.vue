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
        <view class="reservation-row">
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
        <view class="license-plate-row" v-if="reservationLicensePlate">
          <uni-icons type="car" size="18" :color="PRIMARY_COLOR" class="car-icon" />
          <text class="license-plate-text">{{ reservationLicensePlate }}</text>
        </view>
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
        :disabled="!reservationId || !kwh || parseFloat(kwh) <= 0 || !reservationLicensePlateId"
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
    goToAuth,
    compressImage,
    getPayload,
  } from '@/utils';
  import { TIMESLOTS, PRIMARY_COLOR } from '@/config';
  import { uploadFile } from '@/api/index';

  import { getCurrentReservationStatus } from '@/api/reservation';
  import { getUserPrice } from '@/api/auth';

  export default {
    components: {
      // 移除 LicensePlateSelector
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
        recentRecords: [],
        reservationId: '',
        reservationDate: '',
        reservationTimeslot: '',
        reservationLicensePlate: '', // 新增：存储预约车牌号
        reservationLicensePlateId: '', // 新增：存储预约车牌号ID
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

        if (!this.reservationLicensePlateId) {
          uni.showToast({ title: '预约车牌号信息缺失', icon: 'none' });
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
            license_plate_id: this.reservationLicensePlateId, // 使用预约车牌号ID
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
          this.reservationId = '';
          this.reservationDate = '';
          this.reservationTimeslot = '';
          this.reservationLicensePlate = ''; // 清空预约车牌号
          this.reservationLicensePlateId = ''; // 清空预约车牌号ID
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
                if (r.confirm) goToAuth('/pages/reservations/index');
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
            // 获取车牌号信息
            console.log('lastReservation 数据:', data.lastReservation);
            console.log('lastReservation.license_plate:', data.lastReservation.license_plate);
            if (data.lastReservation.license_plate) {
              this.reservationLicensePlate = data.lastReservation.license_plate.plate_number;
              this.reservationLicensePlateId = data.lastReservation.license_plate.id;
              console.log('设置车牌号:', this.reservationLicensePlate, 'ID:', this.reservationLicensePlateId);
            } else if (data.lastReservation.license_plate_id) {
              // 如果只有ID，尝试获取车牌号信息
              console.log('只有车牌号ID:', data.lastReservation.license_plate_id);
              this.reservationLicensePlateId = data.lastReservation.license_plate_id;
              // 这里可以调用API获取车牌号信息，暂时显示ID
              this.reservationLicensePlate = `车牌号ID: ${data.lastReservation.license_plate_id}`;
            } else {
              this.reservationLicensePlate = '';
              this.reservationLicensePlateId = '';
              console.log('lastReservation 中没有车牌号信息');
            }
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
                  // 获取车牌号信息
                  if (data.currentReservation.license_plate) {
                    this.reservationLicensePlate = data.currentReservation.license_plate.plate_number;
                    this.reservationLicensePlateId = data.currentReservation.license_plate.id;
                  } else {
                    this.reservationLicensePlate = '';
                    this.reservationLicensePlateId = '';
                  }
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
              if (r.confirm) goToAuth('/pages/reservations/index');
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
    @extend .btn;
    width: 100%;
    margin-top: $uni-spacing-col-base;
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
    
    // 禁用状态
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
      background-color: $uni-text-color-disable;
      
      &:hover {
        transform: none;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
      }
    }
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
    flex-direction: column;
    align-items: center;
    background: rgba(255, 165, 0, 0.1);
    border-radius: $uni-border-radius-base;
    margin: 30rpx 0 20rpx 0;
    padding: 18rpx 30rpx;
    font-size: 30rpx;
    color: $uni-color-primary;
    box-shadow: $charging-shadow-sm;
  }

  .reservation-row {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;
    flex-wrap: wrap;
    justify-content: center;
  }

  .supplement-label {
    font-size: 28rpx;
    color: $uni-text-color;
    margin-right: 10rpx;
  }

  .supplement-date {
    font-size: 28rpx;
    color: $uni-color-primary;
    font-weight: bold;
    margin-right: 10rpx;
  }

  .supplement-timeslot {
    font-size: 28rpx;
    color: $uni-color-primary;
    font-weight: bold;
  }

  .license-plate-row {
    display: flex;
    align-items: center;
    background: transparent;
    border-radius: 16rpx;
    padding: 8rpx 0;
    margin-top: 8rpx;
  }

  .car-icon {
    margin-right: 8rpx;
    font-size: 16rpx;
    color: $uni-color-success;
  }

  .license-plate-text {
    display: inline-block;
    padding: 6rpx 16rpx;
    border-radius: 12rpx;
    background: linear-gradient(135deg, $plate-ev-gradient-start 0%, $plate-ev-gradient-end 100%);
    color: #111;
    font-weight: 700;
    letter-spacing: 2rpx;
    border: 2rpx solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1) inset;
    font-size: 28rpx;
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
