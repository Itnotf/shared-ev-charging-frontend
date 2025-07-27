<template>
	<view class="container">
		<view class="center-area">
			<view class="logo-area">
				<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
				<text class="app-name">澜充小站</text>
			</view>
			<button
				class="login-btn"
				open-type="login"
				@tap="onWeixinLogin"
				:loading="loginLoading"
				:disabled="loginLoading"
			>
				<uni-icons type="weixin" size="24" color="#fff"></uni-icons>
				<text>微信一键登录</text>
			</button>
			<view class="agreement-area">
				<view class="agreement">
					<checkbox-group @change="onAgreeChange">
						<checkbox value="agree" color="$primary" />
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
import { userAuth, goTo } from '@/utils';

export default {
	data() {
		return {
			agreeProtocol: false,
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
							console.log('【登录调试】uni.login 成功:', res);
							resolve(res);
						},
						fail: (err) => {
							console.log('【登录调试】uni.login 失败:', err);
							reject(err);
						}
					});
				});
				if (!loginRes.code) {
					console.log('【登录调试】未获取到微信登录凭证:', loginRes);
					throw new Error('未获取到微信登录凭证');
				}
				// 2. 调用后端登录接口
				const authRes = await wxLogin({ code: loginRes.code });
				console.log('【登录调试】wxLogin 返回:', authRes);
				if (!authRes || !authRes.data || !authRes.data.token || !authRes.data.user_info) {
					console.log('【登录调试】wxLogin 返回数据不完整:', authRes);
					throw { code: 'NO_TOKEN' };
				}
				const token = authRes.data.token;
				const userInfo = authRes.data.data || authRes.data.user_info;
				userAuth.save(token, userInfo);
				goTo('/pages/index/index');
			} catch (error) {
				console.log('【登录调试】catch 捕获到异常:', error);
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
	justify-content: center;
}

.center-area {
	display: flex;
	flex-direction: column;
	align-items: center;
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
	margin-bottom: 20rpx;
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