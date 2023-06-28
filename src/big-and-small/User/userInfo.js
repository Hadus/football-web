(
  function(w, d){
    Object.assign(w, {
      userInfo: {
        username: 'admin',
        role: '管理员',
        authority: 'ROLE_ADMIN'
      },
      getNodeStr_changePW: initNodeStr_changePW, // 修改密码的str
      flag_dialogEnsure: 0, // -1:修改密码
    })

    getUserInfo(); // 获取用户信息
    bindLogout(); // 退出登录

    /* 方法：init nodeStr_changePW */
    function initNodeStr_changePW(){
       return `
        <div class="change-pw" id="s_changePWBox">
        <p>用户名：<input type="text" id="s_change_username" disabled value=${w.userInfo.username}></p>
        <p>旧密码：<input type="password" id="s_change_oldPassword"></p>
        <p>新密码：<input type="password" id="s_change_newPassword"></p>
        <p>确认密码：<input type="password" id="s_change_verfyPassword"></p>
        <p>角色：<input type="text" id="s_change_role" disabled value=${w.userInfo.role}></p>
      </div>
      `;
    }
    
    /* 方法：获取用户信息 */
    function getUserInfo() {
      getUserInfo_api();
    }
    
    /* 方法：api 获取用户信息 */
    function getUserInfo_api(params) {
      const api_url = w.API_URL.userInfo;
      ajaxPromise({
        type: 'get',
        url: api_url,
      }).then(res => {
        cd_getUserInfo(res.obj);
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }
    
    /* 方法：获取用户信息cb */
    function cd_getUserInfo({username, role,authority}) {
      w.userInfo = {
        username,
        role,
        authority
      }
      const userInfoNode = d.querySelector('#s_userInfo');
      const s_showUsernameNode = userInfoNode.querySelector('#s_showUsername');
      s_showUsernameNode.innerText = role + '：' + username;
      bindToUserManage(authority);
    }
    
    /* 方法：跳转用户管理 */
    function bindToUserManage(authority) {
      const dom_toUserManage = d.querySelector('#s_toUserManage');
      const isUserPage = w.location.href.includes('user.html');
      if(!isUserPage && authority === 'ROLE_ADMIN'){
        dom_toUserManage.classList.add('show');
        dom_toUserManage.addEventListener('click', function () {
          if(authority !== "ROLE_ADMIN"){
            alert("不是管理员。");
            return;
          }
          w.open('../User/user.html');
        })
      } else{
        dom_toUserManage.classList.remove('show');
      }
    }
    
    /* 方法：退出登录 */
    function bindLogout() {
      const logoutNode = d.querySelector('#s_logout');
      logoutNode.addEventListener('click', function () {
        logout_api();
      })
    }
    
    /* 方法：api 退出登录 */
    function logout_api(params) {
      const api_url = w.API_URL.logout;
      ajaxPromise({
        type: 'get',
        url: api_url,
      }).then(res => {
        w.location.href = '/Login/login.html';
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }
  }
)(window, document)