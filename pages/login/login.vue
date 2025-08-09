<template>
  <view class="container">
    <!-- 添加返回按钮 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <uni-icons type="left" size="20"></uni-icons>
        <text class="nav-text">返回</text>
      </view>
      <text class="nav-title">登录</text>
      <view class="nav-right"></view>
    </view>

    <view class="center-area">
      <view class="logo-area">
        <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
        <text class="app-name">澜充小站</text>
      </view>

      <!-- 添加说明文字 -->
      <view class="login-desc">
        <text class="desc-text">登录后可享受完整的充电共享服务</text>
        <text class="desc-sub">包括预约充电、上传记录、查看统计等功能</text>
      </view>

      <button
        class="login-btn"
        open-type="login"
        @tap="onWeixinLogin"
        :loading="loginLoading"
        :disabled="loginLoading"
      >
        <uni-icons type="weixin" size="24"></uni-icons>
        <text>微信一键登录</text>
      </button>

      <!-- 添加跳过登录按钮 -->
      <button class="skip-btn" @click="skipLogin">
        <text>暂不登录，先体验</text>
      </button>

      <view class="agreement-area">
        <view class="agreement">
          <checkbox-group @change="onAgreeChange">
            <checkbox value="agree" :color="PRIMARY_COLOR" />
          </checkbox-group>
          <text class="agreement-text">
            登录即表示同意
            <text class="link" @click="goTo('/pages/profile/agreement')">《用户协议》</text>
            和
            <text class="link" @click="goTo('/pages/profile/privacy')">《隐私政策》</text>
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { wxLogin } from '@/api/auth';
  import { userAuth, goTo, getPayload } from '@/utils';
  import { PRIMARY_COLOR } from '@/config';

  export default {
    data() {
      return {
        agreeProtocol: false,
        loginLoading: false,
      };
    },
    onLoad() {
      const token = uni.getStorageSync('token');
      if (token) {
        goTo('/pages/index/index');
      }
    },
    methods: {
      goTo,
      goBack() {
        // 直接跳转到首页
        uni.switchTab({
          url: '/pages/index/index',
        });
      },
      skipLogin() {
        uni.showModal({
          title: '提示',
          content: '您可以选择暂不登录，但部分功能可能无法使用。确定要跳过登录吗？',
          confirmText: '确定跳过',
          cancelText: '继续登录',
          success: (res) => {
            if (res.confirm) {
              // 直接跳转到首页，而不是返回
              uni.switchTab({
                url: '/pages/index/index',
              });
            }
          },
        });
      },
      onAgreeChange(e) {
        this.agreeProtocol = e.detail.value.includes('agree');
      },
      async onWeixinLogin() {
        if (!this.checkAgreement()) return;
        if (this.loginLoading) return;
        this.loginLoading = true;
        uni.showLoading({ title: '登录中' });
        try {
          // 1. 微信登录凭证
          const loginRes = await new Promise((resolve, reject) => {
            uni.login({
              provider: 'weixin',
              success: (res) => {
                // uni.login 成功
                resolve(res);
              },
              fail: (err) => {
                console.error('【登录调试】uni.login 失败:', err);
                reject(err);
              },
            });
          });
          if (!loginRes.code) {
            console.error('【登录调试】未获取到微信登录凭证:', loginRes);
            throw new Error('未获取到微信登录凭证');
          }
          // 2. 调用后端登录接口
          const authRes = await wxLogin({ code: loginRes.code });
          // wxLogin 返回成功
          const payload = getPayload(authRes);
          if (!payload || !payload.token || (!payload.user_info && !payload.data)) {
            console.error('【登录调试】wxLogin 返回数据不完整:', authRes);
            throw { code: 'NO_TOKEN' };
          }
          const token = payload.token;
          const userInfo = payload.data || payload.user_info;
          userAuth.save(token, userInfo);
          goTo('/pages/index/index');
        } catch (error) {
          console.error('【登录调试】catch 捕获到异常:', error);
          let msg = '登录失败，请重试';
          if (error && error.code) {
            if (error.code === 'NO_TOKEN') msg = '登录失败，未获取到用户信息';
          }
          uni.showToast({ title: msg, icon: 'none' });
        } finally {
          this.loginLoading = false;
          uni.hideLoading();
        }
      },
      checkAgreement() {
        if (!this.agreeProtocol) {
          uni.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' });
          return false;
        }
        return true;
      },
    },
    computed: {
      PRIMARY_COLOR() {
        return PRIMARY_COLOR;
      },
    },
  };
</script>

<style lang="scss">
  @import '@/uni.scss';

  .container {
    @extend .page-bg;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    box-sizing: border-box;
    align-items: center;
    padding: 0 40rpx;
  }

  /* 导航栏样式 */
  .nav-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 88rpx;
    background: $uni-bg-color;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    z-index: 1000;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    color: $uni-text-color;
  }

  .nav-left {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: $uni-text-color;
  }

  .nav-text {
    font-size: 28rpx;
    color: $uni-text-color;
    margin-left: 10rpx;
  }

  .nav-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $uni-text-color;
  }

  .nav-right {
    width: 80rpx;
  }

  .center-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 120rpx;
    justify-content: center;
    flex: 1;
  }

  .logo-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 60rpx;
  }

  .logo {
    width: 180rpx;
    height: 180rpx;
    margin-bottom: 30rpx;
  }

  .app-name {
    font-size: 42rpx;
    font-weight: bold;
    color: $primary;
    margin-bottom: 20rpx;
  }

  /* 登录说明区域 */
  .login-desc {
    text-align: center;
    margin-bottom: 60rpx;
  }

  .desc-text {
    display: block;
    font-size: 28rpx;
    color: $uni-text-color;
    margin-bottom: 10rpx;
  }

  .desc-sub {
    display: block;
    font-size: 24rpx;
    color: $uni-text-color-grey;
  }

  .login-btn {
    @extend .btn;
    width: 100%;
    margin-bottom: 30rpx;

    /* 使按钮内图标与文字同为白色 */
    :deep(.uni-icons) {
      color: $white !important;
    }
  }

  /* 跳过登录按钮 */
  .skip-btn {
    width: 100%;
    height: 80rpx;
    background: transparent;
    border: 2rpx solid $uni-border-color;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40rpx;
    font-size: 28rpx;
    color: $uni-text-color;
  }

  .skip-btn:active {
    background: $uni-bg-color-grey;
  }

  .agreement-area {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .agreement {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: $text-sub;
  }

  .agreement-text {
    margin-left: 10rpx;
  }

  .link {
    color: $primary;
  }
</style>
