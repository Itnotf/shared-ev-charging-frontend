import { cancelReservation } from '@/api/reservation';
import { syncUserProfile } from '@/api';

// 日期格式化
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  format = format.replace('YYYY', year);
  format = format.replace('MM', month);
  format = format.replace('DD', day);
  return format;
};

// 获取当前日期（可自定义格式）
export const getCurrentDate = (format = 'YYYY-MM-DD') => {
  return formatDate(new Date(), format);
};

// 计算金额
export const calculateAmount = (kwh, unitPrice) => {
  if (!kwh) return '0.00';
  return (parseFloat(kwh) * unitPrice).toFixed(2);
};

// 数字千分位格式化
export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 获取状态标签样式
export const getStatusStyle = (status) => {
  const styles = {
    'paid': { color: '#67C23A', background: '#F0F9EB' },     // 已支付
    'pending': { color: '#E6A23C', background: '#FDF6EC' },  // 待支付
    'cancelled': { color: '#909399', background: '#F4F4F5' } // 已取消
  };
  return styles[status] || { color: '#909399', background: '#F4F4F5' };
};

// 认证相关工具对象
export const userAuth = {
  save(token, userInfo) {
  uni.setStorageSync('token', token);
  uni.setStorageSync('userInfo', typeof userInfo === 'string' ? userInfo : JSON.stringify(userInfo));
  },
  get() {
  const token = uni.getStorageSync('token');
  const userInfoStr = uni.getStorageSync('userInfo');
  if (!token || !userInfoStr) return null;
  try {
    const userInfo = typeof userInfoStr === 'object' ? userInfoStr : JSON.parse(userInfoStr);
    return { token, userInfo };
  } catch (e) {
    console.error('Parse userInfo error:', e);
      this.clear();
    return null;
  }
  },
  clear() {
  uni.removeStorageSync('token');
  uni.removeStorageSync('userInfo');
  },
  check() {
    return !!this.get();
  },
  getRole() {
    const auth = this.get();
    return auth ? auth.userInfo.role : null;
  }
};

export const redirectToLogin = (message = '请先登录') => {
  uni.showToast({
    title: message,
    icon: 'none'
  });
  setTimeout(() => {
    uni.navigateTo({ url: '/pages/login/login' });
  }, 1000);
};

// 获取星期几
export const getWeekday = (dateStr) => {
  const weekMap = ['日', '一', '二', '三', '四', '五', '六'];
  const d = new Date(dateStr);
  return '周' + weekMap[d.getDay()];
};

// 私有函数：上传记录弹窗
function showUploadRecordModal(data, goTo, cancelReservation) {
      uni.showModal({
        title: '温馨提示',
        content: '您有上次充电记录未上传，请先上传或选择未充电取消本次预约！',
        showCancel: true,
        confirmText: '去上传',
        cancelText: '取消预约',
        success: (res) => {
          if (res.confirm) {
            if (data.lastReservation) {
              const date = data.lastReservation.date ? data.lastReservation.date.slice(0, 10) : '';
              const url = `/pages/records/create?id=${data.lastReservation.id}&date=${date}&timeslot=${data.lastReservation.timeslot}`;
          goTo(url);
            } else {
          goTo('/pages/records/create');
            }
          } else if (res.cancel) {
            uni.showModal({
              title: '确认取消',
              content: '确定本次预约未充电并取消吗？',
              confirmText: '确定取消',
              cancelText: '我再想想',
          success: async (res2) => {
                if (res2.confirm && data.lastReservation) {
                  uni.showLoading({ title: '取消中' });
              try {
                await cancelReservation(data.lastReservation.id);
                    uni.hideLoading();
                    uni.showToast({ title: '已取消预约', icon: 'success' });
                // 关键：取消后立即刷新 current-status，避免再次弹窗
                if (typeof getCurrentReservationStatus === 'function') {
                  const res = await getCurrentReservationStatus();
                  // 不再自动弹窗，用户可手动操作
                }
              } catch {
                    uni.hideLoading();
                    uni.showToast({ title: '取消失败', icon: 'none' });
              }
                } else if (res2.cancel) {
              showUploadRecordModal(data, goTo, cancelReservation);
                }
              }
            });
      }
    }
  });
}

/**
 * 检查needUploadRecord并弹窗跳转上传记录页面
 * @param {Object} data - getCurrentReservationStatus接口返回的data对象
 */
export const checkAndHandleNeedUploadRecord = (data) => {
  if (data && data.needUploadRecord) {
    showUploadRecordModal(data, goTo, cancelReservation);
    return true;
  }
  return false;
}; 

/**
 * 全局统一跳转方法，自动判断tabBar页面，后续可扩展埋点、权限等
 * @param {string} url 跳转地址
 */
export const goTo = (url) => {
  const tabBarPages = [
    '/pages/index/index',
    '/pages/reservations/index',
    '/pages/records/create',
    '/pages/profile/index'
    // 只保留 pages.json 里 tabBar 配置的页面
  ];
  if (tabBarPages.includes(url.split('?')[0])) {
    uni.switchTab({ url });
  } else {
    uni.navigateTo({ url });
  }
}; 

export const checkAndFetchUserProfile = async () => {
  const userInfoRaw = uni.getStorageSync('userInfo');
  let userInfo;
  try {
    userInfo = typeof userInfoRaw === 'string' ? JSON.parse(userInfoRaw) : userInfoRaw;
  } catch (e) {
    userInfo = null;
  }

  // 检查用户信息是否存在且包含头像
  const hasAvatar = userInfo?.user_avatar || userInfo?.avatar;
  if (!userInfo || !hasAvatar || hasAvatar === '') {
    uni.showModal({
      title: '获取头像和昵称',
      content: '为了提供更好的个性化体验，请完善您的头像和昵称。',
      confirmText: '去填写',
      showCancel: false,
      success: (res) => {
        if (res.confirm) {
          goTo('/pages/profile/fillUserInfo');
        }
      }
    });
    return false;
  }
  return true;
};

const syncUserInfo = async (userInfo) => {
  try {
    const response = await syncUserProfile({
      avatarUrl: userInfo.avatarUrl,
      nickName: userInfo.nickName
    });
  } catch (error) {
    // 静默处理错误
  }
}; 