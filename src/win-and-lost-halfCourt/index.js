initCSS();

/* 方法：初始化 CSS */
function initCSS() {
  const cssFileList = [
    './Football/football.css'
  ];
  
  cssFileList.forEach((ele) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = ele;
    document.querySelector('head').appendChild(link);
  })
}

/* 方法：初始化 JS */
function initCommonJS(time) {
  const jsFileList = [
    './JS/utils.js',
    './JS/api.js',
    './Config/config.js',
  ];

  jsFileList.forEach((ele) => {
    const script = document.createElement('script');
    script.src = ele + '?' + time;
    document.querySelector('body').appendChild(script);
  })
}

/* 方法：初始化 JS */
function initJS(time) {
  const jsFileList = [
    './Football/football.js'
  ];

  jsFileList.forEach((ele) => {
    const script = document.createElement('script');
    script.src = ele + '?' + time;
    document.querySelector('body').appendChild(script);
  })
}

/* 方法：初始化 JSON */
function initJSON(time) {
  const dataFileList = [
    "./lib/data/FootballData.js",
    "./lib/data/CalculatorData.js",
    "./lib/data/StatusData.js"
  ]
  dataFileList.forEach((ele) => {
    const script = document.createElement('script');
    script.src = ele + '?' + time;
    document.querySelector('body').appendChild(script);
  })
}


window.onload = function () {
  const time = new Date().getTime();
  if (!window.location.host) {
    Object.assign(window, {
      mock: {}
    });
    initJSON(time);
  }
  initCommonJS(time);
  initJS(time);
}