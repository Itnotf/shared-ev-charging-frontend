// 开发环境
const DEV = {
  baseUrl: 'http://localhost:8080/api'
};

// 生产环境
const PROD = {
  baseUrl: 'https://api.example.com/api'
};

// 根据环境导出配置
export const { baseUrl } = process.env.NODE_ENV === 'development' ? DEV : PROD;

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