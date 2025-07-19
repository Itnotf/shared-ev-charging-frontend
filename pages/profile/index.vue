<template>
	<view class="container">
		<!-- 导航栏 -->
		<CommonNavBar title="个人中心" :showBack="false" />
		
		<!-- 头像卡片 -->
		<view class="content">
			<view class="profile-header">
				<image v-if="userInfo.avatar && userInfo.avatar !== '👤'" :src="userInfo.avatar" class="profile-avatar" />
				<image v-else src="/static/icons/person.svg" class="profile-avatar" />
				<view class="profile-info">
					<text class="profile-nickname">{{ userInfo.name || '未登录' }}</text>
					<text class="profile-phone">{{ userInfo.phone || '' }}</text>
				</view>
			</view>
			<!-- 分组1 -->
			<BaseGroup>
				<BaseGroupItem
					icon="notification"
					title="通知设置"
					@click="goTo('/pages/profile/notification')"
					rightIcon="right"
				/>
			</BaseGroup>
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
			<button class="profile-logout-btn" @click="logout">退出登录</button>
		</view>
	</view>
</template>

<script>
import { getUserProfile} from '@/api/auth';
import CommonNavBar from '@/components/CommonNavBar.vue';
import BaseGroup from '@/components/BaseGroup.vue';
import BaseGroupItem from '@/components/BaseGroupItem.vue';
import { goTo } from '@/utils';

export default {
	components: { CommonNavBar, BaseGroup, BaseGroupItem },
	data() {
		return {
			userInfo: {
				name: '',
				phone: '',
				avatar: ''
			},
			isAdmin: false
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
				uni.redirectTo({ url: '/pages/login/login' });
				return;
			}
			try {
				const res = await getUserProfile();
				if (res && res.data) {
					this.userInfo = {
						name: res.data.user_name,
						phone: res.data.phone,
						avatar: res.data.user_avatar || ''
					};
					uni.setStorageSync('userInfo', JSON.stringify(this.userInfo));
				}
			} catch (error) {
				uni.showToast({ title: '获取用户信息失败', icon: 'none' });
			}
		},
		logout() {
			uni.showModal({
				title: '提示',
				content: '确认退出登录？',
				success: (res) => {
					if (res.confirm) {
						uni.removeStorageSync('token');
						uni.removeStorageSync('userInfo');
						uni.reLaunch({ url: '/pages/login/login' });
					}
				}
			});
		}
	}
};
</script>

<style>
.container {
  min-height: 100vh;
  background: #f7f7f7;
}
.profile-header {
	display: flex;
	align-items: center;
	background: #fff;
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
	color: #222;
}
.profile-phone {
	font-size: 26rpx;
	color: #888;
	margin-top: 8rpx;
}
.profile-logout-btn {
	width: 100%;
	margin: 24rpx 0 0 0;
	background: #fff;
	color: #222;
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
	background: #f5f5f5;
}
</style> 