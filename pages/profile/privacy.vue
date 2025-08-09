<template>
  <view class="container">
    <CommonNavBar title="隐私政策" :showBack="true" />

    <!-- 内容区域 -->
    <view class="content">
      <!-- 政策标题 -->
      <view class="privacy-title">澜充小站隐私政策</view>
      <view class="privacy-date">更新日期：2025年07月18日</view>

      <!-- 政策内容 -->
      <view class="privacy-content">
        <view class="section">
          <view class="section-title">1. 引言</view>
          <view class="section-content">
            <view class="paragraph"
              >澜充小站（以下简称"我们"）非常重视用户隐私保护，并严格遵守相关法律法规。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息，以及您享有的相关权利。请您在使用我们的服务前，仔细阅读并了解本隐私政策。</view
            >
          </view>
        </view>

        <view class="section">
          <view class="section-title">2. 信息收集</view>
          <view class="section-content">
            <view class="paragraph">2.1 为了向您提供澜充小站服务，我们可能收集以下信息：</view>
            <view class="paragraph"
              >（1）账号信息：包括您注册和使用小程序时提供的手机号码、微信账号等。</view
            >
            <view class="paragraph">（2）设备信息：设备型号、操作系统、唯一设备标识符等信息。</view>
            <view class="paragraph"
              >（3）位置信息：在您同意的情况下，我们可能收集您的位置信息。</view
            >
            <view class="paragraph">（4）使用记录：包括您的预约记录、充电记录等服务使用记录。</view>
            <view class="paragraph">（5）其他信息：您在使用我们的服务过程中提供的其他信息。</view>
          </view>
        </view>

        <view class="section">
          <view class="section-title">3. 信息使用</view>
          <view class="section-content">
            <view class="paragraph">3.1 我们可能将收集的信息用于以下目的：</view>
            <view class="paragraph">（1）提供、维护和改进我们的服务。</view>
            <view class="paragraph">（2）进行用户认证，确保账号安全。</view>
            <view class="paragraph">（3）处理您的预约、记录和支付请求。</view>
            <view class="paragraph">（4）向您推送服务通知和相关信息。</view>
            <view class="paragraph">（5）进行数据分析，以优化我们的服务。</view>
            <view class="paragraph">3.2 我们承诺不会将您的个人信息用于与服务无关的其他用途。</view>
          </view>
        </view>

        <view class="section">
          <view class="section-title">4. 信息共享</view>
          <view class="section-content">
            <view class="paragraph">4.1 我们不会向第三方出售、出租或交易您的个人信息。</view>
            <view class="paragraph">4.2 以下情况下，我们可能会共享您的个人信息：</view>
            <view class="paragraph">（1）在获得您的明确同意后。</view>
            <view class="paragraph">（2）与我们的关联公司共享，用于提供服务或进行数据处理。</view>
            <view class="paragraph">（3）根据法律法规要求或政府机关的强制命令。</view>
          </view>
        </view>

        <view class="section">
          <view class="section-title">5. 信息存储和保护</view>
          <view class="section-content">
            <view class="paragraph"
              >5.1 我们将采取合理的安全措施保护您的个人信息，防止未经授权的访问、使用或泄露。</view
            >
            <view class="paragraph"
              >5.2
              您的个人信息将保存在中国大陆的服务器上，并在提供服务所必需的期限内予以保留。</view
            >
          </view>
        </view>

        <view class="section">
          <view class="section-title">6. 您的权利</view>
          <view class="section-content">
            <view class="paragraph"
              >6.1 您有权访问、更正、删除您的个人信息，以及撤回您的授权同意。</view
            >
            <view class="paragraph">6.2 如您需要行使上述权利，可通过本小程序的客服联系我们。</view>
          </view>
        </view>

        <view class="section">
          <view class="section-title">7. 隐私政策变更</view>
          <view class="section-content">
            <view class="paragraph"
              >7.1 我们可能会适时更新本隐私政策，更新后的政策将在小程序内公布。</view
            >
            <view class="paragraph">7.2 对于重大变更，我们将通过显著方式通知您。</view>
            <view class="paragraph"
              >7.3 若您继续使用我们的服务，即表示您同意受更新后的隐私政策约束。</view
            >
          </view>
        </view>

        <view class="section">
          <view class="section-title">8. 联系我们</view>
          <view class="section-content">
            <view class="paragraph"
              >如您对本隐私政策有任何疑问或意见，可通过以下方式联系我们：</view
            >
            <view class="paragraph">电子邮箱：privacy@charging.example.com</view>
            <view class="paragraph">电话：400-123-4567</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import CommonNavBar from '@/components/CommonNavBar.vue';
  export default {
    data() {
      return {};
    },
    components: { CommonNavBar },
    methods: {
      // 返回上一页
      navigateBack() {
        uni.navigateBack();
      },
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

  .privacy-title {
    font-size: $uni-font-size-xl;
    font-weight: bold;
    color: $uni-text-color;
    text-align: center;
    margin-bottom: 10rpx;
  }

  .privacy-date {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
    text-align: center;
    margin-bottom: 40rpx;
  }

  .privacy-content {
    padding: $uni-spacing-row-base;
    background-color: $uni-bg-color;
    border-radius: $uni-border-radius-lg;
    box-shadow: $charging-shadow-sm;
  }

  .section {
    margin-bottom: $uni-spacing-row-base;
  }

  .section:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: $uni-font-size-lg;
    font-weight: bold;
    color: $uni-text-color;
    margin-bottom: $uni-spacing-row-base;
  }

  .paragraph {
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
    line-height: 1.6;
    margin-bottom: 16rpx;
    text-indent: 2em;
  }

  .paragraph:last-child {
    margin-bottom: 0;
  }
</style>
