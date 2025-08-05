<template>
	<view class="container">
		<CommonNavBar
			title="预约充电"
			:showBack="true"
		/>
		<view class="content">
			<!-- 日历视图 -->
			<CommonCard customClass="card">
				<view class="calendar-header-bar">
					<uni-icons type="left" size="22" :color="currentReservation ? '#ccc' : '#333'" @click="!currentReservation && prevMonth()" />
					<text class="calendar-header-title">{{ currentYear }}年{{ currentMonth + 1 }}月</text>
					<uni-icons type="right" size="22" :color="currentReservation ? '#ccc' : '#333'" @click="!currentReservation && nextMonth()" />
				</view>
				<view class="card-header">
					<text class="card-title">选择日期</text>
				</view>
				<view class="calendar">
					<view class="calendar-header">
						<view v-for="(day, index) in weekDays" :key="index" class="week-day">{{ day }}</view>
					</view>
					<view class="calendar-body">
						<view 
							v-for="day in daysInMonth" 
							:key="day.date + '-' + day.isCurrentMonth"
							:class="[
								'calendar-day',
								{ 
									'selected': day.date === selectedDate,
									'disabled': (currentReservation && day.date !== selectedDate), // 只保留当前预约限制
									'full': getReservedSlots(day.date).length === 2,
									'today': day.date === today,
									'not-current-month': !day.isCurrentMonth,
									'weekend': isWeekend(day)
								}
							]"
							@click="!currentReservation && selectDate(day.date)"
						>
							<view class="calendar-day-inner">
								<text :class="['calendar-day-number', { 'not-current-month': !day.isCurrentMonth, 'weekend': isWeekend(day) }]">{{ day.day }}</text>
								<!-- 今日角标 -->
								<view v-if="day.date === today" class="today-corner">今</view>
								<!-- 图标标记 -->
								<view class="icon-row">
									<text v-if="getReservedSlots(day.date).includes('day')"
									      :class="['icon-sun', { 'icon-selected': day.date === selectedDate }]">☀️</text>
									<text v-if="getReservedSlots(day.date).includes('night')"
									      :class="['icon-moon', { 'icon-selected': day.date === selectedDate }]">🌙</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</CommonCard>
			<!-- 时段选择 -->
			<CommonCard v-if="selectedDate" customClass="card">
				<view class="card-header">
					<text class="card-title">选择时段</text>
				</view>
				<view class="time-slots">
					<view 
						:class="['time-slot', { 'selected': selectedTimeSlot === 'day', 'disabled': currentReservation && selectedTimeSlot !== 'day' } ]"
						@click="!currentReservation && selectTimeSlot('day')"
						style="position: relative;"
					>
						<view class="time-slot-info-block">
							<view class="info-row">
								<text class="time-slot-name">{{ TIMESLOTS.day.name }}</text>
								<!-- 白班预约信息 -->
								<view v-if="reservations[selectedDate + '_day']" class="reserved-info-avatar-tag">
									<image v-if="reservations[selectedDate + '_day'].user_avatar" :src="reservations[selectedDate + '_day'].user_avatar" class="avatar-img" />
									<view class="reserved-tag">
										{{ reservations[selectedDate + '_day'].user_name || reservations[selectedDate + '_day'].userName || 'XXX' }}已预约
									</view>
								</view>
								<uni-icons v-if="selectedTimeSlot === 'day'" type="checkmarkempty" size="20" color="#FFA500"></uni-icons>
							</view>
							<view class="time-row">
								<text class="time-slot-time-block">{{ TIMESLOTS.day.time }}</text>
							</view>
						</view>
					</view>
					<view 
						:class="['time-slot', { 'selected': selectedTimeSlot === 'night', 'disabled': currentReservation && selectedTimeSlot !== 'night' } ]"
						@click="!currentReservation && selectTimeSlot('night')"
						style="position: relative;"
					>
						<view class="time-slot-info-block">
							<view class="info-row">
								<text class="time-slot-name">{{ TIMESLOTS.night.name }}</text>
								<!-- 夜班预约信息 -->
								<view v-if="reservations[selectedDate + '_night']" class="reserved-info-avatar-tag">
									<image v-if="reservations[selectedDate + '_night'].user_avatar" :src="reservations[selectedDate + '_night'].user_avatar" class="avatar-img" />
									<view class="reserved-tag">
										{{ reservations[selectedDate + '_night'].user_name || reservations[selectedDate + '_night'].userName || 'XXX' }}已预约
									</view>
								</view>
								<uni-icons v-if="selectedTimeSlot === 'night'" type="checkmarkempty" size="20" color="#FFA500"></uni-icons>
							</view>
							<view class="time-row">
								<text class="time-slot-time-block">{{ TIMESLOTS.night.time }}</text>
							</view>
						</view>
					</view>
				</view>
			</CommonCard>
			<!-- 确认按钮 -->
			<button 
				v-if="selectedDate && selectedTimeSlot && !currentReservation" 
				class="confirm-btn"
				@click="confirmReservation"
			>
				确认预约
			</button>
			<!-- 取消预约按钮 -->
			<view v-if="currentReservation" style="margin-top: 40rpx;">
				<button class="cancel-btn" @click="cancelCurrentReservation">取消预约</button>
			</view>
		</view>
	</view>
</template>

<script>
import { getReservations, createReservation, getCurrentReservationStatus, cancelReservation } from '@/api/reservation';
import { formatDate, getCurrentDate, checkAndHandleNeedUploadRecord, getWeekday, goTo, checkAndFetchUserProfile } from '@/utils';
import { TIMESLOTS } from '@/config';
import uniNavBar from '@dcloudio/uni-ui/lib/uni-nav-bar/uni-nav-bar.vue';
import { getUnsubmittedRecord } from '@/api/record';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import CommonNavBar from '@/components/CommonNavBar.vue';
import CommonCard from '@/components/CommonCard.vue';

export default {
	components: {
		uniIcons,
		uniNavBar,
		CommonNavBar,
		CommonCard
	},
	data() {
		return {
			TIMESLOTS,
			weekDays: ['日', '一', '二', '三', '四', '五', '六'],
			currentYear: 0,
			currentMonth: 0,
			selectedDate: '',
			selectedTimeSlot: '',
			reservations: {},
			daysInMonth: [],
			forbidReservation: false,
			currentReservation: null,
			today: '',
			firstEnter: true,
		};
	},
	async onLoad() {
		const now = new Date();
		this.currentYear = now.getFullYear();
		this.currentMonth = now.getMonth();
		// 记录今日日期字符串
		this.today = this.formatDate(now);
		// this.initReservationState(); // 移除，避免重复请求
	},
	onShow() {
		this.firstEnter = true;
		this.initReservationState();
	},
	onHide() {
		if (this.pollingTimer) clearInterval(this.pollingTimer);
	},
	onUnload() {
		if (this.pollingTimer) clearInterval(this.pollingTimer);
	},
	methods: {
		async initReservationState() {
			// 获取当前预约状态
			const res = await getCurrentReservationStatus();
			const data = res && res.data ? res.data : null;

			// 公共处理未上传充电记录
			if (checkAndHandleNeedUploadRecord(data)) {
				return;
			}

			if (data && data.currentReservation) {
				this.currentReservation = data.currentReservation;
				this.selectedDate = data.currentReservation.date.slice(0, 10);
				this.selectedTimeSlot = data.currentReservation.timeslot;
				// 跳转到预约对应的年月
				const [year, month] = this.selectedDate.split('-').map(Number);
				this.currentYear = year;
				this.currentMonth = month - 1;
				await this.loadReservations();
				// 合并当前预约
				const key = this.selectedDate + '_' + this.selectedTimeSlot;
				this.reservations[key] = {
					...data.currentReservation,
					date: this.selectedDate
				};
			} else {
				if (this.firstEnter) {
					// 只有首次进入页面才跳回当月
					const now = new Date();
					this.currentYear = now.getFullYear();
					this.currentMonth = now.getMonth();
					const today = this.formatDate(now);
					this.selectedDate = today;
					this.selectedTimeSlot = '';
					this.currentReservation = null;
					this.firstEnter = false;
				}
				await this.loadReservations();
			}
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
					await this.initReservationState(); // 全量刷新
					this.selectedDate = '';
					this.selectedTimeSlot = '';
					this.currentReservation = null;
					uni.showToast({ title: '已取消预约', icon: 'none' });
				} catch (error) {
					uni.showToast({ title: '取消失败', icon: 'none' });
				} finally {
					uni.hideLoading();
				}
			}
		},
		async checkUnsubmittedRecord() {
			try {
				const res = await getUnsubmittedRecord();
				if (res && res.data && res.data.length > 0) {
					this.forbidReservation = true;
					uni.showModal({
						title: '温馨提示',
						content: '您有上次充电记录未提交，请先提交后再预约！',
						showCancel: false
					});
				} else {
					this.forbidReservation = false;
				}
			} catch (e) {
				this.forbidReservation = false;
			}
		},
		// 加载预约数据并刷新日历
		async loadReservations() {
			uni.showLoading({ title: '加载中' });
			try {
				// 获取本月所有预约
				const monthStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}`;
				const res = await getReservations(monthStr);
				const reservations = {};
				if (res && Array.isArray(res.data)) {
					res.data.forEach(item => {
						// 只记录未取消的预约
						if (item.status !== 'cancelled') {
							// 只保留年月日部分
							const dateStr = item.date.slice(0, 10);
							reservations[dateStr + '_' + item.timeslot] = {
								...item,
								date: dateStr
							};
						}
					});
				}
				this.reservations = reservations;
				this.loadCalendarData();
			} catch (error) {
				uni.showToast({ title: '获取预约数据失败', icon: 'none' });
				console.error('获取预约数据失败', error);
			} finally {
				uni.hideLoading();
			}
		},
		// 加载日历数据
		loadCalendarData() {
			const year = this.currentYear;
			const month = this.currentMonth;
			const firstDay = new Date(year, month, 1).getDay();
			const lastDate = new Date(year, month + 1, 0).getDate();
			const days = [];
			const prevMonthLastDate = new Date(year, month, 0).getDate();
			// 上月补齐
			for (let i = firstDay - 1; i >= 0; i--) {
				const day = prevMonthLastDate - i;
				const dateObj = new Date(year, month - 1, day);
				const date = this.formatDate(dateObj);
				days.push({
					day,
					date,
					isCurrentMonth: dateObj.getFullYear() === year && dateObj.getMonth() === month,
					isReserved: this.isDateReserved(date),
					reservedSlots: this.getReservedSlots(date)
				});
			}
			// 本月
			for (let i = 1; i <= lastDate; i++) {
				const dateObj = new Date(year, month, i);
				const date = this.formatDate(dateObj);
				days.push({
					day: i,
					date,
					isCurrentMonth: dateObj.getFullYear() === year && dateObj.getMonth() === month,
					isReserved: this.isDateReserved(date),
					reservedSlots: this.getReservedSlots(date)
				});
			}
			// 下月补齐
			const remainingDays = 42 - days.length;
			for (let i = 1; i <= remainingDays; i++) {
				const dateObj = new Date(year, month + 1, i);
				const date = this.formatDate(dateObj);
				days.push({
					day: i,
					date,
					isCurrentMonth: dateObj.getFullYear() === year && dateObj.getMonth() === month,
					isReserved: this.isDateReserved(date),
					reservedSlots: this.getReservedSlots(date)
				});
			}
			this.daysInMonth = days;
		},
		getReservedSlots(date) {
			// 返回该日期已预约的时间段数组
			return Object.values(this.reservations)
				.filter(r => r.date === date && r.status !== 'cancelled')
				.map(r => r.timeslot);
		},
		// 判断某天是否已被预约（任意时段）
		isDateReserved(date) {
			// 只要有一个时间段被预约就算已预约
			return this.getReservedSlots(date).length > 0;
		},
		// 选择日期
		selectDate(date) {
			if (this.forbidReservation) {
				uni.showToast({ title: '请先提交上次充电记录', icon: 'none' });
				return;
			}
			const [year, month] = date.split('-').map(Number);
			if (year !== this.currentYear || month !== this.currentMonth + 1) {
				this.currentYear = year;
				this.currentMonth = month - 1;
				this.selectedDate = date;
				this.initReservationState().then(() => {
					this.selectedDate = date;
				});
				return;
			}
			this.selectedDate = date;
			// 如果有预约且选中的日期等于预约日期，自动选中班次
			if (this.currentReservation && this.currentReservation.date === date) {
				this.selectedTimeSlot = this.currentReservation.timeslot;
			} else {
				this.selectedTimeSlot = '';
			}
		},
		// 选择时段
		selectTimeSlot(slot) {
			// 禁止选择已被预约的时间段
			const reserved = this.getReservedSlots(this.selectedDate);
			if (reserved.includes(slot)) {
				uni.showToast({ title: '该时段已被预约', icon: 'none' });
				return;
			}
			this.selectedTimeSlot = slot;
		},
		async beforeCreateReservation() {
			const res = await getCurrentReservationStatus();
			if (res && res.data) {
				if (checkAndHandleNeedUploadRecord(res.data)) {
					return false;
				}
				if (res.data.currentReservation && !this.isCurrentReservationExpired(res.data.currentReservation)) {
					uni.showToast({
						title: '当前有未结束预约，不能重复预约',
						icon: 'none'
					});
					return false;
				}
			}
			return true;
		},
		async confirmReservation() {
			const profileComplete = await checkAndFetchUserProfile();
			if (!profileComplete) {
				uni.showToast({ title: '请设置头像和昵称', icon: 'none' });
				return;
			}
			if (!(await this.beforeCreateReservation())) return;
			if (this.forbidReservation) {
				uni.showToast({ title: '请先提交上次充电记录', icon: 'none' });
				return;
			}
			if (!this.selectedDate || !this.selectedTimeSlot) {
				uni.showToast({ title: '请选择日期和时段', icon: 'none' });
				return;
			}
			// 校验冲突
			const reserved = this.getReservedSlots(this.selectedDate);
			if (reserved.includes(this.selectedTimeSlot)) {
				uni.showToast({ title: '该时段已被预约', icon: 'none' });
				return;
			}
			uni.showLoading({ title: '预约中' });
			try {
				await createReservation({ date: this.selectedDate, timeslot: this.selectedTimeSlot });
				// 只跳转首页，不再弹窗，首页会自动检测未上传充电记录
				uni.showToast({ title: '预约成功', icon: 'success' });
				setTimeout(() => {
					goTo('/pages/index/index');
				}, 1000);
			} catch (error) {
				if (error && error.data && error.data.message) {
					uni.showModal({
						title: '提示',
						content: error.data.message,
						showCancel: false
					});
				} else {
					uni.showToast({ title: '预约失败', icon: 'none' });
				}
			} finally {
				uni.hideLoading();
			}
		},
		isCurrentReservationExpired(reservation) {
			// 判断当前预约是否已过期
			const now = new Date();
			const endTime = new Date(reservation.endTime); // 需后端返回 endTime 字段
			return now > endTime;
		},
		// 返回
		navigateBack() {
			uni.navigateBack();
		},
		formatDate(date) {
			const y = date.getFullYear();
			const m = String(date.getMonth() + 1).padStart(2, '0');
			const d = String(date.getDate()).padStart(2, '0');
			return `${y}-${m}-${d}`;
		},
		prevMonth() {
			if (this.currentMonth === 0) {
				this.currentYear -= 1;
				this.currentMonth = 11;
			} else {
				this.currentMonth -= 1;
			}
			this.selectedDate = '';
			this.initReservationState(); // 全量刷新
		},
		nextMonth() {
			if (this.currentMonth === 11) {
				this.currentYear += 1;
				this.currentMonth = 0;
			} else {
				this.currentMonth += 1;
			}
			this.selectedDate = '';
			this.initReservationState(); // 全量刷新
		},
		isWeekend(day) {
			// 0:周日, 6:周六
			const d = new Date(day.date);
			return d.getDay() === 0 || d.getDay() === 6;
		},
		// 导航栏右侧点击事件
		rightClick() {
			goTo('/pages/profile/index');
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
</script>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f8f8f8;
}

.content {
	flex: 1;
	padding: 20rpx;
	padding-top: 0;
	overflow-y: auto;
}

.card {
	background-color: #fff;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
	padding: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	border: 2rpx solid #f0f0f0;
}

.card-header {
	margin-bottom: 20rpx;
}

.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.calendar {
	width: 100%;
}

.calendar-header {
	display: flex;
	justify-content: space-around;
	margin-bottom: 20rpx;
}

.week-day {
	width: 14.28%;
	text-align: center;
	font-size: 28rpx;
	color: #666;
}

.calendar-body {
	display: flex;
	flex-wrap: wrap;
}

.calendar-day {
	width: 14.28%;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 10rpx;
	transition: background-color 0.2s;
	position: relative;
	z-index: 1;
	background: #fff;
	transition: background 0.2s;
	border-radius: 8rpx;
	border: none;
}

.calendar-day.full {
	background: #f2f2f2 !important;
}

.calendar-day.other-month {
	color: #ccc;
}

.calendar-day.disabled {
	background-color: #f0f0f0;
	color: #ccc;
	cursor: not-allowed;
}

.calendar-day.selected {
	border: 2rpx solid #4CAF50 !important;
	background: #fff;
	border-radius: 8rpx;
	box-sizing: border-box;
}
.calendar-day.not-current-month {
	color: #ccc;
	background: #fafafa;
}
.calendar-day.weekend {
	color: #FF4D4F;
}
.calendar-day[data-has-reservation="true"] {
	border: 2rpx solid #FFA500;
	position: relative;
}
.calendar-day .reservation-dot {
	position: absolute;
	bottom: 10rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 28rpx;
	height: 28rpx;
	border-radius: 50%;
	background: #FFA500;
	box-shadow: 0 2rpx 6rpx rgba(255, 165, 0, 0.18);
	border: 2rpx solid #fff;
	z-index: 2;
}
.calendar-day .half-dot {
	position: absolute;
	left: 50%;
	width: 28rpx;
	height: 14rpx;
	background: #FFA500;
	transform: translateX(-50%);
	z-index: 2;
	box-shadow: 0 1rpx 4rpx rgba(255, 165, 0, 0.12);
	border: 2rpx solid #fff;
}
.half-dot.day {
	bottom: 10rpx;
	border-radius: 14rpx 14rpx 0 0;
}
.half-dot.night {
	bottom: 10rpx;
	border-radius: 0 0 14rpx 14rpx;
}

.calendar-day:not(.disabled):not(.selected):active {
	background-color: #f0f0f0;
}

.time-slots {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.time-slot {
	padding: 20rpx;
	border: 2rpx solid #eee;
	border-radius: 8rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	transition: all 0.2s;
}

.time-slot.selected {
	border-color: #FFA500;
	background-color: rgba(255, 165, 0, 0.05);
}

.time-slot-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-right: 8rpx;
}

.time-slot-time {
	font-size: 24rpx;
	color: #666;
}

.reserved-info {
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #888;
	display: flex;
	flex-direction: column;
}
.reserved-user {
	color: #d2691e;
}
.reserved-time {
	color: #aaa;
	font-size: 22rpx;
}

.reserved-info-inline {
	color: #888;
	font-size: 24rpx;
	margin-left: 0;
}

.reserved-info-block {
	margin-top: 8rpx;
	color: #999;
	font-size: 24rpx;
	line-height: 1.6;
}

.confirm-btn {
	margin-top: 40rpx;
	background-color: #FFA500;
	color: #fff;
	border: none;
	border-radius: 8rpx;
	font-size: 32rpx;
	font-weight: bold;
	padding: 20rpx 0;
	transition: opacity 0.2s;
}

.confirm-btn:active {
	opacity: 0.8;
}

.cancel-btn {
	margin-top: 40rpx;
	background-color: #FFA500;
	color: #fff;
	border: none;
	border-radius: 8rpx;
	font-size: 32rpx;
	font-weight: bold;
	padding: 20rpx 0;
	transition: opacity 0.2s;
}

.cancel-btn:active {
	opacity: 0.8;
}

.current-reservation-info {
	text-align: center;
	font-size: 30rpx;
}
.time-slot-info-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}
.slot-label {
	display: flex;
	flex-direction: row;
	align-items: center;
}
.time-slot-info-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.time-row {
  margin-top: 2rpx;
}
.time-slot-time-block {
  color: #bbb;
  font-size: 24rpx;
  line-height: 1.6;
}
.corner-tag {
	position: absolute;
	font-size: 18rpx;
	padding: 0 8rpx;
	border-radius: 8rpx;
	color: #fff;
	z-index: 2;
	line-height: 1.4;
}
.day-tag {
	left: 2rpx;
	bottom: 2rpx;
	background: #FFA500;
}
.night-tag {
	right: 2rpx;
	bottom: 2rpx;
	background: #409EFF;
}
.full-tag {
	right: 2rpx;
	top: 2rpx;
	background: #bbb;
	color: #fff;
	font-size: 16rpx;
	padding: 0 6rpx;
}
.icon-row {
  position: absolute;
  left: 50%;
  bottom: 2rpx;
  transform: translateX(-50%);
  display: flex;
  flex-direction: row;
  gap: 4rpx;
  z-index: 2;
}
.icon-sun {
  font-size: 22rpx;
  color: #FFA500;
  margin-right: 2rpx;
  text-shadow: none;
}
.icon-moon {
  font-size: 22rpx;
  color: #409EFF;
  text-shadow: none;
}
.icon-selected {
  color: #d2691e !important;
  text-shadow: 0 0 4rpx #fff, 0 0 2rpx #fff;
}
.today-dot {
  position: absolute;
  left: 50%;
  bottom: 32rpx;
  transform: translateX(-50%);
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #409EFF;
  z-index: 3;
}
.calendar-day.today {
  border: 2rpx solid #409EFF;
  box-sizing: border-box;
  border-radius: 50%;
}
.calendar-header-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}
.calendar-header-title {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}
.calendar-arrow {
  font-size: 36rpx;
  color: #333;
  padding: 0 16rpx;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}
.calendar-arrow.disabled {
  color: #ccc;
  cursor: not-allowed;
}
.calendar-day-inner {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.calendar-day-number {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}
.calendar-day-number.weekend {
  color: #FF4D4F;
}
.calendar-day-number.not-current-month {
  color: #ccc !important;
}
.today-corner {
  position: absolute;
  left: 2rpx;
  top: 2rpx;
  font-size: 18rpx;
  color: #fff;
  background: #4CAF50;
  border-radius: 8rpx;
  padding: 0 6rpx;
  z-index: 3;
  line-height: 1.2;
}
/* 样式部分 */
.calendar-day, .calendar-day.selected, .calendar-day.today {
  border-radius: 8rpx !important;
  border: none;
  box-sizing: border-box;
}
.reserved-info-avatar-tag {
  display: flex;
  align-items: center;
  margin-left: 8rpx;
}
.avatar-img {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  margin-right: 8rpx;
  background: #f0f0f0;
  object-fit: cover;
}
.reserved-tag {
  display: inline-block;
  background: #FFD591; /* 原为#FFF7E6，改为更深的橙色 */
  color: #D46B08;     /* 原为#FFA500，改为更深的橙色文字 */
  border-radius: 16rpx;
  padding: 4rpx 16rpx;
  font-size: 22rpx;
  font-weight: 500;
}
</style> 