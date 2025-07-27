const config = {
  development: {
    baseURL: 'http://localhost:8080/api'
  },
  production: {
    baseURL: 'https://shared-ev-charging-backend.itnotf.tech/api'
  }
};

export const baseUrl = config[process.env.NODE_ENV].baseURL

// 常量配置
export const TIMESLOTS = {
  day: {
    name: '白天',
    time: '08:00 - 20:00'
  },
  night: {
    name: '晚上',
    time: '20:00 - 08:00'
  }
};