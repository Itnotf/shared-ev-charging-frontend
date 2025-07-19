<template>
	<view class="container">
		<view class="center-area">
			<view class="logo-area">
				<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
				<text class="app-name">馨澜美邻</text>
			</view>
			<button
				class="login-btn"
				open-type="getPhoneNumber"
				@getphonenumber="onGetPhoneNumber"
				:loading="loginLoading"
				:disabled="loginLoading"
			>
				<uni-icons type="weixin" size="24" color="#fff"></uni-icons>
				<text>微信一键登录</text>
			</button>
		</view>
		<view class="agreement-area">
			<view class="agreement">
				<checkbox :checked="agreeProtocol" @change="agreeProtocol = $event.detail.value" color="$primary" />
				<text class="agreement-text">
					登录即表示同意
					<text class="link" @click="goTo('/pages/profile/agreement')">《用户协议》</text>
					和
					<text class="link" @click="goTo('/pages/profile/privacy')">《隐私政策》</text>
				</text>
			</view>
		</view>
	</view>
</template>

<script>
import { wxLogin } from '@/api/auth';
import { userAuth, goTo } from '@/utils';

export default {
	data() {
		return {
			agreeProtocol: true,
			loginLoading: false
		};
	},
	onLoad() {
		const token = uni.getStorageSync('token');
		if (token) {
			goTo('/pages/index/index');
		}
	},
	methods: {
		async onGetPhoneNumber(e) {
			if (!this.checkAgreement()) return;
			if (!e.detail || !e.detail.code) {
				uni.showToast({ title: '获取手机号失败', icon: 'none' });
				return;
			}
			if (this.loginLoading) return;
			this.loginLoading = true;
			uni.showLoading({ title: '登录中' });
			try {
				const loginRes = await new Promise((resolve, reject) => {
					uni.login({ provider: 'weixin', success: resolve, fail: reject });
				});
				const authRes = await wxLogin({
					code: loginRes.code,
					phoneCode: e.detail.code
				});
				if (!authRes || !authRes.data || !authRes.data.token || !authRes.data.user_info) {
					throw { code: 'NO_TOKEN' };
				}
				const token = authRes.data.token;
				const userInfo = authRes.data.data || authRes.data.user_info;
				userAuth.save(token, userInfo);
				goTo('/pages/index/index');
			} catch (error) {
				let msg = '登录失败，请重试';
				if (error && error.code) {
					if (error.code === 'NO_TOKEN') msg = '登录失败，未获取到用户信息';
					else if (error.code === 'INVALID_PHONE') msg = '手机号无效';
					// 可根据后端返回的错误码细分更多提示
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
		}
	}
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
	justify-content: space-between;
}

.center-area {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	justify-content: center;
	width: 100%;
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

.login-btn {
	@extend .btn;
	width: 100%;
	margin-bottom: 30rpx;
}

.agreement-area {
	width: 100%;
	margin-bottom: 40rpx;
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