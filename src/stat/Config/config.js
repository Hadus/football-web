window.config = {
  server: {
    // mode: mock || local || production
    mode: 'local',
    path: 'http://1.14.59.227:8891/api',

  },
  chartSmall: {
    // 全局调色盘。
    color: [
      '#ee6666','#fac858','#91cc75','#5470c6','#91c7ae','#749f83','#ca8622','#bda29a','#6e7074','#546570','#c4ccd3'
    ],
    title: {
      text: 'chart',
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    grid: { // 图标padding
      left: '3%',
      right: '5%',
      top: '23%',
      bottom: '0%',
      containLabel: true
    },
    series: [ // 数据
    // {
    //   name: 'percentArrOneTwoG',
    //   type: 'line',
    //   data: data.dataYearly.percentArrOneTwoG
    // },
    ],
  },
  chartBig: {
    tooltip: {
      trigger: 'axis',
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        dataView: { readOnly: false },
        magicType: { type: ['line', 'bar'] },
        restore: {},
        saveAsImage: {}
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 95,
        end: 100
      },
      {
        start: 95,
        end: 100
      }
    ],
  },
  chartTest: {
    title: 'test'
  },
  chartMap: {
    title: ['欧盘', '亚盘', '上下盘', '进球数'],
    seriesData: [
      ['percentArrWinE', 'percentArrDawE', 'percentArrLossE'],
      ['percentArrWinA', 'percentArrDawA', 'percentArrLossA'],
      ['percentArrMinusLossA', 'percentArrPlusWinA'],
      ['percentArrZeroG', 'percentArrOneTwoG', 'percentArrZeroOneTwoG', 'percentArrThreeMoreG'],
    ],
    legend: {
      "countArrMinusLossA": '',		//预留
      "countArrPlusWinA": '',			//预留
      "percentArrWinE": '胜场占比',			//列1 y1	--胜场占比
      "percentArrDawE": '平局占比',			//列1 y2	--平局占比
      "percentArrLossE": '负场占比',			//列1 y3	--负场占比
  
      "percentArrWinA": '胜场占比',			//列2 y1	--胜场占比
      "percentArrDawA": '平局占比',			//列2 y2	--平局占比
      "percentArrLossA": '负场占比',			//列2 y3	--负场占比
  
      "percentArrMinusLossA": '让球负占比',		//列3 y1	--让球负占比
      "percentArrPlusWinA": '受让胜占比',		//列3 y2	--受让胜占比
      
      "percentArrZeroG": '0 球占比',			//列4 y1	--0 球占比
      "percentArrOneTwoG": '1 2 球占比',		//列4 y2	--1 2 球占比
      "percentArrZeroOneTwoG": '0 1 2 球占比',	//列4 y3	--0 1 2 球占比
      "percentArrThreeMoreG": '3球+ 占比',		//列4 y4	--3球+ 占比
    }
  }
}

// api 地址
window.API_URL = {
  getData: 'curves-data',
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