(
  function (w, d) {
    Object.assign(w, echarts, {...w.config}, {
      flagServerPath: 1, // api server: 0-本地，-1-跨域，1-服务器
      filterDefault: {
        fromDateDaily: null,
        toDateDaily: null,
        fromDateWeekly: null,
        toDateWeekly: null,
        fromDateMonthly: null,
        toDateMonthly: null,
        fromDateYearly: null,
        toDateYearly: null,
      },
      now: new Date,
      optionList: [], // chat option list
      isFullFresh: false, 
      dom_full: null, // 点击的放大按钮
      dom_dialog: d.querySelector('#s_dialog'), // mes box
      dom_dialogContent: d.querySelector('#s_dialogContent'), // mes box
    });

    initFilterDefault(); // 初始化筛选默认数据
    getData(w.filterDefault);
    bindClickFilter() // 点击筛选
    bindShowFull() // 显示放大按钮
    bindClickFull() // 点击放大按钮
    bindCancleDialog(); // 弹窗-取消dialog

    /* 方法：获取数据 */
    function getData(params, filterIndex) {
      getAllData(params, filterIndex);
    }

    /* 方法：init filter params */
    function initFilterDefault() {
      const fromDateDaily = getcurDate(w.now);
      const toDateDaily = getcurDate(w.now);
      w.filterDefault = {
        fromDateDaily: '2023-01-01',
        toDateDaily,
        fromDateWeekly: null,
        toDateWeekly: null,
        fromDateMonthly: null,
        toDateMonthly: null,
        fromDateYearly: null,
        toDateYearly: null,
      };
      initFilterDom();
    }

    /* 方法：init filter input */
    function initFilterDom() {
      const datepickerDomList = d.querySelectorAll('.datepicker');
      datepickerDomList.forEach((ele, index) => {
        const filterType = ele.dataset['filter'];
        const dateDomList = ele.querySelectorAll('input');
        dateDomList[0].value = w.filterDefault['fromDate' + filterType];
        dateDomList[1].value = w.filterDefault['toDate' + filterType];
      });
    }

    /* 方法：获取数据 */
    function getAllData(params, filterIndex) {
      // api：get 列表数据--静态调用 _file，API 调用 _api
      if (!flagServerPath) {
        getData_file(params, filterIndex);
      } else {
        getData_api(params, filterIndex);
      }
    }

    /* 方法：api 获取数据 */
    function getData_api(params, filterIndex) {
      const api_url = w.API_URL && w.API_URL.getData;
      let data = params || {};
      ajaxPromise({
        type: 'post',
        url: api_url,
        data
      }).then(res => {
        const data = res;
        w.optionList = formatChatData(data);
        w.optionList.push(formatChatData_test(data));
        genAllChart(optionList, filterIndex);
      }).catch(err => {
        console.log("请求失败==>" + err);
        alert('请求失败，请联系管理员。');
      })
    }

    /* 方法：本地 获取数据 */
    function getData_file(params, filterIndex) {
      const api_url = w.API_URL && w.API_URL.getData;
      const url = api_url;
      setTimeout(() => {
        const data = w.mock.StatData;
        w.optionList = formatChatData(data);
        genAllChart(optionList);
      }, .5 * 1000);
    }

    /* 方法：处理图表数据 */
    function formatChatData(data) {
      const option = getChartConfig('chartSmall');
      const optionList = [];
      const {title, seriesData} = w.config.chartMap;
      const params = {
        data, option, optionList, title, seriesData,
      };
      formatChatData_col('dataDaily', params);
      formatChatData_col('dataWeekly', params);
      formatChatData_col('dataMonthly', params);
      formatChatData_col('dataYearly', params);
      return optionList;
    }

    /* 方法：处理图表列 */
    function formatChatData_col(statPeriod, {data, option, optionList, title, seriesData}) {
      seriesData.forEach((ele, index) => {
        let stat = {
          title: {
            text: title[index],
            textStyle: {
              fontSize: 13,
              color: '#666'
            }
          },
          legend: {
            data: [],
            show: false
          },
          xAxis: {
            ...option.xAxis,
            data: data[statPeriod].xarr
          },
          series: []
        };
        const series = [];

        ele.forEach((ele_in) => {
          const legend = w.config.chartMap.legend[ele_in];
          stat.legend.data.push(legend);
          series.push({
            name: legend,
            type: 'line',
            data: data[statPeriod][ele_in]
          });
        });
        stat.series = series;
        const stat_option = Object.assign({}, option, stat);
        optionList.push(stat_option);
      });
    }

    /* 方法：处理表格数据 test */
    function formatChatData_test(data) {
      const option = getChartConfig('chartSmall');
      const optionList = [];
      const {title, seriesData} = w.config.chartMap;
      const params = {
        data: data.topRateSummary, 
        option, optionList, title, seriesData,
      };
      formatChatData_test1('topRateSummary', params);
      return optionList;
    }
  
    /* 方法：处理图表 test */
    function formatChatData_test1(statPeriod, {data, option, optionList, title, seriesData}) {
      debugger
      seriesData.forEach((ele, index) => {
        let stat = {
          title: {
            text:  'ML',
            textStyle: {
              fontSize: 13,
              color: '#666'
            }
          },
          legend: {
            data: [],
            show: false
          },
          xAxis: {
            ...option.xAxis,
            data: data.rateMl
          },
          series: []
        };
        const series = [];
  
        ele.forEach((ele_in) => {
          const legend = w.config.chartMap.legend[ele_in];
          stat.legend.data.push(legend);
          series.push({
            name: legend,
            type: 'line',
            data: data[statPeriod][ele_in]
          });
        });
        stat.series = series;
        const stat_option = Object.assign({}, option, stat);
        optionList.push(stat_option);
      });
    }

    /* 方法：获取图表配置 */
    function getChartConfig(type) {
      return w.config[type];
    }

    /* 方法：生成全部图表 */
    function genAllChart(dataList, filterIndex) {
      const dom_chartList = d.querySelectorAll('.s-container');
      dom_chartList.forEach((ele, index) => {
        if(index < 16){
          if(filterIndex == null || filterIndex == undefined || (index >= filterIndex * 4 && index < filterIndex * 4 + 4)){
            let data;
            data = dataList[index];
            chartObj = genChart(ele, data, index);
          }
        }else if(index == 16){
          let data;
          data = dataList[0];
          const bigOption = getChartConfig('chartBig');
          Object.assign(data, bigOption);
          chartObj = genChart(ele, data, index);
        }
      });
    }

    /* 方法：生成一个图表 */
    function genChart(chartDom, option, index) {
      chartDom.innerHTML = '';
      const div = d.createElement('div');
      chartDom.appendChild(div);
      const  chartObject = w.echarts.init(div);
      option && chartObject.setOption(option);
    }

    /* 方法：点击筛选 */
    function bindClickFilter(params) {
      const filterBtnList = d.querySelectorAll('.s-filter');
      const datepickerList = d.querySelectorAll('.datepicker');
      const statTypeList = d.querySelectorAll('.competitionType');
      filterBtnList.forEach((ele, index) => {
        ele.addEventListener('click', function () {
          const dateList = datepickerList[index].querySelectorAll('input');
          const params = {};
          const type = ele.dataset['filter'];
          params['fromDate' + type] = dateList[0].value;
          params['toDate' + type] = dateList[1].value;
          const flag_filter = validDate(statTypeList[index].innerText, params['fromDate' + type], params['toDate' + type]);
          if(!flag_filter) return;

          getData(params, index);
        });
      });
    }

    /* 方法：验证日期 */
    function validDate(statTpye, startTime, endTime){
      const nowYear = w.now.getYear() + 1900;
      if(!startTime || startTime == '' || startTime == null){
        alert(statTpye + `：请正确填写 开始时间(格式：${nowYear}-01-01）。`);
        return false;
      }

      if(!endTime || endTime == '' || endTime == null){
        alert(statTpye + `：请正确填写 结束时间(格式：${nowYear}-01-01）。`);
        return false;
      }

      const startTimeT = new Date(startTime).getTime();
      const endTimeT = new Date(endTime).getTime();
      if(endTimeT - startTimeT <= 0){
        alert(statTpye + `：结束时间 不能早于 开始时间。`);
        return false;
      } else{
        return true;
      }
    }

    /* 方法：绑定点击某个全屏展示按钮 */
    function bindShowFull() {
      const containerList = d.querySelectorAll('.bot>div.block');
      containerList.forEach((ele, index) => {
        w.index = index;
        ele.addEventListener('mouseover', mouseOverBlock);
        ele.addEventListener('mouseout', function () {
          w.dom_full.classList.remove('show');
        });
      });
    } 

    /* 方法：鼠标移入block */
    function mouseOverBlock() {
      w.dom_full = this.querySelector('.s-full');
      w.dom_full.classList.add('show');
    }

    /* 方法：绑定点击某个全屏展示按钮 */
    function bindClickFull() {
      const dom_fullList = d.querySelectorAll('.s-full');
      dom_fullList.forEach((ele, index) => {
        ele.addEventListener('click', function (e) {
          const option = optionList[index];
          this.classList.toggle('active');
          dom_dialog.classList.add('show');
          const headerText = this.dataset['header'];
          initDialogContent(option, headerText);
          d.querySelector('html').classList.add('no-scroll');
          d.querySelector('body').classList.add('no-scroll');
        })
      });
    } 

    /* 方法：dialog 取消 */  
    function bindCancleDialog() {
      d.querySelector('#s_cancelDialog').addEventListener('click',function (e) {
        clearDialogContent();
        pageScroll(true);
      })
    }
  
    function initDialogContent(option, headerText) {
      const dom_dialogHeader = dom_dialog.querySelector('.header');
      dom_dialogHeader.innerText = headerText;
      const bigOption = getChartConfig('chartBig');
      Object.assign(option, bigOption);
      option.legend.show = true;
      genChart(dom_dialogContent, option);
    }

    function clearDialogContent(){
      w.dom_dialog.classList.remove('show');
      dom_dialogContent.innerHTML  = '';
      w.flag_dialogEnsure = 0;
    }

    // date
    function getcurDate(dateObject) {
      const year = dateObject.getFullYear();
      const month = (dateObject.getMonth() + 1).toString().padStart(2,'0');
      const date = (dateObject.getDate()).toString().padStart(2,'0');
      
      const curDate = year +'-' + month +'-' + date;
      return curDate;
    }
  }
)(window, document);