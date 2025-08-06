<template>
	<view class="container">
		<!-- 导航栏 -->
		<CommonNavBar title="编辑记录" :showBack="true" />
		
		<!-- 内容区域 -->
		<view class="content">
			<!-- 原记录信息展示 -->
			<view class="original-info-card">
				<view class="card-header">
					<text class="card-title">原记录信息</text>
				</view>
				<view class="original-info">
					<view class="info-row">
						<text class="info-label">日期：</text>
						<text class="info-value">{{ formatDate(record.date, 'YYYY年MM月DD日') }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">时段：</text>
						<text class="info-value">{{ getTimeslotLabel(record.timeslot) }}</text>
					</view>
					<view class="info-row">
						<text class="info-label">原度数：</text>
						<text class="info-value">{{ record.kwh }} kWh</text>
					</view>
				</view>
			</view>
			
			<!-- 图片上传 -->
			<view class="card">
				<view class="card-header">
					<text class="card-title">充电截图</text>
					<text class="card-subtitle">点击重新上传</text>
				</view>
				<view class="upload-area" @click="chooseImage">
					<block v-if="imageUrl">
						<image :src="imageUrl" mode="aspectFill" class="upload-image"></image>
						<view class="image-overlay">
							<text class="overlay-text">点击更换图片</text>
						</view>
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
				@click="updateRecord"
				:disabled="!kwh || parseFloat(kwh) <= 0"
			>
				<uni-icons type="checkmarkempty" size="20" color="#fff"></uni-icons>
				<text class="btn-text">保存修改</text>
			</button>
		</view>
	</view>
</template>

<script>
import { getRecordDetail, updateRecord } from '@/api/record';
import { formatDate, compressImage, getRecordImageUrl } from '@/utils';
import { TIMESLOTS } from '@/config';
import { uploadFile } from '@/api/index';
import CommonNavBar from '@/components/CommonNavBar.vue';
import { getUserPrice } from '@/api/auth';

export default {
	components: {
		CommonNavBar
	},
	data() {
		return {
			TIMESLOTS,
			userPrice: 0,
			recordId: '',
			record: {
				id: '',
				date: '',
				timeslot: '',
				kwh: 0,
				amount: 0,
				remark: '',
				image_url: ''
			},
			imageUrl: '',
			tempFilePath: '',
			kwh: '',
			cost: '0.00',
			remark: '',
			loading: false
		};
	},
	onLoad(options) {
		if (options && options.id) {
			this.recordId = options.id;
			this.loadRecordDetail();
		}
	},
	methods: {
		async loadRecordDetail() {
			this.loading = true;
			try {
				const res = await getRecordDetail(this.recordId);
				if (res && res.data) {
					this.record = res.data;
					// 加载用户电价后再赋值 kwh 并计算金额
					await this.loadUserPrice();
					this.kwh = String(this.record.kwh);
					this.remark = this.record.remark || '';
					this.imageUrl = getRecordImageUrl(this.record.image_url || '');
					this.calculateCost();
				}
			} catch (error) {
				uni.showToast({ title: '加载记录详情失败', icon: 'none' });
			} finally {
				this.loading = false;
			}
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
		
		async chooseImage() {
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
		
		calculateCost() {
			this.cost = this.kwh ? (parseFloat(this.kwh) * parseFloat(this.userPrice)).toFixed(2) : '0.00';
		},
		
		async updateRecord() {
			if (!this.kwh || parseFloat(this.kwh) <= 0) {
				uni.showToast({ title: '请输入有效的充电度数', icon: 'none' });
				return;
			}
			
			uni.showLoading({ title: '保存中' });
			try {
				let imageUrl = this.record.image_url; // 默认使用原图片
				
				// 如果选择了新图片，则上传
				if (this.tempFilePath) {
					console.log('[日志] 开始上传新图片:', this.tempFilePath);
					const uploadRes = await uploadFile(this.tempFilePath);
					console.log('[日志] 图片上传结果:', uploadRes);
					if (uploadRes && uploadRes.data && uploadRes.data.url) {
						imageUrl = uploadRes.data.url;
					}
				}
				
				const updateData = {
					kwh: parseFloat(this.kwh),
					image_url: imageUrl,
					remark: this.remark
				};
				
				console.log('[日志] 提交更新数据:', updateData);
				await updateRecord(this.recordId, updateData);
				console.log('[日志] 更新成功');
				
				uni.showToast({ title: '保存成功', icon: 'success' });
				
				// 返回详情页面
				setTimeout(() => {
					uni.navigateBack();
				}, 800);
			} catch (error) {
				console.error('[日志] 更新失败:', error);
				uni.showToast({ title: '保存失败', icon: 'none' });
			} finally {
				uni.hideLoading();
			}
		},
		
		formatDate(date, format) {
			return formatDate(date, format);
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

.original-info-card {
	background: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	padding: 24rpx 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.04);
	border-left: 4rpx solid #FFA500;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.card-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
}

.card-subtitle {
	font-size: 24rpx;
	color: #999;
}

.original-info {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.info-row {
	display: flex;
	align-items: center;
}

.info-label {
	font-size: 26rpx;
	color: #666;
	min-width: 120rpx;
}

.info-value {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
}

.card {
	background: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	padding: 24rpx 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.04);
}

.upload-area {
	height: 240rpx;
	border: 2rpx dashed #ddd;
	border-radius: 12rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #f9f9f9;
	cursor: pointer;
	position: relative;
	overflow: hidden;
}

.upload-image {
	width: 100%;
	height: 100%;
	border-radius: 12rpx;
}

.image-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: opacity 0.2s;
}

.upload-area:active .image-overlay {
	opacity: 1;
}

.overlay-text {
	color: #fff;
	font-size: 24rpx;
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
	background: linear-gradient(90deg, #FFA500 0%, #FFB84D 100%);
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 32rpx;
	font-weight: bold;
	padding: 20rpx 0;
	margin-top: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(255, 165, 0, 0.2);
	transition: opacity 0.2s;
}

.submit-btn:active {
	opacity: 0.8;
}

.submit-btn[disabled] {
	background: #ccc;
	opacity: 0.6;
}

.btn-text {
	margin-left: 10rpx;
}
</style> 