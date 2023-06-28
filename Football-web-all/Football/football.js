(
  function (w, d) {
    Object.assign(w, {...w.config}, {
      flagServerPath: 0, // api server: 0-本地，-1-跨域，1-服务器
      tableNode_index: d.querySelector('#s_table_index'), // 列表的 table
      tableNode_ttg: d.querySelector('#s_table_ttg'), // 列表的 table
      s_bet: d.querySelector('#s_bet'), // bet
      response: {}, // API返回值
      listData_index: [], // 数据
      listData_ttg: [], // 数据
      clock: null, // 自动刷新定时器
      isFirstTimeInitBet: true, // 第一次进来界面才会initBet
      getFlag_filters: null, // 过滤条件
      filter_ensureNode: d.querySelector('#s_filter').querySelector('button'),
      audio_alert: new Audio(w.ALERT_AUDIO_URL || ''), // 音频对象
      alertTimes: { // 需要报警的次数
        warning: 0,
        danger: 0
      }, 
      isPlayAudio: false, // 是否播放音频
      filterWithoutAudio: false, // bet 切换触发音频播放
      showTabName: 'index',// 是否为首页
      mesNode: d.querySelector('#s_mes'), // mes box
      mesContentNode: d.querySelector('#s_mesContent'), // mes content
      mesCallback: null, // mes 的回调函数
      isShowAllBet: true, // 是否显示所有已投注比赛
      hideBetList: [], // 已投注的比赛列表
      dialogNode: d.querySelector('#s_dialog'), // mes box
      dialogContentNode: d.querySelector('#s_dialogContent'), // mes box
      dialogData: null, // dialog 的数据
      dragBox: { // 拖拽元素的位置
        node: null,
        left: 0,
        top: 0
      },
    });

    defineServerPath(w.location.host); // 定义当前 server 环境
    getData();
    initBetConst();
    bindBet(betAction);
    bindFilter(filterAction);
    bindSwitchAudio();
    bindTabs();
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

    /* 方法：初始化 table */
    function initTable({ nodeStr_index = '', nodeStr_ttg = '' }) {
      tableNode_index.innerHTML = '';
      tableNode_ttg.innerHTML = '';
      tableNode_index.innerHTML = nodeStr_index;
      tableNode_ttg.innerHTML = nodeStr_ttg;
      bindIsBet(); // 绑定每个已投注
      bindCalculator(); // 绑定每个calculator
    }

    /* 方法：生成 list 字符串 */
    function generateListStr(listData_index = [], listData_ttg = [], getFlag_filters) {
      let nodeStr_index = '';
      let nodeStr_ttg = '';
      const no_data = `
        <p class="no-data">No Data.</p>
      `;
      const alert_times_index = {
        warning: 0,
        danger: 0
      };
      const alert_times_ttg = {
        warning: 0,
        danger: 0
      };

      const s_hightBenefitPoint = s_bet.querySelector('#s_hightBenefitPoint');
      const s_middleBenefitPoint = s_bet.querySelector('#s_middleBenefitPoint');
      const hightBenefitPoint = s_hightBenefitPoint.nowValue || s_hightBenefitPoint.value;
      const middleBenefitPoint = s_middleBenefitPoint.nowValue || s_middleBenefitPoint.value;
      listData_index.forEach((ele, index) => {
        // 本剧游戏是否投注
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
    
          nodeStr_index += `
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
                    <th width="44%" colspan="4">
                      <span>${ele.jzRateType}</span>
                    </th>
                    <th width="40%" colspan="3">
                      <span>${ele.hgRateType}</span>
                    </th>
                    <th width="16%" colspan="1">利润</th>
                  </tr>
                  <tr>
                    <td class="trend ${tdClass_jzPValue}" width="5%">${ele.jzPValue > 0 ? "+" + ele.jzPValue : ele.jzPValue}</td>
                    <td class="trend ${ele.changeJzWRate&&(ele.changeJzWRate>0?'trend-up':'trend-down')} ${ele.jzWHighlight?'red':''}" width="10%">${ele.jzWRate}</td>
                    <td class="trend ${ele.changeJzDRate&&(ele.changeJzDRate>0?'trend-up':'trend-down')} ${ele.jzDHighlight?'red':''}" width="10%">${ele.jzDRate}</td>
                    <td class="trend ${ele.changeJzLRate&&(ele.changeJzLRate>0?'trend-down':'trend-up')} ${ele.jzLHighlight?'red':''}" width="10%">${ele.jzLRate}</td>
                    <td class="trend ${ele.changeHgWRate&&(ele.changeHgWRate>0?'trend-up':'trend-down')} ${ele.hgWHighlight?'red':''}" width="10%">${ele.hgWRate}</td>
                    <td class="trend ${ele.changeHgDRate&&(ele.changeHgDRate>0?'trend-up':'trend-down')} ${ele.hgDHighlight?'red':''}" width="18%">${ele.hgPDisplay == ''? ele.hgDRate : ele.hgPDisplay}</td>
                    <td class="trend ${ele.changeHgLRate&&(ele.changeHgLRate>0?'trend-up':'trend-down')} ${ele.hgLHighlight?'red':''}" width="18%">${ele.hgLRate}</td>
                    <td class="${tdClass_totalBenefitPoint}">${ele.totalBenefitPoint||''}</td>
                  </tr>
                  <tr>
                    <td class="hide"></td>
                    <td class="bold">${ele.jzWPayAmount>0? ele.jzWPayAmount : ''}</td>
                    <td class="bold">${ele.jzDPayAmount>0? ele.jzDPayAmount : ''}</td>
                    <td class="bold">${ele.jzLPayAmount>0? ele.jzLPayAmount : ''}</td>
                    <td class="bold">${ele.hgWPayAmount>0? ele.hgWPayAmount : ''}</td>
                    <td class="bold">${ele.hgDPayAmount>0? ele.hgDPayAmount : ''}</td>
                    <td class="bold">${ele.hgLPayAmount>0? ele.hgLPayAmount : ''}</td>
                    <td class="bold">${ele.totalBenefitAmount!=0? ele.totalBenefitAmount : ''}</td>
                  </tr>
                </table>
              </div>
            </div>
          `;
        }
      })
      listData_ttg.forEach((ele, index) => {
        // 本剧游戏是否投注
        // -1: 未投注
        // 1: 已投注
        ele.isBet =  w.hideBetList.includes(ele.calcId)? 1 : -1;
        const filterCondition_hasFilter = !getFlag_filters || (getFlag_filters && getFlag_filters(ele));
        const filterCondition_isBet = !w.isShowAllBet && ele.isBet === 1;
        const filterCondition = filterCondition_hasFilter && !filterCondition_isBet;
        // 过滤
        if(filterCondition){
          let tdClass_totalBenefitPoint = '';
          // 需要判断 空 或者 0 吗
          if(ele.totalBenefitPoint > Number(hightBenefitPoint)){ // 报警利润
            tdClass_totalBenefitPoint = 'tips red flash';
            ele.isBet === -1 && alert_times_ttg.danger++;
          } else if(ele.totalBenefitPoint > Number(middleBenefitPoint)){ // 跟踪利润
            tdClass_totalBenefitPoint = 'tips yellow';
            ele.isBet === -1 && alert_times_ttg.warning++;
          }
          
          nodeStr_ttg += `
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
                  <button class="primary small s-calculator-ttg" data-index=${index}>计算</button>
                </div>
                <div class="is-bet">
                  已投注：
                  <div class="s-is-bet-ttg switch ${ele.isBet===1?'active': ''}" data-index=${index} data-calc-id=${ele.calcId}>
                    <div class="switch-handle"></div>
                  </div>
                </div>
              </div>
              <div class="bot">
                <table>
                  <tr class="head">
                    <th width="44%" colspan="5">
                      <span>${ele.jzRateType}</span>
                    </th>
                    <th width="40%" colspan="3">
                      <span>${ele.hgRateType}</span>
                    </th>
                    <th width="16%" colspan="1">利润</th>
                  </tr>
                  <tr>
                    <td class="bold" width="8%">进球数</td>
                    <td width="10%">0球</td>
                    <td width="10%">1球</td>
                    <td width="10%">2球</td>
                    <td width="10%">3球</td>
                    <td width="12%">大球</td>
                    <td width="12%">盘口</td>
                    <td width="12%">小球</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="bold">赔  率</td>
                    <td class="${ele.jzS0Highlight?'red':''}">${ele.jzS0Rate}</td>
                    <td class="${ele.jzS1Highlight?'red':''}">${ele.jzS1Rate}</td>
                    <td class="${ele.jzS2Highlight?'red':''}">${ele.jzS2Rate}</td>
                    <td class="${ele.jzS3Highlight?'red':''}">${ele.jzS3Rate}</td>
                    <td class="trend ${ele.changeHgWRate&&(ele.changeHgWRate>0?'trend-up':'trend-down')} ${ele.hgWHighlight?'red':''}">${ele.hgWRate}</td>
                    <td class="${''}">${ele.hgPDisplay == ''? ele.hgPValue : ele.hgPDisplay}</td>
                    <td class="trend ${ele.changeHgLRate&&(ele.changeHgLRate>0?'trend-up':'trend-down')} ${ele.hgLHighlight?'red':''}">${ele.hgLRate}</td>
                    <td class="${tdClass_totalBenefitPoint}">${ele.totalBenefitPoint||''}</td>
                  </tr>
                  <tr>
                    <td class="bold">投  注</td>
                    <td class="bold">${ele.jzS0PayAmount>0? ele.jzS0PayAmount:''}</td>
                    <td class="bold">${ele.jzS1PayAmount>0? ele.jzS1PayAmount:''}</td>
                    <td class="bold">${ele.jzS2PayAmount>0? ele.jzS2PayAmount:''}</td>
                    <td class="bold">${ele.jzS3PayAmount>0? ele.jzS3PayAmount:''}</td>
                    <td class="bold">${ele.hgWPayAmount>0? ele.hgWPayAmount:''}</td>
                    <td class="bold"></td>
                    <td class="bold"></td>
                    <td class="bold">${ele.totalBenefitAmount!=0? ele.totalBenefitAmount : ''}</td>
                  </tr>
                  <tr>
                  <td class="bold">中  奖</td>
                    <td class="gray trend ${ele.changeJzS0Rate&&(ele.changeJzS0Rate>0?'trend-up':'trend-down')}">${ele.jzS0BenefitAmount > 0 ? ele.jzS0BenefitAmount : ''}</td>
                    <td class="gray trend ${ele.changeJzS1Rate&&(ele.changeJzS1Rate>0?'trend-up':'trend-down')}">${ele.jzS1BenefitAmount > 0 ? ele.jzS1BenefitAmount : ''}</td>
                    <td class="gray trend ${ele.changeJzS2Rate&&(ele.changeJzS2Rate>0?'trend-up':'trend-down')}">${ele.jzS2BenefitAmount > 0 ? ele.jzS2BenefitAmount : ''}</td>
                    <td class="gray trend ${ele.changeJzS3Rate&&(ele.changeJzS3Rate>0?'trend-up':'trend-down')}">${ele.jzS3BenefitAmount > 0 ? ele.jzS3BenefitAmount : ''}</td>
                    <td class="gray">${ele.hgWBenefitAmount > 0 ? ele.hgWBenefitAmount : ''}</td>
                    <td class="gray"></td>
                    <td class="gray"></td>
                    <td class="gray"></td>
                  </tr>
                </table>
              </div>
            </div>
          `;
        }

      })
      w.alertTimes = {
        warning: alert_times_index.warning + alert_times_ttg.warning,
        danger: alert_times_index.danger + alert_times_ttg.danger,
      }

      const s_tabs = d.querySelector('#s_tabsBox');
      const s_lis = s_tabs.querySelectorAll('li');
      s_lis[0].classList.remove('tips','red','yellow');
      s_lis[1].classList.remove('tips','red','yellow');

      if(alert_times_index.danger > 0){
        s_lis[0].classList.add('tips','red');
      } else if(alert_times_index.warning > 0){
        s_lis[0].classList.add('tips','yellow');
      }
      if(alert_times_ttg.danger > 0){
        s_lis[1].classList.add('tips','red');
      } else if(alert_times_ttg.warning > 0){
        s_lis[1].classList.add('tips','yellow');
      }
      if(!w.filterWithoutAudio && w.isPlayAudio && w.alertTimes.danger){
        audioPlay(); // 播放音频
      }
      w.filterWithoutAudio = false; // 判断音频是否播放完成，分离 isBet
      return {
        nodeStr_index: nodeStr_index.length?nodeStr_index:no_data,
        nodeStr_ttg: nodeStr_ttg.length?nodeStr_ttg:no_data
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
      const s_bet_ensure = s_bet.querySelector('button');

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
      w.filter_ensureNode.addEventListener('click', (e) => {
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
      const nodeStrList = generateListStr(listData_index, listData_ttg, (ele) => {
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

    /* 方法：api 获取数据 */
    function getData_api(bet_params) {
      // api：get 列表数据
      let data = bet_params && {
        jzPayAmount: bet_params.jzPayAmount,
        jzRebatePoint: bet_params.jzRebatePoint,
        hgERebatePoint: bet_params.hgERebatePoint,
        hgARebatePoint: bet_params.hgARebatePoint,
        needFresh: bet_params.needFresh || false
      } || {
        jzPayAmount: '',
        jzRebatePoint: '',
        hgERebatePoint: '',
        hgARebatePoint: '',
        needFresh: false,
      };

      // 请求之前先停止 audio
      audioClose();
      const api_url = w.API_URL && w.API_URL.getData;

      ajaxPromise({
        type: 'post',
        url: getCurrentUrl() + api_url,
        data
      }).then(res => {
        w.response = res;
        w.listData_index = res.data;
        w.listData_ttg = res.ttgData;
        w.filter_ensureNode.click();
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
        needFresh: bet_params.needFresh || false
      } || {
        jzPayAmount: '',
        jzRebatePoint: '',
        hgERebatePoint: '',
        hgARebatePoint: '',
        needFresh: false,
      };
      // 请求之前先停止 audio
      audioClose();
      const url_getData = w.API_URL && w.API_URL.getData;

      setTimeout(() => {
        w.response = w.mock.res;
        w.listData_index = w.mock.res.data;
        w.listData_ttg = w.mock.res.ttgData;
        w.filter_ensureNode.click();
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
      w.mesNode.classList.add('show');
      w.mesContentNode.innerText = '是否开启预警提醒？';
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

    /* 方法：获取当前网址信息 */
    function getCurrentUrl() {
      let origin = '';
      if(w.server.cors && !w.location.host){
        origin = w.server.path;
      } else {
        origin = w.location.origin;
      }
      return origin + '/';
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
        w.filter_ensureNode.click();
      })  
    } 

    /* 方法：绑定单个已投注 */
    function bindIsBet() {
      const s_isBet_list_index = d.querySelectorAll('.s-is-bet-index');
      const s_isBet_list_ttg = d.querySelectorAll('.s-is-bet-ttg');
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
            w.filter_ensureNode.click();
          });
        })
      })

      s_isBet_list_ttg.forEach((ele) => {
        ele.addEventListener('click', function (e) {
          const index = this.dataset['index'];
          const calcId = this.dataset['calcId'];
          listData_ttg[index].isBet  = listData_ttg[index].isBet * -1;
          this.classList.toggle('active');  // 放在 callback 外面有动画过渡
          changeBlockBetStatus({ // 修改比赛投注状态
            optType: listData_ttg[index].isBet,
            hiddenCalcIds: [calcId]
          }, () => {
            w.filter_ensureNode.click();
            w.filterWithoutAudio = true;
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
        url: getCurrentUrl() + api_url,
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
      const s_calculator_list_ttg = d.querySelectorAll('.s-calculator-ttg');
      let showObj = {};
      s_calculator_list_index.forEach((ele) => {
        ele.addEventListener('click', function (e) {
          this.classList.toggle('active');
          const index = this.dataset['index'];
          showObj = listData_index[index];
          dialogNode.classList.add('show');
          initDialogContent(showObj);
          d.querySelector('html').classList.add('no-scroll');
          d.querySelector('body').classList.add('no-scroll');
        })
      })

      s_calculator_list_ttg.forEach((ele) => {
        ele.addEventListener('click', function (e) {
          this.classList.toggle('active');
          const index = this.dataset['index'];
          showObj = listData_ttg[index];
          dialogNode.classList.add('show');
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

      const api_url = w.API_URL && w.API_URL.calculator;

      ajaxPromise({
        type: 'post',
        url: getCurrentUrl() + api_url,
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

      const api_url = w.API_URL && w.API_URL.calculator;

      setTimeout(() => {
        console.log("api 请求成功==>");
        callback_calculator(w.mock.CalculatorData, outputNodeList);
      }, .5 * 1000);
    }

    /* 方法：获取 dialog 数据用于计算请求 */
    function getDialogDataForCalculator() {
      const inputNodeList = dialogContentNode.querySelectorAll('input[data-input-key]');      
      const outputNodeList = dialogContentNode.querySelectorAll('input[data-output-key]');
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
            rateD: inputValueList.jzDRate,
            rateL: inputValueList.jzLRate,
            rateW: inputValueList.jzWRate
          }
        } else{ // 让球
          console.log('让球')
          res_params.userCalcReq.jzRate = {
            hasJzDate: false,
            hasJzRDate: true,
            point: Number(inputValueList.jzPValue) + '', // 去掉 + 号
            rateRD: inputValueList.jzDRate,
            rateRL: inputValueList.jzLRate,
            rateRW: inputValueList.jzWRate,
          }
        }
      } else if(showTabName === 'ttg'){
        res_params.userCalcReq = {
          crownBSRate: {
            point: inputValueList.hgPValue, // hgPValue
            rateBig: inputValueList.hgWRate,
            rateSmall: inputValueList.hgLRate
          },
          jzBSRate: {
            s0: inputValueList.jzS0Rate,
            s1: inputValueList.jzS1Rate,
            s2: inputValueList.jzS2Rate,
            s3: inputValueList.jzS3Rate,
          }
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
      const inputNodeList = dialogContentNode.querySelectorAll('input[data-input-key]');      
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
        keyList['jzWPayAmount'].value = ele.jzWPayAmount>0? ele.jzWPayAmount : '';
        keyList['jzDPayAmount'].value = ele.jzDPayAmount>0? ele.jzDPayAmount : '';
        keyList['hgWPayAmount'].value = ele.hgWPayAmount>0? ele.hgWPayAmount : '';
        keyList['hgDPayAmount'].value = ele.hgDPayAmount>0? ele.hgDPayAmount : '';
        keyList['hgLPayAmount'].value = ele.hgLPayAmount>0? ele.hgLPayAmount : '';
        keyList['totalBenefitAmount'].value = ele.totalBenefitAmount!=0? ele.totalBenefitAmount : '';
      } else if(w.showTabName === 'ttg'){
        const ele = res.ttgData[0];
        keyList['totalBenefitPoint'].value = ele.totalBenefitPoint;
        keyList['jzS0PayAmount'].value = ele.jzS0PayAmount>0? ele.jzS0PayAmount : '';
        keyList['jzS1PayAmount'].value = ele.jzS1PayAmount>0? ele.jzS1PayAmount : '';
        keyList['jzS2PayAmount'].value = ele.jzS2PayAmount>0? ele.jzS2PayAmount : '';
        keyList['jzS3PayAmount'].value = ele.jzS3PayAmount>0? ele.jzS3PayAmount : '';
        keyList['hgWPayAmount'].value = ele.hgWPayAmount>0? ele.hgWPayAmount : '';
        keyList['totalBenefitAmount'].value = ele.totalBenefitAmount!=0? ele.totalBenefitAmount : '';
        keyList['jzS0BenefitAmount'].value = ele.jzS0BenefitAmount>0? ele.jzS0BenefitAmount : '';
        keyList['jzS1BenefitAmount'].value = ele.jzS1BenefitAmount>0? ele.jzS1BenefitAmount : '';
        keyList['jzS2BenefitAmount'].value = ele.jzS2BenefitAmount>0? ele.jzS2BenefitAmount : '';
        keyList['hgWBenefitAmount'].value = ele.hgWBenefitAmount>0? ele.hgWBenefitAmount : '';
      }
    }
    /* 方法：强制刷新数据 */  
    function bindForceRefresh() {
      d.querySelector('#s_forceRefresh').addEventListener('click',function (e) {
        w.mesNode.classList.add('show');
        w.mesContentNode.innerText = '确定强制刷新后台数据吗？';
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
        w.mesNode.classList.remove('show');
        pageScroll(true);
      })
    }

    /* 方法：message 确定 */  
    function bindEnsureMes() {
      d.querySelector('#s_ensureMes').addEventListener('click',function (e) {
        w.mesNode.classList.remove('show');
        w.mesCallback();
        w.mesCallback = null; // 执行完置空
        pageScroll(true);
      })
    }

    /* 方法：dialog 取消 */  
    function bindCancleDialog() {
      d.querySelector('#s_cancelDialog').addEventListener('click',function (e) {
        w.dialogNode.classList.remove('show');
        dialogContentNode.innerHTML = '';
        w.dialogData = null;
        pageScroll(true);
      })
    }

    /* 方法：dialog 确定 */  
    function bindEnsureDialog() {
      d.querySelector('#s_ensureDialog').addEventListener('click',function (e) {
        const invaildInputObj = validCalculatorInput();
        if(invaildInputObj.length){
          alert('请输入投注金额！');
          return;
        };
        const {res_params, outputNodeList} = getDialogDataForCalculator();
        getCalculator(res_params, outputNodeList);
      })
    }

    function initDialogContent(obj) {
      dialogContentNode.innerHTML = '';
      const ele = w.dialogData = Object.assign({}, obj);
      let nodeStr = '';
      if(showTabName === 'index'){
        let hgLRateFormat02 = ele.hgLRate.trim(),hgLRateFormat01 = '';
        if(hgLRateFormat02.includes(' ')){
          hgLRateFormat01 = hgLRateFormat02.split(' ')[0];
          hgLRateFormat02 = hgLRateFormat02.split(' ')[1];
        }
        nodeStr += `
          <div>
            <label>请输入投注金额：
              <input class="big" data-input-key="jzPayAmount" type="number" value="10000"> 元
            </label>
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
                  <th width="44%" colspan="4">
                    <span>${ele.jzRateType}</span>
                  </th>
                  <th width="40%" colspan="3">
                    <span>${ele.hgRateType}</span>
                  </th>
                  <th width="20%" colspan="1">利润</th>
                </tr>
                <tr>
                  <td width="5%">
                    <input type="text" disabled data-input-key="jzPValue" value=${ele.jzPValue > 0 ? "+" + ele.jzPValue : ele.jzPValue}>
                  </td>
                  <td width="10%">
                    <input type="number" data-input-key="jzWRate" value=${ele.jzWRate||''}>
                  </td>
                  <td width="10%">
                    <input type="number" data-input-key="jzDRate" value=${ele.jzDRate||''}>
                  </td>
                  <td width="10%">
                    <input type="number" data-input-key="jzLRate" value=${ele.jzLRate||''}>
                  </td>
                  <td width="10%">
                    <input type="number" data-input-key="hgWRate" value=${ele.hgWRate||''}>
                  </td>
                  <td width="18%">
                    <input type=${ele.hgPDisplay===''?'number':'text'}" ${ele.hgPDisplay===''?'':'disabled'} data-input-key="hgPValue" data-input-res=${ele.hgPDisplay===''?ele.hgDRate:ele.hgPValue} value="${ele.hgPDisplay===''?ele.hgDRate:ele.hgPDisplay}">
                    <input type="number" class="hide" disabled data-input-key="hgDRate" value=${ele.hgDRate}>
                  </td>
                  <td width="18%">
                    <output>${hgLRateFormat01}</output>
                    <input type="number" class="${hgLRateFormat01&&'small'}" data-input-key="hgLRate" value=${hgLRateFormat02||''}>
                  </td>
                  <td>
                    <input type="number" data-output-key="totalBenefitPoint" disabled value=${ele.totalBenefitPoint||''}>
                  </td>
                </tr>
                <tr>
                  <td class="v-hide"></td>
                  <td class="bold">
                    <input type="number" data-output-key="jzWPayAmount" disabled value=${ele.jzWPayAmount>0? ele.jzWPayAmount : ''}>
                  </td>
                  <td class="bold">
                    <input type="number" data-output-key="jzDPayAmount" disabled value=${ele.jzDPayAmount>0? ele.jzDPayAmount : ''}>
                  </td>
                  <td class="bold">
                    <input type="number" disabled value=${ele.jzLPayAmount>0? ele.jzLPayAmount : ''}>
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
              </table>
            </div>
          </div>
        `;
      } else if(showTabName === 'ttg'){
        nodeStr += `
          <div>
            <label>请输入投注金额：<input class="big" data-input-key="jzPayAmount" type="number" value="10000"> 元</label>
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
                  <th width="44%" colspan="5">
                    <span>${ele.jzRateType}</span>
                  </th>
                  <th width="40%" colspan="3">
                    <span>${ele.hgRateType}</span>
                  </th>
                  <th width="16%" colspan="1">利润</th>
                </tr>
                <tr>
                  <td class="bold" width="8%">进球数</td>
                  <td width="10%">0球</td>
                  <td width="10%">1球</td>
                  <td width="10%">2球</td>
                  <td width="10%">3球</td>
                  <td width="12%">大球</td>
                  <td width="12%">盘口</td>
                  <td width="12%">小球</td>
                  <td></td>
                </tr>
                <tr>
                  <td class="bold">赔  率</td>
                  <td>
                    <input type="number" data-input-key="jzS0Rate" value=${ele.jzS0Rate||''}>
                  </td>
                  <td>
                    <input type="number" data-input-key="jzS1Rate" value=${ele.jzS1Rate||''}>
                  </td>
                  <td>
                    <input type="number" data-input-key="jzS2Rate" value=${ele.jzS2Rate||''}>
                  </td>
                  <td>
                    <input type="number" data-input-key="jzS3Rate" value=${ele.jzS3Rate||''}>
                  </td>
                  <td>
                    <input type="number" data-input-key="hgWRate" value=${ele.hgWRate||''}>
                  </td>
                  <td>
                    <input type="number" data-input-key="hgPValue" data-input-res=${ele.hgPValue} disabled value=${ele.hgPDisplay == ''? ele.hgPValue : ele.hgPDisplay}>
                  </td>
                  <td>
                    <input type="number" data-input-key="hgLRate" value=${ele.hgLRate||''}>
                  </td>
                  <td>
                    <input type="number" data-output-key="totalBenefitPoint" disabled value=${ele.totalBenefitPoint||''}>
                  </td>
                </tr>
                <tr>
                  <td class="bold">投  注</td>
                  <td class="bold">
                    <input type="number" data-output-key="jzS0PayAmount" disabled value=${ele.jzS0PayAmount>0? ele.jzS0PayAmount:''}>
                  </td>
                  <td class="bold">
                    <input type="number" data-output-key="jzS1PayAmount" disabled value=${ele.jzS1PayAmount>0? ele.jzS1PayAmount:''}>
                  </td>
                  <td class="bold">
                    <input type="number" data-output-key="jzS2PayAmount" disabled value=${ele.jzS2PayAmount>0? ele.jzS2PayAmount:''}>
                  </td>
                  <td class="bold">
                    <input type="number" data-output-key="jzS3PayAmount" disabled value=${ele.jzS3PayAmount>0? ele.jzS3PayAmount:''}>
                  </td>
                  <td class="bold">
                    <input type="number" data-output-key="hgWPayAmount" disabled value=${ele.hgWPayAmount>0? ele.hgWPayAmount:''}>
                  </td>
                  <td class="bold"></td>
                  <td class="bold"></td>
                  <td class="bold">
                    <input type="number" data-output-key="totalBenefitAmount" disabled value=${ele.totalBenefitAmount!=0? ele.totalBenefitAmount : ''}>
                  </td>
                </tr>
                <tr>
                  <td class="bold">中  奖</td>
                  <td class="gray">
                    <input type="number" data-output-key="jzS0BenefitAmount" disabled value=${ele.jzS0BenefitAmount > 0 ? ele.jzS0BenefitAmount : ''}>
                  </td>
                  <td class="gray">
                    <input type="number" data-output-key="jzS1BenefitAmount" disabled value=${ele.jzS1BenefitAmount > 0 ? ele.jzS1BenefitAmount : ''}>
                  </td>
                  <td class="gray">
                    <input type="number" data-output-key="jzS2BenefitAmount" disabled value=${ele.jzS2BenefitAmount > 0 ? ele.jzS2BenefitAmount : ''}>
                  </td>
                  <td class="gray">
                    <input type="number" data-output-key="jzS3BenefitAmount" disabled value=${ele.jzS3BenefitAmount > 0 ? ele.jzS3BenefitAmount : ''}>
                  </td>
                  <td class="gray">
                    <input type="text" data-output-key="hgWBenefitAmount" disabled value=${ele.hgWBenefitAmount > 0 ? ele.hgWBenefitAmount : ''}>
                  </td>
                  <td class="gray"></td>
                  <td class="gray"></td>
                  <td class="gray"></td>
                </tr>
              </table>
            </div>
          </div>
        `;
      }

      dialogContentNode.innerHTML = nodeStr;
    }

    /* 方法：页面是否可以滚动 */
    function pageScroll(flag = true) {
      if(flag){
        d.querySelector('html').classList.remove('no-scroll');
        d.querySelector('body').classList.remove('no-scroll');
        resetDrag(); // 页面可以滚动时候reset
      } else{
        d.querySelector('html').classList.add('no-scroll');
        d.querySelector('body').classList.add('no-scroll');
      }
    }

    /* 方法：拖拽 */
    function bindDragBox() {
      const dragList = d.querySelectorAll('.s-drag'); 
      dragList.forEach((ele) => {
        const box = ele.querySelector('.s-box');
        const title = ele.querySelector('.header-box');
        const titleBg = title.style.backgroundColor;
        const dragW = d.body.clientWidth;
        const dragH = d.body.clientHeight;

        let boxStartX = 0;
        let boxStartY = 0;

        title.style.cursor = 'move';
        // 开始拖拽
        title.addEventListener('mousedown', function (e) {
          const boxW = box.offsetWidth;
          w.dragBox = {
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
          d.addEventListener('mousemove', move)
          d.addEventListener('mouseup', function () {
            d.removeEventListener('mousemove',move);
            title.style.background = titleBg;
            d.body.classList.remove('no-select');
          })

          function move(e) {
            title.style.background = '#fafafa';
            d.body.classList.add('no-select');
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
      w.dragBox.node && (w.dragBox.node.style.left = w.dragBox.left + 'px');
      w.dragBox.node && (w.dragBox.node.style.top = w.dragBox.top + 'px');
    }
  }
)(window, document);



