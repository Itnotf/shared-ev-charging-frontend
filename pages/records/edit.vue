<template>
  <view class="container">

    <!-- 内容区域 -->
    <view class="content">
      <!-- 原记录信息展示 -->
      <view class="original-info-card">
        <view class="card-header">
          <text class="card-title">原记录信息</text>
        </view>
        <view class="original-info">
          <view class="info-row">
            <text class="info-label">日期：</text>
            <text class="info-value">{{ formatDate(record.date, 'YYYY年MM月DD日') }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">时段：</text>
            <text class="info-value">{{ getTimeslotLabel(record.timeslot) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">原度数：</text>
            <text class="info-value">{{ record.kwh }} kWh</text>
          </view>
        </view>
      </view>

      <!-- 图片上传 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">充电截图</text>
          <text class="card-subtitle">点击重新上传</text>
        </view>
        <view class="upload-area" @click="chooseImage">
          <block v-if="imageUrl">
            <image
              v-if="imageUrl"
              :src="getRecordImageUrl(imageUrl)"
              mode="aspectFill"
              class="upload-image"
            ></image>
            <view class="image-overlay">
              <text class="overlay-text">点击更换图片</text>
            </view>
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
      <button class="submit-btn" @click="updateRecord" :disabled="!kwh || parseFloat(kwh) <= 0 || !selectedLicensePlate">
        <uni-icons type="checkmarkempty" size="20" class="submit-icon"></uni-icons>
        <text class="btn-text">保存修改</text>
      </button>
    </view>
  </view>
</template>

<script>
  import { getRecordDetail, updateRecord } from '@/api/record';
  import { formatDate, compressImage, getRecordImageUrl, getPayload } from '@/utils';
  import { TIMESLOTS } from '@/config';
  import { uploadFile } from '@/api/index';

  import { getUserPrice } from '@/api/auth';
  import LicensePlateSelector from '@/components/LicensePlateSelector.vue';

  export default {
    components: {
      LicensePlateSelector,
    },
    data() {
      return {
        TIMESLOTS,
        userPrice: 0,
        recordId: '',
        record: {
          id: '',
          date: '',
          timeslot: '',
          kwh: 0,
          amount: 0,
          remark: '',
          image_url: '',
        },
        imageUrl: '',
        tempFilePath: '',
        kwh: '',
        cost: '0.00',
        remark: '',
        selectedLicensePlate: null,
        loading: false,
      };
    },
    onLoad(options) {
      if (options && options.id) {
        this.recordId = options.id;
        this.loadRecordDetail();
      }
    },
    methods: {
      onLicensePlateChange(licensePlate) {
        this.selectedLicensePlate = licensePlate;
      },
      async loadRecordDetail() {
        this.loading = true;
        try {
          const res = await getRecordDetail(this.recordId);
          const data = getPayload(res);
          if (data) {
            this.record = data;
            // 加载用户电价后再赋值 kwh 并计算金额
            await this.loadUserPrice();
            this.kwh = String(this.record.kwh);
            this.remark = this.record.remark || '';
            this.imageUrl = getRecordImageUrl(this.record.image_url || '');
            this.selectedLicensePlate = this.record.license_plate || null;
            this.calculateCost();
          }
        } catch (error) {
          uni.showToast({ title: '加载记录详情失败', icon: 'none' });
        } finally {
          this.loading = false;
        }
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

      async chooseImage() {
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

      calculateCost() {
        this.cost = this.kwh
          ? (parseFloat(this.kwh) * parseFloat(this.userPrice)).toFixed(2)
          : '0.00';
      },

      async updateRecord() {
        if (!this.kwh || parseFloat(this.kwh) <= 0) {
          uni.showToast({ title: '请输入有效的充电度数', icon: 'none' });
          return;
        }

        if (!this.selectedLicensePlate) {
          uni.showToast({ title: '请选择车牌号', icon: 'none' });
          return;
        }

        uni.showLoading({ title: '保存中' });
        try {
          let imageUrl = this.record.image_url; // 默认使用原图片

          // 如果选择了新图片，则上传
          if (this.tempFilePath) {
            // 开始上传新图片
            const uploadRes = await uploadFile(this.tempFilePath);
            // 图片上传结果返回
            if (uploadRes && uploadRes.data && uploadRes.data.url) {
              imageUrl = uploadRes.data.url;
            }
          }

          const updateData = {
            kwh: parseFloat(this.kwh),
            image_url: imageUrl,
            remark: this.remark,
            license_plate_id: this.selectedLicensePlate.id,
          };

          // 提交更新数据调试
          await updateRecord(this.recordId, updateData);
          // 更新成功

          uni.showToast({ title: '保存成功', icon: 'success' });

          // 返回详情页面
          setTimeout(() => {
            uni.navigateBack();
          }, 800);
        } catch (error) {
          console.error('[日志] 更新失败:', error);
          uni.showToast({ title: '保存失败', icon: 'none' });
        } finally {
          uni.hideLoading();
        }
      },

      formatDate(date, format) {
        return formatDate(date, format);
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

  .original-info-card {
    background: $white;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    padding: 24rpx 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
    border-left: 4rpx solid $uni-color-primary;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }

  .card-title {
    font-size: 28rpx;
    font-weight: bold;
    color: $text-main;
  }

  .card-subtitle {
    font-size: 24rpx;
    color: $text-sub;
  }

  .original-info {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .info-row {
    display: flex;
    align-items: center;
  }

  .info-label {
    font-size: 26rpx;
    color: $text-sub;
    min-width: 120rpx;
  }

  .info-value {
    font-size: 26rpx;
    color: $text-main;
    font-weight: 500;
  }

  .card {
    background: $white;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    padding: 24rpx 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
  }

  .upload-area {
    height: 240rpx;
    border: 2rpx dashed $uni-border-color;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: $uni-bg-color-grey;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .upload-image {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .upload-area:active .image-overlay {
    opacity: 1;
  }

  .overlay-text {
    color: $uni-text-color-inverse;
    font-size: $uni-font-size-sm;
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
    color: $uni-text-color;
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
    background: linear-gradient(90deg, $uni-color-primary 0%, #ffb84d 100%);
    color: $uni-text-color-inverse;
    border: none;
    border-radius: $uni-border-radius-base;
    font-size: $uni-font-size-lg;
    font-weight: bold;
    padding: $uni-spacing-col-base 0;
    margin-top: $uni-spacing-col-base;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: $charging-shadow-sm;
    transition: opacity 0.2s;
  }

  .submit-btn:active {
    opacity: 0.8;
  }

  .submit-btn[disabled] {
    background: $uni-text-color-disable;
    opacity: 0.6;
  }

  .btn-text {
    margin-left: 10rpx;
  }

  // 图标样式类
  .camera-icon {
    color: $uni-text-color-disable;
  }

  .submit-icon {
    color: $uni-text-color-inverse;
  }
</style>
