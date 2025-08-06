<template>
	<view class="container">
		<!-- 导航栏 -->
		<CommonNavBar title="充电分析" :showBack="true" />
		
		<!-- 内容区域 -->
		<view class="content">
			<!-- 月份选择 -->
			<view class="month-bar-row" @click="openMonthPicker">
				<picker mode="date" fields="month" :value="selectedMonth" @change="onMonthChange">
					<view class="month-picker">{{ selectedMonth }}</view>
				</picker>
			</view>
			
			<!-- 统计概览卡片 -->
			<view class="stats-card">
				<view class="stats-header">
					<text class="stats-title">本月统计</text>
				</view>
				<view class="stats-content">
					<view class="stats-item">
						<text class="stats-value">{{ monthlyStats.totalKwh || '0.0' }}</text>
						<text class="stats-label">总度数 (kWh)</text>
					</view>
					<view class="stats-item">
						<text class="stats-value">¥{{ monthlyStats.totalCost || '0.00' }}</text>
						<text class="stats-label">总费用</text>
					</view>
				</view>
			</view>
			
			<!-- 记录列表 -->
			<view class="records-container">
				<view class="records-header">
					<text class="records-title">充电记录</text>
					<text class="records-count">共 {{ records.length }} 条</text>
				</view>
				
				<view v-if="records.length > 0" class="records-list">
					<view 
						v-for="record in records" 
						:key="record.id" 
						class="record-item"
						@click="goToDetail(record.id)"
					>
						<view class="record-left">
							<view class="record-date-row">
								<text class="record-date">{{ formatDate(record.date, 'MM-DD') }}</text>
								<text class="record-timeslot">{{ getTimeslotLabel(record.timeslot) }}</text>
							</view>
							<view class="record-info">
								<text class="record-kwh">{{ record.kwh }} kWh</text>
								<text class="record-amount">¥{{ formatAmount(record.amount) }}</text>
							</view>
							<text v-if="record.remark" class="record-remark">{{ record.remark }}</text>
						</view>
						<view class="record-right">
							<image 
								v-if="record.image_url" 
								:src="getRecordImageUrl(record.image_url)" 
								class="record-thumbnail"
								mode="aspectFill"
							/>
							<view v-else class="record-no-image">无图</view>
							<uni-icons type="right" size="16" color="#ccc" />
						</view>
					</view>
				</view>
				
				<view v-else class="empty-state">
					<uni-icons type="info" size="48" color="#ccc" />
					<text class="empty-text">本月暂无充电记录</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import CommonNavBar from '@/components/CommonNavBar.vue';
import { getRecordsList } from '@/api/record';
import { getMonthlyStatistics } from '@/api/statistics';
import { formatDate, getCurrentDate, getRecordImageUrl } from '@/utils';
import { TIMESLOTS } from '@/config';

export default {
	components: { CommonNavBar },
	data() {
		return {
			TIMESLOTS,
			selectedMonth: getCurrentDate('YYYY-MM'),
			records: [],
			monthlyStats: {
				totalKwh: 0,
				totalCost: 0
			},
			loading: false
		};
	},
	onLoad(options) {
		if (options && options.month) {
			this.selectedMonth = options.month;
		}
	},
	onShow() {
		this.loadData();
	},
	methods: {
		onMonthChange(e) {
			this.selectedMonth = e.detail.value;
			this.loadData();
		},
		
		async loadData() {
			this.loading = true;
			try {
				// 并行加载记录列表和统计数据
				const [recordsRes, statsRes] = await Promise.all([
					getRecordsList(this.selectedMonth),
					getMonthlyStatistics(this.selectedMonth)
				]);
				
				// 处理记录列表
				if (recordsRes && Array.isArray(recordsRes.data)) {
					this.records = recordsRes.data
						.map(record => ({
							...record,
							amount: Number(record.amount) / 100 // 分转元
						}))
						.sort((a, b) => new Date(b.date) - new Date(a.date)); // 日期倒序
				} else {
					this.records = [];
				}
				
				// 处理统计数据
				if (statsRes && statsRes.data) {
					this.monthlyStats = {
						totalKwh: Number(statsRes.data.totalKwh).toFixed(1),
						totalCost: (Number(statsRes.data.totalCost) / 100).toFixed(2)
					};
				}
			} catch (error) {
				uni.showToast({ title: '加载数据失败', icon: 'none' });
			} finally {
				this.loading = false;
			}
		},
		
		goToDetail(recordId) {
			uni.navigateTo({
				url: `/pages/records/detail?id=${recordId}`
			});
		},
		
		formatDate(date, format) {
			return formatDate(date, format);
		},
		
		formatAmount(amount) {
			return Number(amount).toFixed(2);
		},
		
		getTimeslotLabel(timeslot) {
			if (this.TIMESLOTS && this.TIMESLOTS[timeslot]) {
				return this.TIMESLOTS[timeslot].name;
			}
			return timeslot || '';
		},
		
		openMonthPicker() {
			// 月份选择器已通过picker组件实现
		},
		getRecordImageUrl
	}
};
</script>

<style lang="scss">
.container {
	background: #f8f8f8;
	min-height: 100vh;
}

.content {
	padding: 20rpx;
	padding-top: 0;
}

.month-bar-row {
	display: flex;
	align-items: center;
	padding: 24rpx 32rpx 0 32rpx;
	font-size: 30rpx;
	color: #FFA500;
	font-weight: bold;
	cursor: pointer;
	position: relative;
	z-index: 10;
}

.month-picker {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0 24rpx;
	height: 56rpx;
	min-width: 120rpx;
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

.month-picker::after {
	content: '';
	display: inline-block;
	margin-left: 10rpx;
	width: 0;
	height: 0;
	border-left: 10rpx solid transparent;
	border-right: 10rpx solid transparent;
	border-top: 10rpx solid #FFA500;
}

.stats-card {
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.04);
	margin: 16rpx 20rpx 20rpx 20rpx;
	padding: 24rpx 20rpx;
}

.stats-header {
	margin-bottom: 16rpx;
}

.stats-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
}

.stats-content {
	display: flex;
	justify-content: space-around;
}

.stats-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stats-value {
	font-size: 36rpx;
	font-weight: bold;
	color: #FFA500;
	margin-bottom: 8rpx;
}

.stats-label {
	font-size: 24rpx;
	color: #666;
}

.records-container {
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.04);
	margin: 0 20rpx;
	padding: 24rpx 20rpx;
}

.records-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.records-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
}

.records-count {
	font-size: 24rpx;
	color: #999;
}

.records-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.record-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx;
	background: #fafafa;
	border-radius: 12rpx;
	border: 1rpx solid #f0f0f0;
	transition: background 0.2s;
}

.record-item:active {
	background: #f5f5f5;
}

.record-left {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.record-date-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.record-date {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
}

.record-timeslot {
	background: #FFA500;
	color: #fff;
	border-radius: 12rpx;
	padding: 4rpx 12rpx;
	font-size: 22rpx;
}

.record-info {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.record-kwh {
	font-size: 26rpx;
	color: #666;
}

.record-amount {
	font-size: 26rpx;
	color: #FFA500;
	font-weight: bold;
}

.record-remark {
	font-size: 24rpx;
	color: #999;
	font-style: italic;
}

.record-right {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.record-thumbnail {
	width: 60rpx;
	height: 60rpx;
	border-radius: 8rpx;
	background: #f0f0f0;
}

.record-no-image {
	width: 60rpx;
	height: 60rpx;
	border-radius: 8rpx;
	background: #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20rpx;
	color: #ccc;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 0;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
	margin-top: 16rpx;
}
</style> 