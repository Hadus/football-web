const {fileList_commonJS, fileList_data, fileList_ownJS} = window.fileList;

/* 方法：初始化 JS */
function initCommonJS(time) {
  fileList_commonJS.forEach((ele) => {
    const script = document.createElement('script');
    script.src = ele + '?' + time;
    document.querySelector('body').appendChild(script);
  })
}

/* 方法：初始化 JSON */
function initJSON(time) {
  fileList_data.forEach((ele) => {
    const script = document.createElement('script');
    script.src = ele + '?' + time;
    document.querySelector('body').appendChild(script);
  })
}

/* 方法：初始化 own JS */
function initJS(time) {
  fileList_ownJS.forEach((ele) => {
    const script = document.createElement('script');
    script.src = ele + '?' + time;
    document.querySelector('body').appendChild(script);
  })
}

window.onload = function () {
  // const time = new Date().getTime();
  const time = 0;
  window.mock = {};
  initJSON(time);
  initCommonJS(time);
  setTimeout(() => {
    initJS(time);
  }, 10);
}