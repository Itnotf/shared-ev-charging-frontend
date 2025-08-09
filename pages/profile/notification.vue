<template>
  <view class="container">
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
            <switch
              :checked="item.enabled"
              @change="toggleNotification(idx)"
              :color="SUCCESS_COLOR"
            />
          </template>
        </BaseGroupItem>
      </BaseGroup>
      <!-- 消息接收方式分组 -->
      <BaseGroup>
        <BaseGroupItem title="微信服务通知" desc="通过微信服务通知接收消息">
          <template #right>
            <radio value="wechat" :checked="true" :color="SUCCESS_COLOR" disabled />
          </template>
        </BaseGroupItem>
      </BaseGroup>
      <!-- 免打扰分组 -->
      <BaseGroup>
        <BaseGroupItem title="消息免打扰" desc="开启后将不再接收通知">
          <template #right>
            <switch :checked="quietModeEnabled" @change="toggleQuietMode" :color="SUCCESS_COLOR" />
          </template>
        </BaseGroupItem>
        <BaseGroupItem v-if="quietModeEnabled">
          <template #default>
            <view class="time-range">
              <text class="time-label">时间段</text>
              <picker mode="time" :value="quietTimeStart" @change="changeStartTime">
                <view class="time-picker">{{ quietTimeStart }}</view>
              </picker>
              <text class="time-label">至</text>
              <picker mode="time" :value="quietTimeEnd" @change="changeEndTime">
                <view class="time-picker">{{ quietTimeEnd }}</view>
              </picker>
            </view>
          </template>
        </BaseGroupItem>
      </BaseGroup>
    </view>
  </view>
</template>

<script>

  import BaseGroup from '@/components/BaseGroup.vue';
  import BaseGroupItem from '@/components/BaseGroupItem.vue';
  import { SUCCESS_COLOR } from '@/config';
  export default {
    components: { BaseGroup, BaseGroupItem },
    data() {
      return {
        notificationSettings: [
          { title: '预约提醒', desc: '预约成功或被取消时提醒', enabled: true },
          { title: '充电完成提醒', desc: '充电记录提交后提醒', enabled: true },
          { title: '系统通知', desc: '系统更新、维护通知', enabled: false },
        ],
        quietModeEnabled: false,
        quietTimeStart: '22:00',
        quietTimeEnd: '08:00',
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
      },
    },
    computed: {
      SUCCESS_COLOR() {
        return SUCCESS_COLOR;
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '@/uni.scss';
  .container {
    min-height: 100vh;
    background: $uni-bg-color-grey;
    padding-bottom: $uni-spacing-row-base;
    padding-top: $uni-spacing-row-base;
  }
  .content {
    padding: 0 $uni-spacing-row-sm;
  }
  /* 时间段自定义样式 token 化 */
  .time-range {
    display: flex;
    align-items: center;
    padding: $uni-spacing-col-sm 0;
  }
  .time-label {
    font-size: $uni-font-size-lg;
    color: $uni-text-color-grey;
    margin: 0 $uni-spacing-row-sm 0 0;
  }
  .time-picker {
    font-size: $uni-font-size-lg;
    color: $uni-text-color;
    background: $uni-bg-color-grey;
    border-radius: $uni-border-radius-lg;
    padding: $uni-spacing-col-sm $uni-spacing-row-lg;
    margin: 0 $uni-spacing-row-base;
    border: 1rpx solid $uni-border-color;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
    transition: border 0.2s;
  }
  .time-picker:active {
    border: 1rpx solid $uni-color-success;
  }
</style>
