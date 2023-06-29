(
  function(w, d){
    Object.assign(w, {...w.config});
    w.code = ''; // 验证码
    const dom_username = d.querySelector('#username');
    const dom_password = d.querySelector('#password');
    const dom_login = d.querySelector('#login');
    const dom_verifyCode = d.querySelector('#verifyCode');
    const dom_showVerifyCode = d.querySelector('#showVerifyCode');
    const dom_showVerifyCodeImg = d.querySelector('#showVerifyCodeImg');
    const dom_showError = d.querySelector('#error>p');
    getVerifyCode(); // 获取验证码
    refreshVerifyCode(); // 点击刷新验证码 
    showError(false); // 默认不展示报错

    dom_login.addEventListener('click', function (e) {
      showError(false);
      const username = dom_username.value;
      const password = dom_password.value;
      const code = dom_verifyCode.value;
      if(!validUsernamesInput(username)) return;
      if(!validPasswordInput(password)) return;
      if(!validVerifyCodeInput(code)) return;
      // 登录请求
      doLogin({
        username, password, code
      });
    });

    /* 方法：点击刷新验证码 */
    function refreshVerifyCode() {
      dom_showVerifyCode.addEventListener('click', function () {
        getVerifyCode()
      })
    }

    /* 方法：展示error */
    function showError(flag = false, str) {
      dom_showError.innerHTML = '';
      if(flag){
        dom_showError.innerHTML = str;
        dom_showError.classList.add('show');
      } else{
        dom_showError.classList.remove('show');
      }
    }

    /* 方法：验证用户名框框输入 */
    function validUsernamesInput(params) {
     if(!params || !params.trim()){
      alert('请输入用户名!');
      return false;
     }
     return true;
    }

    /* 方法：验证密码框输入 */
    function validPasswordInput(params) {
      if(!params || !params.trim()){
        alert('请输入密码!');
        return false;
      }
     return true;
    }

    /* 方法：验证验证码框输入 */
    function validVerifyCodeInput(params) {
      if(!params || !params.trim()){
        alert('请输入验证码!');
        return false;
      }
      return true;
    }

    /* 方法：请求结果验证 */
    function validLogin(params) {
      let flag_login = params.status;
      if(flag_login === 200){
        w.location.href = '../index.html';
      } else if(flag_login === 500){ // 验证码错误
        showError(true, params.msg);
      } else{
        alert('登录错误，请联系管理员!');
      }
    }

    /* 方法：验证登录 */
    function getVerifyCode() {
      const time = new Date().getTime();
      dom_showVerifyCodeImg.src = w.BISIC_URL + w.API_URL.verifyCode + '?' + time;
    }

    /* 方法：验证登录 */
    function doLogin(data) {
      ajaxPromise({
        type: 'post',
        url: w.API_URL.doLogin,
        data
      }).then(res => {
        validLogin(res);
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }
  }
)(window, document)