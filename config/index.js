const config = {
  development: {
    baseURL: 'http://localhost:8080',
  },
  production: {
    baseURL: 'https://shared-ev-charging-backend.itnotf.tech',
  },
};

export const baseUrl = config[process.env.NODE_ENV].baseURL;

// 常量配置
export const TIMESLOTS = {
  day: {
    name: '白天',
    time: '08:00 - 20:00',
  },
  night: {
    name: '晚上',
    time: '20:00 - 08:00',
  },
};

// 主题颜色常量（用于组件 props 绑定，避免模板硬编码颜色）
export const PRIMARY_COLOR = '#FFA500';
export const SUCCESS_COLOR = '#67C23A';
