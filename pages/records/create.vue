<template>
	<view class="container">
		<!-- 导航栏 -->
		<CommonNavBar title="上传记录" :showBack="true" />
		
		<!-- 内容区域 -->
		<view class="content">
			<!-- 无预约ID时的提示 -->
			<view v-if="!reservationId" class="no-reservation-warning">
				<uni-icons type="info" size="22" color="#FF6B6B" style="margin-right: 8rpx;" />
				<text class="warning-text">请先预约充电时段，然后才能上传记录</text>
			</view>
			
			<!-- 补交预约信息美观展示 -->
			<view v-if="reservationId || reservationDate || reservationTimeslot" class="supplement-reservation-info">
				<uni-icons type="calendar" size="22" color="#FFA500" style="margin-right: 8rpx;" />
				<text class="supplement-label">本次预约信息：</text>
				<text class="supplement-date">{{ reservationDate }}</text>
				<text class="supplement-timeslot" v-if="reservationTimeslot">
					（{{ reservationTimeslot === 'day' ? TIMESLOTS.day.name : reservationTimeslot === 'night' ? TIMESLOTS.night.name : reservationTimeslot }}）
				</text>
			</view>
			<!-- 照片上传 -->
			<view class="card">
				<view class="card-header">
					<text class="card-title">上传电量截图</text>
				</view>
				<view class="upload-area" @click="chooseImage">
					<block v-if="imageUrl">
						<image :src="imageUrl" mode="aspectFill" class="upload-image"></image>
					</block>
					<block v-else>
						<uni-icons type="camera" size="32" color="#ccc"></uni-icons>
						<text class="upload-text">点击上传电量截图</text>
					</block>
				</view>
			</view>
			
			<!-- 电量输入 -->
			<view class="card">
				<view class="card-header">
					<text class="card-title">电量与费用</text>
				</view>
				<view class="form-group">
					<text class="form-label">充电度数 (kWh)</text>
					<input
						type="digit"
						v-model="kwh"
						class="form-input"
						placeholder="请输入充电度数"
						@input="calculateCost"
					/>
				</view>
				
				<view class="form-group">
					<text class="form-label">预估费用</text>
					<view class="cost-display">
						<text class="cost-value">¥{{ cost }}</text>
						<text class="cost-note">按 {{ userPrice }}元/kWh 计算</text>
					</view>
				</view>
				
				<view class="form-group">
					<text class="form-label">备注 (可选)</text>
					<textarea
						v-model="remark"
						class="form-textarea"
						placeholder="如：特殊情况充到12点"
					/>
				</view>
			</view>
			
			<!-- 提交按钮 -->
			<button 
				class="submit-btn"
				@click="submitRecord"
				:disabled="!reservationId || !kwh || parseFloat(kwh) <= 0"
			>
				<uni-icons type="wallet" size="20" color="#fff"></uni-icons>
				<text class="btn-text">提交记录 ¥{{ cost }}</text>
			</button>
			
			<!-- 历史记录 -->
			<view class="card">
				<view class="card-header">
					<text class="card-title">最近记录</text>
				</view>
				<view class="records-list">
					<view class="record-item" v-for="(record, index) in recentRecords" :key="index">
						<view class="record-left">
							<view class="record-date-row">
							<text class="record-date">{{ formatDate(record.date, 'MM月DD日') }}</text>
								<text class="record-timeslot-label">{{ record.timeslotLabel }}</text>
							</view>
							<text class="record-kwh">{{ record.kwh }} kWh</text>
						</view>
						<view class="record-right">
							<text class="record-amount">¥{{ record.amount }}</text>
							<!-- 状态字段已移除 -->
						</view>
					</view>
					<view class="empty-records" v-if="recentRecords.length === 0">
						<text class="empty-text">暂无记录</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getRecords, createRecord } from '@/api/record';
import { formatDate, calculateAmount, getStatusStyle, goTo, compressImage } from '@/utils';
import { TIMESLOTS } from '@/config';
import { uploadFile } from '@/api/index';
import CommonNavBar from '@/components/CommonNavBar.vue';
import { getCurrentReservationStatus } from '@/api/reservation';
import { getUserPrice } from '@/api/auth';

export default {
	components: {
		CommonNavBar
	},
	data() {
		return {
			TIMESLOTS,
			userPrice: 0, // 只保留 userPrice
			imageUrl: '',
			tempFilePath: '',
			kwh: '',
			cost: '0.00',
			remark: '',
			recentRecords: [],
			reservationId: '',
			reservationDate: '',
			reservationTimeslot: '',
			skipCheck: false
		};
	},
	onLoad(options) {
		console.log('create.vue onLoad options:', options);
		// 解析预约参数
		if (options && (options.id || options.date || options.timeslot)) {
			// 只保留数字id
			this.reservationId = options.id && !isNaN(Number(options.id)) ? String(Number(options.id)) : '';
			this.reservationDate = options.date || '';
			this.reservationTimeslot = options.timeslot || '';
		} else {
			this.reservationId = '';
			this.reservationDate = '';
			this.reservationTimeslot = '';
		}
		this.loadUserPrice();
		this.loadRecentRecords();
	},
	onTabItemTap() {
		this.skipCheck = false; // 每次点击tab时重置跳过检查
	},
	onShow() {
		if (this.skipCheck) {
			this.skipCheck = false;
			return;
		}
		this.checkCurrentStatusLogic();
		this.loadRecentRecords(); // 每次进入页面都刷新最近记录
	},
	methods: {
		async chooseImage() {
			this.skipCheck = true; // 选择图片时不弹框
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: async (res) => {
					try {
						// 压缩图片
						const compressedPath = await compressImage(res.tempFilePaths[0], 0.8);
						this.tempFilePath = compressedPath;
						this.imageUrl = compressedPath;
					} catch (error) {
						console.log('图片压缩失败，使用原图:', error);
						this.tempFilePath = res.tempFilePaths[0];
						this.imageUrl = res.tempFilePaths[0];
					}
				}
			});
		},
		async loadUserPrice() {
			try {
				const res = await getUserPrice();
				if (res && res.data && res.data.unit_price) {
					this.userPrice = res.data.unit_price;
				} else {
					this.userPrice = 0;
				}
			} catch (e) {
				this.userPrice = 0;
			}
		},
		calculateCost() {
			this.cost = this.kwh ? (parseFloat(this.kwh) * parseFloat(this.userPrice)).toFixed(2) : '0.00';
		},
		async loadRecentRecords() {
			uni.showLoading({ title: '加载中' });
			try {
				const res = await getRecords();
				if (res && res.data && res.data.length > 0) {
					// 直接取前5条，金额单位分转元，班次美化
					this.recentRecords = res.data.slice(0, 5).map(record => {
						return {
							...record,
							amount: (Number(record.amount) / 100).toFixed(2),
							timeslotLabel: this.TIMESLOTS && record.timeslot && this.TIMESLOTS[record.timeslot] ? this.TIMESLOTS[record.timeslot].name : (record.timeslot || '')
						};
					});
				} else {
					this.recentRecords = [];
				}
			} catch (error) {
				uni.showToast({ title: '获取记录失败', icon: 'none' });
			} finally {
				uni.hideLoading();
			}
		},
		async submitRecord() {
			// 检查是否有预约ID
			if (!this.reservationId) {
				uni.showToast({ title: '请先预约充电时段', icon: 'none' });
				return;
			}
			
			if (!this.kwh || parseFloat(this.kwh) <= 0) {
				uni.showToast({ title: '请输入有效的充电度数', icon: 'none' });
				return;
			}
			uni.showLoading({ title: '提交中' });
			try {
				let imageUrl = '';
				if (this.tempFilePath) {
					console.log('[日志] 开始上传图片:', this.tempFilePath);
					const uploadRes = await uploadFile(this.tempFilePath);
					console.log('[日志] 图片上传结果:', uploadRes);
					if (uploadRes && uploadRes.data && uploadRes.data.url) {
						imageUrl = uploadRes.data.url;
					}
				}
				console.log('[日志] imageUrl:', imageUrl);
				const recordData = {
					date: this.reservationDate,
					kwh: parseFloat(this.kwh),
					image_url: imageUrl,
					remark: this.remark,
					reservation_id: this.reservationId // 始终传递
				};
				console.log('[日志] 提交 recordData:', recordData);
				await createRecord(recordData);
				console.log('[日志] createRecord 已调用');
				uni.showToast({ title: '提交成功', icon: 'success' });
				// 清空表单字段
				this.imageUrl = '';
				this.tempFilePath = '';
				this.kwh = '';
				this.cost = '0.00';
				this.remark = '';
				this.reservationId = '';
				this.reservationDate = '';
				this.reservationTimeslot = '';
				setTimeout(() => {
					uni.switchTab({ url: '/pages/index/index' });
				}, 1000);
			} catch (error) {
				console.error('[日志] 提交失败:', error);
				uni.showToast({ title: '提交失败', icon: 'none' });
			} finally {
				uni.hideLoading();
			}
		},
		async checkCurrentStatusLogic() {
			try {
				const res = await getCurrentReservationStatus();
				const data = res && res.data ? res.data.data || res.data : null;
				if (!data) {
					uni.showModal({
						title: '提示',
						content: '暂无待上传的预约，去预约',
						confirmText: '去预约',
						showCancel: true,
						success: (r) => {
							if (r.confirm) goTo('/pages/reservations/index');
						}
					});
					return;
				}
				if (data.needUploadRecord && data.lastReservation) {
					// 展示上传表单，填充 lastReservation 数据
					this.reservationId = data.lastReservation.id;
					this.reservationDate = data.lastReservation.date ? data.lastReservation.date.slice(0, 10) : '';
					this.reservationTimeslot = data.lastReservation.timeslot;
					// 继续展示上传表单
					return;
				}
				if (data.currentReservation) {
					// 当前预约还未到上传时机
					uni.showModal({
						title: '提示',
						content: '当前预约时段还未结束，确定已经充电完成？',
						confirmText: '确定',
						cancelText: '取消',
						success: (r) => {
							if (r.confirm) {
								this.reservationId = data.currentReservation.id;
								this.reservationDate = data.currentReservation.date ? data.currentReservation.date.slice(0, 10) : '';
								this.reservationTimeslot = data.currentReservation.timeslot;
								// 继续展示上传表单
							} else {
								// 取消则返回首页或不做处理
								goTo('/pages/index/index');
							}
						}
					});
					return;
				}
				// 兜底：无未上传记录、无当前预约
				uni.showModal({
					title: '提示',
					content: '暂无待上传的预约，去预约',
					confirmText: '去预约',
					showCancel: true,
					success: (r) => {
						if (r.confirm) goTo('/pages/reservations/index');
					}
				});
			} catch (e) {
				uni.showToast({ title: '获取预约状态失败', icon: 'none' });
			}
		},
		formatDate,
		getStatusStyle,
		navigateBack() {
			uni.navigateBack();
		}
	}
};
</script>

<style>
.container {
	background: #f8f8f8;
	min-height: 100vh;
}

.content {
	padding: 20rpx;
	padding-top: 0;
}

.card {
	background: #fff;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	margin-bottom: 30rpx;
	padding: 30rpx 24rpx;
}

.card-header {
	margin-bottom: 20rpx;
}

.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.upload-area {
	height: 240rpx;
	border: 2rpx dashed #ddd;
	border-radius: 8rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #f9f9f9;
	cursor: pointer;
}

.upload-image {
	width: 100%;
	height: 100%;
	border-radius: 8rpx;
}

.upload-text {
	margin-top: 20rpx;
	font-size: 28rpx;
	color: #999;
}

.form-group {
	margin-bottom: 30rpx;
}

.form-label {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 10rpx;
	display: block;
}

.form-input {
	height: 80rpx;
	border: 1rpx solid #eee;
	border-radius: 8rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	background-color: #fafafa;
}

.cost-display {
	display: flex;
	flex-direction: column;
}

.cost-value {
	font-size: 48rpx;
	font-weight: bold;
	color: #333;
}

.cost-note {
	font-size: 24rpx;
	color: #999;
	margin-top: 10rpx;
}

.form-textarea {
	height: 160rpx;
	border: 1rpx solid #eee;
	border-radius: 8rpx;
	padding: 20rpx;
	font-size: 28rpx;
	width: 100%;
	box-sizing: border-box;
	background-color: #fafafa;
}

.submit-btn {
	background-color: #FFA500;
	color: #fff;
	border: none;
	border-radius: 8rpx;
	font-size: 32rpx;
	font-weight: bold;
	padding: 20rpx 0;
	margin-top: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.submit-btn:active {
	opacity: 0.8;
}

.submit-btn[disabled] {
	background-color: #ccc;
	opacity: 0.6;
}

.btn-text {
	margin-left: 10rpx;
}

.records-list {
	padding: 10rpx 0;
}

.record-item {
	display: flex;
	justify-content: space-between;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.record-item:last-child {
	border-bottom: none;
}

.record-left, .record-right {
	display: flex;
	flex-direction: column;
}

.record-left {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.record-date-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.record-date {
	font-size: 28rpx;
	color: #333;
	font-weight: bold;
}

.record-kwh {
	font-size: 24rpx;
	color: #666;
	margin-top: 8rpx;
}

.record-amount {
	font-size: 28rpx;
	color: #333;
	font-weight: bold;
	text-align: right;
}

.record-status {
	font-size: 24rpx;
	margin-top: 8rpx;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
	text-align: center;
}

.empty-records {
	text-align: center;
	color: #999;
	margin-top: 40rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
}

.supplement-reservation-info {
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fffbe6;
	border-radius: 12rpx;
	margin: 30rpx 0 20rpx 0;
	padding: 18rpx 30rpx;
	font-size: 30rpx;
	color: #FFA500;
	box-shadow: 0 2rpx 8rpx rgba(255, 165, 0, 0.08);
}

.supplement-label {
	font-weight: bold;
	margin-right: 8rpx;
}

.supplement-date {
	font-weight: bold;
	color: #333;
}

.supplement-timeslot {
	margin-left: 4rpx;
	color: #FFA500;
}

.record-timeslot-label {
  display: inline-block;
  margin-left: 10rpx;
  margin-right: 10rpx;
  padding: 2rpx 12rpx;
  background: #FFA500;
  color: #fff;
  border-radius: 12rpx;
  font-size: 22rpx;
  vertical-align: middle;
}

.no-reservation-warning {
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff2f0;
	border: 1rpx solid #ffccc7;
	border-radius: 12rpx;
	margin: 30rpx 0 20rpx 0;
	padding: 18rpx 30rpx;
	font-size: 28rpx;
	color: #FF6B6B;
	box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.08);
}

.warning-text {
	font-weight: 500;
}
</style> 