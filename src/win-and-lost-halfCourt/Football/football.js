(
  function (w, d) {
    Object.assign(w, {...w.config}, {
      flagServerPath: 0, // api server: 0-本地，-1-跨域，1-服务器
      tableNode_index: d.querySelector('#s_table_index'), // 列表的 table
      s_bet: d.querySelector('#s_bet'), // bet
      response: {}, // API返回值
      listData_index: [], // 数据
      clock: null, // 自动刷新定时器
      isFirstTimeInitBet: true, // 第一次进来界面才会initBet
      getFlag_filters: null, // 过滤条件
      dom_filter_ensure: d.querySelector('#s_filter').querySelector('button'),
      audio_alert: new Audio(w.ALERT_AUDIO_URL || ''), // 音频对象
      alertTimes: { // 需要报警的次数
        warning: 0,
        danger: 0
      }, 
      isPlayAudio: false, // 是否播放音频
      filterWithoutAudio: false, // bet 切换触发音频播放
      showTabName: 'index',// 是否为首页
      dom_mes: d.querySelector('#s_mes'), // mes box
      dom_mesContent: d.querySelector('#s_mesContent'), // mes content
      mesCallback: null, // mes 的回调函数
      isShowAllBet: true, // 是否显示所有已投注比赛
      hideBetList: [], // 已投注的比赛列表
      dom_dialog: d.querySelector('#s_dialog'), // mes box
      dom_dialogContent: d.querySelector('#s_dialogContent'), // mes box
      dialogData: null, // dialog 的数据
      dialogCallback: null, // dialog 的回调函数
      isJzPayAsTotal: true, // 投注分配默认为true
      isJzPayAsTotal_calc: true,
    });

    defineServerPath(w.location.host); // 定义当前 server 环境
    getData();
    bindSwitchPayAsTotal(); // 绑定切换投注分配
    initBetConst();
    bindBet(betAction);
    bindFilter(filterAction);
    bindSwitchAudio();
    // bindTabs();
    // bindForceRefresh(); // 绑定强制刷新
    bindShowAllBet(); // 绑定显示所有已投注
    bindCancleMes(); // 弹窗-取消mes
    bindEnsureMes(); // 弹窗-确定mes
    bindCancleDialog(); // 弹窗-取消dialog
    bindEnsureDialog(); // 弹窗-确定dialog

    bindDragBox(); // 绑定拖拽

    // 提示用户选择是否开启预警
    audioAlert();

    /* 方法：获取当前数据的server地址 */
    function defineServerPath(host) {
      if(host){
        w.flagServerPath = 1; // 服务器调用
      } else{ // 本地调用
        if(w.server.cors){ // 跨域
          w.flagServerPath = -1;
        } else{
          w.flagServerPath = 0;
        }
      }
    }

    bindChangePW(); // 修改密码
    /* 方法：获取修改密码 */
    function bindChangePW() {
      const dom_changePWNode = d.querySelector('#s_changePW');
      dom_changePWNode.addEventListener('click', function () {
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

    /* 方法：初始化 table */
    function initTable({ nodeStr_index = ''}) {
      tableNode_index.innerHTML = '';
      tableNode_index.innerHTML = nodeStr_index;
      bindIsBet(); // 绑定每个已投注
      bindCalculator(); // 绑定每个calculator
    }

    /* 方法：生成 list 字符串 */
    function generateListStr(listData_index = [], getFlag_filters) {
      let nodeStr_index = '';
      const no_data = `
        <p class="no-data">No Data.</p>
      `;
      const alert_times_index = {
        warning: 0,
        danger: 0
      };

      const s_hightBenefitPoint = s_bet.querySelector('#s_hightBenefitPoint');
      const s_middleBenefitPoint = s_bet.querySelector('#s_middleBenefitPoint');
      const hightBenefitPoint = s_hightBenefitPoint.nowValue || s_hightBenefitPoint.value;
      const middleBenefitPoint = s_middleBenefitPoint.nowValue || s_middleBenefitPoint.value;
      listData_index.forEach((ele, index) => {
        // 本局游戏是否投注
        // -1: 未投注
        // 1: 已投注
        ele.isBet =  w.hideBetList.includes(ele.calcId)? 1 : -1;
        const filterCondition_hasFilter = !getFlag_filters || (getFlag_filters && getFlag_filters(ele));
        const filterCondition_isBet = !w.isShowAllBet && ele.isBet === 1;
        const filterCondition = filterCondition_hasFilter && !filterCondition_isBet;
        // 过滤
        if(filterCondition){
          const tdClass_jzPValue = ele.jzPValue == 0 ? '' : (ele.jzPValue < 0 ? 'green' : 'red');
          let tdClass_totalBenefitPoint = '';
          // 需要判断 空 或者 0 吗
          if(ele.totalBenefitPoint > Number(hightBenefitPoint)){ // 报警利润
            tdClass_totalBenefitPoint = 'tips red flash';
            ele.isBet === -1 && alert_times_index.danger++;
          } else if(ele.totalBenefitPoint > Number(middleBenefitPoint)){ // 跟踪利润
            tdClass_totalBenefitPoint = 'tips yellow';
            ele.isBet === -1 && alert_times_index.warning++;
          }
    
          const nodeStr_index_main = `
            <div class="block">
              <div class="top">
                <div class="competitionType">
                  <p>${ele.competitionType}</p>
                  <span></span>
                </div>
                <div class="level">
                  <span>${ele.level}</span>
                  <span>${ele.matchTime}</span>
                </div>
                <div class="teams">
                  <span class="team1">${ele.teamNameH}</span>
                  <span class="icon-vs"></span>
                  <span class="team2">${ele.teamNameA}</span>
                </div>
                <div class="calculator">
                  <button class="primary small s-calculator-index" data-index=${index}>计算</button>
                </div>
                <div class="is-bet">
                  已投注：
                  <div class="s-is-bet-index switch ${ele.isBet===1?'active': ''}" data-index=${index} data-calc-id=${ele.calcId}>
                    <div class="switch-handle"></div>
                  </div>
                </div>
              </div>
              <div class="bot">
                <table>
                  <tr class="head">
                    <th colspan="10">
                      <span>${ele.jzRateType}</span>
                    </th>
                    <th colspan="3">
                      <span>${ele.hgRateType}</span>
                    </th>
                    <th olspan="1">利润</th>
                  </tr>
                  <tr class="sec-head">
                    <td width="3%" class="hide-text"></td>
                    <td width="6%" class="bold">胜胜</td>
                    <td width="6%" class="bold">胜平</td>
                    <td width="6%" class="bold">胜负</td>
                    <td width="6%" class="bold">平胜</td>
                    <td width="6%" class="bold">平平</td>
                    <td width="6%" class="bold">平负</td>
                    <td width="6%" class="bold">负胜</td>
                    <td width="6%" class="bold">负平</td>
                    <td width="6%" class="bold">负负</td>

                    <td width="10%" class="bold">胜</td>
                    <td width="10%" class="bold">平</td>
                    <td width="10%" class="bold">负</td>
                    <td width="10%" class="bold"></td>
                  </tr>
                  <tr>
                    <td class="trend ${tdClass_jzPValue}">${ele.jzPValue > 0 ? "+" + ele.jzPValue : ele.jzPValue}</td>
                    <td class="trend ${ele.changeJzHhRate&&(ele.changeJzHhRate>0?'trend-up':'trend-down')} ${ele.jzHhHighlight?'red':''}">${ele.jzHhRate}</td>
                    <td class="trend ${ele.changeJzHdRate&&(ele.changeJzHdRate>0?'trend-up':'trend-down')} ${ele.jzHdHighlight?'red':''}">${ele.jzHdRate}</td>
                    <td class="trend ${ele.changeJzHaRate&&(ele.changeJzHaRate>0?'trend-down':'trend-up')} ${ele.jzHaHighlight?'red':''}">${ele.jzHaRate}</td>
                    <td class="trend ${ele.changeJzDhRate&&(ele.changeJzDhRate>0?'trend-up':'trend-down')} ${ele.jzDhHighlight?'red':''}">${ele.jzDhRate}</td>
                    <td class="trend ${ele.changeJzDdRate&&(ele.changeJzDdRate>0?'trend-up':'trend-down')} ${ele.jzDdHighlight?'red':''}">${ele.jzDdRate}</td>
                    <td class="trend ${ele.changeJzDaRate&&(ele.changeJzDaRate>0?'trend-down':'trend-up')} ${ele.jzDaHighlight?'red':''}">${ele.jzDaRate}</td>
                    <td class="trend ${ele.changeJzAhRate&&(ele.changeJzAhRate>0?'trend-up':'trend-down')} ${ele.jzAhHighlight?'red':''}">${ele.jzAhRate}</td>
                    <td class="trend ${ele.changeJzAdRate&&(ele.changeJzAdRate>0?'trend-up':'trend-down')} ${ele.jzAdHighlight?'red':''}">${ele.jzAdRate}</td>
                    <td class="trend ${ele.changeJzAaRate&&(ele.changeJzAaRate>0?'trend-down':'trend-up')} ${ele.jzAaHighlight?'red':''}">${ele.jzAaRate}</td>

                    <td class="trend ${ele.changeHgWRate&&(ele.changeHgWRate>0?'trend-up':'trend-down')} ${ele.hgWHighlight?'red':''}">${ele.hgWRate}</td>
                    <td class="trend ${ele.changeHgDRate&&(ele.changeHgDRate>0?'trend-up':'trend-down')} ${ele.hgDHighlight?'red':''}">${ele.hgPDisplay == ''? ele.hgDRate : ele.hgPDisplay}</td>
                    <td class="trend ${ele.changeHgLRate&&(ele.changeHgLRate>0?'trend-up':'trend-down')} ${ele.hgLHighlight?'red':''}">${ele.hgLRate}</td>
                    <td class="${tdClass_totalBenefitPoint}">${ele.totalBenefitPoint||''}</td>
                  </tr>
                  <tr>
                    <td class="hide-text"></td>
                    <td class="bold">${ele.jzHhPayAmount>0? ele.jzHhPayAmount : ''}</td>
                    <td class="bold">${ele.jzHdPayAmount>0? ele.jzHdPayAmount : ''}</td>
                    <td class="bold">${ele.jzHaPayAmount>0? ele.jzHaPayAmount : ''}</td>
                    <td class="bold">${ele.jzDhPayAmount>0? ele.jzDhPayAmount : ''}</td>
                    <td class="bold">${ele.jzDdPayAmount>0? ele.jzDdPayAmount : ''}</td>
                    <td class="bold">${ele.jzDaPayAmount>0? ele.jzDaPayAmount : ''}</td>
                    <td class="bold">${ele.jzAhPayAmount>0? ele.jzAhPayAmount : ''}</td>
                    <td class="bold">${ele.jzAdPayAmount>0? ele.jzAdPayAmount : ''}</td>
                    <td class="bold">${ele.jzAaPayAmount>0? ele.jzAaPayAmount : ''}</td>

                    <td class="bold">${ele.hgWPayAmount>0? ele.hgWPayAmount : ''}</td>
                    <td class="bold">${ele.hgDPayAmount>0? ele.hgDPayAmount : ''}</td>
                    <td class="bold">${ele.hgLPayAmount>0? ele.hgLPayAmount : ''}</td>
                    <td class="bold">${ele.totalBenefitAmount!=0? ele.totalBenefitAmount : ''}</td>
                  </tr>
                </table>
              </div>
              <!-- lose </div> -->
          `;
          let nodeStr_index_history = '';
          if(ele.hisIndex) nodeStr_ttg_history = `
          <div class="bot bot-history">
            <table>
              <tr class="head">
                <th colspan="10">
                  <span>${ele.hisIndex.jzRateType}</span>
                </th>
                <th colspan="3">
                  <span>${ele.hisIndex.hgRateType}</span>
                </th>
                <th olspan="1">利润</th>
              </tr>
              <tr class="sec-head">
                <td width="3%" class="hide-text"></td>
                <td width="6%" class="bold">胜胜</td>
                <td width="6%" class="bold">胜平</td>
                <td width="6%" class="bold">胜负</td>
                <td width="6%" class="bold">平胜</td>
                <td width="6%" class="bold">平平</td>
                <td width="6%" class="bold">平负</td>
                <td width="6%" class="bold">负胜</td>
                <td width="6%" class="bold">负平</td>
                <td width="6%" class="bold">负负</td>

                <td width="10%" class="bold">胜</td>
                <td width="10%" class="bold">平</td>
                <td width="10%" class="bold">负</td>
                <td width="10%" class="bold"></td>
              </tr>
              <tr>
                <td class="trend ${tdClass_jzPValue}">${ele.hisIndex.jzPValue > 0 ? "+" + ele.hisIndex.jzPValue : ele.hisIndex.jzPValue}</td>
                <td class="trend ${ele.hisIndex.changeJzHhRate&&(ele.hisIndex.changeJzHhRate>0?'trend-up':'trend-down')} ${ele.hisIndex.jzHhHighlight?'red':''}">${ele.hisIndex.jzHhRate}</td>
                <td class="trend ${ele.hisIndex.changeJzHdRate&&(ele.hisIndex.changeJzHdRate>0?'trend-up':'trend-down')} ${ele.hisIndex.jzHdHighlight?'red':''}">${ele.hisIndex.jzHdRate}</td>
                <td class="trend ${ele.hisIndex.changeJzHaRate&&(ele.hisIndex.changeJzHaRate>0?'trend-down':'trend-up')} ${ele.hisIndex.jzHaHighlight?'red':''}">${ele.hisIndex.jzHaRate}</td>
                <td class="trend ${ele.hisIndex.changeJzDhRate&&(ele.hisIndex.changeJzDhRate>0?'trend-up':'trend-down')} ${ele.hisIndex.jzDhHighlight?'red':''}">${ele.hisIndex.jzDhRate}</td>
                <td class="trend ${ele.hisIndex.changeJzDdRate&&(ele.hisIndex.changeJzDdRate>0?'trend-up':'trend-down')} ${ele.hisIndex.jzDdHighlight?'red':''}">${ele.hisIndex.jzDdRate}</td>
                <td class="trend ${ele.hisIndex.changeJzDaRate&&(ele.hisIndex.changeJzDaRate>0?'trend-down':'trend-up')} ${ele.hisIndex.jzDaHighlight?'red':''}">${ele.hisIndex.jzDaRate}</td>
                <td class="trend ${ele.hisIndex.changeJzAhRate&&(ele.hisIndex.changeJzAhRate>0?'trend-up':'trend-down')} ${ele.hisIndex.jzAhHighlight?'red':''}">${ele.hisIndex.jzAhRate}</td>
                <td class="trend ${ele.hisIndex.changeJzAdRate&&(ele.hisIndex.changeJzAdRate>0?'trend-up':'trend-down')} ${ele.hisIndex.jzAdHighlight?'red':''}">${ele.hisIndex.jzAdRate}</td>
                <td class="trend ${ele.hisIndex.changeJzAaRate&&(ele.hisIndex.changeJzAaRate>0?'trend-down':'trend-up')} ${ele.hisIndex.jzAaHighlight?'red':''}">${ele.hisIndex.jzAaRate}</td>

                <td class="trend ${ele.hisIndex.changeHgWRate&&(ele.hisIndex.changeHgWRate>0?'trend-up':'trend-down')} ${ele.hisIndex.hgWHighlight?'red':''}">${ele.hisIndex.hgWRate}</td>
                <td class="trend ${ele.hisIndex.changeHgDRate&&(ele.hisIndex.changeHgDRate>0?'trend-up':'trend-down')} ${ele.hisIndex.hgDHighlight?'red':''}">${ele.hisIndex.hgPDisplay == ''? ele.hisIndex.hgDRate : ele.hisIndex.hgPDisplay}</td>
                <td class="trend ${ele.hisIndex.changeHgLRate&&(ele.hisIndex.changeHgLRate>0?'trend-up':'trend-down')} ${ele.hisIndex.hgLHighlight?'red':''}">${ele.hisIndex.hgLRate}</td>
                <td class="${tdClass_totalBenefitPoint}">${ele.hisIndex.totalBenefitPoint||''}</td>
              </tr>
              <tr>
                <td class="hide-text"></td>
                <td class="bold">${ele.hisIndex.jzWPayAmount>0? ele.hisIndex.jzWPayAmount : ''}</td>
                <td class="bold">${ele.hisIndex.jzDPayAmount>0? ele.hisIndex.jzDPayAmount : ''}</td>
                <td class="bold">${ele.hisIndex.jzLPayAmount>0? ele.hisIndex.jzLPayAmount : ''}</td>
                <td class="bold">${ele.hisIndex.jzWPayAmount>0? ele.hisIndex.jzWPayAmount : ''}</td>
                <td class="bold">${ele.hisIndex.jzDPayAmount>0? ele.hisIndex.jzDPayAmount : ''}</td>
                <td class="bold">${ele.hisIndex.jzLPayAmount>0? ele.hisIndex.jzLPayAmount : ''}</td>
                <td class="bold">${ele.hisIndex.jzWPayAmount>0? ele.hisIndex.jzWPayAmount : ''}</td>
                <td class="bold">${ele.hisIndex.jzDPayAmount>0? ele.hisIndex.jzDPayAmount : ''}</td>
                <td class="bold">${ele.hisIndex.jzLPayAmount>0? ele.hisIndex.jzLPayAmount : ''}</td>

                <td class="bold">${ele.hisIndex.hgWPayAmount>0? ele.hisIndex.hgWPayAmount : ''}</td>
                <td class="bold">${ele.hisIndex.hgDPayAmount>0? ele.hisIndex.hgDPayAmount : ''}</td>
                <td class="bold">${ele.hisIndex.hgLPayAmount>0? ele.hisIndex.hgLPayAmount : ''}</td>
                <td class="bold">${ele.hisIndex.totalBenefitAmount!=0? ele.hisIndex.totalBenefitAmount : ''}</td>
              </tr>
            </table>
          </div>
          `;
          // 删除   
          if(true) nodeStr_index_history = `
            <div class="bot bot-history">
              <table>
                <tr class="head">
                  <th colspan="10">
                    <span>${ele.jzRateType}</span>
                  </th>
                  <th colspan="3">
                    <span>${ele.hgRateType}</span>
                  </th>
                  <th olspan="1">利润</th>
                </tr>
                <tr class="sec-head">
                  <td width="3%" class="hide-text"></td>
                  <td width="6%" class="bold">胜胜</td>
                  <td width="6%" class="bold">胜平</td>
                  <td width="6%" class="bold">胜负</td>
                  <td width="6%" class="bold">平胜</td>
                  <td width="6%" class="bold">平平</td>
                  <td width="6%" class="bold">平负</td>
                  <td width="6%" class="bold">负胜</td>
                  <td width="6%" class="bold">负平</td>
                  <td width="6%" class="bold">负负</td>

                  <td width="10%" class="bold">胜</td>
                  <td width="10%" class="bold">平</td>
                  <td width="10%" class="bold">负</td>
                  <td width="10%" class="bold"></td>
                </tr>
                <tr>
                  <td class="trend ${tdClass_jzPValue}">${ele.jzPValue > 0 ? "+" + ele.jzPValue : ele.jzPValue}</td>
                  <td class="trend ${ele.changeJzHhRate&&(ele.changeJzHhRate>0?'trend-up':'trend-down')} ${ele.jzHhHighlight?'red':''}">${ele.jzHhRate}</td>
                  <td class="trend ${ele.changeJzHdRate&&(ele.changeJzHdRate>0?'trend-up':'trend-down')} ${ele.jzHdHighlight?'red':''}">${ele.jzHdRate}</td>
                  <td class="trend ${ele.changeJzHaRate&&(ele.changeJzHaRate>0?'trend-down':'trend-up')} ${ele.jzHaHighlight?'red':''}">${ele.jzHaRate}</td>
                  <td class="trend ${ele.changeJzDhRate&&(ele.changeJzDhRate>0?'trend-up':'trend-down')} ${ele.jzDhHighlight?'red':''}">${ele.jzDhRate}</td>
                  <td class="trend ${ele.changeJzDdRate&&(ele.changeJzDdRate>0?'trend-up':'trend-down')} ${ele.jzDdHighlight?'red':''}">${ele.jzDdRate}</td>
                  <td class="trend ${ele.changeJzDaRate&&(ele.changeJzDaRate>0?'trend-down':'trend-up')} ${ele.jzDaHighlight?'red':''}">${ele.jzDaRate}</td>
                  <td class="trend ${ele.changeJzAhRate&&(ele.changeJzAhRate>0?'trend-up':'trend-down')} ${ele.jzAhHighlight?'red':''}">${ele.jzAhRate}</td>
                  <td class="trend ${ele.changeJzAdRate&&(ele.changeJzAdRate>0?'trend-up':'trend-down')} ${ele.jzAdHighlight?'red':''}">${ele.jzAdRate}</td>
                  <td class="trend ${ele.changeJzAaRate&&(ele.changeJzAaRate>0?'trend-down':'trend-up')} ${ele.jzAaHighlight?'red':''}">${ele.jzAaRate}</td>

                  <td class="trend ${ele.changeHgWRate&&(ele.changeHgWRate>0?'trend-up':'trend-down')} ${ele.hgWHighlight?'red':''}">${ele.hgWRate}</td>
                  <td class="trend ${ele.changeHgDRate&&(ele.changeHgDRate>0?'trend-up':'trend-down')} ${ele.hgDHighlight?'red':''}">${ele.hgPDisplay == ''? ele.hgDRate : ele.hgPDisplay}</td>
                  <td class="trend ${ele.changeHgLRate&&(ele.changeHgLRate>0?'trend-up':'trend-down')} ${ele.hgLHighlight?'red':''}">${ele.hgLRate}</td>
                  <td class="${tdClass_totalBenefitPoint}">${ele.totalBenefitPoint||''}</td>
                </tr>
                <tr>
                  <td class="hide-text"></td>
                  <td class="bold">${ele.jzHhPayAmount>0? ele.jzHhPayAmount : ''}</td>
                  <td class="bold">${ele.jzHdPayAmount>0? ele.jzHdPayAmount : ''}</td>
                  <td class="bold">${ele.jzHaPayAmount>0? ele.jzHaPayAmount : ''}</td>
                  <td class="bold">${ele.jzDhPayAmount>0? ele.jzDhPayAmount : ''}</td>
                  <td class="bold">${ele.jzDdPayAmount>0? ele.jzDdPayAmount : ''}</td>
                  <td class="bold">${ele.jzDaPayAmount>0? ele.jzDaPayAmount : ''}</td>
                  <td class="bold">${ele.jzAhPayAmount>0? ele.jzAhPayAmount : ''}</td>
                  <td class="bold">${ele.jzAdPayAmount>0? ele.jzAdPayAmount : ''}</td>
                  <td class="bold">${ele.jzAaPayAmount>0? ele.jzAaPayAmount : ''}</td>

                  <td class="bold">${ele.hgWPayAmount>0? ele.hgWPayAmount : ''}</td>
                  <td class="bold">${ele.hgDPayAmount>0? ele.hgDPayAmount : ''}</td>
                  <td class="bold">${ele.hgLPayAmount>0? ele.hgLPayAmount : ''}</td>
                  <td class="bold">${ele.totalBenefitAmount!=0? ele.totalBenefitAmount : ''}</td>
                </tr>
              </table>
            </div>
          `;
          nodeStr_index += nodeStr_index_main + nodeStr_index_history + `</div>`;
        }
      })
      w.alertTimes = {
        warning: alert_times_index.warning,
        danger: alert_times_index.danger,
      }

      const s_tabs = d.querySelector('#s_tabsBox');
      const s_lis = s_tabs.querySelectorAll('li');
      s_lis[0].classList.remove('tips','red','yellow');

      if(alert_times_index.danger > 0){
        s_lis[0].classList.add('tips','red');
      } else if(alert_times_index.warning > 0){
        s_lis[0].classList.add('tips','yellow');
      }
      if(!w.filterWithoutAudio && w.isPlayAudio && w.alertTimes.danger){
        audioPlay(); // 播放音频
      }
      w.filterWithoutAudio = false; // 判断音频是否播放完成，分离 isBet
      return {
        nodeStr_index: nodeStr_index.length?nodeStr_index:no_data
      };
    }

    /* 方法：绑定投注事件 */
    function bindBet(callback) {
      const s_jzPayAmount = s_bet.querySelector('#s_jzPayAmount');
      const s_jzRebatePoint = s_bet.querySelector('#s_jzRebatePoint');
      const s_hgERebatePoint = s_bet.querySelector('#s_hgERebatePoint');
      const s_hgARebatePoint = s_bet.querySelector('#s_hgARebatePoint');
      const s_refreshFreq = s_bet.querySelector('#s_refreshFreq');
      const s_hightBenefitPoint = s_bet.querySelector('#s_hightBenefitPoint');
      const s_middleBenefitPoint = s_bet.querySelector('#s_middleBenefitPoint');
      const s_bet_ensure = s_bet.querySelector('#s_bet_ensure');

      s_bet_ensure.addEventListener('click', (e) => {
        isFirstTimeInitBet = false;
        const betObj = {
          jzPayAmount: s_jzPayAmount.value.trim(),
          jzRebatePoint: s_jzRebatePoint.value.trim(),
          hgERebatePoint: s_hgERebatePoint.value.trim(),
          hgARebatePoint: s_hgARebatePoint.value.trim(),
        };
        w.s_bet.querySelector('#s_hightBenefitPoint').nowValue = s_hightBenefitPoint.value.trim();
        w.s_bet.querySelector('#s_middleBenefitPoint').nowValue = s_middleBenefitPoint.value.trim();
        const refreshFreq = s_refreshFreq.value;
        if (!getValidBet({ ...betObj, refreshFreq })) {
          return;
        }
        if (Number(s_refreshFreq.value) >= 1) {
          w.refreshFreqTime = Math.ceil(Number(s_refreshFreq.value));
        }
        callback(betObj);
      })
    }

    /* 方法：投注处理---点击按钮触发 */
    function betAction(bet_params) {
      getData(bet_params);
      refreshList_end();
      refreshList_start(bet_params);
    }

    /* 方法：初始化 投注 */
    function initBet(params) {
      const s_jzPayAmount = s_bet.querySelector('#s_jzPayAmount');
      const s_jzRebatePoint = s_bet.querySelector('#s_jzRebatePoint');
      const s_hgERebatePoint = s_bet.querySelector('#s_hgERebatePoint');
      const s_hgARebatePoint = s_bet.querySelector('#s_hgARebatePoint');
      const s_refreshFreq = s_bet.querySelector('#s_refreshFreq');
      s_jzPayAmount.value = params.jzPayAmount;
      s_jzRebatePoint.value = params.jzRebatePoint;
      s_hgERebatePoint.value = params.hgERebatePoint;
      s_hgARebatePoint.value = params.hgARebatePoint;
      s_refreshFreq.value = params.refreshFreq;
    }

    /* 方法：初始化 投注的定值 */
    function initBetConst() {
      const s_hightBenefitPoint = s_bet.querySelector('#s_hightBenefitPoint');
      const s_middleBenefitPoint = s_bet.querySelector('#s_middleBenefitPoint');
      s_middleBenefitPoint.value = w.middleBenefitPoint;
      s_hightBenefitPoint.value = w.hightBenefitPoint;
    }

    /* 方法：bet 校验 */
    function getValidBet(params) {
      const hightBenefitPoint = w.s_bet.querySelector('#s_hightBenefitPoint').nowValue || w.hightBenefitPoint;
      const middleBenefitPoint = w.s_bet.querySelector('#s_middleBenefitPoint').nowValue || w.middleBenefitPoint;
      const validBetObj = {
        jzPayAmount: Number(params.jzPayAmount),
        jzRebatePoint: Number(params.jzRebatePoint),
        hgERebatePoint: Number(params.hgERebatePoint),
        hgARebatePoint: Number(params.hgARebatePoint),
        hightBenefitPoint: Number(hightBenefitPoint),
        middleBenefitPoint: Number(middleBenefitPoint),
        refreshFreq: Number(params.refreshFreq),
      };
      if (validBetObj.jzPayAmount&&!validBetObj.jzPayAmount) {
        alert('体彩投注格式错误，请输入数字。。');
        return false;
      }
      if (validBetObj.jzRebatePoint&&!validBetObj.jzRebatePoint) {
        alert('体彩返点格式错误，请输入数字。。');
        return false;
      }
      if (validBetObj.hgERebatePoint&&!validBetObj.hgERebatePoint) {
        alert('皇冠返点格式错误，请输入数字。。');
        return false;
      }
      if (validBetObj.hgARebatePoint&&!validBetObj.hgARebatePoint) {
        alert('皇冠让球返点格式错误，请输入数字。。');
        return false;
      }
      if (validBetObj.hightBenefitPoint&&!validBetObj.hightBenefitPoint) {
        alert('预警利润格式错误，请输入数字。。');
        return false;
      }
      if (validBetObj.middleBenefitPoint&&!validBetObj.middleBenefitPoint) {
        alert('跟踪利润格式错误，请输入数字。。');
        return false;
      }
      if (validBetObj.refreshFreq&&!validBetObj.refreshFreq) {
        alert('刷新频率格式错误，请输入数字。。');
        return false;
      }
      if (validBetObj.refreshFreq&&validBetObj.refreshFreq < 0) {
        alert('刷新频率需 > 0，请重新输入。。');
        return false;
      }
      return true;
    }

    /* 方法：绑定筛选事件 */
    function bindFilter(callback) {
      const s_filter = d.querySelector('#s_filter');
      const s_type = s_filter.querySelector('#s_type')
      const s_level = s_filter.querySelector('#s_level')
      const s_team = s_filter.querySelector('#s_team')
      w.dom_filter_ensure.addEventListener('click', (e) => {
        callback({
          type: s_type.value.trim(),
          level: s_level.value.trim(),
          team: s_team.value.trim(),
        });
      })
    }

    /* 方法：筛选处理---点击按钮触发 */
    function filterAction(filter_params = {}) {
      let { type, level, team } = filter_params;
      const nodeStrList = generateListStr(listData_index, (ele) => {
        const typeCondition = !(type && type.trim()) || (ele.competitionType.includes(type));
        const levelCondition = !(level && level.trim()) || (ele.level.includes(level));
        const teamCondition = !(team && team.trim()) || (ele.teamNameH.includes(team) || ele.teamNameA.includes(team));
        const filterCondition = typeCondition && levelCondition && teamCondition;

        if (filterCondition) {
          return true;
        }
        return false;
      });

      initTable(nodeStrList);
    }

    /* 方法：refresh start */
    function refreshList_start(params) {
      clock = setInterval(() => {
        getData(params);
      }, refreshFreqTime * 1000);
    }

    /* 方法：refresh end */
    function refreshList_end() {
      clearInterval(clock);
      clock = null;
    }

    /* 方法：获取数据 */
    function getData(bet_params) {
      changeBlockBetStatus({ // 修改比赛投注状态
        optType: 0,
        hiddenCalcIds: []
      }, () => {
        // api：get 列表数据--静态调用 _file，API 调用 _api
        if (!flagServerPath) {
          getData_file(bet_params);
        } else {
          getData_api(bet_params);
        }
      });
    }
    /* 方法：绑定投注分配switch */
    function bindSwitchPayAsTotal() {
      const s_isJzPayAsTotal = d.querySelector('#s_isJzPayAsTotal');
      s_isJzPayAsTotal.addEventListener('click', function (e) {
        w.isJzPayAsTotal = !w.isJzPayAsTotal;
        s_bet.querySelector('#s_bet_ensure').click();
        if (isJzPayAsTotal) {
          this.classList.add('active');
        } else {
          this.classList.remove('active');
        }
      })
    }

    /* 方法：api 获取数据 */
    function getData_api(bet_params) {
      // api：get 列表数据
      let data = bet_params && {
        jzPayAmount: bet_params.jzPayAmount,
        jzRebatePoint: bet_params.jzRebatePoint,
        hgERebatePoint: bet_params.hgERebatePoint,
        hgARebatePoint: bet_params.hgARebatePoint,
        needFresh: bet_params.needFresh || false,
        
      } || {
        jzPayAmount: '',
        jzRebatePoint: '',
        hgERebatePoint: '',
        hgARebatePoint: '',
        needFresh: false,
      };

      data.isJzPayAsTotal = w.isJzPayAsTotal; // 投注分配
      // 请求之前先停止 audio
      audioClose();
      const api_url = w.API_URL && w.API_URL.getData;

      ajaxPromise({
        type: 'post',
        url:  api_url,
        data
      }).then(res => {
        w.response = res;
        w.listData_index = res.data;
        w.dom_filter_ensure.click();
        if (isFirstTimeInitBet) {
          const bet_params = {
            jzPayAmount: res.jzPayAmount,
            jzRebatePoint: res.jzRebatePoint,
            hgERebatePoint: res.hgERebatePoint,
            hgARebatePoint: res.hgARebatePoint,
            refreshFreq: res.refreshFreq,
          };
          w.refreshFreq = res.refreshFreq;
          initBet(bet_params);
          refreshList_end();
          refreshList_start(bet_params);
          // 每次请求重置
          w.isFirstTimeInitBet = false;
        }
        // 每次请求将提醒次数清空
        w.alertTimes = {
          warning: 0,
          danger: 0,
        };
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }

    /* 方法：本地 获取数据 */
    function getData_file(bet_params) {
      // api：get 列表数据
      let data = bet_params && {
        jzPayAmount: bet_params.jzPayAmount,
        jzRebatePoint: bet_params.jzRebatePoint,
        hgERebatePoint: bet_params.hgERebatePoint,
        hgARebatePoint: bet_params.hgARebatePoint,
        needFresh: bet_params.needFresh || false,
      } || {
        jzPayAmount: '',
        jzRebatePoint: '',
        hgERebatePoint: '',
        hgARebatePoint: '',
        needFresh: false,
      };
      data.isJzPayAsTotal = w.isJzPayAsTotal; // 投注分配
      // 请求之前先停止 audio
      audioClose();
      const url_getData = w.API_URL && w.API_URL.getData;

      setTimeout(() => {
        w.response = w.mock.res;
        w.listData_index = w.mock.res.data;
        w.dom_filter_ensure.click();
        if (isFirstTimeInitBet) {
          const bet_params = {
            jzPayAmount: w.mock.res.jzPayAmount,
            jzRebatePoint: w.mock.res.jzRebatePoint,
            hgERebatePoint: w.mock.res.hgERebatePoint,
            hgARebatePoint: w.mock.res.hgARebatePoint,
            refreshFreq: w.mock.res.refreshFreq,
          };
          w.refreshFreqTime = w.mock.res.refreshFreq;
          initBet(bet_params);
          refreshList_end();
          refreshList_start(bet_params);
          // 每次请求重置
          w.isFirstTimeInitBet = false;
        }
        // 每次请求将提醒次数清空
        w.alertTimes = {
          warning: 0,
          danger: 0,
        };
      }, .5 * 1000);
    }

    /* 方法：播放音频 */
    function audioPlay() {
      w.audio_alert.pause();
      w.audio_alert.play();
    }

    function audioClose() {
      w.audio_alert.pause();
    }

    /* 方法：预警弹窗 */
    function audioAlert() {
      w.dom_mes.classList.add('show');
      w.dom_mesContent.innerText = '是否开启预警提醒？';
      w.mesCallback = () => {
        d.querySelector('#s_audio_select').click();
      };
      pageScroll(false);
    }
    /* 方法：绑定预警提醒开关 */
    function bindSwitchAudio() {
      const s_audio_select = d.querySelector('#s_audio_select');
      s_audio_select.addEventListener('click', function (e) {
        w.isPlayAudio = !w.isPlayAudio;
        if (isPlayAudio) {
          this.classList.add('active');
          audioPlay();
        } else {
          this.classList.remove('active');
          audioClose();
        }
      })
    }

    /* 方法：绑定 tabs */
    function bindTabs() {
      const s_tab_List = d.querySelectorAll('#s_tabsBox>li');
      const s_tabContent_list = d.querySelectorAll('div>.table');
      s_tab_List.forEach((ele, index) => {
        ele.addEventListener('click', function (e) {
          const tabName = ele.dataset['tab'];
          if(tabName === w.showTabName){
            return false;
          }
          s_tabContent_list.forEach((ele_inner, index_inner) => {
            ele_inner.classList.remove('show');
            s_tab_List[index_inner].classList.remove('active');
          })
          s_tabContent_list[index].classList.add('show');
          ele.classList.add('active');
          w.showTabName = tabName;
        })
      })
    }

    /* 方法：绑定显示所有已投注 */
    function bindShowAllBet() {
      const s_showAllBet = d.querySelector('#s_showAllBet');
      s_showAllBet.addEventListener('click', function (e) {
        w.isShowAllBet = !w.isShowAllBet;
        if(w.isShowAllBet){
          this.classList.add('active');
        } else{
          this.classList.remove('active');
        }
        w.filterWithoutAudio = true;
        w.dom_filter_ensure.click();
      })  
    } 

    /* 方法：绑定单个已投注 */
    function bindIsBet() {
      const s_isBet_list_index = d.querySelectorAll('.s-is-bet-index');
      s_isBet_list_index.forEach((ele) => {
        ele.addEventListener('click', function (e) {
          const index = this.dataset['index'];
          const calcId = this.dataset['calcId'];
          listData_index[index].isBet  = listData_index[index].isBet * -1;
          this.classList.toggle('active'); // 放在 callback 外面有动画过渡
          changeBlockBetStatus({ // 修改比赛投注状态
            optType: listData_index[index].isBet,
            hiddenCalcIds: [calcId]
          }, () => {
            w.filterWithoutAudio = true;
            w.dom_filter_ensure.click();
          });
        })
      })
    } 

    /* 方法：获取数据 */
    function changeBlockBetStatus(params, callback) {
      // api：get 列表数据--静态调用 _file，API 调用 _api
      if (!flagServerPath) {
        changeBlockBetStatus_file(params, callback);
      } else {
        changeBlockBetStatus_api(params, callback);
      }
    }
    
    /* 方法：api 计算 */
    function changeBlockBetStatus_api(params, callback) {
      // optType:
      // 0 查询 只需要userId 后台返回对应user的数据
      // 1 更新 把你传的内容更新进来
      let data = params && {
        userId: '',
        optType: params.optType,
        hiddenCalcIds: params.hiddenCalcIds
      } || {
        userId: '',
        optType: 0,
        hiddenCalcIds: []
      };

      const api_url = w.API_URL && w.API_URL.staticValues;

      ajaxPromise({
        type: 'post',
        url:  api_url,
        data
      }).then(res => {
        w.hideBetList = res.hiddenCalcIds;
        callback();
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }
    
    /* 方法：本地 计算 */
    function changeBlockBetStatus_file(params, callback) {
      // api：get 列表数据
      // optType:
      // 0 查询 只需要userId 后台返回对应user的数据
      // 1 更新 转为投注
      // -1 更新 转为不投注
      let data = params && {
        userId: '',
        optType: params.optType,
        hiddenCalcIds: params.hiddenCalcIds
      } || {
        userId: '',
        optType: 0,
        hiddenCalcIds: []
      };

      const api_url = w.API_URL && w.API_URL.staticValues;

      setTimeout(() => {
        w.hideBetList = w.mock.StatusData.hiddenCalcIds;
        callback();
      }, .5 * 1000);
    }

    /* 方法：绑定点击某场比赛的计算 */
    function bindCalculator() {
      const s_calculator_list_index = d.querySelectorAll('.s-calculator-index');
      let showObj = {};
      s_calculator_list_index.forEach((ele) => {
        ele.addEventListener('click', function (e) {
          this.classList.toggle('active');
          const index = this.dataset['index'];
          showObj = listData_index[index];
          initDialogContent(showObj);
          d.querySelector('html').classList.add('no-scroll');
          d.querySelector('body').classList.add('no-scroll');
        })
      })
    } 

    /* 方法：获取数据 */
    function getCalculator(params, outputNodeList) {
      // api：get 列表数据--静态调用 _file，API 调用 _api
      if (!flagServerPath) {
        getCalculator_file(params, outputNodeList);
      } else {
        getCalculator_api(params, outputNodeList);
      }
    }

    /* 方法：api 计算 */
    function getCalculator_api(params, outputNodeList) {
      let data = params || {};
      data.isJzPayAsTotal_calc = w.isJzPayAsTotal_calc;
      const api_url = w.API_URL && w.API_URL.calculator;

      ajaxPromise({
        type: 'post',
        url:  api_url,
        data
      }).then(res => {
        console.log("api 请求成功==>");
        console.log(res);
        callback_calculator(res, outputNodeList);
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }

    /* 方法：本地 计算 */
    function getCalculator_file(params, outputNodeList) {
      let data = params || {};
      data.isJzPayAsTotal_calc = w.isJzPayAsTotal_calc;
      const api_url = w.API_URL && w.API_URL.calculator;

      setTimeout(() => {
        console.log("api 请求成功==>");
        callback_calculator(w.mock.CalculatorData, outputNodeList);
      }, .5 * 1000);
    }

    /* 方法：获取 dialog 数据用于计算请求 */
    function getDialogDataForCalculator() {
      const inputNodeList = dom_dialogContent.querySelectorAll('input[data-input-key]');      
      const outputNodeList = dom_dialogContent.querySelectorAll('input[data-output-key]');
      const inputValueList = {};
      inputNodeList.forEach((ele) => {
        const key = ele.dataset['inputKey']; // 请求的input 框
        if(ele.dataset['inputRes']){ // 稍显复杂且不需用户输入
          inputValueList[key] = ele.dataset['inputRes'].trim(); // hgPValue
        } else{
          inputValueList[key] = ele.value.trim();
        }
      });
      
      let res_params = {
        jzRebatePoint: s_bet.querySelector('#s_jzRebatePoint').value,
        hgERebatePoint: s_bet.querySelector('#s_hgERebatePoint').value,
        hgARebatePoint: s_bet.querySelector('#s_hgARebatePoint').value,
        jzPayAmount: inputValueList.jzPayAmount,
        isUserCalc: true,
        calcId: w.dialogData.calcId,
        userCalcReq: {}
      };

      if(showTabName === 'index'){
        // 欧赔 或者 亚赔
        if(w.dialogData.hgPDisplay == ''){ // 欧赔
          console.log('欧赔')
          res_params.userCalcReq = {
            crownERate: {
              rateD: inputValueList.hgPValue,
              rateL: inputValueList.hgLRate,
              rateW: inputValueList.hgWRate
            }
          };
        } else{ // 亚赔
          console.log('亚赔')
          res_params.userCalcReq = {
            crownARate: {
              point: inputValueList.hgPValue, // hgPValue
              rateA: inputValueList.hgLRate,
              rateD: inputValueList.hgDRate,
              rateH: inputValueList.hgWRate
            }
          };
        }
        // 让球 或者 胜平负
        if(inputValueList.jzPValue == '0' || inputValueList.jzPValue == 0){ // 胜平负
          console.log('胜平负');
          res_params.userCalcReq.jzRate = {
            hasJzDate: true,
            hasJzRDate: false,
            point: Number(inputValueList.jzPValue) + '', // 去掉 + 号
          }
        } else{ // 让球
          console.log('让球')
          res_params.userCalcReq.jzRate = {
            hasJzDate: false,
            hasJzRDate: true,
            point: Number(inputValueList.jzPValue) + '', // 去掉 + 号
          }
        }

        // 半全场
        res_params.userCalcReq.jzHafuRate = {
          "hh": inputValueList.jzHhRate,
          "hd": inputValueList.jzHdRate,
          "ha": inputValueList.jzHaRate,
          "dh": inputValueList.jzDhRate,
          "dd": inputValueList.jzDdRate,
          "da": inputValueList.jzDaRate,
          "ah": inputValueList.jzAhRate,
          "ad": inputValueList.jzAdRate,
          "aa": inputValueList.jzAaRate
        };
      }
      console.log(res_params);
      return {
        res_params,
        outputNodeList,
      }
    }

    /* 方法：赔率计算弹窗输入框校验 */  
    function validCalculatorInput() {
      const invaildInputObj = {
        length: 0
      };
      const inputNodeList = dom_dialogContent.querySelectorAll('input[data-input-key]');      
      inputNodeList.forEach((ele) => {
        // ele.classList.remove('danger');
        if(ele.dataset['inputKey'] === 'jzPayAmount' && !ele.value.trim()){
          invaildInputObj['jzPayAmount'] = ele;
          invaildInputObj['length']++;
          // ele.classList.add('danger');
        }
      });
      return invaildInputObj;
    }

    /* 方法：calculator 接口数据请求完成后的 callback */
    function callback_calculator(res, outputNodeList) {
      const keyList = {};
      outputNodeList.forEach((ele) => {
        const key = ele.dataset['outputKey'];
        keyList[key] = ele;
      })
      if(w.showTabName === 'index'){
        const ele = res.data[0];
        keyList['totalBenefitPoint'].value = ele.totalBenefitPoint;
        keyList['jzHhPayAmount'].value = ele.jzHhPayAmount>0? ele.jzHhPayAmount : '';
        keyList['jzHdPayAmount'].value = ele.jzHdPayAmount>0? ele.jzHdPayAmount : '';
        keyList['jzHaPayAmount'].value = ele.jzHaPayAmount>0? ele.jzHaPayAmount : '';
        keyList['jzDhPayAmount'].value = ele.jzDhPayAmount>0? ele.jzDhPayAmount : '';
        keyList['jzDdPayAmount'].value = ele.jzDdPayAmount>0? ele.jzDdPayAmount : '';
        keyList['jzDaPayAmount'].value = ele.jzDaPayAmount>0? ele.jzDaPayAmount : '';
        // keyList['jzAhPayAmount'].value = ele.jzAhPayAmount>0? ele.jzAhPayAmount : '';
        // keyList['jzAdPayAmount'].value = ele.jzAdPayAmount>0? ele.jzAdPayAmount : '';
        // keyList['jzAaPayAmount'].value = ele.jzAaPayAmount>0? ele.jzAaPayAmount : '';

        keyList['hgWPayAmount'].value = ele.hgWPayAmount>0? ele.hgWPayAmount : '';
        keyList['hgDPayAmount'].value = ele.hgDPayAmount>0? ele.hgDPayAmount : '';
        keyList['hgLPayAmount'].value = ele.hgLPayAmount>0? ele.hgLPayAmount : '';
        keyList['totalBenefitAmount'].value = ele.totalBenefitAmount!=0? ele.totalBenefitAmount : '';
      }
    }
    /* 方法：强制刷新数据 */  
    function bindForceRefresh() {
      d.querySelector('#s_forceRefresh').addEventListener('click',function (e) {
        w.dom_mes.classList.add('show');
        w.dom_mesContent.innerText = '确定强制刷新后台数据吗？';
        w.mesCallback = forceRefreshAction;
        pageScroll(false);
      })
    }

    /* 方法：强制刷新处理---点击按钮触发 */
    function forceRefreshAction(params) {
      console.log('发请求');
      getData({
        needFresh: true
      });
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
        w.mesCallback();
        w.mesCallback = null; // 执行完置空
        pageScroll(true);
      })
    }

    /* 方法：dialog 取消 */  
    function bindCancleDialog() {
      d.querySelector('#s_cancelDialog').addEventListener('click',function (e) {
        clearDialogContent();
        pageScroll(true);
      })
    }

    /* 方法：dialog 确定 */  
    function bindEnsureDialog() {
      d.querySelector('#s_ensureDialog').addEventListener('click',function (e) {
        if(!w.flag_dialogEnsure){
          const invaildInputObj = validCalculatorInput();
          if(invaildInputObj.length){
            alert('请输入投注金额！');
            return;
          };
          const {res_params, outputNodeList} = getDialogDataForCalculator();
          getCalculator(res_params, outputNodeList);
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

      if(!w.flag_dialogEnsure){
        dom_dialogHeader.innerText = '赔率计算器：';
        const ele = w.dialogData = Object.assign({}, obj);
        if(showTabName === 'index'){
          let hgLRateFormat02 = ele.hgLRate.trim(),hgLRateFormat01 = '';
          if(hgLRateFormat02.includes(' ')){
            hgLRateFormat01 = hgLRateFormat02.split(' ')[0];
            hgLRateFormat02 = hgLRateFormat02.split(' ')[1];
          }
          nodeStr += `
            <div class="dialog-title">
              <label>请输入投注金额：
                <input class="big" data-input-key="jzPayAmount" type="number" value="10000"> 元
              </label>
              <div class="isJzPayAsTotal_calc">
                投注分配：
                <div class="switch active" id="s_isJzPayAsTotal_calc">
                  <div class="switch-handle"></div>
                </div>
              </div>
            </div></br>
            <div class="block">
              <div class="top">
                <div class="competitionType">
                  <p>${ele.competitionType}</p>
                  <span></span>
                </div>
                <div class="level">
                  <span>${ele.level}</span>
                  <span>${ele.matchTime}</span>
                </div>
                <div class="teams">
                  <span class="team1">${ele.teamNameH}</span>
                  <span class="icon-vs"></span>
                  <span class="team2">${ele.teamNameA}</span>
                </div>
              </div>
              <div class="bot">
                <table>
                  <tr class="head">
                    <th colspan="10">
                      <span>${ele.jzRateType}</span>
                    </th>
                    <th colspan="3">
                      <span>${ele.hgRateType}</span>
                    </th>
                    <th width="20%" colspan="1">利润</th>
                  </tr>
                  <tr class="sec-head">
                    <td width="3%" class="hide-text"></td>
                    <td width="6%" class="bold">胜胜</td>
                    <td width="6%" class="bold">胜平</td>
                    <td width="6%" class="bold">胜负</td>
                    <td width="6%" class="bold">平胜</td>
                    <td width="6%" class="bold">平平</td>
                    <td width="6%" class="bold">平负</td>
                    <td width="6%" class="bold">负胜</td>
                    <td width="6%" class="bold">负平</td>
                    <td width="6%" class="bold">负负</td>

                    <td width="10%" class="bold">胜</td>
                    <td width="10%" class="bold">平</td>
                    <td width="10%" class="bold">负</td>
                    <td width="10%" class="bold"></td>
                  </tr>
                  <tr>
                    <td><input type="text" disabled data-input-key="jzPValue" value=${ele.jzPValue > 0 ? "+" + ele.jzPValue : ele.jzPValue}></td>
                    <td><input type="number" data-input-key="jzHhRate" value=${ele.jzHhRate||''}></td>
                    <td><input type="number" data-input-key="jzHdRate" value=${ele.jzHdRate||''}></td>
                    <td><input type="number" data-input-key="jzHaRate" value=${ele.jzHaRate||''}></td>
                    <td><input type="number" data-input-key="jzDhRate" value=${ele.jzDhRate||''}></td>
                    <td><input type="number" data-input-key="jzDdRate" value=${ele.jzDdRate||''}></td>
                    <td><input type="number" data-input-key="jzDaRate" value=${ele.jzDaRate||''}></td>
                    <td><input type="number" data-input-key="jzAhRate" value=${ele.jzAhRate||''}></td>
                    <td><input type="number" data-input-key="jzAdRate" value=${ele.jzAdRate||''}></td>
                    <td><input type="number" data-input-key="jzAaRate" value=${ele.jzAaRate||''}></td>

                    <td><input type="number" data-input-key="hgWRate" value=${ele.hgWRate||''}></td>
                    <td>
                      <input type=${ele.hgPDisplay===''?'number':'text'}" ${ele.hgPDisplay===''?'':'disabled'} data-input-key="hgPValue" data-input-res=${ele.hgPDisplay===''?ele.hgDRate:ele.hgPValue} value="${ele.hgPDisplay===''?ele.hgDRate:ele.hgPDisplay}">
                      <input type="number" class="hide" disabled data-input-key="hgDRate" value=${ele.hgDRate}>
                    </td>
                    <td>
                      <output>${hgLRateFormat01}</output>
                      <input type="number" class="${hgLRateFormat01&&'small'}" data-input-key="hgLRate" value=${hgLRateFormat02||''}>
                    </td>
                    <td>
                      <input type="number" data-output-key="totalBenefitPoint" disabled value=${ele.totalBenefitPoint||''}>
                    </td>
                  </tr>
                  <tr>
                    <td class="hide-text"></td>
                    <td class="bold">
                      <input type="number" data-output-key="jzHhPayAmount" disabled value=${ele.jzHhPayAmount>0? ele.jzHhPayAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzHdPayAmount" disabled value=${ele.jzHdPayAmount>0? ele.jzHdPayAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzHaPayAmount" disabled value=${ele.jzHaPayAmount>0? ele.jzHaPayAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzDhPayAmount" disabled value=${ele.jzDhPayAmount>0? ele.jzDhPayAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzDdPayAmount" disabled value=${ele.jzDdPayAmount>0? ele.jzDdPayAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzDaPayAmount" disabled value=${ele.jzDaPayAmount>0? ele.jzDaPayAmount : ''}>
                    </td>
                    <!-- 之前lose 没有output 
                    <td class="bold">
                      <input type="number" data-output-key="jzAhPayAmount" disabled value=${ele.jzAhPayAmount>0? ele.jzAhPayAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzAdPayAmount" disabled value=${ele.jzAdPayAmount>0? ele.jzAdPayAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzAaPayAmount" disabled value=${ele.jzAaPayAmount>0? ele.jzAaPayAmount : ''}>
                    </td>
                    -->
                    <td class="bold">
                      <input type="number" disabled value=${ele.jzAhPayAmount>0? ele.jzAhPayAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" disabled value=${ele.jzAdPayAmount>0? ele.jzAdPayAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" disabled value=${ele.jzAaPayAmount>0? ele.jzAaPayAmount : ''}>
                    </td>
                    
                    <td class="bold">
                      <input type="number" data-output-key="hgWPayAmount" disabled value=${ele.hgWPayAmount>0? ele.hgWPayAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="hgDPayAmount" disabled value=${ele.hgDPayAmount>0? ele.hgDPayAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="hgLPayAmount" disabled value=${ele.hgLPayAmount>0? ele.hgLPayAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="totalBenefitAmount" disabled value=${ele.totalBenefitAmount!=0? ele.totalBenefitAmount : ''}>
                    </td>
                  </tr>
                  <tr>
                    <td class="hide-text"></td>
                    <td class="bold">
                      <input type="number" data-output-key="jzHhBenefitAmount" disabled value=${ele.jzHhBenefitAmount>0? ele.jzHhBenefitAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzHdBenefitAmount" disabled value=${ele.jzHdBenefitAmount>0? ele.jzHdBenefitAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzHaBenefitAmount" disabled value=${ele.jzHaBenefitAmount>0? ele.jzHaBenefitAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzDhBenefitAmount" disabled value=${ele.jzDhBenefitAmount>0? ele.jzDhBenefitAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzDdBenefitAmount" disabled value=${ele.jzDdBenefitAmount>0? ele.jzDdBenefitAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzDaBenefitAmount" disabled value=${ele.jzDaBenefitAmount>0? ele.jzDaBenefitAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzAhBenefitAmount" disabled value=${ele.jzAhBenefitAmount>0? ele.jzAhBenefitAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzAdBenefitAmount" disabled value=${ele.jzAdBenefitAmount>0? ele.jzAdBenefitAmount : ''}>
                    </td>
                    <td class="bold">
                      <input type="number" data-output-key="jzAaBenefitAmount" disabled value=${ele.jzAaBenefitAmount>0? ele.jzAaBenefitAmount : ''}>
                    </td>
                    
                    <td class="bold">
                    </td>
                    <td class="bold">
                    </td>
                    <td class="bold">
                    </td>
                    <td class="bold">
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          `;
        }
      } else if(w.flag_dialogEnsure == -1){ // 修改密码
        dom_dialogHeader.innerText = '修改密码：';
        nodeStr = w.getNodeStr_changePW();
      }

      dom_dialogContent.innerHTML = nodeStr;
      w.isJzPayAsTotal_calc = true; // 投注分配
      bindSwitchPayAsTotal_calc(); // 绑定切换投注分配_calc
    }

    function clearDialogContent(){
      w.dialogCallback = null; // 执行完置空
      w.dom_dialog.classList.remove('show');
      dom_dialogContent.innerHTML  = '';
      w.flag_dialogEnsure = 0;
      w.dialogData = null;
    }

    /* 方法：绑定投注分配 calc switch */
    function bindSwitchPayAsTotal_calc() {
      const s_isJzPayAsTotal_calc = d.querySelector('#s_isJzPayAsTotal_calc');
      s_isJzPayAsTotal_calc.addEventListener('click', function (e) {
        w.isJzPayAsTotal_calc = !w.isJzPayAsTotal_calc;
        d.querySelector('#s_ensureDialog').click();
        if (isJzPayAsTotal_calc) {
          this.classList.add('active');
        } else {
          this.classList.remove('active');
        }
      })
    }
  }
)(window, document);



