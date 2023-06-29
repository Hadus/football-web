window.config = {
  refreshFreqTime: 20, // 秒--自动刷新时间间隔
  middleBenefitPoint: '1.0',
  hightBenefitPoint: '2.0',
  server: {
  // 是否访问服务器数据
  // 需要跨域环境
  // * 仅用于开发，上线请设为 false
    cors: false, 
    path: 'http://1.14.58.230:8888',
  }
}