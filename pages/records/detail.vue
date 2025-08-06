<template>
	<view class="container">
		<!-- 导航栏 -->
		<CommonNavBar title="记录详情" :showBack="true" />
		
		<!-- 内容区域 -->
		<view class="content">
			<!-- 图片展示区域 -->
			<view v-if="record.image_url" class="image-section">
				<image 
					:src="getRecordImageUrl(record.image_url)" 
					class="record-image"
					mode="aspectFit"
					@click="previewImage"
				/>
				<view class="image-overlay">
					<text class="image-tip">点击查看大图</text>
				</view>
			</view>
			
			<view v-else class="no-image-section">
				<uni-icons type="image" size="48" color="#ccc" />
				<text class="no-image-text">暂无图片</text>
			</view>
			
			<!-- 记录信息卡片 -->
			<view class="info-card">
				<view class="card-header">
					<text class="card-title">充电信息</text>
				</view>
				
				<view class="info-list">
					<view class="info-item">
						<text class="info-label">日期</text>
						<text class="info-value">{{ formatDate(record.date, 'YYYY年MM月DD日') }}</text>
					</view>
					
					<view class="info-item">
						<text class="info-label">时段</text>
						<text class="info-value">{{ getTimeslotLabel(record.timeslot) }}</text>
					</view>
					
					<view class="info-item">
						<text class="info-label">充电度数</text>
						<text class="info-value highlight">{{ record.kwh }} kWh</text>
					</view>
					
					<view class="info-item">
						<text class="info-label">费用</text>
						<text class="info-value highlight">¥{{ formatAmount(record.amount) }}</text>
					</view>
					
					<view v-if="record.remark" class="info-item">
						<text class="info-label">备注</text>
						<text class="info-value">{{ record.remark }}</text>
					</view>
					
					<view class="info-item">
						<text class="info-label">创建时间</text>
						<text class="info-value">{{ formatDateTime(record.created_at) }}</text>
					</view>
					
					<view v-if="record.updated_at && record.updated_at !== record.created_at" class="info-item">
						<text class="info-label">更新时间</text>
						<text class="info-value">{{ formatDateTime(record.updated_at) }}</text>
					</view>
				</view>
			</view>
			
			<!-- 操作按钮 -->
			<view class="action-buttons">
				<button class="edit-btn" @click="goToEdit">
					<uni-icons type="compose" size="20" color="#fff" />
					<text class="btn-text">编辑记录</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import CommonNavBar from '@/components/CommonNavBar.vue';
import { getRecordDetail } from '@/api/record';
import { formatDate, getRecordImageUrl } from '@/utils';
import { TIMESLOTS } from '@/config';

export default {
	components: { CommonNavBar },
	data() {
		return {
			TIMESLOTS,
			recordId: '',
			record: {
				id: '',
				date: '',
				timeslot: '',
				kwh: 0,
				amount: 0,
				remark: '',
				image_url: '',
				created_at: '',
				updated_at: ''
			},
			loading: false
		};
	},
	onLoad(options) {
		if (options && options.id) {
			this.recordId = options.id;
			this.loadRecordDetail();
		}
	},
	onShow() {
		if (this.recordId) {
			this.loadRecordDetail();
		}
	},
	methods: {
		async loadRecordDetail() {
			this.loading = true;
			try {
				const res = await getRecordDetail(this.recordId);
				if (res && res.data) {
					this.record = {
						...res.data,
						amount: Number(res.data.amount) / 100 // 分转元
					};
				}
			} catch (error) {
				uni.showToast({ title: '加载记录详情失败', icon: 'none' });
			} finally {
				this.loading = false;
			}
		},
		
		goToEdit() {
			uni.navigateTo({
				url: `/pages/records/edit?id=${this.recordId}`
			});
		},
		
		previewImage() {
			if (this.record.image_url) {
				uni.previewImage({
					urls: [this.record.image_url],
					current: this.record.image_url
				});
			}
		},
		
		formatDate(date, format) {
			return formatDate(date, format);
		},
		
		formatDateTime(dateTime) {
			if (!dateTime) return '';
			const date = new Date(dateTime);
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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

.image-section {
	position: relative;
	background: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.04);
}

.record-image {
	width: 100%;
	height: 400rpx;
	background: #f0f0f0;
}

.image-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: linear-gradient(transparent, rgba(0,0,0,0.6));
	padding: 20rpx;
	display: flex;
	justify-content: center;
}

.image-tip {
	color: #fff;
	font-size: 24rpx;
	opacity: 0.8;
}

.no-image-section {
	background: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	padding: 80rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.04);
}

.no-image-text {
	font-size: 28rpx;
	color: #999;
	margin-top: 16rpx;
}

.info-card {
	background: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	padding: 24rpx 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.04);
}

.card-header {
	margin-bottom: 20rpx;
}

.card-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
}

.info-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.info-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
	border-bottom: none;
}

.info-label {
	font-size: 26rpx;
	color: #666;
}

.info-value {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
}

.info-value.highlight {
	color: #FFA500;
	font-weight: bold;
}

.action-buttons {
	padding: 20rpx 0;
}

.edit-btn {
	width: 100%;
	background: linear-gradient(90deg, #FFA500 0%, #FFB84D 100%);
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 32rpx;
	font-weight: bold;
	padding: 20rpx 0;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(255, 165, 0, 0.2);
	transition: opacity 0.2s;
}

.edit-btn:active {
	opacity: 0.8;
}

.btn-text {
	margin-left: 8rpx;
}
</style> 