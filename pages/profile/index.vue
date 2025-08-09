<template>
  <view class="container">
    <!-- 导航栏 -->
    <CommonNavBar title="个人中心" :showBack="false" />

    <!-- 头像卡片 -->
    <view class="content">
      <view class="profile-header" @click="goTo('/pages/profile/fillUserInfo')">
        <image
          v-if="userInfo.avatar && userInfo.avatar !== '👤'"
          :src="getAvatarUrl(userInfo.avatar)"
          class="profile-avatar"
        />
        <image v-else src="/static/icons/person.svg" class="profile-avatar" />
        <view class="profile-info">
          <text class="profile-nickname">{{ userInfo.name || '未登录' }}</text>
          <text class="profile-phone">{{ userInfo.phone || '' }}</text>
        </view>
      </view>
      <!-- 分组1 -->
      <!-- <BaseGroup>
				<BaseGroupItem
					icon="notification"
					title="通知设置"
					@click="goTo('/pages/profile/notification')"
					rightIcon="right"
				/>
			</BaseGroup> -->
      <!-- 分组2 -->
      <BaseGroup>
        <BaseGroupItem
          icon="lock"
          title="隐私政策"
          @click="goTo('/pages/profile/privacy')"
          rightIcon="right"
        />
        <BaseGroupItem
          icon="compose"
          title="用户协议"
          @click="goTo('/pages/profile/agreement')"
          rightIcon="right"
        />
        <BaseGroupItem
          icon="info"
          title="关于小程序"
          @click="goTo('/pages/profile/about')"
          rightIcon="right"
        />
      </BaseGroup>
      <BaseGroup v-if="isAdmin">
        <BaseGroupItem
          icon="group"
          title="用户管理"
          @click="goTo('/pages/profile/userManage')"
          rightIcon="right"
        />
        <BaseGroupItem
          icon="list"
          title="月度对账"
          @click="goTo('/pages/profile/monthlyReport')"
          rightIcon="right"
        />
      </BaseGroup>
      <button v-if="userInfo.name !== '未登录'" class="profile-logout-btn" @click="logout">
        退出登录
      </button>
      <button v-else class="profile-login-btn" @click="goToLogin">立即登录</button>
    </view>
  </view>
</template>

<script>
  import { getUserProfile } from '@/api/auth';
  import CommonNavBar from '@/components/CommonNavBar.vue';
  import BaseGroup from '@/components/BaseGroup.vue';
  import BaseGroupItem from '@/components/BaseGroupItem.vue';
  import { goTo, getAvatarUrl, getPayload } from '@/utils';

  export default {
    components: { CommonNavBar, BaseGroup, BaseGroupItem },
    data() {
      return {
        userInfo: {
          name: '',
          phone: '',
          avatar: '',
        },
        isAdmin: false,
      };
    },
    onShow() {
      this.getUserInfo();
    },
    methods: {
      goTo, // 注册 goTo 方法，指向 util 中的 goTo
      async getUserInfo() {
        const token = uni.getStorageSync('token');
        if (!token) {
          // 未登录时显示默认信息，不强制跳转
          this.userInfo = {
            name: '未登录',
            phone: '',
            avatar: '',
          };
          this.isAdmin = false;
          return;
        }

        // 先尝试从缓存获取用户信息
        const cachedUserInfo = uni.getStorageSync('userInfo');
        if (cachedUserInfo) {
          try {
            this.userInfo = JSON.parse(cachedUserInfo);
          } catch (e) {
            // 缓存用户信息解析失败，重新获取
          }
        }

        try {
          const res = await getUserProfile();
          const data = getPayload(res);
          if (data) {
            const newUserInfo = {
              name: data.user_name,
              phone: data.phone,
              avatar: data.user_avatar || '',
            };

            // 检查头像是否有更新，有更新则清除旧缓存
            if (
              newUserInfo.avatar !== this.userInfo.avatar &&
              this.userInfo.avatar &&
              this.userInfo.avatar !== '👤'
            ) {
              this.clearAvatarCache();
            }

            this.userInfo = newUserInfo;
            uni.setStorageSync('userInfo', JSON.stringify(this.userInfo));

            // 缓存新头像
            if (newUserInfo.avatar && newUserInfo.avatar !== '👤') {
              this.cacheAvatar();
            }
            // 设置isAdmin
            this.isAdmin = data.role === 'admin';
          }
        } catch (error) {
          uni.showToast({ title: '获取用户信息失败', icon: 'none' });
          this.isAdmin = false;
        }
      },

      // 缓存头像
      cacheAvatar() {
        const avatarUrl = this.userInfo.avatar;
        if (!avatarUrl || avatarUrl === '👤') return;

        const avatarKey = this.getAvatarKey();

        // 检查是否已经缓存过
        if (uni.getStorageSync(avatarKey)) {
          // 头像已缓存，跳过下载
          return;
        }

        // 下载并缓存头像
        uni.downloadFile({
          url: avatarUrl,
          success: (res) => {
            if (res.statusCode === 200) {
              uni.setStorageSync(avatarKey, res.tempFilePath);
              // 头像缓存成功
              this.$forceUpdate();
            }
          },
          fail: (err) => {
            console.error('头像缓存失败:', err);
          },
        });
      },

      // 清除头像缓存
      clearAvatarCache() {
        const avatarKey = this.getAvatarKey();
        uni.removeStorageSync(avatarKey);
        // 头像缓存已清除
      },

      // 获取头像URL，优先使用缓存
      getAvatarUrl(avatarUrl) {
        return getAvatarUrl(avatarUrl);
      },

      // 获取头像缓存键名
      getAvatarKey() {
        return `avatar_${this.userInfo.name || 'user'}`;
      },
      logout() {
        uni.showModal({
          title: '提示',
          content: '确认退出登录？',
          success: (res) => {
            if (res.confirm) {
              // 清除头像缓存
              if (this.userInfo.avatar && this.userInfo.avatar !== '👤') {
                this.clearAvatarCache();
              }

              uni.removeStorageSync('token');
              uni.removeStorageSync('userInfo');
              uni.showToast({ title: '已退出登录', icon: 'success' });
              this.getUserInfo();
            }
          },
        });
      },
      goToLogin() {
        goTo('/pages/login/login');
      },
    },
  };
</script>

<style lang="scss">
  @import '@/uni.scss';
  .container {
    min-height: 100vh;
    background: $bg;
  }
  .profile-header {
    display: flex;
    align-items: center;
    background: $white;
    padding: 0 0 0 32rpx;
    margin-bottom: 16rpx;
  }
  .profile-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin: 32rpx 24rpx 32rpx 0;
    background: #eee;
    object-fit: cover;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .profile-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .profile-nickname {
    font-size: 38rpx;
    font-weight: bold;
    color: $text-main;
  }
  .profile-phone {
    font-size: 26rpx;
    color: $text-sub;
    margin-top: 8rpx;
  }
  .profile-logout-btn {
    width: 100%;
    margin: 24rpx 0 0 0;
    background: $white;
    color: $text-main;
    border-radius: 8rpx;
    font-size: 32rpx;
    font-weight: normal;
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: none;
    transition: background 0.2s;
  }
  .profile-logout-btn:active {
    background: $uni-bg-color-hover;
  }
  .profile-login-btn {
    width: 100%;
    margin: 24rpx 0 0 0;
    background: $primary;
    color: #fff;
    border-radius: 8rpx;
    font-size: 32rpx;
    font-weight: normal;
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: none;
    transition: background 0.2s;
  }
  .profile-login-btn:active {
    background: $main-color-dark;
  }
</style>
