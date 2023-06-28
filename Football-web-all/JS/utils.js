// ajax
function ajaxPromise(param) {
  return new Promise((resovle, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open(param.type || "get", param.url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(param.data) || null);

    xhr.onreadystatechange = () => {
      var DONE = 4; // readyState 4 代表已向服务器发送请求
      var OK = 200; // status 200 代表服务器返回成功
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

/* 方法：获取当前网址信息 */
function getCurrentUrl() {
  return w.location.origin + '/';
}

/* 方法：get session */
function getSession(key) {
  localStorage.getItem(key);
}

/* 方法：set session */
function setSession(key, str) {
  // localStorage.setItem(key, str);
  sessionStorage.setItem(key, str);

}

/* 方法：get cookie */
function getCookie(key) {

}

/* 方法：set cookie */
function setCookie(key) {

}