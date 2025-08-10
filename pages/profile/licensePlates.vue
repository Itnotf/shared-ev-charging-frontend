<template>
  <view class="license-plates-page">
    <!-- 顶部装饰背景 -->
    <view class="page-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="header-title">
          <text class="title-text">车牌管理</text>
          <text class="title-subtitle">新能源 · 绿色出行</text>
        </view>
        <view class="header-icon">
          <uni-icons type="location" size="48" color="#fff" />
        </view>
      </view>
    </view>

    <view class="content">
      <!-- 添加车牌号区域 -->
      <view class="add-section">
        <view class="add-card">
          <view class="add-header">
            <view class="add-icon">
              <uni-icons type="plusempty" size="32" color="#FFA500" />
            </view>
            <view class="add-title">
              <text class="add-title-text">添加新能源车牌</text>
              <text class="add-title-desc">支持传统车牌和新能源车牌</text>
            </view>
          </view>
          
          <view class="add-form">
            <view class="input-container">
              <input
                v-model="newPlateNumber"
                class="plate-input"
                placeholder="请输入车牌号，如：京AD12345"
                maxlength="8"
                @input="onPlateInput"
              />
              <view class="input-icon">
                <uni-icons type="location" size="24" color="#999" />
              </view>
            </view>
            
            <button
              :disabled="!isValidPlate || adding"
              class="add-btn"
              :class="{ 'btn-loading': adding }"
              @click="addPlate"
            >
              <uni-icons v-if="!adding" type="plusempty" size="20" color="#fff" />
              <text>{{ adding ? '添加中...' : '添加车牌' }}</text>
            </button>
          </view>
          
          <view v-if="plateError" class="error-message">
            <uni-icons type="info" size="16" color="#ff4757" />
            <text>{{ plateError }}</text>
          </view>
        </view>
      </view>

      <!-- 车牌号列表 -->
      <view class="plates-section">
        <view class="section-header">
          <view class="section-title">
            <text class="title-main">我的车牌</text>
            <text class="title-count" v-if="Array.isArray(licensePlates)">{{ licensePlates.length }}个</text>
          </view>
          <view class="section-icon">
            <uni-icons type="bars" size="24" color="#FFA500" />
          </view>
        </view>
        
        <view v-if="Array.isArray(licensePlates) && licensePlates.length > 0" class="plates-grid">
          <view
            v-for="(plate, index) in licensePlates"
            :key="plate.id"
            class="plate-item"
            :class="{ 'is-default': plate.is_default }"
            :style="{ animationDelay: index * 0.1 + 's' }"
          >
            <view class="plate-card">
              <view class="plate-header">
                <view class="plate-type">
                  <uni-icons type="location" size="20" color="#4CAF50" />
                  <text class="type-text">新能源</text>
                </view>
                <view v-if="plate.is_default" class="default-indicator">
                  <uni-icons type="checkmark" size="16" color="#FFA500" />
                  <text>默认</text>
                </view>
              </view>
              
              <view class="plate-number-display">
                <text class="plate-number">{{ plate.plate_number }}</text>
              </view>
              
              <view class="plate-actions">
                <button 
                  v-if="!plate.is_default" 
                  class="action-btn primary"
                  @click="setDefaultPlate(plate.id)"
                >
                  <uni-icons type="checkmark" size="16" color="#fff" />
                  <text>设为默认</text>
                </button>
                <button class="action-btn secondary" @click="editPlate(plate.id)">
                  <uni-icons type="gear" size="16" color="#666" />
                  <text>编辑</text>
                </button>
                <button class="action-btn danger" @click="deletePlate(plate.id)">
                  <uni-icons type="close" size="16" color="#fff" />
                  <text>删除</text>
                </button>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="empty-state">
          <view class="empty-content">
            <view class="empty-icon">
              <uni-icons type="location" size="80" color="#ddd" />
            </view>
            <text class="empty-title">暂无车牌号</text>
            <text class="empty-desc">添加您的第一个新能源车牌号</text>
            <text class="empty-tip">支持传统车牌和新能源车牌格式</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 编辑车牌号弹窗 -->
    <view v-if="showEditPopup" class="edit-overlay" @click="cancelEdit">
      <view class="edit-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">编辑车牌号</text>
          <button class="close-btn" @click="cancelEdit">
            <uni-icons type="closeempty" size="24" color="#999" />
          </button>
        </view>
        
        <view class="modal-content">
          <view class="input-container">
            <input
              v-model="editPlateNumber"
              class="edit-input"
              placeholder="请输入新的车牌号"
              maxlength="8"
            />
            <view class="input-icon">
              <uni-icons type="location" size="24" color="#999" />
            </view>
          </view>
        </view>
        
        <view class="modal-actions">
          <button class="modal-btn cancel" @click="cancelEdit">取消</button>
          <button
            :disabled="!validateLicensePlate(editPlateNumber) || updating"
            class="modal-btn confirm"
            :class="{ 'btn-loading': updating }"
            @click="confirmEdit"
          >
            <uni-icons v-if="!updating" type="checkmark" size="16" color="#fff" />
            <text>{{ updating ? '保存中...' : '保存' }}</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  getLicensePlates,
  addLicensePlate,
  deleteLicensePlate,
  setDefaultLicensePlate,
  updateLicensePlate,
  validateLicensePlate,
} from '@/api/licensePlate';
import { getPayload } from '@/utils';
import CommonCard from '@/components/CommonCard.vue';
import LicensePlateCard from '@/components/LicensePlateCard.vue';

export default {
  name: 'LicensePlates',
  components: {
    CommonCard,
    LicensePlateCard,
  },
  data() {
    return {
      licensePlates: [],
      newPlateNumber: '',
      plateError: '',
      adding: false,
      loading: false,
      
      // 编辑相关
      editingPlateId: null,
      editPlateNumber: '',
      updating: false,
      showEditPopup: false,
    };
  },
  computed: {
    isValidPlate() {
      return validateLicensePlate(this.newPlateNumber) && !this.plateError;
    },
  },
  onLoad() {
    this.loadLicensePlates();
  },
  onShow() {
    // 确保弹窗不会自动打开
    this.closeEditPopup();
  },
  onReady() {
    // 页面渲染完成后确保弹窗关闭
    this.closeEditPopup();
  },
  mounted() {
    // 组件挂载后确保弹窗关闭
    this.$nextTick(() => {
      this.closeEditPopup();
    });
  },
  methods: {
    validateLicensePlate,
    
    closeEditPopup() {
      // 重置编辑状态
      this.editingPlateId = null;
      this.editPlateNumber = '';
      this.showEditPopup = false;
      console.log('弹窗已关闭，编辑状态已重置');
    },

    async loadLicensePlates() {
      try {
        this.loading = true;
        const res = await getLicensePlates();
        const payload = getPayload(res);
        
        // 确保 licensePlates 始终是一个数组
        if (Array.isArray(payload)) {
          this.licensePlates = payload;
        } else if (payload && typeof payload === 'object') {
          // 如果返回的是对象，尝试提取数组
          this.licensePlates = Array.isArray(payload.data) ? payload.data : [];
        } else {
          this.licensePlates = [];
        }
        
        console.log('加载的车牌号列表:', this.licensePlates);
      } catch (error) {
        console.error('加载车牌号列表失败:', error);
        this.licensePlates = []; // 出错时设置为空数组
        uni.showToast({
          title: '加载失败',
          icon: 'none',
        });
      } finally {
        this.loading = false;
      }
    },

    onPlateInput() {
      // 自动转换为大写
      this.newPlateNumber = this.newPlateNumber.toUpperCase();
      
      // 验证格式
      if (this.newPlateNumber && !validateLicensePlate(this.newPlateNumber)) {
        this.plateError = '车牌号格式不正确';
      } else if (Array.isArray(this.licensePlates) && this.licensePlates.some(plate => plate.plate_number === this.newPlateNumber)) {
        this.plateError = '该车牌号已存在';
      } else {
        this.plateError = '';
      }
    },

    async addPlate() {
      if (!this.isValidPlate) return;

      try {
        this.adding = true;
        const isFirstPlate = Array.isArray(this.licensePlates) && this.licensePlates.length === 0;
        await addLicensePlate(this.newPlateNumber, isFirstPlate);
        
        uni.showToast({
          title: '添加成功',
          icon: 'success',
        });
        
        this.newPlateNumber = '';
        this.plateError = '';
        await this.loadLicensePlates();
      } catch (error) {
        console.error('添加车牌号失败:', error);
        uni.showToast({
          title: '添加失败',
          icon: 'none',
        });
      } finally {
        this.adding = false;
      }
    },

    async setDefaultPlate(plateId) {
      try {
        await setDefaultLicensePlate(plateId);
        uni.showToast({
          title: '设置成功',
          icon: 'success',
        });
        await this.loadLicensePlates();
      } catch (error) {
        console.error('设置默认车牌失败:', error);
        uni.showToast({
          title: '设置失败',
          icon: 'none',
        });
      }
    },

    editPlate(plateId) {
      if (!Array.isArray(this.licensePlates)) return;
      
      const plate = this.licensePlates.find(p => p.id === plateId);
      if (plate) {
        this.editingPlateId = plateId;
        this.editPlateNumber = plate.plate_number;
        this.showEditPopup = true;
      }
    },

    cancelEdit() {
      this.closeEditPopup();
    },

    async confirmEdit() {
      if (!validateLicensePlate(this.editPlateNumber)) return;

      try {
        this.updating = true;
        await updateLicensePlate(this.editingPlateId, this.editPlateNumber);
        
        uni.showToast({
          title: '更新成功',
          icon: 'success',
        });
        
        this.closeEditPopup();
        await this.loadLicensePlates();
      } catch (error) {
        console.error('更新车牌号失败:', error);
        uni.showToast({
          title: '更新失败',
          icon: 'none',
        });
      } finally {
        this.updating = false;
      }
    },

    deletePlate(plateId) {
      if (!Array.isArray(this.licensePlates)) return;
      
      const plate = this.licensePlates.find(p => p.id === plateId);
      if (!plate) return;

      uni.showModal({
        title: '确认删除',
        content: `确定要删除车牌号"${plate.plate_number}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteLicensePlate(plateId);
              uni.showToast({
                title: '删除成功',
                icon: 'success',
              });
              await this.loadLicensePlates();
            } catch (error) {
              console.error('删除车牌号失败:', error);
              uni.showToast({
                title: '删除失败',
                icon: 'none',
              });
            }
          }
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.license-plates-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;

  // 顶部装饰背景
  .page-header {
    position: relative;
    height: 240rpx;
    overflow: hidden;

    .header-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        opacity: 0.3;
      }
    }

    .header-content {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 60rpx 40rpx 40rpx;
      height: 100%;
      box-sizing: border-box;

      .header-title {
        .title-text {
          display: block;
          font-size: 48rpx;
          font-weight: 700;
          color: white;
          margin-bottom: 8rpx;
          text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
        }

        .title-subtitle {
          display: block;
          font-size: 28rpx;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 400;
        }
      }

      .header-icon {
        width: 96rpx;
        height: 96rpx;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10rpx);
        border: 2rpx solid rgba(255, 255, 255, 0.3);
      }
    }
  }

  .content {
    margin-top: -40rpx;
    padding: 0 24rpx 40rpx;
    position: relative;
    z-index: 3;
  }

  // 添加车牌区域
  .add-section {
    margin-bottom: 40rpx;

    .add-card {
      background: white;
      border-radius: 24rpx;
      padding: 32rpx;
      box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
      border: 1rpx solid rgba(0, 0, 0, 0.05);

      .add-header {
        display: flex;
        align-items: center;
        margin-bottom: 32rpx;

        .add-icon {
          width: 64rpx;
          height: 64rpx;
          background: linear-gradient(135deg, #FFA500, #FF8C00);
          border-radius: 16rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20rpx;
          box-shadow: 0 4rpx 12rpx rgba(255, 165, 0, 0.3);
        }

        .add-title {
          flex: 1;

          .add-title-text {
            display: block;
            font-size: 32rpx;
            font-weight: 600;
            color: $uni-text-color;
            margin-bottom: 4rpx;
          }

          .add-title-desc {
            display: block;
            font-size: 24rpx;
            color: $uni-text-color-placeholder;
          }
        }
      }

      .add-form {
        .input-container {
          position: relative;
          margin-bottom: 24rpx;

          .plate-input {
            width: 100%;
            height: 88rpx;
            padding: 0 80rpx 0 24rpx;
            background: #f8f9fa;
            border: 2rpx solid transparent;
            border-radius: 16rpx;
            font-size: 32rpx;
            color: $uni-text-color;
            box-sizing: border-box;
            transition: all 0.3s ease;

            &:focus {
              background: white;
              border-color: #FFA500;
              box-shadow: 0 0 0 6rpx rgba(255, 165, 0, 0.1);
            }

            &::placeholder {
              color: #999;
            }
          }

          .input-icon {
            position: absolute;
            right: 24rpx;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.6;
          }
        }

        .add-btn {
          width: 100%;
          height: 88rpx;
          background: linear-gradient(135deg, #FFA500, #FF8C00);
          border: none;
          border-radius: 16rpx;
          color: white;
          font-size: 32rpx;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12rpx;
          box-shadow: 0 4rpx 16rpx rgba(255, 165, 0, 0.3);
          transition: all 0.3s ease;

          &:disabled {
            background: #ccc;
            box-shadow: none;
          }

          &:not(:disabled):active {
            transform: translateY(2rpx);
            box-shadow: 0 2rpx 8rpx rgba(255, 165, 0, 0.3);
          }

          &.btn-loading {
            opacity: 0.8;
          }
        }
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 8rpx;
        margin-top: 16rpx;
        padding: 16rpx;
        background: rgba(255, 71, 87, 0.1);
        border-radius: 12rpx;
        border-left: 4rpx solid #ff4757;

        text {
          font-size: 26rpx;
          color: #ff4757;
        }
      }
    }
  }

  // 车牌列表区域
  .plates-section {
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32rpx;

      .section-title {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .title-main {
          font-size: 36rpx;
          font-weight: 600;
          color: $uni-text-color;
        }

        .title-count {
          font-size: 24rpx;
          color: #FFA500;
          background: rgba(255, 165, 0, 0.1);
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
          font-weight: 500;
        }
      }

      .section-icon {
        width: 48rpx;
        height: 48rpx;
        background: rgba(255, 165, 0, 0.1);
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .plates-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24rpx;

      .plate-item {
        animation: slideInUp 0.6s ease forwards;
        opacity: 0;
        transform: translateY(30rpx);

        &.is-default {
          .plate-card {
            border-color: #FFA500;
            box-shadow: 0 8rpx 24rpx rgba(255, 165, 0, 0.2);
          }
        }

        .plate-card {
          background: white;
          border-radius: 20rpx;
          padding: 32rpx;
          border: 2rpx solid transparent;
          box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;

          &:active {
            transform: scale(0.98);
          }

          .plate-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24rpx;

            .plate-type {
              display: flex;
              align-items: center;
              gap: 8rpx;

              .type-text {
                font-size: 24rpx;
                color: #4CAF50;
                font-weight: 500;
              }
            }

            .default-indicator {
              display: flex;
              align-items: center;
              gap: 6rpx;
              font-size: 24rpx;
              color: #FFA500;
              font-weight: 500;
            }
          }

          .plate-number-display {
            text-align: center;
            margin-bottom: 32rpx;

            .plate-number {
              font-size: 48rpx;
              font-weight: 700;
              color: $uni-text-color;
              letter-spacing: 6rpx;
              font-family: 'Arial', sans-serif;
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
            }
          }

          .plate-actions {
            display: flex;
            gap: 16rpx;

            .action-btn {
              flex: 1;
              height: 72rpx;
              border: none;
              border-radius: 12rpx;
              font-size: 26rpx;
              font-weight: 500;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8rpx;
              transition: all 0.3s ease;

              &::after {
                border: none;
              }

              &.primary {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);

                &:active {
                  transform: translateY(2rpx);
                }
              }

              &.secondary {
                background: #f8f9fa;
                color: #666;
                border: 1rpx solid #e9ecef;

                &:active {
                  background: #e9ecef;
                }
              }

              &.danger {
                background: linear-gradient(135deg, #ff4757, #ff3742);
                color: white;
                box-shadow: 0 4rpx 12rpx rgba(255, 71, 87, 0.3);

                &:active {
                  transform: translateY(2rpx);
                }
              }
            }
          }
        }
      }
    }

    .empty-state {
      padding: 120rpx 40rpx;

      .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .empty-icon {
          margin-bottom: 32rpx;
          opacity: 0.3;
        }

        .empty-title {
          font-size: 36rpx;
          font-weight: 600;
          color: $uni-text-color-grey;
          margin-bottom: 16rpx;
        }

        .empty-desc {
          font-size: 28rpx;
          color: $uni-text-color-placeholder;
          margin-bottom: 12rpx;
          line-height: 1.5;
        }

        .empty-tip {
          font-size: 24rpx;
          color: #999;
          line-height: 1.4;
        }
      }
    }
  }

  // 编辑弹窗
  .edit-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4rpx);

    .edit-modal {
      background: white;
      border-radius: 24rpx;
      width: 600rpx;
      max-width: 90vw;
      box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
      animation: modalSlideIn 0.3s ease;

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 32rpx 32rpx 24rpx;
        border-bottom: 1rpx solid #f0f0f0;

        .modal-title {
          font-size: 36rpx;
          font-weight: 600;
          color: $uni-text-color;
        }

        .close-btn {
          width: 48rpx;
          height: 48rpx;
          background: #f8f9fa;
          border: none;
          border-radius: 12rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;

          &:active {
            background: #e9ecef;
          }
        }
      }

      .modal-content {
        padding: 32rpx;

        .input-container {
          position: relative;

          .edit-input {
            width: 100%;
            height: 88rpx;
            padding: 0 80rpx 0 24rpx;
            background: #f8f9fa;
            border: 2rpx solid transparent;
            border-radius: 16rpx;
            font-size: 32rpx;
            color: $uni-text-color;
            box-sizing: border-box;
            transition: all 0.3s ease;

            &:focus {
              background: white;
              border-color: #FFA500;
              box-shadow: 0 0 0 6rpx rgba(255, 165, 0, 0.1);
            }
          }

          .input-icon {
            position: absolute;
            right: 24rpx;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.6;
          }
        }
      }

      .modal-actions {
        display: flex;
        gap: 16rpx;
        padding: 24rpx 32rpx 32rpx;

        .modal-btn {
          flex: 1;
          height: 80rpx;
          border: none;
          border-radius: 16rpx;
          font-size: 30rpx;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8rpx;
          transition: all 0.3s ease;

          &::after {
            border: none;
          }

          &.cancel {
            background: #f8f9fa;
            color: #666;
            border: 1rpx solid #e9ecef;

            &:active {
              background: #e9ecef;
            }
          }

          &.confirm {
            background: linear-gradient(135deg, #FFA500, #FF8C00);
            color: white;
            box-shadow: 0 4rpx 16rpx rgba(255, 165, 0, 0.3);

            &:disabled {
              background: #ccc;
              box-shadow: none;
            }

            &:not(:disabled):active {
              transform: translateY(2rpx);
            }

            &.btn-loading {
              opacity: 0.8;
            }
          }
        }
      }
    }
  }
}

// 动画
@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
