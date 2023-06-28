(
  function(w, d){
    Object.assign(w, {...w.config}, {
      dom_tbody: d.querySelector('tbody'), // 列表wrap
      dom_addUser: d.querySelector('#s_add'), // add user 
      deleteUserParams: { username: 'delete' }, // 删除的用户信息
      dom_mes: d.querySelector('#s_mes'), // mes box
      dom_mesContent: d.querySelector('#s_mesContent'), // mes content
      mesCallback: null, // mes 的回调函数
      dom_dialog: d.querySelector('#s_dialog'), // mes box
      dom_dialogContent: d.querySelector('#s_dialogContent'), // mes box
      dialogCallback: null, // dialog 的回调函数
    });
    getUserList(); // 获取用户列表
    bindAddUser(); // 添加用户

    bindCancleMes(); // 弹窗-取消mes
    bindEnsureMes(); // 弹窗-确定mes
    bindCancleDialog(); // 弹窗-取消dialog
    bindEnsureDialog(); // 弹窗-确定dialog
    bindDragBox(); // 绑定拖拽

    bindChangePW(); // 修改密码
    /* 方法：获取修改密码 */
    function bindChangePW() {
      const changePWNode = d.querySelector('#s_changePW');
      changePWNode.addEventListener('click', function () {
        w.flag_dialogEnsure = -1;
        w.dialogCallback = changePW_api;
        initDialogContent();
      })
    }
    
    /* 方法：api 修改密码 */
    function changePW_api(params) {
      let data = params || {
        
      }
      const api_url = w.API_URL.changePwd;
      ajaxPromise({
        type: 'post',
        url: api_url,
        data
      }).then(res => {
        if(res.status===200){
          alert('密码修改成功。');
          clearDialogContent();
        } else {
          alert('修改密码失败，请重试！');
        }
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }
        
    /* 方法：验证修改密码输入 */
    function verfyChangePWInput(oldPassword, newPassword, verfyPassword){
      if(!oldPassword){
        alert('请输入旧密码！');
        return false;
      }
      if(!newPassword){
        alert('请输入新密码！');
        return false;
      }
      if(!verfyPassword){
        alert('请再次输入确认密码！');
        return false;
      }
      if(newPassword !== verfyPassword){
        alert('两次密码输入不一致，请重新输入！');
        return false;
      }
      return true;
    }

    /* 方法：获取用户名列表 */
    function getUserList() {
      // 发送请求
      getUserList_api({});
    }

    /* 方法：api 获取用户列表 */
    function getUserList_api(params) {
      const api_url = w.API_URL.listUser;
      ajaxPromise({
        type: 'get',
        url: api_url,
      }).then(res => {
        createUserList(res.obj);
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }

    /* 方法：创建列表 */
    function createUserList(list=[]) {
      w.dom_tbody.innerHTML = '';
      let domStr_userList = '';
      list.forEach((ele, index) => {
        const btnAdmin = `<button class="danger delete disabled">删除</button>`;
        const btnUser = `<button class="danger delete" data-username="${ele.username}" id="s_delete">删除</button>`;
        const trStr = `
        <tr>
          <td>
            <div class="cell">${index + 1}</div>
          </td>
          <td>
            <div class="cell">${ele.username}</div>
          </td>
          <td>
            <div class="cell">${ele.role}</div>
          </td>
          <td>
            <div class="cell">
              ${ele.authority==='ROLE_ADMIN' ? btnAdmin: btnUser}</div>
          </td>
        </tr>
        `;
        domStr_userList += trStr;
      })
      w.dom_tbody.innerHTML = domStr_userList;
      bindDeleteUser();
    }

    /* 方法：绑定添加用户 */
    function bindAddUser(){
      dom_addUser.addEventListener('click', () => {
        if(w.userInfo.authority !== "ROLE_ADMIN"){
          alert("不是管理员。");
          return;
        }
        w.dialogCallback = addUser_api;
        initDialogContent();
      });
    }

    /* 方法：api 添加用户 */
    function addUser_api(params) {
      let data = params || {
        
      }
      const api_url = w.API_URL.createUser;
      ajaxPromise({
        type: 'post',
        url: api_url,
        data
      }).then(res => {
        getUserList_api();
        clearDialogContent();
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }

    /* 方法：验证添加用户输入 */
    function verfyAddUserInput(username, password, verfyPassword){
      if(!username){
        alert('请输入用户名！');
        return false;
      }
      if(!password){
        alert('请输入密码！');
        return false;
      }
      if(!verfyPassword){
        alert('请再次输入确认密码！');
        return false;
      }
      if(password !== verfyPassword){
        alert('两次密码输入不一致，请重新输入！');
        return false;
      }
      return true;
    }

    /* 方法：绑定删除用户 */
    function bindDeleteUser(e, index){
      const deleteBtnListNode = d.querySelectorAll('#s_delete');
      deleteBtnListNode.forEach((ele) => {
        ele.addEventListener('click', () => {
          w.deleteUserParams = {
            username: ele.dataset['username']
          };
          w.mesCallback = deleteUser_api;
          intialMesContent();
        });
      });
    }

    /* 方法：api 删除用户 */
    function deleteUser_api(params) {
      let data = params || {
        
      }
      const api_url = w.API_URL.delUser;
      ajaxPromise({
        type: 'post',
        url: api_url,
        data
      }).then(res => {
        getUserList_api();
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }

    /* 方法：message 取消 */  
    function bindCancleMes() {
      d.querySelector('#s_cancelMes').addEventListener('click',function (e) {
        w.dom_mes.classList.remove('show');
        pageScroll(true);
      })
    }

    /* 方法：message 确定 */  
    function bindEnsureMes() {
      d.querySelector('#s_ensureMes').addEventListener('click',function (e) {
        w.dom_mes.classList.remove('show');
        w.mesCallback(w.deleteUserParams);
        w.mesCallback = null; // 执行完置空
        pageScroll(true);
      })
    }

    function intialMesContent() {
      w.dom_mes.classList.add('show');
      dom_mesContent.innerHTML = `您是否确定要删除此用户：${w.deleteUserParams.username} ！`;
    }

    /* 方法：dialog 取消 */  
    function bindCancleDialog() {
      d.querySelector('#s_cancelDialog').addEventListener('click',function (e) {
        w.dom_dialog.classList.remove('show');
        pageScroll(true);
        clearDialogContent();
      })
    }

    /* 方法：dialog 确定 */  
    function bindEnsureDialog() {
      d.querySelector('#s_ensureDialog').addEventListener('click',function (e) {
        if(!w.flag_dialogEnsure){ // 添加用户
          const username = dom_dialogContent.querySelector('#s_add_username').value;
          const password = dom_dialogContent.querySelector('#s_add_password').value;
          const verfyPassword = dom_dialogContent.querySelector('#s_add_verfyPassword').value;
          if(!verfyAddUserInput(username, password, verfyPassword)){
            return;
          }
          let params = {
            username,
            password
          };
          w.dialogCallback(params);
        } else if(w.flag_dialogEnsure === -1){ // 修改密码
          const username = dom_dialogContent.querySelector('#s_change_username').value;
          const oldPassword = dom_dialogContent.querySelector('#s_change_oldPassword').value;
          const newPassword = dom_dialogContent.querySelector('#s_change_newPassword').value;
          const verfyPassword = dom_dialogContent.querySelector('#s_change_verfyPassword').value;
          if(!verfyChangePWInput(oldPassword, newPassword, verfyPassword)){
            return;
          }
          let params = {
            username,
            oldPwd: oldPassword,
            newPwd: newPassword
          };
          w.dialogCallback(params);
        }
      })
    }

    function initDialogContent(obj) {
      w.dom_dialog.classList.add('show');
      const dom_dialogHeader = dom_dialog.querySelector('.header');
      let nodeStr = '';

      if(!w.flag_dialogEnsure){ // 添加用户
        dom_dialogHeader.innerText = '添加用户：';
        nodeStr = `
        <div class="add-user" id="s_addUserBox">
          <p>用户名：<input type="text" id="s_add_username"></p>
          <p>密码：<input type="password" id="s_add_password"></p>
          <p>确认密码：<input type="password" id="s_add_verfyPassword"></p>
          <p>角色：<input type="text" id="s_add_role" value="普通用户" disabled></p>
        </div>
        `;
      } else if(w.flag_dialogEnsure == -1){ // 修改密码
        dom_dialogHeader.innerText = '修改密码：';
        nodeStr = w.getNodeStr_changePW();
      }

      dom_dialogContent.innerHTML = nodeStr;
    }

    function clearDialogContent(){
      w.dialogCallback = null; // 执行完置空
      w.dom_dialog.classList.remove('show');
      dom_dialogContent.innerHTML  = '';
      w.flag_dialogEnsure = 0;
    }
  }
)(window, document)