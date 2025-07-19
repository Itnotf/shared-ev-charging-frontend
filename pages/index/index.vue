<template>
	<view class="container">
		<CommonNavBar
			title="充电共享"
			:rightClick="() => goTo('/pages/profile/index')"
		/>
		<view class="content">
			<!-- 内容区域原有内容全部移入此处 -->
			<CommonCard customClass="card overview-card gradient-bg">
				<view class="card-header card-header-flex overview-header">
					<picker mode="date" fields="month" :value="selectedMonth" @change="onMonthChange">
						<view class="month-picker">{{ selectedMonth }}</view>
					</picker>
					<text class="card-title">用电总览</text>
					<text class="card-more-btn" @click="goToRecordsPageWithMonth">查看详情</text>
				</view>
				<!-- 用电总览卡片数据区块 -->
				<view class="overview-data with-divider">
					<view class="data-item">
						<text class="data-value big main-color">{{ monthlyData.totalKwh || '0.00' }}</text>
						<text class="data-label gray-label">累计度数 (kWh)</text>
					</view>
					<view class="data-item">
						<text class="data-value big blue-color">¥{{ monthlyData.totalCost || '0.00' }}</text>
						<text class="data-label gray-label">累计费用</text>
					</view>
				</view>
			</CommonCard>
			<!-- 当前预约卡片 -->
			<CommonCard v-if="currentReservation" customClass="card reservation-card highlight-border reservation-card-striped">
				<view class="card-header" @click="goToReservationPage">
					<text class="card-title">当前预约</text>
				</view>
				<view class="reservation-info">
					<view class="reservation-info-main" @click="goToReservationPage">
						<image v-if="currentReservation.user_avatar" :src="currentReservation.user_avatar" class="avatar-img" />
						<view v-else class="avatar-default">👤</view>
						<view class="reservation-detail">
							<view class="reservation-user">{{ currentReservation.user_name || '用户' }}</view>
							<view class="reservation-meta">
								<text>{{ currentReservation.date }}（{{ getWeekday(currentReservation.date) }}）</text>
								<text class="reservation-slot slot-tag">{{ TIMESLOTS[currentReservation.timeslot].name }}</text>
							</view>
						</view>
					</view>
					<button class="cancel-reservation-btn" @click.stop="cancelCurrentReservation">取消预约</button>
				</view>
			</CommonCard>
			<CommonCard v-else customClass="card reservation-card empty-reservation-card">
				<view class="empty-reservation">
					<text class="empty-text">暂无预约</text>
					<button class="go-reservation-btn" @click="goToReservationPage">去预约</button>
				</view>
			</CommonCard>
			<!-- 宫格区块v-for渲染，背景色和icon色可变量控制，icon加粗 -->
			<view class="function-grid-new">
				<view
					v-for="(item, i) in functionList"
					:key="item.title"
					class="function-item-new"
					:style="{ background: item.bgColor }"
					@click="item.onClick"
				>
					<view class="function-icon-bg-new" :style="{ background: item.bgColor }">
						<SvgIcon :name="item.icon" size="56" :color="item.iconColor" style="font-weight:bold;" />
					</view>
					<text class="function-title-new">{{ item.title }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { checkAndHandleNeedUploadRecord, getWeekday, goTo, getCurrentDate } from '@/utils';
import { TIMESLOTS } from '@/config';
import { getCurrentReservationStatus, cancelReservation } from '@/api/reservation';
import { getMonthlyStatistics } from '@/api/statistics';
import SvgIcon from '@/components/SvgIcon.vue';
import CommonNavBar from '@/components/CommonNavBar.vue';
import CommonCard from '@/components/CommonCard.vue';
import { checkAndFetchUserProfile } from '@/utils';

export default {
	components: {
		SvgIcon,
    CommonNavBar,
    CommonCard
	},
	data() {
		return {
			TIMESLOTS,
			monthlyData: {
				totalKwh: 0,
				totalCost: 0
			},
			selectedMonth: '',
			currentReservation: null,
			pollingTimer: null,
			// 宫格功能项配置，包含背景色和icon色
			functionList: [
				{ title: '预约充电', icon: 'calendar', bgColor: '#FFF7E6', iconColor: '#FFA500', onClick: () => goTo('/pages/reservations/index') },
				{ title: '上传记录', icon: 'camera', bgColor: '#FFFBEA', iconColor: '#D46B08', onClick: () => goTo('/pages/records/create') },
				{ title: '充电记录', icon: 'calendar', bgColor: '#FFF3E0', iconColor: '#FFB84D', onClick: () => goTo(`/pages/records/index?month=${this.selectedMonth}`) },
				{ title: '个人中心', icon: 'person', bgColor: '#FFF9F0', iconColor: '#FF9900', onClick: () => goTo('/pages/profile/index') }
			]
		};
	},
	async onShow() {
		const token = uni.getStorageSync('token');
		if (token) {
			this.selectedMonth = getCurrentDate('YYYY-MM');
			this.startPolling();
			this.fetchData();
			// 检查并获取用户头像和昵称
			const profileComplete = await checkAndFetchUserProfile();
			if (!profileComplete) {
				uni.showToast({ title: '请设置头像和昵称', icon: 'none' });
			}
		} else {
			// 未登录时，清空数据或显示默认内容
			this.monthlyData = { totalKwh: '0.00', totalCost: '0.00' };
			this.currentReservation = null;
		}
	},
	async onLoad() {
		// 移除未登录时的重定向逻辑
		this.selectedMonth = getCurrentDate('YYYY-MM');
	},
	onUnload() {
		this.clearPollingTimer();
	},
	methods: {
		clearPollingTimer() {
			if (this.pollingTimer) clearTimeout(this.pollingTimer);
			this.pollingTimer = null;
		},
		async fetchData() {
			uni.showLoading({ title: '加载中' });
			try {
				const statRes = await getMonthlyStatistics(this.selectedMonth);
				const stat = statRes && statRes.data ? statRes.data : { totalKwh: 0, totalCost: 0 };
				// 金额单位由分转元
				this.monthlyData = {
					totalKwh: Number(stat.totalKwh).toFixed(1),
					totalCost: (Number(stat.totalCost) / 100).toFixed(2)
				};
			} catch (error) {
				uni.showToast({ title: '数据加载失败', icon: 'none' });
			} finally {
				uni.hideLoading();
			}
		},
		startPolling() {
			if (this.pollingTimer) clearTimeout(this.pollingTimer);
			this.pollingTimer = setTimeout(async function poll() {
				const shouldContinue = await this.checkReservationStatus();
				if (shouldContinue) {
					this.pollingTimer = setTimeout(poll.bind(this), 20000); // 20秒轮询
				} else {
					this.pollingTimer = null;
				}
			}.bind(this), 0);
		},
		async checkReservationStatus() {
			try {
				const res = await getCurrentReservationStatus();
				const data = res && res.data ? res.data.data || res.data : null;

				// 1. 有未上传充电记录，弹窗并停止轮询
				if (data && data.needUploadRecord) {
					checkAndHandleNeedUploadRecord(data);
					this.clearPollingTimer();
						return false;
					}

				// 2. 有当前预约，更新状态，继续轮询
				if (data && data.currentReservation) {
						this.currentReservation = data.currentReservation;
					return true;
				}

				// 3. 没有 currentReservation 也没有 lastReservation，停止轮询
				if (!data || (!data.currentReservation && !data.lastReservation)) {
						this.currentReservation = null;
					this.clearPollingTimer();
					return false;
				}

				// 4. 其他情况，继续轮询
				return true;
			} catch (e) {
				// 网络异常等，建议继续轮询
				return true;
			}
		},
		onMonthChange(e) {
			this.selectedMonth = e.detail.value;
			this.fetchData();
		},
		async cancelCurrentReservation() {
			if (!this.currentReservation) return;
			const res = await new Promise(resolve => {
				uni.showModal({
					title: '提示',
					content: '确定要取消当前预约吗？',
					confirmColor: '#FFA500',
					success: (r) => resolve(r)
				});
			});
			if (res.confirm) {
				uni.showLoading({ title: '取消中' });
				try {
					await cancelReservation(this.currentReservation.id);
					this.currentReservation = null;
					this.fetchData();
					uni.showToast({ title: '已取消预约', icon: 'none' });
				} catch (error) {
					uni.showToast({ title: '取消失败', icon: 'none' });
				} finally {
					uni.hideLoading();
				}
			}
		},
		goToReservationPage() {
			goTo('/pages/reservations/index');
		},
		goToRecordsPageWithMonth() {
			goTo(`/pages/records/index?month=${this.selectedMonth}`);
		},
		getWeekday(dateStr) {
			return getWeekday(dateStr);
		},
		getUserProfile() {
			wx.getUserProfile({
				desc: '用于完善用户资料',
				success: (res) => {
					const userInfo = res.userInfo;
					// 将头像和昵称发送到后端
					this.syncUserInfo(userInfo);
				},
				fail: () => {
					uni.showToast({ title: '获取头像和昵称失败', icon: 'none' });
				}
			});
		},
		syncUserInfo(userInfo) {
			console.log('Syncing user info to backend:', userInfo);
			// 将用户信息发送到后端的逻辑
			// 这里可以调用一个API来同步用户信息
		}
	}
};
// 预约卡片、宫格区块、数据区块建议抽成独立组件，便于复用
</script>

<style lang="scss">
@import '@/uni.scss';

.container {
	@extend .page-bg;
	display: flex;
	flex-direction: column;
	min-height: 100vh;
}

.content {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 16rpx 20rpx 20rpx 20rpx;
	overflow-y: auto;
	align-items: stretch;
}

.card,
.overview-card,
.reservation-card,
.empty-reservation-card {
  border-radius: $card-radius;
  background: #fff;
  box-shadow: $card-shadow;
  margin-bottom: $card-margin;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.overview-card {
  border-top: 8rpx solid $main-color;
  background: linear-gradient(135deg, #FFFDF7 0%, #FFF7E6 100%);
  min-height: 140rpx;
  height: 20vh;
  max-height: 300rpx;
  box-shadow: $card-shadow-deep;
}

.reservation-card,
.empty-reservation-card {
  min-height: 150rpx;
  height: 22vh;
  max-height: 320rpx;
  background: $main-color-lightest;
  box-shadow: $card-shadow-deep;
  border-left: 8rpx solid $main-color;
}

.gradient-bg {
  background: linear-gradient(135deg, #FFF7E6 0%, #FFE7BA 100%);
  border: none;
  box-shadow: 0 4rpx 24rpx rgba(255, 165, 0, 0.10);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.card-header-flex {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}
.card-header-flex .month-picker {
	min-width: 120rpx;
	text-align: left;
	margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
  height: 56rpx;
  background: #fff7e6;
  border: 2rpx solid #ffa500;
  border-radius: 28rpx;
  font-size: 30rpx;
  color: #FFA500;
  font-weight: bold;
  box-shadow: 0 2rpx 8rpx rgba(255,165,0,0.08);
  cursor: pointer;
  position: relative;
}
 .card-header-flex .month-picker::after {
   content: '';
   display: inline-block;
   margin-left: 10rpx;
   width: 0;
   height: 0;
   border-left: 10rpx solid transparent;
   border-right: 10rpx solid transparent;
   border-top: 10rpx solid #FFA500;
}
.card-header-flex .card-title {
	flex: 1;
	text-align: center;
	margin: 0;
}
.card-header-flex .card-more {
	min-width: 100rpx;
	text-align: right;
	margin: 0;
}

.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: $text-main;
}

.card-more {
	font-size: 26rpx;
	color: $primary;
}

.overview-data {
	display: flex;
	justify-content: space-around;
}

.data-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.data-value {
	font-size: 40rpx;
	font-weight: bold;
	color: $text-main;
	margin-bottom: 10rpx;
}

.data-value.big,
.data-value.big.main-color {
  font-size: 56rpx;
  font-weight: bold;
  color: $main-color-deep;
  margin-bottom: 4rpx;
}
.data-value.big.blue-color {
  font-size: 56rpx;
  font-weight: bold;
  color: #0057B7;
  margin-bottom: 4rpx;
}

.data-label {
	font-size: 26rpx;
	color: $text-sub;
}

.month-picker {
	display: inline-block;
	margin: 0 16rpx;
	font-size: 26rpx;
	color: $primary;
	font-weight: bold;
}

.reservation-info {
  flex: 1;
	display: flex;
	align-items: center;
  width: 100%;
  min-width: 0;
  flex-shrink: 1;
  max-height: 100%;
  overflow: auto;
}
.reservation-info-main {
	display: flex;
	align-items: center;
	flex: 1;
	cursor: pointer;
}
.avatar-img {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	margin-right: 20rpx;
	background: #f0f0f0;
	object-fit: cover;
	border: 2rpx solid #FFA500;
}
.avatar-default {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	margin-right: 20rpx;
	background: #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 40rpx;
	color: #FFA500;
	border: 2rpx solid #FFA500;
}
.reservation-detail {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	padding-top: 16rpx;
}
.reservation-user {
  font-size: 32rpx;
	font-weight: bold;
	color: #333;
}
.reservation-meta {
	font-size: 26rpx;
	color: #888;
	display: flex;
	padding-top: 16rpx;
	gap: 16rpx;
}
.reservation-slot {
	color: #FFA500;
	font-weight: bold;
}
.cancel-reservation-btn {
	background: #fff;
  color: $main-color-dark;
  border: 2rpx solid $main-color-dark;
	border-radius: 24rpx;
	font-size: 24rpx;
	font-weight: bold;
	padding: 8rpx 24rpx;
	margin-left: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(255, 165, 0, 0.08);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}
.cancel-reservation-btn:active {
  background: $main-color-dark;
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(212,107,8,0.15);
}
.empty-reservation-card {
  min-height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2rpx dashed #FFA500;
  box-shadow: none;
  padding: 28rpx 24rpx;
}
.empty-reservation {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 64rpx;
}
.empty-text {
	font-size: 28rpx;
	color: #FFA500;
	margin-bottom: 16rpx;
}
.go-reservation-btn {
	background: linear-gradient(90deg, #FFA500 0%, #FFB84D 100%);
	color: #fff;
	border: none;
	border-radius: 24rpx;
	font-size: 26rpx;
	font-weight: bold;
	padding: 8rpx 32rpx;
	box-shadow: 0 2rpx 8rpx rgba(255, 165, 0, 0.10);
	transition: opacity 0.2s;
}
.go-reservation-btn:active {
	opacity: 0.8;
}
// 重要按钮主色高亮，禁用态灰色
button,
.card-more-btn,
.go-reservation-btn {
  background: linear-gradient(90deg, #FFA500 0%, #FFB84D 100%);
  color: #fff;
  border: none;
  border-radius: 24rpx;
  font-size: 28rpx;
  font-weight: bold;
  padding: 12rpx 36rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 165, 0, 0.10);
  transition: opacity 0.2s;
}
button:disabled,
.card-more-btn:disabled,
.go-reservation-btn:disabled {
  background: #e0e0e0;
  color: #aaa;
  box-shadow: none;
}
.slot-tag {
  background: #FFA500;
  color: #fff;
  border-radius: 12rpx;
  padding: 2rpx 12rpx;
  font-size: 22rpx;
  margin-left: 8rpx;
}
.function-grid-new {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $function-gap;
  margin-top: 20rpx;
  margin-bottom: 0;
  min-height: 240rpx;
  height: 44vh;
  max-height: 600rpx;
}
.function-item-new {
  background: #fff;
  border-radius: $card-radius;
  box-shadow: $card-shadow-deep;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200rpx;
  padding: 56rpx 0 48rpx 0;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
  margin-bottom: 0;
}
.function-item-new:active {
  box-shadow: 0 8rpx 24rpx rgba(212,107,8,0.15);
  transform: scale(0.97);
}
.function-icon-bg-new {
  width: $icon-size;
  height: $icon-size;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  color: $main-color;
}
.function-title-new {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-top: 0;
}
// 响应式适配
@media (max-width: 400px) {
  .content {
    padding: 16rpx 4rpx 12rpx 4rpx;
  }
  .card {
    padding: 16rpx 8rpx;
    border-radius: 12rpx;
  }
  .function-item {
    padding: 18rpx;
  }
  .data-value.big {
    font-size: 40rpx;
  }
}

@media (min-height: 700px) {
  .overview-card {
    height: 20vh;
    max-height: 400rpx;
}
  .overview-card .overview-data {
    gap: 48rpx;
}
  .reservation-card, .empty-reservation-card { height: 20vh; }
  .function-grid-new { height: 32vh; }
}
// 按钮active反馈
button:active,
.card-more-btn:active,
.go-reservation-btn:active {
  background: linear-gradient(90deg, #D46B08 0%, #FFA500 100%);
  color: #fff;
  transform: scale(0.97);
  box-shadow: 0 8rpx 24rpx rgba(212,107,8,0.15);
}
// 主要数据色彩更深
.data-value.big.main-color {
  color: $main-color-deep;
}
.data-value.big.blue-color {
  color: #0057B7;
}
</style>
