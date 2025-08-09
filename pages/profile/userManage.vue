<template>
  <view class="user-manage">
    <CommonNavBar title="用户管理" :showBack="true" />

    <view class="content">
      <view class="user-list">
        <view v-for="(user, index) in users" :key="user.id" class="user-item">
          <view class="user-info">
            <image :src="getAvatarUrl(user.avatar)" class="avatar" />
            <view class="user-details">
              <text class="username">{{ user.user_name || user.nickname || '未设置昵称' }}</text>
              <text class="phone" v-if="user.phone">{{ user.phone }}</text>
            </view>
          </view>

          <view class="user-actions">
            <view class="reserve-section">
              <text class="reserve-label">可预约：</text>
              <switch
                :checked="!!user.can_reserve"
                @change="toggleReserve(index)"
                :color="SUCCESS_COLOR"
              />
            </view>

            <view class="price-section">
              <text class="price-label">单价：</text>
              <text v-if="!user.editing" class="price-value"
                >¥{{ user.unit_price || 0.5 }}/kWh</text
              >
              <input
                v-else
                v-model="user.editingPrice"
                type="digit"
                class="price-input"
                placeholder="输入单价"
              />
            </view>

            <view class="action-buttons">
              <button v-if="!user.editing" @click="editUser(index)" class="edit-btn">编辑</button>
              <button v-else @click="saveUser(index)" class="save-btn">保存</button>
              <button v-if="user.editing" @click="cancelEdit(index)" class="cancel-btn">
                取消
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import CommonNavBar from '@/components/CommonNavBar.vue';
  import { getAllUsers, updateUserPrice, updateUserReserve } from '@/api/admin';
  import { getPayload, getAvatarUrl } from '@/utils';
  import { SUCCESS_COLOR } from '@/config';

  export default {
    name: 'UserManage',
    components: {
      CommonNavBar,
    },
    data() {
      return {
        users: [],
      };
    },
    onLoad() {
      this.loadUsers();
    },
    methods: {
      getAvatarUrl,
      async loadUsers() {
        uni.showLoading({ title: '加载中' });
        try {
          const res = await getAllUsers();
          const payload = getPayload(res);
          const list = payload.users || payload || [];
          this.users = list.map((u) => ({
            ...u,
            editing: false,
            editingPrice: u.unit_price,
          }));
        } catch (error) {
          uni.showToast({ title: '加载失败', icon: 'none' });
          console.error('加载用户列表失败:', error);
        } finally {
          uni.hideLoading();
        }
      },
      editUser(index) {
        this.users[index].editing = true;
      },
      async saveUser(index) {
        const user = this.users[index];
        const newPrice = parseFloat(user.editingPrice);

        if (isNaN(newPrice) || newPrice <= 0) {
          uni.showToast({ title: '请输入有效单价', icon: 'none' });
          return;
        }

        uni.showLoading({ title: '保存中' });
        try {
          await updateUserPrice(user.id, newPrice);
          user.unit_price = newPrice;
          user.editing = false;
          uni.showToast({ title: '保存成功', icon: 'success' });
        } catch (error) {
          uni.showToast({ title: '保存失败', icon: 'none' });
          console.error('更新用户单价失败:', error);
        } finally {
          uni.hideLoading();
        }
      },
      cancelEdit(index) {
        const user = this.users[index];
        user.editingPrice = user.unit_price;
        user.editing = false;
      },
      async toggleReserve(index) {
        const user = this.users[index];
        const next = !user.can_reserve;
        try {
          await updateUserReserve(user.id, next);
          this.users.splice(index, 1, { ...user, can_reserve: next });
        } catch (error) {
          uni.showToast({ title: '更新失败', icon: 'none' });
          console.error('更新预约权限失败:', error);
        }
      },
    },
    computed: {
      SUCCESS_COLOR() {
        return SUCCESS_COLOR;
      },
    },
  };
</script>

<style lang="scss">
  @import '@/uni.scss';

  .user-manage {
    min-height: 100vh;
    background-color: $uni-bg-color-grey;

    .content {
      padding: $uni-spacing-row-base;
    }

    .user-list {
      .user-item {
        background-color: $uni-bg-color;
        border-radius: $uni-border-radius-lg;
        padding: $uni-spacing-row-base;
        margin-bottom: $uni-spacing-row-base;
        box-shadow: $charging-shadow-sm;

        .user-info {
          display: flex;
          align-items: center;
          margin-bottom: $uni-spacing-row-sm;

          .avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
            margin-right: $uni-spacing-row-sm;
          }

          .user-details {
            flex: 1;

            .username {
              display: block;
              font-size: $uni-font-size-lg;
              color: $uni-text-color;
              font-weight: bold;
              margin-bottom: 4rpx;
            }

            .phone {
              display: block;
              font-size: $uni-font-size-base;
              color: $uni-text-color-grey;
            }
          }
        }

        .user-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: $uni-spacing-row-sm;

          .reserve-section {
            display: flex;
            align-items: center;
            gap: $uni-spacing-row-xs;

            .reserve-label {
              font-size: $uni-font-size-base;
              color: $uni-text-color;
            }
          }

          .price-section {
            display: flex;
            align-items: center;

            .price-label {
              font-size: $uni-font-size-base;
              color: $uni-text-color;
              margin-right: $uni-spacing-row-xs;
            }

            .price-value {
              font-size: $uni-font-size-lg;
              color: $charging-color-primary;
              font-weight: bold;
            }

            .price-input {
              width: 120rpx;
              height: 60rpx;
              border: 1rpx solid $uni-border-color;
              border-radius: $uni-border-radius-base;
              padding: 0 $uni-spacing-row-xs;
              font-size: $uni-font-size-base;
              text-align: center;
            }
          }

          .action-buttons {
            display: flex;
            gap: $uni-spacing-row-xs;

            .edit-btn,
            .save-btn,
            .cancel-btn {
              padding: 12rpx 24rpx;
              border-radius: $uni-border-radius-base;
              font-size: $uni-font-size-sm;
              border: none;
            }

            .edit-btn {
              background-color: $charging-color-primary;
              color: $uni-text-color-inverse;
            }

            .save-btn {
              background-color: $uni-color-success;
              color: $uni-text-color-inverse;
            }

            .cancel-btn {
              background-color: $uni-bg-color-grey;
              color: $uni-text-color;
              border: 1rpx solid $uni-border-color;
            }
          }
        }
      }
    }
  }
</style>
