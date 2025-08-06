<template>
  <view class="container">
    <CommonNavBar title="完善头像昵称" :showBack="true" />
    <view class="content-card">
      <view class="avatar-section">
        <button open-type="chooseAvatar" @chooseavatar="onChooseAvatar" class="avatar-btn">
          <image
            v-if="avatarUrl"
            :src="avatarUrl"
            class="profile-avatar"
          />
          <image
            v-else
            src="/static/icons/person.svg"
            class="profile-avatar"
          />
        </button>
        <text class="avatar-tip">点击头像更换微信头像</text>
      </view>
      <view class="input-section">
        <view class="input-wrapper">
          <text class="input-icon">👤</text>
          <input
            v-model="nickName"
            class="nickname-input"
            placeholder="请输入昵称（如：2-201 黄老师）"
            maxlength="20"
          />
        </view>
        <text class="input-tip">昵称将用于身份识别，请填写真实信息</text>
      </view>
      <button class="save-btn" type="primary" @click="onSubmit">保存</button>
    </view>
  </view>
</template>

<script>
import CommonNavBar from '@/components/CommonNavBar.vue';
import { userAuth } from '@/utils/index';
import { syncUserProfile, uploadFile } from '@/api';
import { getAvatarUrl } from '@/utils';
import { baseUrl } from '@/config';

export default {
  components: { CommonNavBar },
  data() {
    return {
      avatarUrl: '',
      nickName: ''
    };
  },
  onLoad() {
    // 自动填充本地已保存的头像和昵称
    let userInfoRaw = uni.getStorageSync('userInfo');
    let userInfo;
    try {
      userInfo = typeof userInfoRaw === 'string' ? JSON.parse(userInfoRaw) : userInfoRaw;
    } catch (e) {
      userInfo = null;
    }
    if (userInfo) {
      // 展示头像时用 getAvatarUrl 拼接
      this.avatarUrl = getAvatarUrl(userInfo.user_avatar || userInfo.avatar || '');
      this.nickName = userInfo.user_name || userInfo.nickName || userInfo.name || '';
    }
  },
  methods: {
    async onChooseAvatar(e) {
      const tempFilePath = e.detail.avatarUrl;
      if (!tempFilePath) return;
      try {
        const res = await uploadFile(tempFilePath);
        // 只保存相对路径
        const url = res.data.url;
        this.avatarUrl = url;
      } catch (err) {
        uni.showToast({ title: '头像上传失败', icon: 'none' });
      }
    },
    async onSubmit() {
      if (!this.avatarUrl || !this.nickName) {
        uni.showToast({ title: '请完善信息', icon: 'none' });
        return;
      }
      try {
        await syncUserProfile({ avatarUrl: this.avatarUrl, nickName: this.nickName });
      } catch (e) {}
      // 本地保存
      const stored = userAuth.get();
      if (stored) {
        stored.userInfo.user_avatar = this.avatarUrl;
        stored.userInfo.user_name = this.nickName;
        userAuth.save(stored.token, stored.userInfo);
      } else {
        uni.setStorageSync('userInfo', JSON.stringify({ user_avatar: this.avatarUrl, user_name: this.nickName }));
      }
      uni.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => {
        uni.navigateBack();
      }, 1000);
    }
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f7f7f7;
}
.content-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 48rpx 32rpx 32rpx 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
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
.profile-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-tip {
  font-size: 24rpx;
  color: #888;
  margin-top: 8rpx;
}
.input-section {
  width: 100%;
  margin-bottom: 32rpx;
}
.input-wrapper {
  display: flex;
  align-items: center;
  background: #fafbfc;
  border: 1px solid #eee;
  border-radius: 8rpx;
  padding: 0 24rpx;
  height: 80rpx;
}
.input-icon {
  font-size: 32rpx;
  color: #FFA500;
  margin-right: 12rpx;
}
.nickname-input {
  flex: 1;
  font-size: 32rpx;
  color: #222;
  background: transparent;
  border: none;
  outline: none;
  height: 80rpx;
}
.input-tip {
  font-size: 22rpx;
  color: #bbb;
  margin-top: 8rpx;
  margin-left: 8rpx;
}
.save-btn {
  width: 100%;
  margin-top: 8rpx;
  background: linear-gradient(90deg, #FFA500 0%, #FFB733 100%);
  color: #fff;
  border-radius: 8rpx;
  font-size: 32rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: none;
  transition: background 0.2s;
}
.save-btn:active {
  background: #ffb733;
}
</style> 