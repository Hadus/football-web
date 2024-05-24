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

/* 方法：拖拽 */
function bindDragBox() {
  const dragList = document.querySelectorAll('.s-drag'); 
  dragList.forEach((ele) => {
    const box = ele.querySelector('.s-box');
    const title = ele.querySelector('.header-box');
    const titleBg = title.style.backgroundColor;
    const dragW = document.body.clientWidth;
    const dragH = document.body.clientHeight;

    let boxStartX = 0;
    let boxStartY = 0;

    title.style.cursor = 'move';
    // 开始拖拽
    title.addEventListener('mousedown', function (e) {
      const boxW = box.offsetWidth;
      window.dragBox = {
        node: box,
        left: box.offsetLeft,
        top: box.offsetTop
      };
      const maxLeft = Number(dragW - boxW);
      const maxTop = Number(dragH);

      boxStartX = box.offsetLeft;
      boxStartY = box.offsetTop;

      const x = e.pageX - boxStartX;
      const y = e.pageY - boxStartY;
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', function () {
        document.removeEventListener('mousemove',move);
        title.style.background = titleBg;
        document.body.classList.remove('no-select');
      })

      function move(e) {
        title.style.background = '#fafafa';
        document.body.classList.add('no-select');
        let nowX = e.pageX - x;
        let nowY = e.pageY - y;
        nowX = nowX <= 0 ? 0 : nowX;
        nowY = nowY <= 0 ? 0 : nowY;

        nowX = nowX > maxLeft ? maxLeft : nowX;
        nowY = nowY > maxTop ? maxTop : nowY;
        
        box.style.left = nowX + 'px';
        box.style.top = nowY + 'px';
      }
    })
  })
}

/* 方法：恢复拖拽 */
function resetDrag() {
  if(!window.dragBox) return;
  window.dragBox.node && (window.dragBox.node.style.left = window.dragBox.left + 'px');
  window.dragBox.node && (window.dragBox.node.style.top = window.dragBox.top + 'px');
}

/* 方法：页面是否可以滚动 */
function pageScroll(flag = true) {
  if(flag){
    document.querySelector('html').classList.remove('no-scroll');
    document.querySelector('body').classList.remove('no-scroll');
    resetDrag(); // 页面可以滚动时候reset
  } else{
    document.querySelector('html').classList.add('no-scroll');
    document.querySelector('body').classList.add('no-scroll');
  }
}