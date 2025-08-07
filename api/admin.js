
// 获取所有用户列表
export function getAllUsers() {
  return new Promise((resolve, reject) => {
    uni.request({
      url: '/api/admin/users',
      method: 'GET',
      success: res => resolve(res.data),
      fail: reject
    });
  });
}

// 修改用户can_reserve状态
export function updateUserReserve(userId, canReserve) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: '/api/admin/user/can_reserve',
      method: 'POST',
      data: { user_id: userId, can_reserve: canReserve },
      success: res => resolve(res.data),
      fail: reject
    });
  });
}

// 修改用户unit_price
export function updateUserPrice(userId, unitPrice) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: '/api/admin/user/unit_price',
      method: 'POST',
      data: { user_id: userId, unit_price: unitPrice },
      success: res => resolve(res.data),
      fail: reject
    });
  });
}

// 获取月度对账数据
export function getMonthlyReport(month) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: '/api/admin/monthly_report',
      method: 'GET',
      data: { month },
      success: res => resolve(res.data),
      fail: reject
    });
  });
}