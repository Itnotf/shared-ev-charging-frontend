<template>
	<view class="container">
		<CommonNavBar title="用户协议" :showBack="true" />
		
		<!-- 内容区域 -->
		<view class="content">
			<!-- 协议标题 -->
			<view class="agreement-title">馨澜美邻用户协议</view>
			<view class="agreement-date">更新日期：2025年07月18日</view>
			
			<!-- 协议内容 -->
			<view class="agreement-content">
				<view class="section">
					<view class="section-title">1. 协议的接受与修改</view>
					<view class="section-content">
						<view class="paragraph">1.1 本协议是您与馨澜美邻（以下简称"本小程序"）开发者之间关于使用本小程序服务所订立的协议。</view>
						<view class="paragraph">1.2 您在注册成为本小程序用户前，应当认真阅读本协议，确保充分理解各条款内容。</view>
						<view class="paragraph">1.3 您注册成功或使用本小程序服务，即视为您已阅读并同意本协议的全部条款。</view>
						<view class="paragraph">1.4 本小程序有权在必要时修改本协议条款，协议条款一旦发生变动，将会在本小程序上公布，请您及时关注。</view>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">2. 服务内容与规范</view>
					<view class="section-content">
						<view class="paragraph">2.1 本小程序为用户提供馨澜美邻服务，包括但不限于充电预约、记录上传等功能。</view>
						<view class="paragraph">2.2 您在使用本小程序服务时，必须遵守中华人民共和国相关法律法规的规定，不得利用本服务从事违法违规行为。</view>
						<view class="paragraph">2.3 您不得利用本小程序传播、发布违法信息，不得侵犯他人合法权益。</view>
						<view class="paragraph">2.4 您应当保证提交的预约信息和充电记录的真实性和准确性，不得提交虚假信息。</view>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">3. 用户账号与安全</view>
					<view class="section-content">
						<view class="paragraph">3.1 您注册成功后，将获得一个用户账号及相应密码，该账号和密码由您负责保管。</view>
						<view class="paragraph">3.2 您应当对账号下的所有行为及结果承担法律责任。</view>
						<view class="paragraph">3.3 如发现有他人冒用或盗用您的账号及密码，或其他任何安全问题，您应立即通知本小程序管理员。</view>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">4. 隐私保护</view>
					<view class="section-content">
						<view class="paragraph">4.1 本小程序重视对您个人隐私的保护，具体隐私政策请参见《隐私政策》。</view>
						<view class="paragraph">4.2 本小程序将依法收集、使用您的个人信息，并采取必要措施保护您的个人信息安全。</view>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">5. 免责声明</view>
					<view class="section-content">
						<view class="paragraph">5.1 本小程序不对因网络故障、系统故障等不可抗力因素导致的服务中断或数据丢失承担责任。</view>
						<view class="paragraph">5.2 您理解并同意，本小程序不对用户之间因使用服务而产生的纠纷承担责任。</view>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">6. 协议终止</view>
					<view class="section-content">
						<view class="paragraph">6.1 您有权在遵守相关法律法规的前提下，随时终止使用本小程序服务。</view>
						<view class="paragraph">6.2 如您违反本协议相关规定，本小程序有权暂停或终止为您提供服务。</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import CommonNavBar from '@/components/CommonNavBar.vue';
export default {
	components: { CommonNavBar },
	data() {
		return {};
	},
	methods: {
		// 返回上一页
		navigateBack() {
			uni.navigateBack();
		}
	}
};
</script>

<style>
.container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f8f8f8;
}

.content {
	flex: 1;
	padding: 30rpx;
	overflow-y: auto;
}

.agreement-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	text-align: center;
	margin-bottom: 10rpx;
}

.agreement-date {
	font-size: 24rpx;
	color: #999;
	text-align: center;
	margin-bottom: 40rpx;
}

.agreement-content {
	padding: 20rpx;
	background-color: #fff;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section {
	margin-bottom: 30rpx;
}

.section:last-child {
	margin-bottom: 0;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
}

.paragraph {
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
	margin-bottom: 16rpx;
	text-indent: 2em;
}

.paragraph:last-child {
	margin-bottom: 0;
}
</style> 