<template>
  <view class="container">
    <PageHero
      :title="heroTitle"
      :subtitle="heroSubtitle"
      :height="200"
      bgClass="gradient-purple"
    >
      <template #subtitle>
        <view class="plate-badge" v-if="userInfo.name && userInfo.name !== '未登录'">
          <text class="plate-text" v-if="defaultPlateNumber">{{ defaultPlateNumber }}</text>
          <text class="plate-text muted" v-else>未设置默认车牌</text>
          <view class="plate-manage-icon" @click.stop="goToAuth('/pages/profile/licensePlates')">
            <uni-icons type="gear" size="18" color="#fff" />
          </view>
        </view>
      </template>
      <template #actions>
        <button class="primary-action" @click="handlePrimaryAction">
          {{ userInfo.name && userInfo.name !== '未登录' ? '更新资料' : '去登录' }}
        </button>
      </template>
    </PageHero>

    <PageContent :overlapOffset="24">
      <!-- 头像卡片（可点击进入完善资料） -->
      <view v-if="loadingUser" class="profile-header skeleton">
        <view class="avatar-skeleton" />
        <view class="info-skeleton">
          <view class="line short" />
          <view class="line long" />
        </view>
      </view>
      <view v-else class="profile-header" @click="goToAuth('/pages/profile/fillUserInfo')">
        <image
          v-if="userInfo.avatar && userInfo.avatar !== '👤'"
          :src="getAvatarUrl(userInfo.avatar)"
          class="profile-avatar"
        />
        <image v-else src="/static/icons/person.svg" class="profile-avatar" />
        <view class="profile-info">
          <text class="profile-nickname">
            {{ userInfo.name || '未登录' }}<text v-if="isAdmin" class="admin-badge">管理员</text>
          </text>
          <text class="profile-sub">点击更新资料</text>
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
          icon=""
          title="车牌管理"
          @click="goToAuth('/pages/profile/licensePlates')"
          rightIcon="right"
        />
        <BaseGroupItem
          icon=""
          title="隐私政策"
          @click="goTo('/pages/profile/privacy')"
          rightIcon="right"
        />
        <BaseGroupItem
          icon=""
          title="用户协议"
          @click="goTo('/pages/profile/agreement')"
          rightIcon="right"
        />
        <BaseGroupItem
          icon=""
          title="关于小程序"
          @click="goTo('/pages/profile/about')"
          rightIcon="right"
        />
      </BaseGroup>
      <view v-if="isAdmin" class="section-title">管理功能</view>
      <BaseGroup v-if="isAdmin">
        <BaseGroupItem
          icon=""
          title="用户管理"
          @click="goToAuth('/pages/profile/userManage')"
          rightIcon="right"
        />
        <BaseGroupItem
          icon=""
          title="月度对账"
          @click="goToAuth('/pages/profile/monthlyReport')"
          rightIcon="right"
        />
      </BaseGroup>
      <button v-if="userInfo.name !== '未登录'" class="profile-logout-btn" @click="logout">
        退出登录
      </button>
      <button v-else class="profile-login-btn" @click="goToLogin">立即登录</button>
    </PageContent>
  </view>
</template>

<script>
  import { getUserProfile } from '@/api/auth';
  import { baseUrl } from '@/config';

  import BaseGroup from '@/components/BaseGroup.vue';
  import BaseGroupItem from '@/components/BaseGroupItem.vue';
  import { goTo, goToAuth, getAvatarUrl, getPayload } from '@/utils';
  import PageHero from '@/components/PageHero.vue';
  import PageContent from '@/components/PageContent.vue';
  import { getLicensePlates } from '@/api/licensePlate';

  export default {
    components: { BaseGroup, BaseGroupItem, PageHero, PageContent },
    data() {
      return {
        userInfo: {
          name: '',
          phone: '',
          avatar: '',
        },
        isAdmin: false,
        loadingUser: true,
        defaultPlateNumber: '',
      };
    },
    computed: {
      heroTitle() {
        return (this.userInfo.name && this.userInfo.name !== '未登录')
          ? this.userInfo.name
          : '个人中心';
      },
      heroSubtitle() {
        return (this.userInfo.name && this.userInfo.name !== '未登录')
          ? (this.defaultPlateNumber || '未设置默认车牌')
          : '登录后可管理车牌与查看更多内容';
      },
    },
    onShow() {
      this.getUserInfo();
    },
    methods: {
      goTo,
      goToAuth, // 受保护跳转，未登录将先进入登录页
      handlePrimaryAction() {
        if (this.userInfo.name && this.userInfo.name !== '未登录') {
          this.goToAuth('/pages/profile/fillUserInfo');
        } else {
          this.goTo('/pages/login/login');
        }
      },
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
          this.loadingUser = false;
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
            // 加载默认车牌
            await this.loadDefaultPlate();
          }
        } catch (error) {
          uni.showToast({ title: '获取用户信息失败', icon: 'none' });
          this.isAdmin = false;
        } finally {
          this.loadingUser = false;
        }
      },

      async loadDefaultPlate() {
        try {
          const res = await getLicensePlates();
          const payload = getPayload(res);
          const list = Array.isArray(payload)
            ? payload
            : (payload && Array.isArray(payload.data) ? payload.data : []);
          const def = Array.isArray(list) ? list.find((p) => p && p.is_default) : null;
          if (def && def.plate_number) {
            this.defaultPlateNumber = def.plate_number;
          } else if (Array.isArray(list) && list.length > 0 && list[0].plate_number) {
            this.defaultPlateNumber = list[0].plate_number;
          } else {
            this.defaultPlateNumber = '';
          }
        } catch (_e) {
          this.defaultPlateNumber = '';
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

        // 获取完整的头像URL（网络地址）
        let fullAvatarUrl = '';
        if (/^https?:\/\//.test(avatarUrl)) {
          // 已经是完整的URL
          fullAvatarUrl = avatarUrl;
        } else if (avatarUrl.startsWith('/')) {
          // 相对路径，需要拼接baseUrl
          fullAvatarUrl = `${baseUrl}${avatarUrl}`;
        } else if (avatarUrl) {
          // 其他情况，拼接baseUrl
          fullAvatarUrl = `${baseUrl}/${avatarUrl}`;
        } else {
          // 无效的头像URL，跳过缓存
          return;
        }

        // 下载并缓存头像
        uni.downloadFile({
          url: fullAvatarUrl,
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
        uni.showActionSheet({
          itemList: ['退出登录', '取消'],
          itemColor: '#ff4d4f',
          success: (res) => {
            if (res.tapIndex === 0) {
              try { if (uni.vibrateShort) uni.vibrateShort({ type: 'light' }); } catch (_) {}
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

  .primary-action {
    @include btn-primary;
    height: 72rpx;
    padding: 0 28rpx;
    font-size: 28rpx;
  }

  .plate-badge {
    display: inline-flex;
    align-items: center;
    gap: 12rpx;
    margin-top: 6rpx;
  }
  .plate-text {
    position: relative;
    background: linear-gradient(135deg, $plate-ev-gradient-start 0%, $plate-ev-gradient-end 100%);
    color: #111;
    padding: 6rpx 16rpx;
    border-radius: 12rpx;
    font-size: 24rpx;
    border: 2rpx solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.1) inset;
  }
  .plate-text::before,
  .plate-text::after {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 6rpx;
    height: 6rpx;
    border-radius: 50%;
    background: rgba(255,255,255,0.9);
    box-shadow: 0 0 0 2rpx rgba(0,0,0,0.06);
  }
  .plate-text::before { left: 6rpx; }
  .plate-text::after { right: 6rpx; }
  .plate-text.muted {
    background: rgba(255,255,255,0.2);
    color: #fff;
    border-color: rgba(255,255,255,0.35);
  }
  .plate-manage-icon {
    width: 40rpx;
    height: 40rpx;
    border-radius: 999rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.18);
    border: 2rpx solid rgba(255,255,255,0.35);
  }

  .profile-header {
    display: flex;
    align-items: center;
    background: $white;
    padding: 16rpx 20rpx 16rpx 24rpx;
    margin-bottom: 16rpx;
    border-radius: 20rpx;
    box-shadow: $card-shadow;
  }
  .profile-header.skeleton {
    .avatar-skeleton {
      width: 120rpx; height: 120rpx; border-radius: 50%; background: $uni-bg-color-hover;
      margin: 32rpx 24rpx 32rpx 0;
    }
    .info-skeleton { flex: 1; display: flex; flex-direction: column; gap: 12rpx; }
    .line { height: 28rpx; background: $uni-bg-color-hover; border-radius: 12rpx; }
    .line.short { width: 240rpx; }
    .line.long { width: 320rpx; }
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
    border: 2rpx solid $uni-color-primary;
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
  .admin-badge {
    margin-left: 8rpx;
    font-size: 22rpx;
    color: $uni-color-primary;
    background: rgba($uni-color-primary, 0.08);
    padding: 2rpx 10rpx;
    border-radius: 999rpx;
    border: 2rpx solid rgba($uni-color-primary, 0.4);
  }
  .profile-sub {
    font-size: 26rpx;
    color: $text-sub;
    margin-top: 8rpx;
  }
  .profile-logout-btn {
    @extend .btn;
    width: 100%;
    margin: 24rpx 0 0 0;
    background: transparent;
    color: #ff4d4f;
    border: 2rpx solid rgba(255, 77, 79, 0.35);
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: $charging-shadow-sm;
    letter-spacing: 1rpx;
    cursor: pointer;
    
    // 悬停效果
    &:hover {
      background: rgba(255, 77, 79, 0.06);
      box-shadow: $charging-shadow-md;
      transform: translateY(-1rpx);
    }
    
    // 点击效果
    &:active {
      transform: translateY(1rpx) scale(0.98);
      box-shadow: $charging-shadow-sm;
      transition: all 0.1s ease;
    }
  }
  
  .profile-login-btn {
    @extend .btn;
    width: 100%;
    margin: 24rpx 0 0 0;
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
  }
</style>
