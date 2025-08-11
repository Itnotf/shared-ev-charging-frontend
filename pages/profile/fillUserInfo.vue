<template>
  <view class="container">
    <PageHero
      title="完善资料"
      subtitle="设置头像与昵称，让其他用户认识你"
      :height="200"
      bgClass="gradient-purple"
    />

    <PageContent :overlapOffset="24">
      <HeroCard type="avatar" cardClass="avatar-card">
        <view class="avatar-section">
          <button open-type="chooseAvatar" @chooseavatar="onChooseAvatar" class="avatar-btn">
            <view class="avatar-container">
              <image
                v-if="avatarUrl || avatarLocalPath"
                :src="getDisplayAvatar()"
                class="profile-avatar"
              />
              <image v-else src="/static/icons/person.svg" class="profile-avatar" />
              <view class="avatar-overlay">
                <uni-icons type="camera" size="32" color="#fff" />
              </view>
            </view>
          </button>
          <text class="avatar-tip">点击头像更换微信头像</text>
        </view>
      </HeroCard>

      <HeroCard type="input" cardClass="input-card">
        <view class="input-section">
          <view class="input-wrapper">
            <uni-icons type="person" size="24" color="#FFA500" />
            <input
              v-model="nickName"
              class="nickname-input"
              placeholder="请输入昵称（如：2-201 黄老师）"
              maxlength="20"
              confirm-type="done"
              @confirm="onSubmit"
            />
          </view>
          <text class="input-tip">昵称将用于身份识别，请填写真实信息</text>
        </view>
      </HeroCard>

      <button class="save-btn" :disabled="!isFormValid" @click="onSubmit">
        <uni-icons v-if="!saving" type="checkmark" size="20" color="#fff" />
        <text>{{ saving ? '保存中...' : '保存' }}</text>
      </button>
    </PageContent>
  </view>
</template>

<script>
  import { userAuth } from '@/utils/index';
  import { syncUserProfile, uploadFile } from '@/api';
  import { getAvatarUrl } from '@/utils';
  import PageHero from '@/components/PageHero.vue';
  import PageContent from '@/components/PageContent.vue';
  import HeroCard from '@/components/HeroCard.vue';
  // import { baseUrl } from '@/config'; // 未使用，已注释

  export default {
    components: {
      PageHero,
      PageContent,
      HeroCard,
    },
    data() {
      return {
        avatarUrl: '', // 只存相对路径
        avatarLocalPath: '', // 本地临时路径，优先展示
        nickName: '',
        saving: false,
      };
    },
    computed: {
      isFormValid() {
        return this.avatarUrl && this.nickName.trim();
      },
    },
    onLoad() {
      const userInfoRaw = uni.getStorageSync('userInfo');
      let userInfo;
      try {
        userInfo = typeof userInfoRaw === 'string' ? JSON.parse(userInfoRaw) : userInfoRaw;
      } catch (e) {
        userInfo = null;
      }
      if (userInfo) {
        this.avatarUrl = userInfo.user_avatar || userInfo.avatar || '';
        this.avatarLocalPath = '';
        this.nickName = userInfo.user_name || userInfo.nickName || userInfo.name || '';
      }
    },
    methods: {
      async onChooseAvatar(e) {
        const tempFilePath = e.detail.avatarUrl;
        if (!tempFilePath) return;
        try { if (uni.vibrateShort) uni.vibrateShort({ type: 'light' }); } catch (_) {}
        try {
          // 先本地显示
          this.avatarLocalPath = tempFilePath;
          // 上传到服务器
          const res = await uploadFile(tempFilePath);
          const url = res.data.url; // 相对路径
          // 缓存本地路径
          const cacheKey = 'img_cache_' + url;
          uni.setStorageSync(cacheKey, tempFilePath);
          // 保存到后端和本地的都是相对路径
          this.avatarUrl = url;
        } catch (err) {
          uni.showToast({ title: '头像上传失败', icon: 'none' });
        }
      },
      // 展示头像时优先用本地路径
      getDisplayAvatar() {
        if (this.avatarLocalPath) return this.avatarLocalPath;
        return getAvatarUrl(this.avatarUrl);
      },
      async onSubmit() {
        if (!this.avatarUrl || !this.nickName) {
          uni.showToast({ title: '请完善信息', icon: 'none' });
          return;
        }
        if (this.saving) return;
        this.saving = true;
        try {
          try { if (uni.vibrateShort) uni.vibrateShort({ type: 'light' }); } catch (_) {}
          await syncUserProfile({ avatarUrl: this.avatarUrl, nickName: this.nickName });

          // 本地保存
          const stored = userAuth.get();
          if (stored) {
            stored.userInfo.user_avatar = this.avatarUrl;
            stored.userInfo.user_name = this.nickName;
            userAuth.save(stored.token, stored.userInfo);
          } else {
            uni.setStorageSync(
              'userInfo',
              JSON.stringify({ user_avatar: this.avatarUrl, user_name: this.nickName })
            );
          }

          uni.showToast({ title: '保存成功', icon: 'success' });
          setTimeout(() => {
            uni.navigateBack();
          }, 1000);
        } catch (e) {
          // 网络或服务异常
          uni.showToast({ title: '保存失败', icon: 'none' });
        } finally {
          this.saving = false;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '@/uni.scss';
  
  .container {
    min-height: 100vh;
    background: $bg;
  }

  .avatar-card {
    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20rpx 0;
    }
    
    .avatar-btn {
      background: none !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0;
      margin-bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .avatar-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .profile-avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      object-fit: cover;
      border: 3rpx solid $uni-color-primary;
      box-shadow: 0 4rpx 16rpx rgba(255, 165, 0, 0.2);
    }
    
    .avatar-overlay {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 40rpx;
      height: 40rpx;
      background: $uni-color-primary;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3rpx solid #fff;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
    }
    
    .avatar-tip {
      font-size: 24rpx;
      color: $text-sub;
      margin-top: 16rpx;
      text-align: center;
    }
  }

  .input-card {
    .input-section {
      width: 100%;
    }
    
    .input-wrapper {
      display: flex;
      align-items: center;
      background: #fafbfc;
      border: 2rpx solid transparent;
      border-radius: 16rpx;
      padding: 0 24rpx;
      height: 88rpx;
      transition: all 0.3s ease;
      
      &:focus-within {
        background: #fff;
        border-color: $uni-color-primary;
        box-shadow: 0 0 0 6rpx rgba(255, 165, 0, 0.1);
      }
    }
    
    .nickname-input {
      flex: 1;
      font-size: 32rpx;
      color: $text-main;
      background: transparent;
      border: none;
      outline: none;
      height: 88rpx;
      margin-left: 16rpx;
      
      &::placeholder {
        color: $text-sub;
      }
    }
    
    .input-tip {
      font-size: 22rpx;
      color: $text-sub;
      margin-top: 12rpx;
      margin-left: 8rpx;
      line-height: 1.4;
    }
  }

  .save-btn {
    width: 100%;
    margin-top: 32rpx;
    background: $charging-gradient-primary;
    color: #fff;
    border-radius: 20rpx;
    font-size: 32rpx;
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    border: none;
    box-shadow: $charging-shadow-sm;
    transition: all 0.3s ease;
    
    &:disabled {
      background: $uni-bg-color-hover;
      color: $uni-text-color-disable;
      box-shadow: none;
    }
    
    &:not(:disabled):active {
      transform: scale(0.97);
      box-shadow: $charging-shadow-md;
    }
  }
</style>
