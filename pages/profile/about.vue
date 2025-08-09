<template>
  <view class="container">

    <!-- 内容区域 -->
    <view class="content">
      <!-- 应用信息 -->
      <view class="app-info">
        <image src="/static/logo.png" mode="aspectFit" class="app-logo"></image>
        <text class="app-name">澜充小站</text>
        <text class="app-version">v1.0.0</text>
      </view>

      <!-- 功能介绍 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">功能介绍</text>
        </view>
        <view class="feature-list">
          <view class="feature-item">
            <uni-icons type="calendar" size="24" class="icon-primary"></uni-icons>
            <text class="feature-text">预约充电，方便管理充电时间</text>
          </view>
          <view class="feature-item">
            <uni-icons type="camera" size="24" class="icon-primary"></uni-icons>
            <text class="feature-text">上传充电记录，自动计算费用</text>
          </view>
          <view class="feature-item">
            <uni-icons type="list" size="24" class="icon-primary"></uni-icons>
            <text class="feature-text">对账中心，明细透明可追溯</text>
          </view>
        </view>
      </view>

      <!-- 开发团队 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">开发团队</text>
        </view>
        <view class="team-info">
          <text class="team-name">智慧充电团队</text>
          <text class="team-desc">致力于为用户提供便捷的充电管理解决方案</text>
        </view>
      </view>

      <!-- 联系我们 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">联系我们</text>
        </view>
        <view class="contact-list">
          <view class="contact-item" @click="copyContact('email')">
            <view class="contact-label">邮箱：</view>
            <view class="contact-value">support@charging.example.com</view>
            <uni-icons type="copy" size="16" class="icon-muted"></uni-icons>
          </view>
          <view class="contact-item" @click="copyContact('phone')">
            <view class="contact-label">电话：</view>
            <view class="contact-value">400-123-4567</view>
            <uni-icons type="copy" size="16" class="icon-muted"></uni-icons>
          </view>
          <view class="contact-item" @click="copyContact('wechat')">
            <view class="contact-label">微信：</view>
            <view class="contact-value">ChargingSupport</view>
            <uni-icons type="copy" size="16" class="icon-muted"></uni-icons>
          </view>
        </view>
      </view>

      <!-- 底部链接 -->
      <view class="footer-links">
        <text class="link" @click="goTo('/pages/profile/agreement')">用户协议</text>
        <text class="divider">|</text>
        <text class="link" @click="goTo('/pages/profile/privacy')">隐私政策</text>
      </view>
    </view>
  </view>
</template>

<script>

  import { goTo } from '@/utils';
  export default {
    data() {
      return {};
    },

    methods: {
      // 复制联系方式
      copyContact(type) {
        let content = '';
        switch (type) {
          case 'email':
            content = 'support@charging.example.com';
            break;
          case 'phone':
            content = '400-123-4567';
            break;
          case 'wechat':
            content = 'ChargingSupport';
            break;
        }
        uni.setClipboardData({
          data: content,
          success: () => {
            uni.showToast({
              title: '已复制到剪贴板',
              icon: 'none',
            });
          },
        });
      },
      goTo,
    },
  };
</script>

<style lang="scss">
  @import '@/uni.scss';

  .container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: $uni-bg-color-grey;
  }

  .content {
    flex: 1;
    padding: $uni-spacing-row-base;
    overflow-y: auto;
  }

  .app-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 0;
  }

  .app-logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 20rpx;
  }

  .app-name {
    font-size: $uni-font-size-xl;
    font-weight: bold;
    color: $uni-text-color;
    margin-bottom: 10rpx;
  }

  .app-version {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
  }

  .card {
    background-color: $uni-bg-color;
    border-radius: $uni-border-radius-lg;
    margin-bottom: $uni-spacing-row-base;
    padding: $uni-spacing-row-base;
    box-shadow: $charging-shadow-sm;
  }

  .card-header {
    margin-bottom: $uni-spacing-row-base;
  }

  .card-title {
    font-size: $uni-font-size-lg;
    font-weight: bold;
    color: $uni-text-color;
  }

  .feature-list {
    padding: 10rpx 0;
  }

  .feature-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
  }

  .icon-primary {
    color: $primary;
  }

  .icon-muted {
    color: $uni-text-color-grey;
  }

  .feature-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
    margin-left: $uni-spacing-row-base;
  }

  .team-info {
    padding: 10rpx 0;
  }

  .team-name {
    font-size: 30rpx;
    color: $uni-text-color;
    margin-bottom: 10rpx;
    display: block;
  }

  .team-desc {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
    line-height: 1.5;
  }

  .contact-list {
    padding: 10rpx 0;
  }

  .contact-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid $uni-border-color;
  }

  .contact-item:last-child {
    border-bottom: none;
  }

  .contact-label {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
    width: 120rpx;
  }

  .contact-value {
    flex: 1;
    font-size: $uni-font-size-base;
    color: $uni-text-color;
  }

  .footer-links {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40rpx 0;
  }

  .link {
    font-size: $uni-font-size-sm;
    color: $primary;
  }

  .divider {
    margin: 0 20rpx;
    color: $uni-border-color;
  }
</style>
