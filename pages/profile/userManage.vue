<template>
  <view class="container">
    <CommonNavBar title="用户管理" :showBack="true" />
    <view class="content">
      <view v-for="user in users" :key="user.id" class="user-card">
        <image :src="getAvatarUrl(user.avatar)" class="user-avatar" />
        <view class="user-info">
          <view class="user-header">
            <text class="user-name">{{ user.user_name }}</text>
            <text class="user-role" v-if="user.role === 'admin'">（管理员）</text>
          </view>
          <view class="user-actions">
            <view class="action-item">
              <text>可预约：</text>
              <switch :checked="user.can_reserve" @change="toggleReserve(user)" />
            </view>
            <view class="action-item">
              <text>电价：</text>
              <input class="unit-price-input" v-model="user.editingPrice" type="number" :disabled="!user.editing" />
              <button v-if="!user.editing" size="mini" @click="editPrice(user)">编辑</button>
              <button v-else size="mini" type="primary" @click="savePrice(user)">保存</button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CommonNavBar from '@/components/CommonNavBar.vue';
import { getAllUsers, updateUserReserve, updateUserPrice } from '@/api/admin';
import { getAvatarUrl } from '@/utils';

export default {
  components: { CommonNavBar },
  data() {
    return {
      users: []
    };
  },
  async onShow() {
    await this.loadUsers();
  },
  methods: {
    getAvatarUrl,
    async loadUsers() {
      const res = await getAllUsers();
      this.users = (res.users || []).map(u => ({ ...u, editing: false, editingPrice: u.unit_price }));
    },
    async toggleReserve(user) {
      await updateUserReserve(user.id, !user.can_reserve);
      user.can_reserve = !user.can_reserve;
    },
    editPrice(user) {
      user.editing = true;
    },
    async savePrice(user) {
      await updateUserPrice(user.id, Number(user.editingPrice));
      user.unit_price = Number(user.editingPrice);
      user.editing = false;
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f8f8;
}
.content {
  flex: 1;
  padding: 24rpx;
  overflow-y: auto;
}
.user-card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
  align-items: center;
}
.user-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-right: 24rpx;
  background: #eee;
}
.user-info {
  flex: 1;
}
.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}
.user-name {
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 12rpx;
}
.user-role {
  font-size: 24rpx;
  color: #888;
}
.user-actions {
  display: flex;
  gap: 32rpx;
}
.action-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.unit-price-input {
  width: 100rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 4rpx 8rpx;
  margin: 0 8rpx;
}
</style>