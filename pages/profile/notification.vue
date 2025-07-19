<template>
	<view class="container">
    <CommonNavBar title="通知设置" :showBack="true" />
		<view class="content">
      <!-- 通知类型分组 -->
      <BaseGroup>
        <BaseGroupItem
          v-for="(item, idx) in notificationSettings"
          :key="idx"
          :title="item.title"
          :desc="item.desc"
        >
          <template #right>
            <switch :checked="item.enabled" @change="toggleNotification(idx)" color="#07c160" />
          </template>
        </BaseGroupItem>
      </BaseGroup>
      <!-- 消息接收方式分组 -->
      <BaseGroup>
        <BaseGroupItem
          title="微信服务通知"
          desc="通过微信服务通知接收消息"
        >
          <template #right>
            <radio value="wechat" :checked="true" color="#07c160" disabled />
          </template>
        </BaseGroupItem>
      </BaseGroup>
      <!-- 免打扰分组 -->
      <BaseGroup>
        <BaseGroupItem
          title="消息免打扰"
          desc="开启后将不再接收通知"
        >
          <template #right>
            <switch :checked="quietModeEnabled" @change="toggleQuietMode" color="#07c160" />
          </template>
        </BaseGroupItem>
        <BaseGroupItem v-if="quietModeEnabled">
          <template #default>
            <view class="base-group-item-time-range">
              <text class="base-group-item-time-label">时间段</text>
              <picker mode="time" :value="quietTimeStart" @change="changeStartTime">
                <view class="base-group-item-time-picker">{{ quietTimeStart }}</view>
              </picker>
              <text class="base-group-item-time-label">至</text>
              <picker mode="time" :value="quietTimeEnd" @change="changeEndTime">
                <view class="base-group-item-time-picker">{{ quietTimeEnd }}</view>
              </picker>
            </view>
          </template>
        </BaseGroupItem>
      </BaseGroup>
		</view>
	</view>
</template>

<script>
import CommonNavBar from '@/components/CommonNavBar.vue';
import BaseGroup from '@/components/BaseGroup.vue';
import BaseGroupItem from '@/components/BaseGroupItem.vue';
export default {
  components: { CommonNavBar, BaseGroup, BaseGroupItem },
	data() {
		return {
			notificationSettings: [
        { title: '预约提醒', desc: '预约成功或被取消时提醒', enabled: true },
        { title: '充电完成提醒', desc: '充电记录提交后提醒', enabled: true },
        { title: '系统通知', desc: '系统更新、维护通知', enabled: false }
			],
			quietModeEnabled: false,
			quietTimeStart: '22:00',
			quietTimeEnd: '08:00'
		};
	},
	methods: {
    toggleNotification(idx) {
      const old = this.notificationSettings[idx].enabled;
      this.notificationSettings[idx].enabled = !old;
      if (old !== this.notificationSettings[idx].enabled) {
        this.autoSave();
      }
    },
		toggleQuietMode(e) {
      const old = this.quietModeEnabled;
			this.quietModeEnabled = e.detail.value;
      if (old !== this.quietModeEnabled) {
        this.autoSave();
      }
		},
		changeStartTime(e) {
      if (this.quietTimeStart !== e.detail.value) {
			this.quietTimeStart = e.detail.value;
        this.autoSave();
      }
		},
		changeEndTime(e) {
      if (this.quietTimeEnd !== e.detail.value) {
			this.quietTimeEnd = e.detail.value;
        this.autoSave();
      }
		},
    autoSave() {
      uni.showToast({ title: '已保存', icon: 'none', duration: 800 });
		}
	}
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f7f7f7;
  padding-bottom: 32rpx;
  padding-top: 24rpx;
}
.content {
  padding: 0 12rpx;
}
/* 只保留时间段自定义样式 */
.base-group-item-time-range {
  display: flex;
  align-items: center;
  padding: 10rpx 0;
}
.base-group-item-time-label {
  font-size: 30rpx;
  color: #888;
  margin: 0 12rpx 0 0;
}
.base-group-item-time-picker {
  font-size: 32rpx;
  color: #222;
  background: #f7f7f7;
  border-radius: 12rpx;
  padding: 12rpx 36rpx;
  margin: 0 16rpx;
  border: 1rpx solid #e0e0e0;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
  transition: border 0.2s;
}
.base-group-item-time-picker:active {
  border: 1rpx solid #07c160;
}
</style> 