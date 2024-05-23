window.config = {
  refreshFreqTime: 20, // 秒--自动刷新时间间隔
  middleBenefitPoint: '1.0',
  hightBenefitPoint: '2.0',
  server: {
    // mode: mock || local || production
    mode: 'local',
    path: 'http://1.14.58.230:8888',
  },
};

// api 地址
window.API_URL = {
  getData: 'football',
  calculator: 'calculator',
  staticValues:'staticValues',
  verifyCode: 'verifyCode', // 验证码
  doLogin: 'doLogin', // 登录
  userInfo: 'userInfo', // 用户信息
  listUser: 'listUser', // 用户列表
  createUser: 'createUser', // 添加用户
  delUser: 'delUser', // 删除用户
  changePwd: 'changePwd', // 修改密码
  logout: 'logout', // 退出登录
};

// 报警音频
window.ALERT_AUDIO_URL = './Lib/audio/preview.mp3';

window.BISIC_URL = getCurrentUrl(window.config.server.mode);

/* 方法：获取当前网址信息 */
function getCurrentUrl(mode) {
  // 检测为服务器环境，强制切换为 production
  if(location.hostname && location.hostname !== 'localhost'){
    mode = 'production';
  }
  let basic_url = '';

  switch (mode){
    case 'mock':
      break;
    case 'local':
      basic_url = window.config.server.path;
      break;
    case 'production':
      basic_url = window.location.origin
      break;
    default:
      1+1;
      break;
  }
  return basic_url + '/';
}

// ajax
function ajaxPromise(param) {
  return new Promise((resovle, reject) => {
    const xhr = new XMLHttpRequest();
    const url = window.BISIC_URL + param.url;
    xhr.open(param.type || "get", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(param.data) || null);
    xhr.onreadystatechange = () => {
      const DONE = 4; // readyState 4 代表已向服务器发送请求
      const OK = 200; // status 200 代表服务器返回成功
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          resovle(JSON.parse(xhr.responseText));
        } else {
          reject(JSON.parse(xhr.responseText));
        }
      }
    }
  })
}