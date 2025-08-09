<template>
  <view class="user-manage">

    <view class="content">
      <CommonCard customClass="toolbar-card" padding="20rpx" margin="0 0 12rpx 0">
        <view class="toolbar-row">
          <input
            class="input-base search-input"
            type="text"
            v-model="searchQuery"
            placeholder="搜索昵称"
            confirm-type="search"
          />
          <view class="filter-tabs">
            <text :class="['tab', { active: filterStatus === 'all' }]" @click="setFilter('all')">全部</text>
            <text :class="['tab', { active: filterStatus === 'can' }]" @click="setFilter('can')">可预约</text>
            <text :class="['tab', { active: filterStatus === 'cannot' }]" @click="setFilter('cannot')">禁用</text>
          </view>
        </view>
      </CommonCard>

      <CommonCard customClass="summary-card" padding="16rpx" margin="0 0 12rpx 0">
        <text class="summary-text">
          共 <text class="summary-num">{{ totalUsers }}</text> 人，
          可预约 <text class="summary-num active">{{ reservableCount }}</text> 人，
          禁用 <text class="summary-num disabled">{{ totalUsers - reservableCount }}</text> 人
        </text>
      </CommonCard>

      <view class="user-list">
        <CommonCard v-for="(user, index) in filteredUsers" :key="user.id" customClass="user-item" padding="20rpx" margin="0 0 12rpx 0">
          <view class="user-info">
            <image :src="getAvatarUrl(user.avatar)" class="avatar" />
            <view class="user-details">
              <view class="username-row">
                <text class="username">{{ user.user_name || user.nickname || '未设置昵称' }}</text>
                <text :class="['tag', user.can_reserve ? 'tag-success' : 'tag-danger']">{{ user.can_reserve ? '可预约' : '禁用' }}</text>
              </view>
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
              <button v-if="!user.editing" @click="editUser(index)" class="action-btn edit-btn">编辑</button>
              <button v-else @click="saveUser(index)" class="action-btn save-btn">保存</button>
              <button v-if="user.editing" @click="cancelEdit(index)" class="action-btn cancel-btn">取消</button>
            </view>
          </view>
        </CommonCard>
      </view>
    </view>
  </view>
</template>

<script>

  import { getAllUsers, updateUserPrice, updateUserReserve } from '@/api/admin';
  import { getPayload, getAvatarUrl } from '@/utils';
  import { SUCCESS_COLOR } from '@/config';
  import CommonCard from '@/components/CommonCard.vue';

  export default {
    name: 'UserManage',
    components: { CommonCard },
    data() {
      return {
        users: [],
        searchQuery: '',
        filterStatus: 'all',
      };
    },
    onLoad() {
      this.loadUsers();
    },
    methods: {
      getAvatarUrl,
      setFilter(status) {
        this.filterStatus = status;
      },
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
      filteredUsers() {
        const keyword = (this.searchQuery || '').trim();
        const bySearch = (u) => {
          if (!keyword) return true;
          const name = u.user_name || u.nickname || '';
          const phone = u.phone || '';
          return name.includes(keyword) || phone.includes(keyword);
        };
        const byFilter = (u) => {
          if (this.filterStatus === 'can') return !!u.can_reserve;
          if (this.filterStatus === 'cannot') return !u.can_reserve;
          return true;
        };
        return this.users.filter((u) => bySearch(u) && byFilter(u));
      },
      totalUsers() {
        return this.users.length;
      },
      reservableCount() {
        return this.users.filter((u) => !!u.can_reserve).length;
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
      padding: 16rpx;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .toolbar-card {
      .toolbar-row {
        display: flex;
        gap: 16rpx;
        align-items: center;
      }
      .search-input {
        flex: 1;
        height: 60rpx;
        font-size: 28rpx;
      }
      .filter-tabs {
        display: flex;
        gap: 8rpx;
        .tab {
          padding: 8rpx 16rpx;
          border: 1rpx solid $uni-border-color;
          border-radius: $uni-border-radius-base;
          color: $uni-text-color;
          font-size: 24rpx;
        }
        .tab.active {
          border-color: $uni-color-primary;
          color: $uni-color-primary;
        }
      }
    }

    .summary-card {
      .summary-text {
        font-size: 26rpx;
        color: $uni-text-color;
        line-height: 1.4;
      }
      .summary-num {
        font-weight: bold;
        font-size: 28rpx;
        color: $uni-text-color;
      }
      .summary-num.active {
        color: $uni-color-success;
      }
      .summary-num.disabled {
        color: $uni-color-error;
      }
    }

    .user-list {
      .user-item {
        @include card;

        .user-info {
          display: flex;
          align-items: center;
          margin-bottom: 16rpx;

          .avatar {
            width: 64rpx;
            height: 64rpx;
            border-radius: 50%;
            margin-right: 16rpx;
          }

          .user-details {
            flex: 1;

            .username-row { display: flex; align-items: center; gap: 12rpx; }
            .username { display: block; font-size: 32rpx; color: $uni-text-color; font-weight: bold; }

            .phone {
              display: block;
              font-size: 26rpx;
              color: $uni-text-color-grey;
              margin-top: 4rpx;
            }
          }
        }

        .user-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12rpx;

          .reserve-section {
            display: flex;
            align-items: center;
            gap: 8rpx;

            .reserve-label {
              font-size: 26rpx;
              color: $uni-text-color;
            }
          }

          .price-section {
            display: flex;
            align-items: center;

            .price-label {
              font-size: 26rpx;
              color: $uni-text-color;
              margin-right: 8rpx;
            }

            .price-value {
              font-size: 28rpx;
              color: $charging-color-primary;
              font-weight: bold;
            }

            .price-input {
              width: 100rpx;
              height: 52rpx;
              border: 1rpx solid $uni-border-color;
              border-radius: $uni-border-radius-base;
              padding: 0 8rpx;
              font-size: 26rpx;
              text-align: center;
            }
          }

          .action-buttons {
            display: flex;
            gap: 8rpx;
            min-height: 60rpx;
            align-items: center;
          }
        }
      }
    }

    .tag {
      padding: 2rpx 8rpx;
      border-radius: $uni-border-radius-base;
      font-size: 22rpx;
      border: 1rpx solid $uni-border-color;
      color: $uni-text-color;
    }
    .tag-success {
      border-color: $uni-color-success;
      color: $uni-color-success;
    }
    .tag-danger {
      border-color: $uni-color-error;
      color: $uni-color-error;
    }

    .action-btn {
      height: 52rpx;
      padding: 0 16rpx;
      border-radius: $uni-border-radius-base;
      font-size: 24rpx;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 60rpx;
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
</style>
