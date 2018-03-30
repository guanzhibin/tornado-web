var mg = function() {
	var _self = this;
	var timeout = 500;

	//获取页面参数
	this.GetParams = function(param) {
		var uri = location.search.substr(1); //获取url "?"后的字符串
		var ret = [];
		var arr = [];
		var uriArr = uri.split("&");
		var reg = new RegExp("(" + param + ")(\\[\\])?=(.*)");
		for(var i = 0; i < uriArr.length; i++) {
			arr = uriArr[i].match(reg);
			if(arr != null) {
				if(arr[2] == undefined) {
					ret = decodeURI(arr[3]);
					break;
				} else {
					ret.push(decodeURI(arr[3]));
				}
			}
		}
		return ret;
	}
	//显示toast提示
	this.ShowToast = function(type, statusInfo) {
		toastr.options = {
			"closeButton": true,
			"debug": false,
			"positionClass": "toast-bottom-right",
			"showDuration": "300",
			"hideDuration": "2000",
			"timeOut": "3000",
			"extendedTimeOut": "1000",
			"showEasing": "swing",
			"hideEasing": "linear",
			"showMethod": "fadeIn",
			"hideMethod": "fadeOut"
		};
		if(type == "success") {
			toastr.success(statusInfo);
		} else if(type == "warning") {
			toastr.warning(statusInfo);
		}else if(type=='info'){
			toastr.info(statusInfo);
		} 
		else {
			toastr.error(statusInfo);
		}

	}
	//表格获取失败
	var tableRequestError = function() {
		hideLoading();
		$("#tip").html("服务器出错！");
		$("#tipModal").modal("show");
	}
	codenum = 1;
	//判断返回码
	var responseCodeFun = function(data) {
		// 30004操作失败
		if(data.code == 30004) {
			_self.ShowToast('error','操作失败');
		}else if (data.code==30005){
			//  30005没有操作的权限
			_self.ShowToast('error',data.msg);
		}
	}
	//表格加载成功
	function onLoadSuccess(data) {
		responseCodeFun(data);
	}
	//验证token有效性
	var tokenValidity = function(data) {
		try {
			// data = $.parseJSON(data);
			responseCodeFun(data);
		} catch(e) {
			hideLoading();
			$("#tip").html("数据出错！");
			$("#tipModal").modal("show");
		}
		return data;
	}
	this.AjaxPostData = function(url, data, callback, pagename) {
		$.ajax({
			type: "post",
			url: url,
			data: data,
			success: function(data) {
				callback(tokenValidity(data));
			},
			error: function() {
				if(pagename == '/login/') {
					setTimeout(function() {
						$("#aaa").addClass('hidden');
						$(".content").removeClass('hidden');
					}, 1000);
				} else {
					hideLoading();
					$("#tip").html("服务器出错！");
					$("#tipModal").modal("show");
				}

			}
		});
	}
	this.AjaxPostDataSync = function(url, data, callback, pagename) {
		$.ajax({
			type: "post",
			url: url,
			async: false,
			data: data,
			success: function(data) {
				callback(tokenValidity(data));
			},
			error: function() {
				if(pagename == '/login/') {
					setTimeout(function() {
						$("#aaa").addClass('hidden');
						$(".content").removeClass('hidden');
					}, 1000);
				} else {
					hideLoading();
					$("#tip").html("服务器出错！");
					$("#tipModal").modal("show");
				}

			}
		});
	}
	this.AjaxGetData = function(url, data, callback) {
		$.ajax({
			type: "get",
			url: url,
			data: data,
			success: function(data) {
				callback(tokenValidity(data));
			},
			error: function() {
				hideLoading();
				$("#tip").html("服务器出错！");
				$("#tipModal").modal("show");
			}
		});
	}
	this.AjaxGetDataSync = function(url, data, callback) {
		$.ajax({
			type: "get",
			url: url,
			data: data,
			async: false,
			success: function(data) {
				callback(tokenValidity(data));
			},
			error: function() {
				hideLoading();
				$("#tip").html("服务器出错！");
				$("#tipModal").modal("show");
			}
		});
	}
	//运行页面的函数
	this.RunPage = function(pagename, href,params) {
		$("input").onlyNumAlpha();
		initModal();
		if(pagename != 'PageIndex' && pagename != 'PageLogin' && pagename != 'PageApplication' && pagename != 'PageApplicationSuccess' && pagename != 'PageExamcode' && pagename != 'PageBuildStatus' && pagename != 'PageFindPassword') {
			initLoading();
			initMenuBar(pagename, href);
			setLogoutClickEvent();
			userToken = getUserToken();
			if(userToken == null || userToken == "") {

			}
		} else {

		}
		eval("this." + pagename + "()");
	}


	//删除数组指定元素
	function removeByValue(arr, val) {
		for(var i = 0; i < arr.length; i++) {
			if(arr[i] == val) {
				arr.splice(i, 1);
				break;
			}
		}
	}


	
	//过滤特殊字符
	$.fn.onlyNumAlpha = function() {
		$(this).keypress(function(e) {
			var keynum;
			if(window.event) // IE 
			{
				keynum = e.keyCode
			} else if(e.which) // Netscape/Firefox/Opera 
			{
				keynum = e.which
			}
			if(keynum == 32) {
				return false;
			}
			return true;
		}).focus(function() {
		}).bind("paste", function() {
			var clipboard = window.clipboardData.getData("Text");
			if(/^\s*$/.test(clipboard))
				return true;
			else
				return false;
		});
	};

	function getQueryString(name) { 
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
		var r = window.location.search.substr(1).match(reg); 
		if (r != null) return unescape(r[2]); return null; 
	}
	

	//登录页面/login/
	this.PageLogin = function() {
		var param = htmlspecialchars(_self.GetParams('action'));
		var login = $("#login");
		$("#username").onlyNumAlpha();
		$("#password").onlyNumAlpha();
		$("#examcodenum").onlyNumAlpha();
		/*回车键事件*/
		function enterEventListener() {
			if(event.keyCode == 13) {
				event.cancelBubble = true;
				event.returnValue = false;
				login.click();
			}
		}
		$("input[type='text']").keypress(function(e) {
			enterEventListener();
		});
		$("input[type='password']").keypress(function(e) {
			enterEventListener();
		});

		$("#login_form").validate({
			rules: {
				username: "required",
				password: "required",
			},
			messages: {
				username: "请输入登录名",
				password: "请输入密码",
			},
			errorPlacement: function(error, element) {
				error.appendTo(element.parent().parent());
			},
			success: function(label) {

			},
			submitHandler: function() {
				var postdata = {};
				postdata["login_name"] = $("#username").val();
				postdata["password"] = $("#password").val();
				// }
				_self.AjaxPostData('/login/login', postdata, function(data) {
					if(data.code == 0) {
						if(data.code==0){
							window.location.href = '/data/'
							
						}else if(data.code==1){
							_self.ShowToast('error', data.msg);
						}
					} else {
						if (data.code==1){
							_self.ShowToast('error', data.msg);
						}else if(data.code == 30001) {
							$(".examcodediv").removeClass('hidden');
						} else if(data.code == 30003) {
							if($("#tip_label").hasClass('hidden')) {
								$("#tip_label").removeClass('hidden');
							}
						} else if(data.code == 30013) {
							$("#tip").html("用户被禁止！");
							$("#tipModal").modal("show");
							setTimeout(function() {
								$("#tipModal").modal("hide");
								window.location.href = "/login/";
							}, 2000);
						} else if(data.code == 30014) {
							if($("#examcodenumerror").hasClass('hidden')) {
								$("#examcodenumerror").removeClass('hidden');
								alert(888)
							}
						} else {

						}
						setTimeout(function() {
							$("#aaa").addClass('hidden');
							$(".content").removeClass('hidden');
						}, 1000);

					}
				}, '/login/');
				return false; //阻止表单提交
			}
		});
	}
	//设置侧边菜单栏的样式
	var sidebarStatus = function(itemTag, subItemUrl) {
		getParentItem = false;
		var lilist = $("#sidebar li");
		for(var i = 0; i < lilist.length; i++) {
			listitem = lilist[i];
			listitem = $(listitem);
			var aData = listitem.attr("aData");
			if(aData == itemTag) {
				getParentItem = true;
				listitem.children('a').addClass('active');
				listitem.children('a').children('.right-icon').attr('class', 'right-icon glyphicon glyphicon-chevron-down pull-right');
			} else if(getParentItem && typeof(aData) == 'undefined') {
				var listitema = listitem.children('a').first();
				if(listitema.attr("href") == subItemUrl) {
					listitema.addClass('active');
				}
				listitem.css('display', 'block');
			} else if(typeof(aData) != 'undefined' && getParentItem) {
				break;
			}
		}
	}

	function start_time(ymd){
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			// disabledHours: false,
			showTodayButton : true,
			viewDate : ymd + ' 00:00:00'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
	}

	function end_time(ymd){
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 23:59:59'
		});
	}

	function screen(){
		var checkdata = [];
		var dsk = [{
			"text": "游戏服务器",
			"href": '',
			"nodes": []
		}];
		
		_self.AjaxGetData('/server/getserver', {

		}, function(data) {
			if(data.code == 0) {
				isLoadedTree = true;
				if(isLoadedTree) {
					hideLoading();
				}
				checkdata = data.rows;
				for(var i = 0; i < checkdata.length; i++) {

					var node = {
						"text": htmlspecialchars(checkdata[i]['name']),
						'href': htmlspecialchars(checkdata[i]['name']),
						'id': htmlspecialchars(checkdata[i]['id']),
						's_uid': htmlspecialchars(checkdata[i]['uid'])
					};
					node["nodes"] = [];
					dsk[0].nodes.push(node);
				}
				ServerData = dsk;
				$searchableTree = $('#treeview-checkable').treeview({
					data: ServerData,
					levels: 1,
					showCheckbox: true,
					showIcon: false,
					emptyIcon: '',
					nodeIcon: '',
					onNodeChecked: function(even, node) {
						checkNodes(node);
						checkParents(node);
					},
					onNodeUnchecked: function(even, node) {
						uncheckParents(node);
						uncheckNodes(node);
					},
					onNodeSelected: function(even, node) {

					},
					onNodeUnselected: function(even, node) {

					}

				});
			}
		});

		function checkNodes(node) {
			if(typeof(node.nodes) != "undefined") {
				for(var i = 0; i < node.nodes.length; i++) {
					$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
						silent: true
					}]);
					checkNodes(node.nodes[i]);
				}

			}
			checkParents(node);
		}

		function uncheckNodes(node) {
			if(typeof(node.nodes) != "undefined") {
				for(var i = 0; i < node.nodes.length; i++) {
					$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
						silent: true
					}]);
					uncheckNodes(node.nodes[i]);
				}
			}
		}

		function uncheckParents(node) {
			var parentNode = $('#treeview-checkable').treeview('getParent', node);
			if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
				var ischeck = false;
				for(var i = 0; i < parentNode.nodes.length; i++) {
					cNodes = parentNode.nodes[i];
					if(cNodes.state.checked) {
						ischeck = true;
						break;
					}
				}
				if(!ischeck) {
					$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
						silent: true
					}]);
					uncheckParents(parentNode);
				}

			}
		}

		function checkParents(node) {

			var parentNode = $('#treeview-checkable').treeview('getParent', node);

			if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
				if(typeof(parentNode.nodes) != "undefined") {

					$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
						silent: true
					}]);
					checkParents(parentNode);
				}
			}
		}

		function checkCrNodes() {
			var crNodeIds = [""];
			var checkdata = $('#treeview-checkable').treeview("getUnselected");

			for(var j = 0; j < crNodeIds.length; j++) {
				for(var i = 0; i < checkdata.length; i++) {
					if(checkdata[i].href == crNodeIds[j]) {
						var node = checkdata[i];
						$('#treeview-checkable').treeview('checkNode', [node, {
							silent: true
						}]);

						checkNodes(node);
						checkParents(node);
						break;
					}
				}
			}

		}
	}

	function power_func(){
		var string_test = '';
		var checked = $('#treeview-checkable').treeview('getChecked', 0);
		$.each(checked, function(index, obj) {
			if (obj.s_uid){
				if (string_test==''){
					string_test += obj.s_uid
				}else{
					string_test +=','+ obj.s_uid
				}
			}
		});
		return (string_test)
	}
	function screen2(){
		var checkdata = [];
		var dsk = [{
			"text": "游戏渠道",
			"href": '',
			"nodes": []
		}];
		
		_self.AjaxGetData('/server/getchannel', {

		}, function(data) {
			if(data.code == 0) {
				isLoadedTree = true;
				if(isLoadedTree) {
					hideLoading();
				}
				checkdata = data.rows;
				for(var i = 0; i < checkdata.length; i++) {

					var node = {
						"text": htmlspecialchars(checkdata[i]['name']),
						'href': htmlspecialchars(checkdata[i]['name']),
						'id': htmlspecialchars(checkdata[i]['id']),
						's_uid': htmlspecialchars(checkdata[i]['uid'])
					};
					node["nodes"] = [];
					dsk[0].nodes.push(node);
				}
				ServerData = dsk;
				$searchableTree = $('#treeview-checkable2').treeview({
					data: ServerData,
					levels: 1,
					showCheckbox: true,
					showIcon: false,
					emptyIcon: '',
					nodeIcon: '',
					onNodeChecked: function(even, node) {
						checkNodes(node);
						checkParents(node);
					},
					onNodeUnchecked: function(even, node) {
						uncheckParents(node);
						uncheckNodes(node);
					},
					onNodeSelected: function(even, node) {

					},
					onNodeUnselected: function(even, node) {

					}

				});
			}
		});

		function checkNodes(node) {
			if(typeof(node.nodes) != "undefined") {
				for(var i = 0; i < node.nodes.length; i++) {
					$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
						silent: true
					}]);
					checkNodes(node.nodes[i]);
				}

			}
			checkParents(node);
		}

		function uncheckNodes(node) {
			if(typeof(node.nodes) != "undefined") {
				for(var i = 0; i < node.nodes.length; i++) {
					$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
						silent: true
					}]);
					uncheckNodes(node.nodes[i]);
				}
			}
		}

		function uncheckParents(node) {
			var parentNode = $('#treeview-checkable2').treeview('getParent', node);
			if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
				var ischeck = false;
				for(var i = 0; i < parentNode.nodes.length; i++) {
					cNodes = parentNode.nodes[i];
					if(cNodes.state.checked) {
						ischeck = true;
						break;
					}
				}
				if(!ischeck) {
					$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
						silent: true
					}]);
					uncheckParents(parentNode);
				}

			}
		}

		function checkParents(node) {

			var parentNode = $('#treeview-checkable2').treeview('getParent', node);

			if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
				if(typeof(parentNode.nodes) != "undefined") {

					$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
						silent: true
					}]);
					checkParents(parentNode);
				}
			}
		}

		function checkCrNodes() {
			var crNodeIds = [""];
			var checkdata = $('#treeview-checkable2').treeview("getUnselected");

			for(var j = 0; j < crNodeIds.length; j++) {
				for(var i = 0; i < checkdata.length; i++) {
					if(checkdata[i].href == crNodeIds[j]) {
						var node = checkdata[i];
						$('#treeview-checkable2').treeview('checkNode', [node, {
							silent: true
						}]);

						checkNodes(node);
						checkParents(node);
						break;
					}
				}
			}

		}
	}

	function power_func2(){
		var string_test = '';
		var checked = $('#treeview-checkable2').treeview('getChecked', 0);
		$.each(checked, function(index, obj) {
			if (obj.href){
				if (string_test==''){
					string_test += obj.href
				}else{
					string_test +=','+ obj.href
				}
			}
		});
		return (string_test)
	}
	//分服日报
	this.PageDataSearch = function() {
		sidebarStatus('comp_st', '/data/');
		var power_list = '';
		channel_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		start_time(ymd)
		end_time(ymd)

		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});	
		screen()
		screen2()
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			params['channel_list'] = channel_list;
			return params;
		}


		$table.bootstrapTable({
			url: '/data/get_data_by_condition',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			striped : true,
			showColumns: true,
			columns: [{
				field: 'd_date',
				title: ' 日期',
				sortable: true, //是否可排序
                order: "desc", //默认排序方式
                titleTooltip: "选择的日期",
                align: 'center',
			}, {
				field: 'server',
				title: '服务器',
				titleTooltip: "选择的当前服务器",
			}, {
				field: 'channel',
				title: '渠道',
				titleTooltip: "当前选择的渠道",
			}, {
				field: 'new_login_accont',
				title: '新登账号数',
				titleTooltip: "当天，新注册并登陆游戏的去重账号数",
			}, {
				field: 'login_account',
				title: '登录账号',
				titleTooltip: "当天，登陆游戏并且去重的账号数",
			}, {
				field: 'pay_account_num',
				title: '付费账号数',
				titleTooltip: "当天，付费账号数",
			}, {
				field: 'atm_num',
				title: '总充值次数',
				titleTooltip: "当天，总充值次数",
			}, {
				field: 'income',
				title: '收入',
				titleTooltip: '当天，付费的总金额',
			}, {
				field: 'first_pay_account',
				title: '首次付费账号',
				titleTooltip: '当天，付费账号数且本账号第一次进行付费的账号',
			}, {
				field: 'first_pay_account_income',
				title: '首次付费收入',
				titleTooltip: '当天，付费账号数且本账号第一次进行付费的账号总充值金额',
			}, {
				field: 'new_login_pay_num',
				title: '新登付费数',
				titleTooltip: '当日，新登且付费账号数',
			}, {
				field: 'new_login_pay_income',
				title: '新登账号收入',
				titleTooltip: '当天，新登账号的充值总金额',
			}, {
				field: 'pay_ARPU',
				title: '付费ARPU',
				titleTooltip: '当日收入/当日付费账号数',
			}, {
				field: 'DAU_ARPU',
				title: 'DAU ARPU',
				titleTooltip: '当日收入/当日登陆账号数',
			}, {
				field: 'account_pay_rate',
				title: '账号付费率',
				titleTooltip: '当日付费玩家数/当日登陆账号数',
			}, {
				field: 'new_account_pay_rate',
				title: '新增账号付费率',
				titleTooltip: '当日新增付费账号数/当日新增账号数',
			}, {
				field: 'new_pay_ARPU',
				title: '新登用户ARPU',
				titleTooltip: '当日新增账号收入/当日新增付费账号数',
			}, {
				field: 'new_DAU_ARPU',
				title: '新登用户ARPPU',
				titleTooltip: '当日新增账号收入/当日新增账号数',
			}, {
				field: 'two_d_rate',
				title: '次日存留',
				titleTooltip: '当日新增在第2日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'th_d_rate',
				title: '3日存留',
				titleTooltip: '当日新增在第3日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'four_retain',
				title: '4日存留',
				titleTooltip: '当日新增在第4日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'five_retain',
				title: '5日存留',
				titleTooltip: '当日新增在第5日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'six_retain',
				title: '6日存留',
				titleTooltip: '当日新增在第6日仍然登陆的账号/当日新增账号数',
			}, {
				field: 's_d_rate',
				title: '7日存留',
				titleTooltip: '当日新增在第7日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'fifteen_retain',
				title: '15日存留',
				titleTooltip: '当日新增在第15日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'thirty_retain',
				title: '30日存留',
				titleTooltip: '当日新增在第30日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'forty_five_retain',
				title: '45日存留',
				titleTooltip: '当日新增在第45日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'sixty_retain',
				title: '60日存留',
				titleTooltip: '当日新增在第60日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'seventy_five_retain',
				title: '75日存留',
				titleTooltip: '当日新增在第75日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'ninety_retain',
				title: '90日存留',
				titleTooltip: '当日新增在第90日仍然登陆的账号/当日新增账号数',
			}
			// , {
			// 	field: 'avg_online',
			// 	title: '平均在线人数',
			// 	titleTooltip: '当日按24小时平均的同时在线玩家数',
			// }, {
			// 	field: 'highest_online',
			// 	title: '最高在线人数',
			// 	titleTooltip: '当日按24小时最高的同时在线玩家数',
			// }
			],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}
					if (data.total>0){
						$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day =-1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day)+ '23:59:59');
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func();
			channel_list = power_func2();
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/data/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list + '&channel_list='+channel_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2();
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func();
			channel_list = power_func2();
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});


		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			console.log(11)
			$("#removeModal2").modal('hide');
		});
	}

	//日报
	this.DailyPageDataSearch = function() {
		sidebarStatus('comp_st', '/data/dailydata');
		var power_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		start_time(ymd)
		end_time(ymd)

		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});

		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		screen()
		function power_func(){
			var string_test = '';
			var checked = $('#treeview-checkable').treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if (string_test==''){
						string_test += obj.s_uid
					}else{
						string_test +=','+ obj.s_uid
					}
				}
			});
			return (string_test)
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			return params;
		}


		$table.bootstrapTable({
			url: '/data/get_daily_data',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			striped : true,
			showColumns: true,
			columns: [{
				field: 'd_date',
				title: ' 日期',
				sortable: true, //是否可排序
                order: "desc", //默认排序方式
                titleTooltip: "选择的日期",
                align: 'center',
			}, {
				field: 'server',
				title: '服务器',
				titleTooltip: "选择的当前服务器",
			}, {
				field: 'new_login_accont',
				title: '新登账号数',
				titleTooltip: "当天，新注册并登陆游戏的去重账号数",
			}, {
				field: 'login_account',
				title: '登录账号',
				titleTooltip: "当天，登陆游戏并且去重的账号数",
			}, {
				field: 'pay_account_num',
				title: '付费账号数',
				titleTooltip: "当天，付费账号数",
			}, {
				field: 'atm_num',
				title: '总的充值次数',
				titleTooltip: '当天，总的充值次数',
			}, {
				field: 'income',
				title: '收入',
				titleTooltip: '当天，付费的总金额',
			}, {
				field: 'first_pay_account',
				title: '首次付费账号',
				titleTooltip: '当天，付费账号数且本账号第一次进行付费的账号',
			}, {
				field: 'first_pay_account_income',
				title: '首次付费收入',
				titleTooltip: '当天，付费账号数且本账号第一次进行付费的账号总充值金额',
			}, {
				field: 'new_login_pay_num',
				title: '新登付费数',
				titleTooltip: '当日，新登且付费账号数',
			}, {
				field: 'new_login_pay_income',
				title: '新登账号收入',
				titleTooltip: '当天，新登账号的充值总金额',
			}, {
				field: 'pay_ARPU',
				title: '付费ARPU',
				titleTooltip: '当日收入/当日付费账号数',
			}, {
				field: 'DAU_ARPU',
				title: 'DAU ARPU',
				titleTooltip: '当日收入/当日登陆账号数',
			}, {
				field: 'account_pay_rate',
				title: '账号付费率',
				titleTooltip: '当日付费玩家数/当日登陆账号数',
			}, {
				field: 'new_account_pay_rate',
				title: '新增账号付费率',
				titleTooltip: '当日新增付费账号数/当日新增账号数',
			}, {
				field: 'new_pay_ARPU',
				title: '新登用户ARPU',
				titleTooltip: '当日新登收入/当日新登付费账号数',
			}, {
				field: 'new_DAU_ARPU',
				title: '新登用户ARPPU',
				titleTooltip: '当日新登收入/当日新登账号数',
			}, {
				field: 'two_d_rate',
				title: '次日存留',
				titleTooltip: '当日新增在第2日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'th_d_rate',
				title: '3日存留',
				titleTooltip: '当日新增在第3日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'fr_d_rate',
				title: '4日存留',
				titleTooltip: '当日新增在第4日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'fv_d_rate',
				title: '5日存留',
				titleTooltip: '当日新增在第5日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'sx_d_rate',
				title: '6日存留',
				titleTooltip: '当日新增在第6日仍然登陆的账号/当日新增账号数',
			}, {
				field: 's_d_rate',
				title: '7日存留',
				titleTooltip: '当日新增在第7日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'fifteen_retain',
				title: '15日存留',
				titleTooltip: '当日新增在第15日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'thirty_retain',
				title: '30日存留',
				titleTooltip: '当日新增在第30日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'sixty_retain',
				title: '60日存留',
				titleTooltip: '当日新增在第60日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'ninety_retain',
				title: '90日存留',
				titleTooltip: '当日新增在第90日仍然登陆的账号/当日新增账号数',
			}
			],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}
					if (data.total>0){
						$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day =-1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day)+ '23:59:59');
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func();
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/data/serverexport?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2();
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func();
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});


		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}


	//关卡皇冠完成度
	this.MedalPageDataSearch = function() {
		console.log(111)
		sidebarStatus('story_related', '/story/');
		var power_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD',
			viewDate: ymd
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD',
			viewDate: ymd
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});

		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		screen()
		function power_func(){
			var string_test = '';
			var checked = $('#treeview-checkable').treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if (string_test==''){
						string_test += obj.s_uid
					}else{
						string_test +=','+ obj.s_uid
					}
				}
			});
			return (string_test)
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			params['isonece'] = $("#isone").val();
			return params;
		}


		$table.bootstrapTable({
			url: '/story/getmedal',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			striped : true,
			showColumns: true,
			columns: [{
				field: 'd_date',
				title: ' 日期',
				sortable: true, //是否可排序
                order: "desc", //默认排序方式
                titleTooltip: "选择的日期",
                align: 'center',
			}, {
				field: 'server',
				title: '服务器',
				titleTooltip: "选择的当前服务器",
			}, {
				field: 'event_id',
				title: '关卡id',
				titleTooltip: "故事关卡所在的id",
			}, {
				field: 'name',
				title: '关卡名称',
				titleTooltip: "故事关卡的名称",
			}, {
				field: 'total_num',
				title: '关卡通关人数',
				titleTooltip: "当前类型通关的总人数",
			}, {
				field: 'zero_medal',
				title: '0皇冠人数',
				titleTooltip: "通关时获得0皇冠的人数",
			}, {
				field: 'one_medal',
				title: '1皇冠人数',
				titleTooltip: "通关时获得1皇冠的人数",
			}
			, {
				field: 'two_medal',
				title: '2皇冠人数',
				titleTooltip: "通关时获得2皇冠的人数",
			}, {
				field: 'three_medal',
				title: '3皇冠人数',
				titleTooltip: "通关时获得3皇冠的人数",
			}, {
				field: 'zero_medal_rate',
				title: '0皇冠占比',
				titleTooltip: "通关时获得0皇冠的人数/当前类型通关的总人数",
			}, {
				field: 'one_medal_rate',
				title: '1皇冠人数',
				titleTooltip: "通关时获得1皇冠的人数/当前类型通关的总人数",
			}, {
				field: 'two_medal_rate',
				title: '2皇冠人数',
				titleTooltip: "通关时获得2皇冠的人数/当前类型通关的总人数",
			}, {
				field: 'three_medal_rate',
				title: '3皇冠人数',
				titleTooltip: "通关时获得3皇冠的人数/当前类型通关的总人数",
			}, {
				field: 'sweepnum',
				title: '扫荡总次数',
				titleTooltip: "当前类型关卡被扫荡的总次数",
			}
			],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}

				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day =-1
			}
			$("#start_time").val(GetDateStr(days));
			$("#end_time").val(GetDateStr(end_day));
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var onece = $('#isone').val();
			var data = $('.no-records-found').val();
			power_list = power_func();
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/story/medalexport?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list+ '&isonece='+onece

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2();
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func();
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});


		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}



	//关卡通关时长
	this.CheckPointPageDataSearch = function() {
		sidebarStatus('story_related', '/story/checkpoint');
		var power_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD',
			viewDate: ymd
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD',
			viewDate: ymd
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});

		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		screen()
		function power_func(){
			var string_test = '';
			var checked = $('#treeview-checkable').treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if (string_test==''){
						string_test += obj.s_uid
					}else{
						string_test +=','+ obj.s_uid
					}
				}
			});
			return (string_test)
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			params['isonece'] = $("#isone").val();
			return params;
		}


		$table.bootstrapTable({
			url: '/story/getcheckpoint',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			striped : true,
			showColumns: true,
			columns: [{
				field: 'd_date',
				title: ' 日期',
				sortable: true, //是否可排序
                order: "desc", //默认排序方式
                titleTooltip: "选择的日期",
                align: 'center',
			}, {
				field: 'server',
				title: '服务器',
				titleTooltip: "选择的当前服务器",
			}, {
				field: 'event_id',
				title: '关卡id',
				titleTooltip: "故事关卡所在的id",
			}, {
				field: 'name',
				title: '关卡名称',
				titleTooltip: "故事关卡的名称",
			}, {
				field: 'pid',
				title: '玩家ID',
				titleTooltip: "玩家的pid",
			}, {
				field: 'finish_time',
				title: '时长(秒)',
				titleTooltip: "故事关卡通关所需的时间",
			}
			],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}

				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day =-1
			}
			$("#start_time").val(GetDateStr(days));
			$("#end_time").val(GetDateStr(end_day));
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func();
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/story/checkpointexport?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2();
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func();
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});


		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}


	//关卡通关等级
	this.CheckPointLvPageDataSearch = function() {
		sidebarStatus('story_related', '/story/checkpointlv');
		var power_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD',
			viewDate: ymd
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD',
			viewDate: ymd
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});

		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		screen()
		function power_func(){
			var string_test = '';
			var checked = $('#treeview-checkable').treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if (string_test==''){
						string_test += obj.s_uid
					}else{
						string_test +=','+ obj.s_uid
					}
				}
			});
			return (string_test)
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			params['isonece'] = $("#isone").val();
			return params;
		}


		$table.bootstrapTable({
			url: '/story/getcheckpointlv',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			striped : true,
			showColumns: true,
			columns: [{
				field: 'd_date',
				title: ' 日期',
				sortable: true, //是否可排序
                order: "desc", //默认排序方式
                titleTooltip: "选择的日期",
                align: 'center',
			}, {
				field: 'server',
				title: '服务器',
				titleTooltip: "选择的当前服务器",
			}, {
				field: 'event_id',
				title: '关卡id',
				titleTooltip: "故事关卡所在的id",
			}, {
				field: 'name',
				title: '关卡名称',
				class: 'event_name',
				titleTooltip: "故事关卡的名称",
			}, {
				field: 'total_num',
				title: '关卡通关人数',
				titleTooltip: "关卡通关人数",
			}, {
				field: '1',
				title: '1',
				class: 'player_lv',
				titleTooltip: "首通等级为1级的总玩家数",
			}, {
				field: '2',
				title: '2',
				class: 'player_lv',
				titleTooltip: "首通等级为2级的总玩家数",
			}, {
				field: '3',
				title: '3',
				class: 'player_lv',
				titleTooltip: "首通等级为3级的总玩家数",
			}, {
				field: '4',
				title: '4',
				class: 'player_lv',
				titleTooltip: "首通等级为4级的总玩家数",
			}, {
				field: '5',
				title: '5',
				class: 'player_lv',
				titleTooltip: "首通等级为5级的总玩家数",
			}, {
				field: '6',
				title: '6',
				class: 'player_lv',
				titleTooltip: "首通等级为6级的总玩家数",
			}, {
				field: '7',
				title: '7',
				class: 'player_lv',
				titleTooltip: "首通等级为7级的总玩家数",
			}, {
				field: '8',
				title: '8',
				class: 'player_lv',
				titleTooltip: "首通等级为8级的总玩家数",
			}, {
				field: '9',
				title: '9',
				class: 'player_lv',
				titleTooltip: "首通等级为9级的总玩家数",
			}, {
				field: '10',
				title: '10',
				class: 'player_lv',
				titleTooltip: "首通等级为10级的总玩家数",
			}, {
				field: '11',
				title: '11',
				class: 'player_lv',
				titleTooltip: "首通等级为11级的总玩家数",
			}, {
				field: '12',
				title: '12',
				class: 'player_lv',
				titleTooltip: "首通等级为12级的总玩家数",
			}, {
				field: '13',
				title: '13',
				class: 'player_lv',
				titleTooltip: "首通等级为13级的总玩家数",
			}, {
				field: '14',
				title: '14',
				class: 'player_lv',
				titleTooltip: "首通等级为14级的总玩家数",
			}, {
				field: '15',
				title: '15',
				class: 'player_lv',
				titleTooltip: "首通等级为15级的总玩家数",
			}, {
				field: '16',
				title: '16',
				class: 'player_lv',
				titleTooltip: "首通等级为16级的总玩家数",
			}, {
				field: '17',
				title: '17',
				class: 'player_lv',
				titleTooltip: "首通等级为17级的总玩家数",
			}, {
				field: '18',
				title: '18',
				class: 'player_lv',
				titleTooltip: "首通等级为18级的总玩家数",
			}, {
				field: '19',
				title: '19',
				class: 'player_lv',
				titleTooltip: "首通等级为19级的总玩家数",
			}, {
				field: '20',
				title: '20',
				class: 'player_lv',
				titleTooltip: "首通等级为20级的总玩家数",
			}, {
				field: '21',
				title: '21',
				class: 'player_lv',
				titleTooltip: "首通等级为21级的总玩家数",
			}, {
				field: '22',
				title: '22',
				class: 'player_lv',
				titleTooltip: "首通等级为22级的总玩家数",
			}, {
				field: '23',
				title: '23',
				class: 'player_lv',
				titleTooltip: "首通等级为23级的总玩家数",
			}, {
				field: '24',
				title: '24',
				class: 'player_lv',
				titleTooltip: "首通等级为1级的总玩家数",
			}, {
				field: '25',
				title: '25',
				class: 'player_lv',
				titleTooltip: "首通等级为1级的总玩家数",
			}, {
				field: '26',
				title: '26',
				class: 'player_lv',
				titleTooltip: "首通等级为26级的总玩家数",
			}, {
				field: '27',
				title: '27',
				class: 'player_lv',
				titleTooltip: "首通等级为27级的总玩家数",
			}, {
				field: '28',
				title: '28',
				class: 'player_lv',
				titleTooltip: "首通等级为28级的总玩家数",
			}, {
				field: '29',
				title: '29',
				class: 'player_lv',
				titleTooltip: "首通等级为29级的总玩家数",
			}, {
				field: '30',
				title: '30',
				class: 'player_lv',
				titleTooltip: "首通等级为30级的总玩家数",
			}, {
				field: '31',
				title: '31',
				class: 'player_lv',
				titleTooltip: "首通等级为31级的总玩家数",
			}, {
				field: '32',
				title: '32',
				class: 'player_lv',
				titleTooltip: "首通等级为32级的总玩家数",
			}, {
				field: '33',
				title: '33',
				class: 'player_lv',
				titleTooltip: "首通等级为33级的总玩家数",
			}, {
				field: '34',
				title: '34',
				class: 'player_lv',
				titleTooltip: "首通等级为34级的总玩家数",
			}, {
				field: '35',
				title: '35',
				class: 'player_lv',
				titleTooltip: "首通等级为35级的总玩家数",
			}, {
				field: '36',
				title: '36',
				class: 'player_lv',
				titleTooltip: "首通等级为36级的总玩家数",
			}, {
				field: '37',
				title: '37',
				class: 'player_lv',
				titleTooltip: "首通等级为37级的总玩家数",
			}, {
				field: '38',
				title: '38',
				class: 'player_lv',
				titleTooltip: "首通等级为38级的总玩家数",
			}, {
				field: '39',
				title: '39',
				class: 'player_lv',
				titleTooltip: "首通等级为39级的总玩家数",
			}, {
				field: '40',
				title: '40',
				class: 'player_lv',
				titleTooltip: "首通等级为40级的总玩家数",
			}, {
				field: '41',
				title: '41',
				class: 'player_lv',
				titleTooltip: "首通等级为41级的总玩家数",
			}, {
				field: '42',
				title: '42',
				class: 'player_lv',
				titleTooltip: "首通等级为42级的总玩家数",
			}, {
				field: '43',
				title: '43',
				class: 'player_lv',
				titleTooltip: "首通等级为43级的总玩家数",
			}, {
				field: '44',
				title: '44',
				class: 'player_lv',
				titleTooltip: "首通等级为44级的总玩家数",
			}, {
				field: '45',
				title: '45',
				class: 'player_lv',
				titleTooltip: "首通等级为45级的总玩家数",
			}, {
				field: '46',
				title: '46',
				class: 'player_lv',
				titleTooltip: "首通等级为46级的总玩家数",
			}, {
				field: '47',
				title: '47',
				class: 'player_lv',
				titleTooltip: "首通等级为47级的总玩家数",
			}, {
				field: '48',
				title: '48',
				class: 'player_lv',
				titleTooltip: "首通等级为48级的总玩家数",
			}, {
				field: '49',
				title: '49',
				class: 'player_lv',
				titleTooltip: "首通等级为1级的总玩家数",
			}, {
				field: '50',
				title: '50',
				class: 'player_lv',
				titleTooltip: "首通等级为50级的总玩家数",
			}, {
				field: '51',
				title: '51',
				class: 'player_lv',
				titleTooltip: "首通等级为51级的总玩家数",
			}, {
				field: '52',
				title: '52',
				class: 'player_lv',
				titleTooltip: "首通等级为52级的总玩家数",
			}, {
				field: '53',
				title: '53',
				class: 'player_lv',
				titleTooltip: "首通等级为53级的总玩家数",
			}, {
				field: '54',
				title: '54',
				class: 'player_lv',
				titleTooltip: "首通等级为54级的总玩家数",
			}, {
				field: '55',
				title: '55',
				class: 'player_lv',
				titleTooltip: "首通等级为55级的总玩家数",
			}, {
				field: '56',
				title: '56',
				class: 'player_lv',
				titleTooltip: "首通等级为56级的总玩家数",
			}, {
				field: '57',
				title: '57',
				class: 'player_lv',
				titleTooltip: "首通等级为57级的总玩家数",
			}, {
				field: '58',
				title: '58',
				class: 'player_lv',
				titleTooltip: "首通等级为58级的总玩家数",
			}, {
				field: '59',
				title: '59',
				class: 'player_lv',
				titleTooltip: "首通等级为59级的总玩家数",
			}, {
				field: '60',
				title: '60',
				titleTooltip: "首通等级为60级的总玩家数",
			}
			],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}

				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day =-1
			}
			$("#start_time").val(GetDateStr(days));
			$("#end_time").val(GetDateStr(end_day));
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func();
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/story/checkpointexportlv?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2();
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func();
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});


		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}


	//皮肤购买
	this.skinPageDataSearch = function() {
		sidebarStatus('data_collect', '/buyskin/');
		var power_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		start_time(ymd)
		end_time(ymd)

		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});

		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		screen()
		function power_func(){
			var string_test = '';
			var checked = $('#treeview-checkable').treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if (string_test==''){
						string_test += obj.s_uid
					}else{
						string_test +=','+ obj.s_uid
					}
				}
			});
			return (string_test)
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			return params;
		}


		$table.bootstrapTable({
			url: '/buyskin/gettotal',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			striped : true,
			showColumns: true,
			columns: [{
				field: 'skin_name',
				title: '皮肤名字',
				titleTooltip: "购买的皮肤名称",
			}, {
				field: 'sale_total',
				title: '出售数量',
				titleTooltip: "当前皮肤出售的数量",
			}, {
				field: 'num_rate',
				title: '数量占比',
				titleTooltip: "当前该皮肤出售数量占总皮肤出售的占比例（该皮肤/总皮肤）",
			}, {
				field: 'diamond_desc',
				title: '钻石的总的消耗',
				titleTooltip: "当前该皮肤总的消耗钻石",
			}, {
				field: 'diamond_rate',
				title: '消耗钻石占比',
				titleTooltip: '当前该皮肤总的消耗钻石占总皮肤消耗钻石的占比例（该皮肤总消耗的钻石/总皮肤消耗的钻石）',
			}, {
				field: 'skin_roll_desc',
				title: '总的消耗的皮肤卷',
				titleTooltip: '当前该皮肤总的消耗的皮肤卷',
			}, {
				field: 'skin_roll_rate',
				title: '消耗皮肤劵占比',
				titleTooltip: '前该皮肤总的消耗皮肤卷占总皮肤消耗皮肤卷的占比例（该皮肤总消耗的皮肤卷/总皮肤消耗的皮肤卷）',
			}, {
				field: 'piece_desc',
				title: '总的消耗的皮肤碎片',
				titleTooltip: '当前该皮肤总的消耗的皮肤碎片',
			}, {
				field: 'piece_rate',
				title: '消耗皮肤碎片占比',
				titleTooltip: '前该皮肤总的消耗皮肤碎片占总皮肤消耗皮肤碎片的占比例（该皮肤总消耗的皮肤碎片/总皮肤消耗的皮肤碎片）',
			}
			],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}
					if (data.total>0){
						$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day =-1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day)+ '23:59:59');
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func();
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/data/serverexport?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2();
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func();
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});


		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}
	//付费点分布界面
	this.PagePaySearch = function() {
		sidebarStatus('pay_recharge', '/paydistribution/');
		var $searchableTree;
		var $searchableTree2;
		var power_list = '';
		var channel_list ='';
		$(".feedback").remove();
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		// $("#end_time").on("dp.change", function(e) {
		// 	$('#start_time').data("DateTimePicker").maxDate(e.date);
		// });
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});		
		screen()
		screen2()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getchannel', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree2 = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			params['channel_list'] = channel_list;
			return params;
		}


		// 画饼状图
		function chart_draw(ele_id,json,data,title_name){
		    var echartsPie;  
			     
			    var option = {  
			            title : {  
			                text: title_name,  
			                x:'center'  
			            },  
			            tooltip : {  
			                trigger: 'item',  
			                formatter: "{b} : {c} ({d}%)"  
			            },
			            color:['#FF9869', '#87CEFA','#DA70D6','#32CD32','#6495ED','#FF69B4','#BA55D3','#CD5C5C','#FFA500','#40E0D0'],    // 选择颜色
			            legend: {  
			                // orient : 'vertical',  
			                x : 'left',  
			                y: 'bottom',
			                data:data  
			            },  
			            toolbox: {  
			                show : true,  
			                feature : {  
			                    mark : {show: true},  
			                    // dataView : {show: true, readOnly: false},  
			                    magicType : {  
			                        show: true,   
			                        type: ['pie', 'funnel'],  
			                        option: {  
			                            funnel: {  
			                                x: '25%',  
			                                width: '50%',  
			                                funnelAlign: 'left',  
			                                max: 100  
			                            }  
			                        }  
			                    },  
			                    // restore : {show: true},  
			                    saveAsImage : {show: true}  
			                }  
			            },  
			            // calculable : true,  
			            series : [  
			                {  
			                    type:'pie',  
			                    radius : '55%',//饼图的半径大小  
			                    center: ['50%', '45%'],//饼图的位置  
			                    data:json  
			                }  
			            ]  
			        };   
			      
			    echartsPie = echarts.init(document.getElementById(ele_id));  
			    $(function(){  
			        echartsPie.setOption(option);  
			          
			    });
			}
		//  接收数据的接口未做
		$table.bootstrapTable({
			url: '/paydistribution/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'pay_point',
				title: '付费点',
			}, {
				field: 'pay_num',
				title: '购买数量',
				sortable: true,
				order : 'desc'
			}, {
				field: 'amount_of_recharge',
				title: '充值金额',
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					// 加进饼状图的回调函数
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
					}else{
						$('#is_show').css('display','block')
						// 服务器获取过来的top10的数据
						if (data.pay_names.length>0){
							
						}
						chart_draw('echartsPie',data.pay_datas,data.pay_names,'购买数量TOP10');
						chart_draw('echartsPie2',data.recharge_datas,data.recharge_names,'充值金额TOP10');
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days)+  '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			channel_list = power_func2()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/paydistribution/export?start_time='+start_time+'&end_time='+end_time+'&orderby='+orderby+'&server_list='+power_list +'&channel_list=' +channel_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if (string_test==''){
						string_test += obj.s_uid
					}else{
						string_test +=','+ obj.s_uid
					}
				}
			});
			return string_test
		}
		function power_func2(){
			var string_test = '';
			var checked = $searchableTree2.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.href){
					if (string_test==''){
						string_test += obj.href
					}else{
						string_test +=','+ obj.href
					}
				}
			});
			return string_test
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}


	// LTV价值页面
	this.PageLTVSearch = function() {
		sidebarStatus('comp_st', '/ltv/');
		var $searchableTree;
		var power_list = '';
		var channel_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate: ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + " 23:59:59"
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});		
		screen()
		screen2()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getchannel', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable2').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable2').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			params['channel_list'] = channel_list
			return params;
		}

		$table.bootstrapTable({
			url: '/ltv/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'd_date',
				title: ' 日期',
				sortable : true,
				order: 'desc',
				titleTooltip : '选择的日期'
			}, {
				field: 'server',
				title: '服务器',
				titleTooltip : '选择的服务器'
			}, {
				field: 'channel',
				title: '渠道',
				titleTooltip :'选择的渠道'
			}, {
				field: 'new_account_num',
				title: '新登账号数',
				titleTooltip : '当天新登录游戏的账号数'
			}, {
				field: 'one_day_ltv',
				title: 'D1',
				titleTooltip : '1天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'two_day_ltv',
				title: 'D2',
				titleTooltip : '2天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'three_days_ltv',
				title: 'D3',
				titleTooltip : '3天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'four_day_ltv',
				title: 'D4',
				titleTooltip : '4天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'five_day_ltv',
				title: 'D5',
				titleTooltip : '5天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'six_day_ltv',
				title: 'D6',
				titleTooltip : '6天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'seven_days_ltv',
				title: 'D7',
				titleTooltip :'7天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'eight_day_ltv',
				title: 'D8',
				titleTooltip : '8天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'nine_day_ltv',
				title: 'D9',
				titleTooltip : '9天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'ten_day_ltv',
				title: 'D10',
				titleTooltip : '10天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'eleven_day_ltv',
				title: 'D11',
				titleTooltip : '11天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'twelve_day_ltv',
				title: 'D12',
				titleTooltip : '12天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'thirteen_day_ltv',
				title: 'D13',
				titleTooltip : '13天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'fourteen_day_ltv',
				title: 'D14',
				titleTooltip : '14天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'half_moon_ltv',
				title: 'D15',
				titleTooltip : '15天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'one_month_ltv',
				title: 'D30',
				titleTooltip : '30天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'forty_five_ltv',
				title: 'D45',
				titleTooltip : '45天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'sixty_ltv',
				title: 'D60',
				titleTooltip :  '60天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'seventy_five_ltv',
				title: 'D75',
				titleTooltip : '75天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'ninety_ltv',
				title: 'D90',
				titleTooltip : ' 90天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'four_month_ltv',
				title: 'D120',
				titleTooltip : ' 120天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'five_month_ltv',
				title: 'D150',
				titleTooltip : ' 150天内第一日新增账号付费总额/第一日新增账号数'
			}, {
				field: 'six_month_ltv',
				title: 'D180',
				titleTooltip : ' 180天内第一日新增账号付费总额/第一日新增账号数'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}else if (data.total==0){
						_self.ShowToast('info','没有相应的数据')
						return false;
					}
					$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			channel_list = power_func2()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/ltv/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list + '&channel_list='+ channel_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $('#treeview-checkable').treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if (string_test==''){
						string_test += obj.s_uid
					}else{
						string_test +=','+ obj.s_uid
					}
				}
			});
			return (string_test)
		}
		function power_func2(){
			var string_test = '';
			var checked = $('#treeview-checkable2').treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.href){
					if (string_test==''){
						string_test += obj.href
					}else{
						string_test +=','+ obj.href
					}
				}
			});
			return (string_test)
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}


	// 用户存留率
	this.PageRetainSearch = function() {
		sidebarStatus('retain_loss', '/accountretain/');
		var $searchableTree;
		var power_list = '';
		var channel_list =''
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate: ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});		
		screen()
		screen2()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getchannel', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree2 = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			params['channel_list'] = channel_list
			return params;
		}


		$table.bootstrapTable({
			url: '/accountretain/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'd_date',
				title: ' 日期',
				sortable : true,
				order : 'desc',
				titleTooltip : '选择的日期'
			}, {
				field: 'server',
				title: '服务器',
				titleTooltip : '选择的服务器'
			}, {
				field: 'channel',
				title: '渠道',
				titleTooltip : '选择的渠道'
			},{
				field: 'regist_account',
				title: '注册账号',
				titleTooltip : '当日创建的账号数'
			},{
				field: 'login_account',
				title: '登录账号',
				titleTooltip : '当日登录的账号数'
			},{
				field: 'new_login_accont',
				title: '新登账号数',
				titleTooltip : '当日新增账号数'
			}, {
				field: 'once_retain',
				title: '次日留存',
				titleTooltip : ' 当日新增在第2日仍然登陆的账号/当日新增账号数'
			}, {
				field: 'three_retain',
				title: '3日存留率',
				titleTooltip : ' 当日新增在第3日仍然登陆的账号/当日新增账号数'
			}, {
				field: 'four_retain',
				title: '4日存留率',
				titleTooltip : ' 当日新增在第4日仍然登陆的账号/当日新增账号数'
			}, {
				field: 'five_retain',
				title: '5日存留率',
				titleTooltip : ' 当日新增在第5日仍然登陆的账号/当日新增账号数'
			}, {
				field: 'six_retain',
				title: '6日存留率',
				titleTooltip : ' 当日新增在第6日仍然登陆的账号/当日新增账号数'
			}, {
				field: 'seven_retain',
				title: '7日存留率',
				titleTooltip : ' 当日新增在第7日仍然登陆的账号/当日新增账号数'
			}, {
				field: 'fifteen_retain',
				title: '15日存留率',
				titleTooltip : ' 当日新增在第15日仍然登陆的账号/当日新增账号数'
			}, {
				field: 'thirty_retain',
				title: '30日存留率',
				titleTooltip : ' 当日新增在第30日仍然登陆的账号/当日新增账号数'
			},{
				field: 'forty_five_retain',
				title: '45日存留率',
				titleTooltip : ' 当日新增在第45日仍然登陆的账号/当日新增账号数'
			}, {
				field: 'sixty_retain',
				title: '60日存留率',
				titleTooltip : ' 当日新增在第60日仍然登陆的账号/当日新增账号数'
			}, {
				field: 'seventy_five_retain',
				title: '75日存留率',
				titleTooltip : ' 当日新增在第75日仍然登陆的账号/当日新增账号数'
			}, {
				field: 'ninety_retain',
				title: '90日存留率',
				titleTooltip : ' 当日新增在第90日仍然登陆的账号/当日新增账号数'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}
					if (data.rows.length!=0){
						$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			channel_list = power_func2()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/accountretain/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list+'&channel_list=' + channel_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $('#treeview-checkable').treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if (string_test==''){
						string_test += obj.s_uid
					}else{
						string_test +=','+ obj.s_uid
					}
				}
			});
			return (string_test)
		}
		function power_func2(){
			var string_test = '';
			var checked = $('#treeview-checkable2').treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.href){
					if (string_test==''){
						string_test += obj.href
					}else{
						string_test +=','+ obj.href
					}
				}
			});
			return (string_test)
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}


	// 角色存留页面
	this.PageRoleRetainSearch = function() {
		sidebarStatus('retain_loss', '/roleretain/');
		var $searchableTree;
		var $searchableTree2;
		var power_list = '';
		var channel_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate: ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});		
		screen()
		screen2()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getchannel', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree2 = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			params['channel_list'] = channel_list
			return params;
		}


		$table.bootstrapTable({
			url: '/roleretain/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'd_date',
				title: ' 日期',
				sortable : true,
				order : 'desc',
				titleTooltip : '选择的日期'
			}, {
				field: 'server',
				title: '服务器',
				titleTooltip : '选择的服务器'
			}, {
				field: 'channel',
				title: '渠道',
				titleTooltip : '选择的渠道'
			},  {
				field: 'create_role_accont',
				title: '创建角色数',
				titleTooltip : '当时创建角色数'
			}, {
				field: 'role_login_accont',
				title: '登录角色数',
				titleTooltip : '当日登录角色数'
			}, {
				field: 'new_login_accont',
				title: '新登角色数',
				titleTooltip : '当日创建并登录的角色数'
			},{
				field: 'once_retain',
				title: '次日留存',
				titleTooltip : ' 当日新增在第2日仍然登陆的角色/当日新增角色数'
			}, {
				field: 'three_retain',
				title: '3日存留率',
				titleTooltip : ' 当日新增在第3日仍然登陆的角色/当日新增角色数'
			}, {
				field: 'four_retain',
				title: '4日存留率',
				titleTooltip : ' 当日新增在第4日仍然登陆的角色/当日新增角色数'
			}, {
				field: 'five_retain',
				title: '5日存留率',
				titleTooltip : ' 当日新增在第5日仍然登陆的角色/当日新增角色数'
			}, {
				field: 'six_retain',
				title: '6日存留率',
				titleTooltip : ' 当日新增在第6日仍然登陆的角色/当日新增角色数'
			}, {
				field: 'seven_retain',
				title: '7日存留率',
				titleTooltip : ' 当日新增在第7日仍然登陆的角色/当日新增角色数'
			}, {
				field: 'fifteen_retain',
				title: '15日存留率',
				titleTooltip : ' 当日新增在第15日仍然登陆的角色/当日新增角色数'
			}, {
				field: 'thirty_retain',
				title: '30日存留率',
				titleTooltip : ' 当日新增在第30日仍然登陆的角色/当日新增角色数'
			},{
				field: 'forty_five_retain',
				title: '45日存留率',
				titleTooltip : ' 当日新增在第45日仍然登陆的角色/当日新增角色数'
			}, {
				field: 'sixty_retain',
				title: '60日存留率',
				titleTooltip : ' 当日新增在第60日仍然登陆的角色/当日新增角色数'
			}, {
				field: 'seventy_five_retain',
				title: '75日存留率',
				titleTooltip : ' 当日新增在第75日仍然登陆的角色/当日新增角色数'
			}, {
				field: 'ninety_retain',
				title: '90日存留率',
				titleTooltip : ' 当日新增在第90日仍然登陆的角色/当日新增角色数'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}
					if (data.rows.length!=0){
						$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			channel_list = power_func2()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/roleretain/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list+'&channel_list='+channel_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			channel_list  = power_func2()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if(string_test!=''){
						string_test+=',' +obj.s_uid
					}else{
						string_test = obj.s_uid
					}
				}
			});
			console.log(string_test)
			return string_test
		}
		function power_func2(){
			var string_test = '';
			var checked = $searchableTree2.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.href){
					if(string_test!=''){
						string_test+=','+obj.href
					}else{
						string_test = obj.href
					}
				}
			});
			return string_test
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}

	// 设备存留页面
	this.PageEquipmentRetainSearch = function() {
		sidebarStatus('retain_loss', '/equipmentretain/');
		var $searchableTree;
		var power_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate: ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		screen()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getservermenu', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['s_uid'])
						};
						if(node.pid == 0) {
							node["nodes"] = [];
							dsk[0].nodes.push(node);
						}
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list
			return params;
		}


		$table.bootstrapTable({
			url: '/equipmentretain/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'd_date',
				title: ' 日期',
				sortable : true,
				order : 'desc',
				titleTooltip : '选择的日期'
			}, {
				field: 'channel',
				title: '渠道',
				titleTooltip : '选择的渠道'
			},  {
				field: 'new_equipment',
				title: '新增设备',
				titleTooltip : '全新设备并且激活的设备数（一个全新设备永久只记录一次）'
			}, {
				field: 'equipment_login_accont',
				title: '登陆设备',
				titleTooltip : '当天，登陆游戏的设备数量（同设备一天只记录一次）'
			}, {
				field: 'new_start_login_accont',
				title: '新登设备',
				titleTooltip : '全新设备并且登陆账号的设备数（一个全新设备对应一个账号只记录一次）'
			},{
				field: 'once_retain',
				title: '次日留存',
				titleTooltip : ' 当日新增在第2日仍然登陆的设备/当日新增设备数'
			}, {
				field: 'three_retain',
				title: '3日存留率',
				titleTooltip : ' 当日新增在第3日仍然登陆的设备/当日新增设备数'
			}, {
				field: 'four_retain',
				title: '4日存留率',
				titleTooltip : ' 当日新增在第4日仍然登陆的设备/当日新增设备数'
			}, {
				field: 'five_retain',
				title: '5日存留率',
				titleTooltip : ' 当日新增在第5日仍然登陆的设备/当日新增设备数'
			}, {
				field: 'six_retain',
				title: '6日存留率',
				titleTooltip : ' 当日新增在第6日仍然登陆的设备/当日新增设备数'
			}, {
				field: 'seven_retain',
				title: '7日存留率',
				titleTooltip : ' 当日新增在第7日仍然登陆的设备/当日新增设备数'
			}, {
				field: 'fifteen_retain',
				title: '15日存留率',
				titleTooltip : ' 当日新增在第15日仍然登陆的设备/当日新增设备数'
			}, {
				field: 'thirty_retain',
				title: '30日存留率',
				titleTooltip : ' 当日新增在第30日仍然登陆的设备/当日新增设备数'
			},{
				field: 'forty_five_retain',
				title: '45日存留率',
				titleTooltip : ' 当日新增在第45日仍然登陆的设备/当日新增设备数'
			}, {
				field: 'sixty_retain',
				title: '60日存留率',
				titleTooltip : ' 当日新增在第60日仍然登陆的设备/当日新增设备数'
			}, {
				field: 'seventy_five_retain',
				title: '75日存留率',
				titleTooltip : ' 当日新增在第75日仍然登陆的设备/当日新增设备数'
			}, {
				field: 'ninety_retain',
				title: '90日存留率',
				titleTooltip : ' 当日新增在第90日仍然登陆的设备/当日新增设备数'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}
					if (data.rows.length!=0){
						$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/equipmentretain/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.pid==0){
					string_test +='|' + obj.text
				}else{
					string_test +=',' + obj.s_uid
				}
			});
			var _idnex = (string_test.indexOf('|')) +1
			return (string_test.substring(_idnex))
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}


	//体力购买次数
	this.PageBuySearch = function() {
		sidebarStatus('data_collect', '/buy/');
		var $searchableTree;
		var $searchableTree2;
		var channel_list = '';
		var power_list = '';
		// var left_width = (window.innerWidth-500);
		// $('#downloads').css('left',left_width.toString()+'px')
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD',
			viewDate: ymd
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD',
			viewDate: ymd
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});		
		screen()
		screen2()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getchannel', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree2 = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			params['vip_level'] = $("#vip_level").val();
			params['channel_list'] = channel_list
			return params;
		}


		$table.bootstrapTable({
			url: '/buy/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			striped : true,
			showColumns: true,
			columns: [{
				field: 'd_date',
				title: ' 日期',
				sortable: true, //是否可排序
                order: "desc", //默认排序方式
                titleTooltip: "选择的日期",
                align: 'center',
			}, {
				field: 'server',
				title: '服务器',
				titleTooltip: "选择的当前服务器",
			}, {
				field: 'channel',
				title: '渠道',
				titleTooltip: "当前选择的渠道",
			}, {
				field: 'vip_level',
				title: 'VIP等级',
				titleTooltip: "当前选择的VIP等级",
			}, {
				field: 'total_vip_num',
				title: 'VIP总人数',
				titleTooltip: "当天，登录用户中对应VIP等级的玩家数",
			}, {
				field: 'once_pay_num',
				title: '1次购买数',
				titleTooltip: "当天，VIP总人数中只购买1次体力的人数",
			}, {
				field: 'once_pay_num_rate',
				title: '1次比例',
				titleTooltip: '1次购买数/VIP总人数',
			}, {
				field: 'twice_pay_num',
				title: '2次购买数',
				titleTooltip: '当天，VIP总人数中只购买2次体力的人数',
			}, {
				field: 'twice_pay_num_rate',
				title: '2次比例',
				titleTooltip: '2次购买数/VIP总人数',
			}, {
				field: 'three_pay_num',
				title: '3次购买数',
				titleTooltip: '当天，VIP总人数中只购买3次体力的人数',
			}, {
				field: 'three_pay_num_rate',
				title: '3次比例',
				titleTooltip: '3次购买数/VIP总人数',
			}, {
				field: 'four_pay_num',
				title: '4次购买数',
				titleTooltip: '当天，VIP总人数中只购买4次体力的人数',
			}, {
				field: 'four_pay_num_rate',
				title: '4次比例',
				titleTooltip: '4次购买数/VIP总人数',
			}, {
				field: 'five_pay_num',
				title: '5次购买数',
				titleTooltip: '当天，VIP总人数中只购买5次体力的人数',
			}, {
				field: 'five_pay_num_rate',
				title: '5次比例',
				titleTooltip: '5次购买数/VIP总人数',
			}, {
				field: 'six_pay_num',
				title: '6从购买数',
				titleTooltip: '当天，VIP总人数中只购买6次体力的人数',
			}, {
				field: 'six_pay_num_rate',
				title: '6次比例',
				titleTooltip: '6次购买数/VIP总人数',
			}, {
				field: 'seven_pay_num',
				title: '7次购买数',
				titleTooltip: '当天，VIP总人数中只购买7次体力的人数',
			}, {
				field: 'seven_pay_num_rate',
				title: '7次比例',
				titleTooltip: '7次购买数/VIP总人数',
			}, {
				field: 'eight_pay_num',
				title: '8次购买数',
				titleTooltip: '当天，VIP总人数中只购买8次体力的人数',
			}, {
				field: 'eight_pay_num_rate',
				title: '8次比例',
				titleTooltip: '8次购买数/VIP总人数',
			}, {
				field: 'nine_pay_num',
				title: '9次购买数',
				titleTooltip: '当天，VIP总人数中只购买9次体力的人数',
			}, {
				field: 'nine_pay_num_rate',
				title: '9次比例',
				titleTooltip: '9次购买数/VIP总人数',
			}, {
				field: 'ten_pay_num',
				title: '10次购买数',
				titleTooltip: '当天，VIP总人数中只购买10次体力的人数',
			}, {
				field: 'ten_pay_num_rate',
				title: '10比例',
				titleTooltip: '10次购买数/VIP总人数',
			}, {
				field: 'eleven_pay_num',
				title: '11次购买数',
				titleTooltip: '当天，VIP总人数中只购买11次体力的人数',
			}, {
				field: 'eleven_pay_num_rate',
				title: '11次比例',
				titleTooltip: '11次购买数/VIP总人数',
			}, {
				field: 'twelve_pay_num',
				title: '12次购买数',
				titleTooltip: '当天，VIP总人数中只购买12次体力的人数',
			}, {
				field: 'twelve_pay_num_rate',
				title: '12次比例',
				titleTooltip: '12次购买数/VIP总人数',
			}, {
				field: 'thirt_pay_num',
				title: '13次购买数',
				titleTooltip: '当天，VIP总人数中只购买13次体力的人数',
			}, {
				field: 'thirt_pay_num_rate',
				title: '13次比例',
				titleTooltip: '13次购买数/VIP总人数',
			}, {
				field: 'fourt_pay_num',
				title: '14次购买数',
				titleTooltip: '当天，VIP总人数中只购买14次体力的人数',
			}, {
				field: 'fourt_pay_num_rate',
				title: '14次比例',
				titleTooltip: '14次购买数/VIP总人数',
			}, {
				field: 'fift_pay_num',
				title: '15次购买数',
				titleTooltip: '当天，VIP总人数中只购买15次体力的人数',
			}, {
				field: 'fift_pay_num_rate',
				title: '15次比例',
				titleTooltip: '15次购买数/VIP总人数',
			}, {
				field: 'sixt_pay_num',
				title: '16次购买数',
				titleTooltip: '当天，VIP总人数中只购买16次体力的人数',
			}, {
				field: 'sixt_pay_num_rate',
				title: '16次比例',
				titleTooltip: '16次购买数/VIP总人数',
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}
					if (data.rows.length!=0){
						$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
					}else{
						_self.ShowToast('info','没有数据');
						return false;
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day  = 0;
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days));
			$("#end_time").val(GetDateStr(end_day));
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			var vip_level = $("#vip_level").val();
			power_list = power_func();
			channel_list = power_func2()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/buy/export?start_time='+start_time+'&end_time='+end_time+'&orderby='+orderby+'&server_list='+power_list + '&vip_level=' +vip_level+'&channel_list='+channel_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if(string_test==''){
						string_test  = obj.s_uid
					}else{
						string_test+=','+obj.s_uid
					}
				}
			});
			return string_test
		}
		function power_func2(){
			var string_test = '';
			var checked = $searchableTree2.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.href){
					if(string_test==''){
						string_test  = obj.href
					}else{
						string_test+=','+obj.href
					}
				}
			});
			return string_test
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}


	//冒险团界面
	this.PageAdGroupSearch = function() {
		sidebarStatus('data_collect', '/adgroup/');
		var $searchableTree;
		var $searchableTree2;
		var power_list = '';
		var channel_list = '';
		$(".feedback").remove();
		var start_time = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		var $table = $("#table");
		var $table2 = $("#table2");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});		
		screen()
		screen2()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getchannel', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree2 = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			params['channel_list'] = channel_list
			return params;
		}
		function queryParams2(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			params['_type'] = $("#_type").val();
			params['channel_list'] = channel_list
			return params;
		}
		// 
		function chart_draw(ele_id,date_list,num_list,title){
		        var echartsPie;  
	        	var name =(title.slice(0,-2)) + '个数';
			        option = {
			        title : {
			            text: title,
			            subtext: '',
			            x:'center'

			        },
			        tooltip : {
			            trigger: 'axis'
			        },
			        toolbox: {
			            show : true,
			            feature : {
			                mark : {show: true},
			                magicType : {show: true},
			                saveAsImage : {show: true}
			            }
			        },
			        calculable : true,
			        xAxis : [
			            {
			                type : 'category',
			                data : date_list
			            }
			        ],
			        yAxis : [
			            {
			                type : 'value'
			            }
			        ],
			        color:['#FF9869'],
			        series : [
			            {
			                name:name,
			                type:'bar',
			                data:num_list,
			            }
			        ]
			    };
			      
			    echartsPie = echarts.init(document.getElementById('ll'));  
			    $(function(){  
			        echartsPie.setOption(option);  
			          
			    });                      
			}
		//  接收数据的接口未做
		$table.bootstrapTable({
			url: '/adgroup/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'd_date',
				title: '日期',
				sortable: true,
				order : 'desc',
				titleTooltip:'选择的日期'
			}, {
				field: 'server',
				title: '服务器',
				titleTooltip:'选择的服务器'
			}, {
				field: 'channel',
				title: '渠道',
				titleTooltip:'选择的渠道'
			}, {
				field: 'ad_num',
				title: '冒险团数量',
				titleTooltip:'冒险团数量'
			}, {
				field: 'ad_dis_num',
				title: '冒险团解散数',
				titleTooltip:'被解散的冒险团数量'
			}, {
				field: 'ad_player_num',
				title: '在团玩家数',
				titleTooltip:'加入冒险团的玩家数'
			}, {
				field: 'residual_con',
				title: '剩余贡献',
				titleTooltip:'冒险团剩余总贡献'
			}, {
				field: 'residual_con_ag',
				title: '平均贡献',
				titleTooltip:'剩余贡献/在团玩家数'
			}, {
				field: 'diam_donation',
				title: '钻石捐献次数',
				titleTooltip:'进行钻石捐献的总次数'
			}, {
				field: 'diam_donation_rate',
				title: '钻石捐献比率',
				titleTooltip:'进行钻石捐献总次数/冒险团数量'
			}, {
				field: 'logging_camp',
				title: '伐木场次数',
				titleTooltip:'进行伐木场的总次数'
			}, {
				field: 'logging_camp_rate',
				title: '伐木场比率',
				titleTooltip:'进行伐木场的总次数/冒险团数量'
			}, {
				field: 'mine_num',
				title: '矿场次数',
				titleTooltip:'进行矿场的总次数'
			}, {
				field: 'mine_num_rate',
				title: '矿场比率',
				titleTooltip:'进行矿场的总次数/冒险团次数'
			}, {
				field: 'open_boss',
				title: '讨伐boss开启次数',
				titleTooltip:'开启boss总次数'
			}, {
				field: 'open_boss_rate',
				title: '讨伐boss开启比率',
				titleTooltip:'开启boss总次数/冒险团数量'
			}, {
				field: 'kill_boss',
				title: '讨伐成功次数',
				titleTooltip:'讨伐成功总次数'
			}, {
				field: 'fail_boss',
				title: '讨伐失败次数',
				titleTooltip:'讨伐失败总次数'
			}, {
				field: 'surplus_funds',
				title: '剩余资金总量',
				titleTooltip:'所有冒险团剩余资金总量'
			}, {
				field: 'surplus_woods',
				title: '剩余木材总量',
				titleTooltip:'所有冒险团剩余木材总量'
			}, {
				field: 'surplus_stones',
				title: '剩余石头总量',
				titleTooltip:'所有冒险团剩余石头总量'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					// 加进饼状图的回调函数
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});

		$table2.bootstrapTable({
			url: '/adgroup/checkfilter2',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams2,
			columns: [{
				field: 'level',
				title: '等级',
				sortable: true,
				order : 'desc',
				titleTooltip:'等级'
			}, {
				field: 'num',
				title: '数量',
				titleTooltip:'总数量'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.date_list){
						chart_draw('ll',data.date_list,data.num_list,$("#_type").find("option:selected").text());
						
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$("#qiehuan").unbind('click').click(function() {
			if ($("#ll").css('display')=='block'){
				$('#ll').hide();
				$('#test').show();
				$("#yy").html('图表')
				isloadedIp = false;
				showLoading();
				getTableData($table2)
			}else{
				$("#ll").show();
				$('#test').hide();
				$("#yy").html('表格')
				getTableData($table2);
			}

		});	
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days)+  '00:00:00');
			$("#_start_time").val(GetDateStr(days)+  '00:00:00');
			start_time = GetDateStr(days)+  '00:00:00';
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			// $("#start_time").val('');
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
			getTableData($table2);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			channel_list = power_func2()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/adgroup/export?start_time='+start_time+'&end_time='+end_time+'&orderby='+orderby+'&server_list='+power_list+'&channel_list='+channel_list

			}

		});

		$("#_type").change(function(){
			isloadedIp = false;
			showLoading();
			getTableData($table2)
		})

		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
			getTableData($table2);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
			getTableDataCurrent($table2);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if(string_test==''){
						string_test =obj.s_uid
					}else{
						string_test+=','+obj.s_uid
					}
				}
			});
			return string_test
		}
		function power_func2(){
			var string_test = '';
			var checked = $searchableTree2.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.href){
					if(string_test==''){
						string_test =obj.href
					}else{
						string_test+=','+obj.href
					}
				}
			});
			return string_test
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}



	//纹章记录界面
	this.PageDeviceRecordSearch = function() {
		sidebarStatus('data_collect', '/devicerecord/');
		var $searchableTree;
		var $searchableTree2;
		var power_list = '';
		var channel_list ='';
		$(".feedback").remove();
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		var $table = $("#table");
		var $table2 = $("#table2");
		var $table3 = $("#table3")
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});		
		screen()
		screen2()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getchannel', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree2 = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list
			params['channel_list'] = channel_list
			return params;
		}


		// 
		function chart_draw(ele_id,date_list,num_list,avg_list){
		        var echartsPie;  

			        option = {
			        title : {
			            text: '',
			            subtext: '',

			        },
			        tooltip : {
			            trigger: 'axis'
			        },
			        legend: {
			            data:['纹章力量','平均纹章力量','星石数','平均星石数']
			        },
			        calculable : true,
			        xAxis : [
			            {
			                type : 'category',
			                data : date_list
			            }
			        ],
			        yAxis : [
			            {
			                type : 'value'
			            }
			        ],
			        color:['#4F81BD', '#4BACC6','#9BBB59','#2C4D75'],
			        series : [
			            {
			                name:'纹章力量',
			                type:'bar',
			                data:num_list,
			                markPoint : {
			                    data : [
			                        {type : 'max', name: '最大值'},
			                        {type : 'min', name: '最小值'}
			                    ]
			                },
			            },			            
			            {
			                name:'平均纹章力量',
			                type:'line',
			                data:num_list,
			                markPoint : {
			                    data : [
			                        {type : 'max', name: '最大值'},
			                        {type : 'min', name: '最小值'}
			                    ]
			                },
			            },
			            {
			                name:'星石数',
			                type:'bar',
			                data:avg_list,
			                markPoint : {
			                    data : [
			                        {name : '年最高', type : 'max'},
			                        {name : '年最低', type : 'min'}
			                    ]
			                },
			            },
			            {
			                name:'平均星石数',
			                type:'line',
			                data:avg_list,
			                markPoint : {
			                    data : [
			                        {name : '年最高', type : 'max'},
			                        {name : '年最低', type : 'min'}
			                    ]
			                },
			            }
			        ]
			    };
			      
			    echartsPie = echarts.init(document.getElementById(ele_id));  
			    $(function(){  
			        echartsPie.setOption(option);  
			          
			    });                      
			}


			function chart_draw2(ele_id,params){
		        var echartsPie;  
				option = {
					title :{text: '伙伴纹章情况'},
				    tooltip : {
				        trigger: 'axis',
				        axisPointer : {
				            type: 'shadow'
				        }
				    },
				    legend: {
				        data:['纹章1级','纹章2级','纹章3级','纹章4级','纹章5级','纹章6级']
				    },
				    toolbox: {
				        show : true,
				        orient : 'vertical',
				        y : 'center',
				    },
				    // calculable : true,
				    xAxis : [
				        {
				            type : 'category',
				            data : params.names
				        }
				    ],
				    yAxis : [
				        {
				            type : 'value',
				            splitArea : {show : true}
				        }
				    ],
				    grid: {
				        x2:40
				    },
				    color:['#F79646', '#4BACC6','#8064A2','#B65708','#276A7C','red'],
				    series : [
				        {
				            name:'纹章1级',
				            type:'bar',
				            stack: '总量',
				            data:params.one_nums
				        },
				        {
				            name:'纹章2级',
				            type:'bar',
				            stack: '总量',
				            data:params.two_nums
				        },
				        {
				            name:'纹章3级',
				            type:'bar',
				            stack: '总量',
				            data:params.three_nums
				        },
				        {
				            name:'纹章4级',
				            type:'bar',
				            stack: '总量',
				            data:params.four_nums
				        },
				        {
				            name:'纹章5级',
				            type:'bar',
				            stack: '总量',
				            data:params.five_nums
				        },
				        {
				            name:'纹章6级',
				            type:'bar',
				            stack: '总量',
				            data:params.six_nums
				        }
				    ]
				};
			      
			    echartsPie = echarts.init(document.getElementById(ele_id));  
			    $(function(){  
			        echartsPie.setOption(option);  
			          
			    });                      
			}

			function chart_draw3(ele_id,params){
		        var echartsPie;  
				option = {
				    title : {
				        text: '魔石使用数量',
				        // subtext: 'fgnjg',
				        // x:'left'
				    },
				    tooltip : {
				        trigger: 'item',
				        formatter: "{a} <br/>{b} : {c} ({d}%)"
				    },
				    legend: {
				        // orient : 'vertical',
				        x : 'left',  
		                y: 'bottom',
				        data:params.names
				    },
				    calculable : true,
				    series : [
				        {
				            // name:'访问来源',
				            type:'pie',
				            radius : '55%',
				            center: ['50%', '60%'],
				            data:params.top_datas
				        }
				    ]
				};
			      
			    echartsPie = echarts.init(document.getElementById(ele_id));  
			    $(function(){  
			        echartsPie.setOption(option);  
			          
			    });                      
			}
		//  接收数据的接口未做
		$table.bootstrapTable({
			url: '/devicerecord/partner',
			idField: 'id',
			pagination: true,
			pageList: [10],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'name',
				title: '伙伴名称',
				// sortable: true,
				// order : 'desc',
				// titleTooltip:'伙伴名称'
			}, {
				field: 't_own_num',
				title: '开启纹章人数',
				titleTooltip:'所选日期内，活跃用户中，开启该伙伴纹章的人数'
			}, {
				field: 'one_level',
				title: '纹章1级',
				titleTooltip:'所选日期内，活跃用户中，开启该伙伴纹章1级的人数'
			}, {
				field: 'two_level',
				title: '纹章2级',
				titleTooltip:'所选日期内，活跃用户中，开启该伙伴纹章2级的人数'
			}, {
				field: 'three_level',
				title: '纹章3级',
				titleTooltip:'所选日期内，活跃用户中，开启该伙伴纹章3级的人数'
			}, {
				field: 'four_level',
				title: '纹章4级',
				titleTooltip:'所选日期内，活跃用户中，开启该伙伴纹章4级的人数'
			}, {
				field: 'five_level',
				title: '纹章5级',
				titleTooltip:'所选日期内，活跃用户中，开启该伙伴纹章5级的人数'
			}, {
				field: 'six_level',
				title: '纹章6级',
				titleTooltip:'所选日期内，活跃用户中，开启该伙伴纹章6级的人数'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					// 加进饼状图的回调函数
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
					}else{
						// 服务器获取过来的top10的数据
						if (data.date_list>0){
						}
						chart_draw2('echartsPie',data);
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});



		$table2.bootstrapTable({
			url: '/devicerecord/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'd_date',
				title: '日期',
				sortable: true,
				order : 'desc',
				titleTooltip:'选择的日期'
			}, {
				field: 'device_power',
				title: '纹章力量',
				titleTooltip:'当天剩余剩余纹章力量'
			}, {
				field: 'ster_stone',
				title: '星石',
				titleTooltip:'当天剩余剩余星石数量'
			}, {
				field: 'device_power_avg',
				title: '平均纹章力量',
				titleTooltip:'纹章力量/活跃人数'
			}, {
				field: 'ster_stone_avg',
				title: '平均星石数',
				titleTooltip:'星石数/活跃人数'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					// 加进饼状图的回调函数
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						// _self.ShowToast('info','请选择服务器')
					}else{
						// 服务器获取过来的top10的数据
						if (data.date_list>0){
						}
						// $('#echartsPie').css('display','block')
						// chart_draw('ll',data.date_list,data.num_list,data.avg_list);
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});


		$table3.bootstrapTable({
			url: '/devicerecord/getmgstone',
			idField: 'id',
			pagination: true,
			pageList: [10],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'name',
				title: '魔石名称',
				titleTooltip:'魔石名称'
			}, {
				field: 'num',
				title: '使用数量',
				sortable: true,
				order : 'desc',
				titleTooltip:'所选日期内，活跃用户中，装备对应魔石的数量'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					// 加进饼状图的回调函数
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						// _self.ShowToast('info','请选择服务器')
					}else{
						// 服务器获取过来的top10的数据
						if (data.names.length>0){
							$("#ll2").css('display','block');
							chart_draw3('ll2',data);
						}else{
							$("#ll2").css('display','none');
							chart_draw3('ll2',data);
						}

					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days)+  '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
			getTableData($table2);
			getTableData($table3)
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			power_list = power_func()
			channel_list = power_func2()
			window.location.href = '/devicerecord/partnerexport?start_time='+start_time+'&end_time='+end_time+'&orderby='+orderby+'&server_list='+power_list+'&channel_list='+channel_list


		});
		$("#download2").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			power_list = power_func()
			channel_list = power_func2()
			window.location.href = '/devicerecord/export?start_time='+start_time+'&end_time='+end_time+'&orderby='+orderby+'&server_list='+power_list+'&channel_list='+channel_list


		});
		$("#download3").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			power_list = power_func()
			channel_list = power_func2()
			window.location.href = '/devicerecord/mgstoneexport?start_time='+start_time+'&end_time='+end_time+'&orderby='+orderby+'&server_list='+power_list+'&channel_list='+channel_list


		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list  = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
			getTableData($table2);
			getTableData($table3)
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
			getTableData($table2);
			getTableData($table3)
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if(string_test==''){
						string_test = obj.s_uid
					}else{
						string_test+=','+obj.s_uid
					}
				}
			});
			return string_test
		}
		function power_func2(){
			var string_test = '';
			var checked = $searchableTree2.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.href){
					if(string_test==''){
						string_test = obj.href
					}else{
						string_test+=','+obj.href
					}
				}
			});
			return string_test
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}


	//超觉醒
	this.PagesuperstarSearch = function() {
		sidebarStatus('data_collect', '/superstar/');
		var $searchableTree;
		var $searchableTree2;
		var power_list = '';
		var channel_list ='';
		var m_data = '1';
		var w_data = '';
		var d_data = '';
		$(".feedback").remove();
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		var $table = $("#table");
		var $table2 = $("#table2");
		var $table3 = $("#table3")
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 23:59:59'
		});
		// $("#start_time").on("dp.change", function(e) {
		// 	$('#end_time').data("DateTimePicker").minDate(e.date);
		// });
		var a = document.getElementById("servers");
	  	a.options[1].selected = true;
		// $("#servers option:first").prop("selected", 'selected');  
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['s_uid'] = $('#servers').val();
			params['m_data'] = m_data
			params['w_data'] = w_data
			params['d_data'] = d_data
			return params;
		}

		function chart_draw(ele_id,data){
		        var echartsPie;  

			        option = {
			        title : {
			            text: data.title,
			            subtext: '',

			        },
			        tooltip : {
			            trigger: 'axis'
			        },
			        legend: {
			            data:['解锁数','重置数','总消耗钻石数','基础消耗钻石数']
			        },
			        toolbox: {
			            show : true,
			            feature : {
			                mark : {show: true},
			                magicType : {show: true},
			                saveAsImage : {show: true}
			            }
			        },
			        calculable : true,
			        xAxis : [
			            {
			                type : 'category',
			                data : data.d_date_list
			            }
			        ],
			        yAxis : [
			            {
			                type : 'value'
			            }
			        ],
			        color:['red','blue','#00FF00','yellow'],
			        series : [
			            {
			                name:'解锁数',
			                type:'line',
			                data:data.ak_num_list
			            },
			            {
			                name:'重置数',
			                type:'line',
			                data:data.reset_num_list
			            },
			            {
			                name:'总消耗钻石数',
			                type:'line',
			                data:data.ldiamond_list
			            },
			            {
			                name:'基础消耗钻石数',
			                type:'line',
			                data:data.baseldiamond_list
			            }
			        ]
			    };
			      
			    echartsPie = echarts.init(document.getElementById('echartsPie'));  
			    $(function(){  
			        echartsPie.setOption(option);  
			          
			    });                      
			}
		//  角色超觉醒属性类型占比
		$table.bootstrapTable({
			url: '/superstar/attrper',
			idField: 'id',
			pagination: true,
			pageList: [10],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'server_name',
				title: '服务器名称',
				// sortable: true,
				// order : 'desc',
				// titleTooltip:'伙伴名称'
			}, {
				field: 'fid',
				title: '角色ID',
				titleTooltip:'角色的id'
			}, {
				field: 'fname',
				title: '角色名称',
				titleTooltip:'角色名字'
			}, {
				field: 'unlock_num',
				title: '解锁觉醒点总数',
				titleTooltip:'所选区服所有玩家对该角色激活觉醒点的总数量'
			}, {
				field: 'total_attr_num',
				title: '解锁属性数',
				titleTooltip:'所选区服所有玩家的该角色的解锁大觉醒点数*2+解锁小觉醒点数*1（大觉醒点两条属性，小觉醒点1条属性）'
			}, {
				field: 'king_n',
				title: '金品质属性数',
				titleTooltip:'所选区服所有玩家的该角色的金品质属性数'
			}, {
				field: 'king_rate',
				title: '金品质占比',
				titleTooltip:'金品质属性数/解锁属性数'
			}, {
				field: 'hp_rate',
				title: '生命类型占比',
				titleTooltip:'所选区服所有玩家的该角色的气血属性数/解锁属性数'
			}, {
				field: 'atk_rate',
				title: '攻击类型占比',
				titleTooltip:'所选区服所有玩家的该角色的攻击属性数/解锁属性数'
			}, {
				field: 'reply_rate',
				title: '回复类型占比',
				titleTooltip:'所选区服所有玩家的该角色的回复属性数/解锁属性数'
			}, {
				field: 'defense_rate',
				title: '防御类型占比',
				titleTooltip:'所选区服所有玩家的该角色的防御属性数/解锁属性数'
			}, {
				field: 'crt_rate',
				title: '暴击类型占比',
				titleTooltip:'所选区服所有玩家的该角色的暴击属性数/解锁属性数'
			}, {
				field: 'sup_p_num',
				title: '觉醒玩家数',
				titleTooltip:'所选区服对该角色解锁过觉醒点的玩家数（包括全觉醒）'
			}, {
				field: 'all_p_num',
				title: '全觉醒玩家数',
				titleTooltip:'所选区服对该角色完成全觉醒（该角色所有觉醒点全解锁）的玩家数'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					// 加进饼状图的回调函数
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});



		$table2.bootstrapTable({
			url: '/superstar/playerrank',
			idField: 'id',
			pagination: true,
			pageList: [10],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'server_name',
				title: '服务器名称',
				titleTooltip: '对应服务器的名称'
			}, {
				field: 'pid',
				title: '玩家ID',
				titleTooltip:'对应玩家的pid'
			}, {
				field: 'pname',
				title: '玩家名称',
				titleTooltip:'玩家名'
			}, {
				field: 'ak_num',
				title: '解锁觉醒点总数',
				titleTooltip:'该玩家所有角色解锁的觉醒点总数'
			}, {
				field: 'ak_attr_num',
				title: '解锁属性数',
				titleTooltip:'该玩家所有角色的解锁大觉醒点数*2+解锁小觉醒点数*1（大觉醒点两条属性，小觉醒点1条属性）'
			}, {
				field: 'king_num',
				title: '金品质属性数',
				titleTooltip:'该玩家所有角色解锁的金品质属性数'
			}, {
				field: 'king_rate',
				title: '金品质占比',
				titleTooltip:'金品质属性数/解锁属性数'
			}, {
				field: 'reset_num',
				title: '重置次数',
				titleTooltip:'该玩家累计重置觉醒点的次数'
			}, {
				field: 'ldiamond',
				title: '总消耗钻石数',
				titleTooltip:'该玩家累计在超觉醒系统（重置觉醒点）中消耗的钻石数量（任何钻石消耗都计入）'
			}, {
				field: 'baseldiamond',
				title: '基础消耗钻石数',
				titleTooltip:'该玩家在超觉醒系统重置觉醒点的基础消耗钻石数（不计入锁定属性时的额外消耗）'
			}, {
				field: 'oneattr_reset',
				title: '单锁定次数',
				titleTooltip:'该玩家锁定单个属性类型重置的次数'
			}, {
				field: 'oneuserld',
				title: '单锁定消耗钻石数',
				titleTooltip:'该玩家进行单锁定重置消耗的钻石数（只算单锁定额外消耗的钻石数，不算基础的钻石消耗）'
			}
			, {
				field: 'twoattr_reste',
				title: '双锁定次数',
				titleTooltip:'该玩家锁定两个属性类型重置的次数'
			}, {
				field: 'twouser_ld',
				title: '双锁定消耗钻石数',
				titleTooltip:'该玩家进行双锁定重置消耗的钻石数（只算双锁定额外消耗的钻石数，不算基础的钻石消耗）'
			}, {
				field: 'all_sup_role',
				title: '全觉醒角色数',
				titleTooltip:'该玩家拥有全觉醒角色的数量'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					// 加进饼状图的回调函数
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});


		$table3.bootstrapTable({
			url: '/superstar/superdata',
			idField: 'id',
			pagination: true,
			pageList: [10],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'd_date',
				title: '时间段',
				titleTooltip:'数据的时间段（月/周/日）'
			}, {
				field: 'ak_num',
				title: '解锁数',
				titleTooltip:'该时间内该区服所有玩家新增的解锁觉醒点的个数'
			}, {
				field: 'reset_num',
				title: '重置数',
				titleTooltip:'该时间内该区服所有玩家重置觉醒点的次数'
			}, {
				field: 'ldiamond',
				title: '总消耗钻石数',
				titleTooltip:'该时间内该区服所有玩家在超觉醒系统（重置觉醒点）中消耗钻石的数量（任何钻石消耗都计入）'
			}, {
				field: 'baseldiamond',
				title: '基础消耗钻石数',
				titleTooltip:'该时间内该区服所有玩家在超觉醒系统重置觉醒点的基础消耗钻石数（不计入锁定属性时的额外消耗）'
			}, {
				field: 'oneattr_reset',
				title: '单锁定次数',
				titleTooltip:'该时间内该区服所有玩家进行单锁定重置的次数'
			}, {
				field: 'oneuserld',
				title: '单锁定消耗钻石数',
				titleTooltip:'该时间内该区服所有玩家进行单锁定重置消耗的钻石数'
			}, {
				field: 'twoattr_reste',
				title: '双锁定次数',
				titleTooltip:'该时间内该区服所有玩家进行双锁定重置的次数'
			}, {
				field: 'twouser_ld',
				title: '双锁定消耗钻石数',
				titleTooltip:'该时间内该区服所有玩家进行双锁定重置消耗的钻石数'
			}],
			onLoadSuccess: function(data) {
				console.log(data.index)
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					// 加进饼状图的回调函数
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					var before_html = '<div class="form-inline" role="form" id="add">'
					before_html+='</div>'
					$("#add").remove();
					$("#echartsPie").before(before_html);
					$('#echartsPie').css('display','block');
					chart_draw('echartsPie',data);
					var chk = '#table3 >tbody >tr:nth-child('+data.index+')'
					$(chk).css('background-color','#FF9900');
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});



		$("#search").unbind('click').click(function() {
			isloadedIp = false;
			showLoading();
			getTableData($table);
			getTableData($table2);
			getTableData($table3)
		});
		$("#refresh").unbind('click').click(function() {
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
			getTableData($table2);
			getTableData($table3)
		});

		$("#m_data").unbind('click').click(function() {
			isloadedIp = false;
			showLoading();
			m_data = '1'
			w_data = '';
			d_data = ''
			getTableData($table3)
		});

		$("#w_data").unbind('click').click(function() {
			isloadedIp = false;
			showLoading();
			m_data = ''
			w_data = '1';
			d_data = ''
			getTableData($table3)
		});
		$("#d_data").unbind('click').click(function() {
			isloadedIp = false;
			showLoading();
			m_data = ''
			w_data = '';
			d_data = '1'
			getTableData($table3)
		});
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}


	// 精灵等级分布
	this.PageSpiritLevelSearch = function() {
		sidebarStatus('data_collect', '/spiritlevel/');
		var $searchableTree;
		var $searchableTree2;
		var channel_list = '';
		var power_list = '';
		var onclick = ''
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate: ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});		
		screen()
		screen2()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getchannel', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree2 = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			$("thead tr th:first").unbind('click').click(function() {
				onclick = '1'
			})
			params['name'] = $("#spirit_type").find("option:selected").text();
			params['onclick'] = onclick
			params['channel_list'] = channel_list
			return params;
		}


		$table.bootstrapTable({
			url: '/spiritlevel/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'server',
				title: ' 服务器',
				sortable : true,
				order : 'desc',
				titleTooltip : '选择的日期'
			}, {
				field: 'channel',
				title: '渠道',
				titleTooltip : '选择的渠道'
			}, {
				field: 'name',
				title: '精灵名称',
				titleTooltip : ' 剑士守护精灵、骑士守护精灵、弓手守护精灵、法师守护精灵'
			}, {
				field: 'level',
				title: '精灵等级',
				titleTooltip : '精灵等级'
			}, {
				field: 'num_owner',
				title: '持有人数',
				titleTooltip : '所选日期内，活跃玩家中对应精灵对应等级的人数'
			}, {
				field: 'rate',
				title: '占比',
				titleTooltip : '对应等级持有人数/所有等级持有人数'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			var spirit_type = $("#spirit_type").val();
			var name = $("#spirit_type").find("option:selected").text();
			power_list = power_func()
			channel_list = power_func2()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/spiritlevel/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list+'&name='+name+'&channel_list='+channel_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if(string_test==''){
						string_test = obj.s_uid
					}else{
						string_test+=','+obj.s_uid
					}
				}
			});
			return string_test
		}

		function power_func2(){
			var string_test = '';
			var checked = $searchableTree2.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.href){
					if(string_test==''){
						string_test = obj.href
					}else{
						string_test+=','+obj.href
					}
				}
			});
			return string_test
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}


	// 任务关卡
	this.PageTaskCheckPointSearch = function() {
		sidebarStatus('data_collect', '/taskcheckpoint/');
		var $searchableTree;
		var $searchableTree2;
		var power_list = '';
		var channel_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate: ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});		
		screen()
		screen2()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getchannel', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree2 = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			params['activation_type'] = $("#activation_type").val();
			params['channel_list'] =channel_list
			return params;
		}


		$table.bootstrapTable({
			url: '/taskcheckpoint/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'name',
				title: ' 名称',
				sortable : true,
				order : 'desc',
				titleTooltip : '游戏客户端传入游戏的ID'
			}, {
				field: 'type',
				title: '类型',
				titleTooltip : '关卡所属类型'
			}, {
				field: 'create_room_num',
				title: '创建次数',
				titleTooltip : ' 所选时期玩家创建房间的总次数'
			}, {
				field: 'dis_room_num',
				title: '解散次数',
				titleTooltip : ' 所选时期房间解散的总次数'
			}, {
				field: 'player_num',
				title: '进入人数',
				titleTooltip : ' 所选时期玩家接受（进入）关卡的人数'
			},{
				field: 'total_num',
				title: '进入人次',
				titleTooltip : ' 所选时期玩家接受（进入）关卡的人次'
			}, {
				field: 'challenge_num',
				title: '进入次数',
				titleTooltip : '所选时期玩家接受（进入）关卡的次数'
			}, {
				field: 'avg_time',
				title: '平均完成时间',
				titleTooltip : '平均每次完成某项任务所消耗的游戏内时长'
			}, {
				field: 'fail_to_boss',
				title: '失败次数',
				titleTooltip : '所选时期玩家进行某任务的失败总次数'
			}, {
				field: 'fail_rate',
				title: '失败率',
				titleTooltip : '所选时期玩家进行某任务会失败的比例（失败次数/进入次数）'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}
					// if (data.rows.length!=0){
					// 	$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
					// }
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			channel_list = power_func2()
			var activation_type = $("#activation_type").val()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/taskcheckpoint/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list + '&activation_type='+activation_type+'&channel_list='+channel_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			channel_list  = power_func2()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if(string_test==''){
						string_test=obj.s_uid
					}else{
						string_test+=','+obj.s_uid
					}
				}
			});
			return string_test
		}
		function power_func2(){
			var string_test = '';
			var checked = $searchableTree2.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.href){
					if(string_test==''){
						string_test=obj.href
					}else{
						string_test+=','+obj.href
					}
				}
			});
			return string_test
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}



	//分渠道日报
	this.PageChDataSearch = function() {
		sidebarStatus('comp_st', '/channelnews/');
		var $searchableTree;
		var power_list = '';
		// var left_width = (window.innerWidth-500);
		// $('#downloads').css('left',left_width.toString()+'px')
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			disabledHours: false,
			showTodayButton : true,
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		screen()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getservermenu', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['s_uid'])
						};
						if(node.pid == 0) {
							node["nodes"] = [];
							dsk[0].nodes.push(node);
						} 
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			return params;
		}


		$table.bootstrapTable({
			url: '/channelnews/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			striped : true,
			showColumns: true,
			columns: [{
				field: 'd_date',
				title: ' 日期',
				sortable: true, //是否可排序
                order: "desc", //默认排序方式
                titleTooltip: "选择的日期",
                align: 'center',
			}, {
				field: 'channel',
				title: '渠道',
				titleTooltip: "当前选择的渠道",
			}, {
				field: 'new_equipment',
				title: '新增设备',
				titleTooltip: "当天，新增加的去重设备数",
			}, {
				field: 'valid_rate',
				title: '转化率',
				titleTooltip: "当日，新增加的去重设备中，注册了账号的设备数，单台设备注册多个账号只算一次转化",
			}, {
				field: 'new_login_accont',
				title: '新登账号数',
				titleTooltip: "当天，新注册并登陆游戏的去重账号数",
			}, {
				field: 'login_account',
				title: '登录账号',
				titleTooltip: "当天，登陆游戏并且去重的账号数",
			}, {
				field: 'pay_account_num',
				title: '付费账号数',
				titleTooltip: "当天，付费账号数",
			}, {
				field: 'atm_num',
				title: '总充值次数',
				titleTooltip: "当天，总充值次数",
			}, {
				field: 'income',
				title: '收入',
				titleTooltip: '当天，付费的总金额',
			}, {
				field: 'first_pay_account',
				title: '首次付费账号',
				titleTooltip: '当天，付费账号数且本账号第一次进行付费的账号',
			}, {
				field: 'first_pay_account_income',
				title: '首次付费收入',
				titleTooltip: '当天，付费账号数且本账号第一次进行付费的账号总充值金额',
			}, {
				field: 'new_login_pay_num',
				title: '新登付费数',
				titleTooltip: '当日，新登且付费账号数',
			}, {
				field: 'new_login_pay_income',
				title: '新登账号收入',
				titleTooltip: '当天，新登账号的充值总金额',
			}, {
				field: 'pay_ARPU',
				title: '付费ARPU',
				titleTooltip: '当日收入/当日付费账号数',
			}, {
				field: 'DAU_ARPU',
				title: 'DAU ARPU',
				titleTooltip: '当日收入/当日登陆账号数',
			}, {
				field: 'account_pay_rate',
				title: '账号付费率',
				titleTooltip: '当日付费玩家数/当日登陆账号数',
			}, {
				field: 'new_account_pay_rate',
				title: '新增账号付费率',
				titleTooltip: '当日新增付费账号数/当日新增账号数',
			}, {
				field: 'new_pay_ARPU',
				title: '新登用户ARPU',
				titleTooltip: '当日新增付费账号总收入/当日新增付费账号数',
			}, {
				field: 'new_DAU_ARPU',
				title: '新登用户ARPPU',
				titleTooltip: '当日新增付费账号总收入/当日新增账号数',
			}, {
				field: 'two_d_rate',
				title: '次留',
				titleTooltip: '当日新增在第2日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'th_d_rate',
				title: '3留',
				titleTooltip: '当日新增在第3日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'four_retain',
				title: '4留',
				titleTooltip: '当日新增在第4日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'five_retain',
				title: '5留',
				titleTooltip: '当日新增在第5日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'six_retain',
				title: '6留',
				titleTooltip: '当日新增在第6日仍然登陆的账号/当日新增账号数',
			}, {
				field: 's_d_rate',
				title: '7留',
				titleTooltip: '当日新增在第7日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'fifteen_retain',
				title: '15留',
				titleTooltip: '当日新增在第15日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'thirty_retain',
				title: '30留',
				titleTooltip: '当日新增在第30日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'sixty_retain',
				title: '60留',
				titleTooltip: '当日新增在第60日仍然登陆的账号/当日新增账号数',
			}, {
				field: 'ninety_retain',
				title: '90留',
				titleTooltip: '当日新增在第90日仍然登陆的账号/当日新增账号数',
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器');
						return false
					}
					if (data.rows.length!=0){
						$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
					}else{
						_self.ShowToast('info','没有数据')
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day =-1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day)+ '23:59:59');
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func();
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/channelnews/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.pid==0){
					string_test +='|' + obj.text
				}else{
					string_test +=',' + obj.s_uid
				}
			});
			var _idnex = (string_test.indexOf('|')) +1
			return (string_test.substring(_idnex))
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}


	// 活跃用户界面
	this.PageActionSearch = function() {
		sidebarStatus('reg_login', '/action/');
		var $searchableTree;
		var $searchableTree2;
		var power_list = '';
		var channel_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate: ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + " 23:59:59"
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});		
		screen()
		screen2()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getchannel', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree2 = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			params['channel_list'] = channel_list
			return params;
		}

		$table.bootstrapTable({
			url: '/action/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'd_date',
				title: ' 日期',
				sortable : true,
				order: 'desc',
				titleTooltip:'显示当前选择的日期'
			}, {
				field: 'server',
				title: '服务器',
				titleTooltip:'当前选择的服务器'
			}, {
				field: 'channel',
				title: '渠道',
				titleTooltip:'选择的渠道'
			}, {
				field: 'td_ac_num',
				title: '日活跃',
				titleTooltip:'所选日期内，进入过游戏的去重玩家数'
			}, {
				field: 'th_ac_num',
				title: '3日活跃',
				titleTooltip:'所选日期内，当日的最近三日（含当日倒推3日）进入过游戏的去重玩家数'
			}, {
				field: 'w_ac_num',
				title: '周活跃',
				titleTooltip:'所选日期内，当日的最近一周（含当日倒推7日）进入过游戏的去重玩家数'
			}, {
				field: 'mth_ac_num',
				title: '月活跃',
				titleTooltip:'所选日期内，当日的最近一个月（含当日倒推30日）进入过游戏的去重玩家数'
			}, {
				field: 'dw_ac',
				title: 'DAU/WAU',
				titleTooltip:'日活跃/周活跃'
			},{
				field: 'dm_ac',
				title: 'DAU/MAU',
				titleTooltip:'日活跃/月活跃'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器');
						return false;
					}else if (data.total==0){
						_self.ShowToast('info','没有相应的数据');
						return false;
					}
					$(".table-striped > tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			channel_list = power_func2()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/action/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list+'&channel_list='+channel_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if(string_test==''){
						string_test =obj.s_uid
					}else{
						string_test +=','+obj.s_uid
					}
				}
			});
			return string_test
		}
		function power_func2(){
			var string_test = '';
			var checked = $searchableTree2.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.href){
					if(string_test==''){
						string_test =obj.href
					}else{
						string_test +=','+obj.href
					}
				}
			});
			return string_test
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}


	//每日在线峰值界面
	this.PageOnlinePeakSearch = function() {
		sidebarStatus('reg_login', '/dailyonlinepeak/');
		var $searchableTree;
		var power_list = '';
		$(".feedback").remove();
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		screen()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];

			//  获取游戏服务器的所有东西，接口未做
			_self.AjaxGetData('/server/getservermenu', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['s_uid'])
						};
						if(node.pid == 0) {
							node["nodes"] = [];
							dsk[0].nodes.push(node);
						} else {
							var parentslist = dsk[0].nodes;
							for(var j = 0; j < parentslist.length; j++) {
								var node2 = parentslist[j];
								if(node2.id == node.pid) {
									node["nodes"] = [];
									dsk[0].nodes[j].nodes.push(node);
								} else {
									var secondParentlist = node2.nodes;
									for(var k = 0; k < secondParentlist.length; k++) {
										var node3 = secondParentlist[k];
										if(node.id == node3.pid) {
											dsk[0].nodes[j].nodes[k].nodes.push(node);
										}
									}
								}
							}
						}
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list
			return params;
		}


		// 
		function chart_draw(ele_id,date_list,num_list,avg_list){
		        var echartsPie;  

			        option = {
			        title : {
			            text: '每日在线',
			            subtext: '',

			        },
			        tooltip : {
			            trigger: 'axis'
			        },
			        legend: {
			            data:['在线峰值人数','平均在线人数']
			        },
			        toolbox: {
			            show : true,
			            feature : {
			                mark : {show: true},
			                magicType : {show: true, type: ['line', 'bar']},
			                saveAsImage : {show: true}
			            }
			        },
			        calculable : true,
			        xAxis : [
			            {
			                type : 'category',
			                data : date_list
			            }
			        ],
			        yAxis : [
			            {
			                type : 'value'
			            }
			        ],
			        color:['#FF9869', '#87CEFA'],
			        series : [
			            {
			                name:'在线峰值人数',
			                type:'bar',
			                data:num_list,
			                markPoint : {
			                    data : [
			                        {type : 'max', name: '最大值'},
			                        {type : 'min', name: '最小值'}
			                    ]
			                },
			            },
			            {
			                name:'平均在线人数',
			                type:'line',
			                data:avg_list,
			                markPoint : {
			                    data : [
			                        {name : '年最高', type : 'max'},
			                        {name : '年最低', type : 'min'}
			                    ]
			                },
			            }
			        ]
			    };
			      
			    echartsPie = echarts.init(document.getElementById('echartsPie'));  
			    $(function(){  
			        echartsPie.setOption(option);  
			          
			    });                      
			}
		//  接收数据的接口未做
		$table.bootstrapTable({
			url: '/dailyonlinepeak/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'd_date',
				title: '日期',
				sortable: true,
				order : 'desc',
				titleTooltip:'选择的日期'
			}, {
				field: 'num',
				title: '在线峰值人数',
				titleTooltip:'24小时内同时在线最高达到人数'
			}, {
				field: 'avg',
				title: '平均在线人数',
				titleTooltip:'24小时每小时同时在线相加总和÷24小时'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					// 加进饼状图的回调函数
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
					}else{
						// 服务器获取过来的top10的数据
						if (data.date_list>0){
						}
						$('#echartsPie').css('display','block')
						chart_draw('echartsPie',data.date_list,data.num_list,data.avg_list);
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days)+  '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/dailyonlinepeak/export?start_time='+start_time+'&end_time='+end_time+'&orderby='+orderby+'&server_list='+power_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.pid>0){
					string_test +=',' + obj.s_uid
				}
			});
			var _idnex = (string_test.indexOf('|')) +1
			return (string_test.substring(_idnex))
		}

		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}


	//每日实时数据（每小时）
	this.PageDailyHourSearch = function() {
		sidebarStatus('reg_login', '/hour/');
		var $searchableTree;
		var power_list = '';
		$(".feedback").remove();
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		screen()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];

			//  获取游戏服务器的所有东西，接口未做
			_self.AjaxGetData('/server/getservermenu', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['s_uid'])
						};
						if(node.pid == 0) {
							node["nodes"] = [];
							dsk[0].nodes.push(node);
						} else {
							var parentslist = dsk[0].nodes;
							for(var j = 0; j < parentslist.length; j++) {
								var node2 = parentslist[j];
								if(node2.id == node.pid) {
									node["nodes"] = [];
									dsk[0].nodes[j].nodes.push(node);
								} else {
									var secondParentlist = node2.nodes;
									for(var k = 0; k < secondParentlist.length; k++) {
										var node3 = secondParentlist[k];
										if(node.id == node3.pid) {
											dsk[0].nodes[j].nodes[k].nodes.push(node);
										}
									}
								}
							}
						}
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list
			return params;
		}


		// 
		function chart_draw(ele_id,data){
		        var echartsPie;  

			        option = {
			        title : {
			            text: '',
			            subtext: '',

			        },
			        tooltip : {
			            trigger: 'axis'
			        },
			        legend: {
			            data:['新增账号','活跃人数','付费人数','付费金额']
			        },
			        toolbox: {
			            show : true,
			            feature : {
			                mark : {show: true},
			                magicType : {show: true},
			                saveAsImage : {show: true}
			            }
			        },
			        calculable : true,
			        xAxis : [
			            {
			                type : 'category',
			                data : data.hours
			            }
			        ],
			        yAxis : [
			            {
			                type : 'value'
			            }
			        ],
			        color:['red','blue','pink','#00FF00'],
			        series : [
			            {
			                name:'新增账号',
			                type:'line',
			                data:data.new_accounts,
			            },
			            {
			                name:'活跃人数',
			                type:'line',
			                data:data.actions,
			            },
			            {
			                name:'付费人数',
			                type:'line',
			                data:data.pay_accounts,
			            },
			            {
			                name:'付费金额',
			                type:'line',
			                data:data.pay_incomes,
			            }
			        ]
			    };
			      
			    echartsPie = echarts.init(document.getElementById('echartsPie'));  
			    $(function(){  
			        echartsPie.setOption(option);  
			          
			    });                      
			}
		//  接收数据的接口未做
		$table.bootstrapTable({
			url: '/hour/checkfilter',
			idField: 'id',
			// pagination: true,
			// pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'hour',
				title: '时间',
				titleTooltip: '当前选择日期的每小时'
			}, {
				field: 'new_account',
				title: '新增账号',
				titleTooltip:'当天每小时，新注册并登陆游戏的去重账号数'
			},{
				field:'actoin',
				title:'活跃人数',
				titleTooltip:'当天每小时，登陆游戏的去重账号数',

			},{
				field:'pay_account',
				title:'付费人数',
				titleTooltip:'当天每小时，付费的玩家数'
			},{
				field:'pay_income',
				title:'付费金额',
				titleTooltip:'当天每小时，玩家付费的金额'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					// 加进饼状图的回调函数
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}else if(data.check_date==false){
						_self.ShowToast('info','请选择日期');
						return false;
					}else{
						var before_html = '<div class="form-inline" role="form" id="add">'
						if (data.totals.length>0){
							var add_all = data.totals[0]
							var ii = 4;
							var name_list = ['新增账号','活跃人数','付费人数','付费金额']
							var key_list = ['new_account','actoin','pay_account','pay_income']
							for( var i=0;i<ii; i++){
								before_html+='<div class="form-group" id="is_show">'+
									'<div style="height: 50px;text-align:center;margin:30px 0 30px 0;">'+
										'<span>'+add_all[key_list[i]]+'</span><br>'+
										'<span>'+name_list[i]+'</span>'+
									'</div>'+
								'</div>'
							}

						}else{
							_self.ShowToast('info','没有对应的数据')
						}
						before_html+='</div>'
						$("#add").remove();
						$("#echartsPie").before(before_html);
						$('#echartsPie').css('display','block');
						chart_draw('echartsPie',data);
					}
					if (data.rows.length!=0){
						// $("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days)+  '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/hour/export?start_time='+start_time+'&server_list='+power_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.pid==0){
					string_test +='|' + obj.text
				}else{
					string_test +=',' + obj.s_uid
				}
			});
			var _idnex = (string_test.indexOf('|')) +1
			return (string_test.substring(_idnex))
		}

		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}


	// 货币进毁存界面
	this.PageCurrencySearch = function() {
		sidebarStatus('data_collect', '/currency/');
		var $searchableTree;
		var $searchableTree2;
		var power_list = '';
		var channel_list ='';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate: ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + " 23:59:59"
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});		
		screen()
		screen2()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getchannel', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree2 = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list
			params['c_type'] = $("#currency").val()
			params['channel_list'] = channel_list;
			return params;
		}

		$table.bootstrapTable({
			url: '/currency/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'd_date',
				title: ' 日期',
				sortable : true,
				order: 'desc',
				titleTooltip : '选择的日期'
			}, {
				field: 'server',
				title: '服务器',
				titleTooltip: '选择的服务器'
			}, {
				field: 'channel',
				title: '渠道',
				titleTooltip : '选择的渠道'
			}, {
				field: 'start_inventory',
				title: '期初库存',
				titleTooltip : '当天初始的货币数量'
			}, {
				field: 'atm_get',
				title: '充值所得',
				titleTooltip : '充值所得货币'
			}, {
				field: 'system_output',
				title: '系统产出',
				titleTooltip : '系统产出所得货币'
			}, {
				field: 'total_get',
				title: '获取总额',
				titleTooltip : '获取货币总数'
			}, {
				field: 'total_drain',
				title: '消耗总额',
				titleTooltip : '消耗货币总数'
			}, {
				field: 'diff',
				title: '差额',
				titleTooltip : '获取总额减去消耗总额'
			}, {
				field: 'end_inventory',
				title: '期末库存',
				titleTooltip : '第二天的初始货币总额'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}else if (data.total==0){
						_self.ShowToast('info','没有相应的数据')
					}
					// if (data.rows.length!=0){
					// 	$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
					// }
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var c_type = $("#currency").val()
			var data = $('.no-records-found').val();
			power_list = power_func()
			channel_list = power_func2()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/currency/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list + '&c_type='+c_type+'&channel_list='+channel_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if(string_test==''){
						string_test = obj.s_uid

					}else{
						string_test+=','+obj.s_uid
					}
				}
			});
			return string_test
		}
		function power_func2(){
			var string_test = '';
			var checked = $searchableTree2.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.href){
					if(string_test==''){
						string_test = obj.href

					}else{
						string_test+=','+obj.href
					}
				}
			});
			return string_test
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}

	// 产出消耗分布
	this.PagedrainSearch = function() {
		sidebarStatus('data_collect', '/oddistributoin/');
		var columns = [{
				field: 'type',
				title: '产出/消耗点',
				titleTooltip:'产出/消耗货币来源'
			}, {
				field: 'diff',
				title: '产出/消耗货币数',
				sortable: true,
				order : 'desc',
				titleTooltip:'产出/消耗货币的数量'
			}, {
				field: 'p_num',
				title: '人数',
				titleTooltip:'获取货币的玩家数'
			}, {
				field: 'num',
				title: '次数',
				titleTooltip:'获取货币的次数'
			}];
		var $searchableTree;
		var $searchableTree2;
		var power_list = '';
		var channel_list ='';
		$(".feedback").remove();
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});		
		screen()
		screen2()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getchannel', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree2 = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			check_currency = $("#check_currency").val();
			if (check_currency=='0'){
				_self.ShowToast('info','请选择货币类型');
				return false
			}
			output_drain = $("#output_drain").val();
			if (output_drain=='0'){
				_self.ShowToast('info','请选择货币情况')
				return false
			}
			params['c_type'] = check_currency
			params['status_flag'] = output_drain
			params['channel_list'] = channel_list
			return params;
		}


		// 画饼状图
		function chart_draw(ele_id,json,data,title_name){
		    var echartsPie;  
			     
			    var option = {  
			            title : {  
			                text: title_name,  
			                x:'center'  
			            },  
			            tooltip : {  
			                trigger: 'item',  
			                formatter: "{b} : {c} ({d}%)"  
			            },
			            color:['#FF9869', '#87CEFA','#DA70D6','#32CD32','#6495ED','#FF69B4','#BA55D3','#CD5C5C','#FFA500','#40E0D0'],    // 选择颜色
			            legend: {  
			                // orient : 'vertical',  
			                x : 'left',  
			                y: 'bottom',
			                data:data  
			            },  
			            toolbox: {  
			                show : true,  
			                feature : {  
			                    mark : {show: true},  
			                    // dataView : {show: true, readOnly: false},  
			                    magicType : {  
			                        show: true,   
			                        type: ['pie', 'funnel'],  
			                        option: {  
			                            funnel: {  
			                                x: '25%',  
			                                width: '50%',  
			                                funnelAlign: 'left',  
			                                max: 100  
			                            }  
			                        }  
			                    },  
			                    // restore : {show: true},  
			                    saveAsImage : {show: true}  
			                }  
			            },  
			            // calculable : true,  
			            series : [  
			                {  
			                    type:'pie',  
			                    radius : '55%',//饼图的半径大小  
			                    center: ['50%', '45%'],//饼图的位置  
			                    data:json  
			                }  
			            ]  
			        };   
			      
			    echartsPie = echarts.init(document.getElementById(ele_id));  
			    $(function(){  
			        echartsPie.setOption(option);  
			          
			    });
			}
		//  接收数据的接口未做

		$table.bootstrapTable({
			url: '/oddistributoin/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: columns,
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					// 加进饼状图的回调函数
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
					}else{
						$('#is_show').css('display','block')
						// 服务器获取过来的top10的数据
						if (data.pay_names.length>0){
							
						}
						chart_draw('echartsPie',data.pay_datas,data.pay_names,data.diff_top10);
						chart_draw('echartsPie2',data.recharge_datas,data.recharge_names,data.num_top10);
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days)+  '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var c_type = $("#check_currency").val();
			var status_flag = $("#output_drain").val()
			var data = $('.no-records-found').val();
			power_list = power_func()
			channel_list = power_func2()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/oddistributoin/export?start_time='+start_time+'&end_time='+end_time+'&orderby='+orderby+'&server_list='+power_list+'&c_type='+c_type+'&status_flag='+status_flag+'&channel_list='+channel_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list =power_func2()
			columns = []
			// isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if(string_test==''){
						string_test = obj.s_uid
					}else{
						string_test+=','+obj.s_uid
					}
				}
			});
			return string_test
		}
		function power_func2(){
			var string_test = '';
			var checked = $searchableTree2.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.href){
					if(string_test==''){
						string_test = obj.href
					}else{
						string_test+=','+obj.href
					}
				}
			});
			return string_test
		}

				// select
		// $("#check_currency").change(function() {
		// 	var option_value = $(this).val();
		// 	// 获取被选中的text
		// 	if (option_value!=0){
		// 		var html_str = '<option value="0">请选择</option>'+
		// 						'<option value="1">产出</option>'+
		// 						'<option value="2">消耗</option>'
		// 		$("#output_drain").html(html_str);
		// 	}
		// });
		// $("#output_drain").unbind('click').click(function(){
		// 	var output_drain_len =  $("#output_drain option").size()
		// 	if(output_drain_len <=1){
		// 		_self.ShowToast('info','请选择前一个');
		// 	}
		// })

		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}

	//概况
	this.PageOverviewSearch = function() {
		sidebarStatus('comp_st', '/overview/');
		var $searchableTree;
		var power_list = '';
		$(".feedback").remove();
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 23:59:59'
		});
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		screen()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];

			//  获取游戏服务器的所有东西，接口未做
			_self.AjaxGetData('/server/getservermenu', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['s_uid'])
						};
						if(node.pid == 0) {
							node["nodes"] = [];
							dsk[0].nodes.push(node);
						}
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		get_data()
		function get_data(params){
			_self.AjaxGetData('/overview/checkfilter', params, function(data) {
					if (data.code==0){
						var htmls = ''
						var ii = 5
						var name_list = ['累计新增设备','累计新增账号','平均活跃人数','付费人数','付费金额']
						var keys = ['new_equipment','new_login_account','login_account','pay_account','pay_income']
						for (var i=0;i<ii;i++){
							htmls+='<div class="form-group" id="is_show">'+
								'<div >'+
									'<span>'+data.data[keys[i]]+'</span><br>'+
									'<span>'+name_list[i]+'</span>'+
								'</div>'+
							'</div>'
						}
						$("#add_overview").html(htmls)
					}
				});

		}


		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days)+  '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			var start_time = $("#start_time").val();
			var end_time = $("#end_time").val();
			power_list = power_func()
			get_data({start_time:start_time,end_time:end_time,server_list:power_list})
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.pid==0){
					string_test +='|' + obj.text
				}
			});
			var _idnex = (string_test.indexOf('|')) +1
			return (string_test.substring(_idnex))
		}

		$("#confirm").unbind('click').click(function() {
			var start_time = $("#start_time").val()
			var end_time = $("#end_time").val()
			var power_list = power_func();
			$("#removeModal").modal('hide');
			get_data({start_time:start_time,end_time:end_time,server_list:power_list})
		});
		$("#start_time").blur(function() {
			var start_time = $("#start_time").val()
			var end_time = $("#end_time").val()
			var power_list = power_func();
			get_data({start_time:start_time,end_time:end_time,server_list:power_list})
		});
	}

	// 鲸鱼用户
	this.PageWhaleSearch = function() {
		sidebarStatus('pay_recharge', '/whale/');
		var $searchableTree;
		var $searchableTree2;
		var power_list = '';
		var channel_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate: ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + " 23:59:59"
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});		
		screen()
		screen2()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getchannel', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree2 = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			params['channel_list'] =channel_list
			return params;
		}

		$table.bootstrapTable({
			url: '/whale/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'last_pay_time',
				title: '最后充值日期',

				titleTooltip:'最后一次充值的日期'
			}, {
				field: 'player',
				title: '角色名称',
				titleTooltip:'玩家游戏角色名称'
			}, {
				field: 'pid',
				title: '角色ID',
				titleTooltip:'玩家游戏的角色ID'
			}, {
				field: 'server',
				title: '所在游戏服',
				titleTooltip:'选择的服务器'
			}, {
				field: 'channel',
				title: '充值渠道',
				titleTooltip:'选择的渠道'
			}, {
				field: 'uuid',
				title: '设备',
				titleTooltip:'设备uuid'
			}, {
				field: 'rechargemoney',
				title: '充值金额',
				sortable : true,
				order: 'desc',
				titleTooltip:'该角色充值的总金额'
			}, {
				field: 'fp_level',
				title: '首次充值等级',
				titleTooltip:'玩家首次付费时的等级'
			},{
				field: 'ac_level',
				title: '当前等级',
				titleTooltip:'玩家当前活跃的最大等级'
			},{
				field: 'reg_time',
				title: '注册日期',
				titleTooltip:'玩家注册游戏的日期'
			},{
				field: 'fp_time',
				title: '首次充值日期',
				titleTooltip:'玩家第一次充值日期'
			},{
				field: 'llogin_time',
				title: '最后活跃日期',
				titleTooltip:'玩家最后一次活跃的日期'
			},{
				field: 'has_diamond',
				title: '虚拟币拥有量',
				titleTooltip:'玩家当前拥有的虚拟币量'
			},{
				field: 'cons_diamond',
				title: '虚拟币总消耗量',
				titleTooltip:'玩家总的虚拟币消耗量'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
					}else if (data.total==0){
						_self.ShowToast('info','没有相应的数据')
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			channel_list = power_func2()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/whale/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list + '&channel_list='+channel_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.pid==0){
					string_test +='|' + obj.text
				}else{
					string_test +=',' + obj.s_uid
				}
			});
			var _idnex = (string_test.indexOf('|')) +1
			return (string_test.substring(_idnex))
		}

		function power_func(){
			var string_test = '';
			var checked = $('#treeview-checkable').treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if (string_test==''){
						string_test += obj.s_uid
					}else{
						string_test +=','+ obj.s_uid
					}
				}
			});
			return (string_test)
		}
		function power_func2(){
			var string_test = '';
			var checked = $('#treeview-checkable2').treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.href){
					if (string_test==''){
						string_test += obj.href
					}else{
						string_test +=','+ obj.href
					}
				}
			});
			return (string_test)
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}


	// 新增设备账号
	this.PageequipSearch = function() {
		sidebarStatus('reg_login', '/equip/');
		var $searchableTree;
		var power_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate: ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + " 23:59:59"
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		screen()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getservermenu', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['s_uid'])
						};
						if(node.pid == 0) {
							node["nodes"] = [];
							dsk[0].nodes.push(node);
						}
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list
			return params;
		}

		$table.bootstrapTable({
			url: '/equip/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'd_date',
				title: '日期',
				sortable : true,
				order: 'desc',
				titleTooltip:'日期'
			}, {
				field: 'channel',
				title: '渠道',
				titleTooltip:'选择的渠道'
			}, {
				field: 'new_equipment',
				title: '新增设备',
				titleTooltip:'全新设备并且激活的设备数（一个全新设备永久只记录一次）'
			}, {
				field: 'new_equip_login',
				title: '新登设备',
				titleTooltip:'全新设备并且登陆账号的设备数（一个全新设备对应一个账号只记录一次）'
			}, {
				field: 'new_login_account',
				title: '新登账号',
				titleTooltip:'当天，新注册并登陆游戏的去重账号数（包括旧设备当天新注册并登陆的账号数）'
			}, {
				field: 'start_equip',
				title: '启动设备数',
				titleTooltip:'当天，启动游戏的设备数量（同设备一天只记录一次）'
			}, {
				field: 'login_account',
				title: '登录账号',
				titleTooltip:'当天，登陆游戏并且去重的账号数'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
					}else if (data.total==0){
						_self.ShowToast('info','没有相应的数据')
					}
					if (data.rows.length!=0){
						$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/equip/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.pid==0){
					string_test +='|' + obj.text
				}
			});
			var _idnex = (string_test.indexOf('|')) +1
			return (string_test.substring(_idnex))
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}


	// 等级分布界面
	this.PageLeveldisSearch = function() {
		sidebarStatus('retain_loss', '/leveldis/');
		var $searchableTree;
		var $searchableTree2;
		var power_list = '';
		var channel_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate: ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + " 23:59:59"
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});		
		screen()
		screen2()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getserver', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏渠道",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getchannel', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['uid'])
						};
						node["nodes"] = [];
						dsk[0].nodes.push(node);
						
					}
					ServerData = dsk;
					$searchableTree2 = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			var type_flag = $("#player_type").val();
			var power_list2  = getQueryString('server_list')
			if(power_list=='' && power_list2!=null){
				power_list = power_list2
			}
			var channel_list2  = getQueryString('channel_list')
			if(channel_list=='' && channel_list2!=null){
				channel_list = channel_list2
			}
			params['server_list'] = power_list
			params['channel_list'] = channel_list
			params['type_flag'] = type_flag
			return params;
		}
		get_data({})
		function get_data(params){
			var start_time = getQueryString('start_time')
			var end_time = getQueryString('end_time')
			var power_list2 = getQueryString('server_list')
			var type_flag = getQueryString('type_flag')
			if (start_time!=null){
				$("#start_time").val(start_time);
			}
			if (end_time!=null){
				$("#end_time").val(end_time)
			}
			if (type_flag!=null){
				$("#player_type").val(type_flag)
			}
			_self.AjaxGetData('/leveldis/gettabletop', {
				start_time: start_time, end_time: end_time, server_list: power_list2, type_flag: type_flag
				}, function(data) {
					if (data.code==1){
						_self.ShowToast('info','请选择服务器');
						return false;
					}
					columns=  data.data
					$table.bootstrapTable({
						url: '/leveldis/checkfilter',
						idField: 'id',
						pagination: true,
						pageList: [10, 25, 50],
						sidePagination: 'server',
						queryParams: queryParams,
						columns: columns,
						onLoadSuccess: function(data) {
							if (data.code==1){
								window.location.href = '/login/'
							}
							if(data.code == 0) {
								// 加进饼状图的回调函数
								isloadedIp = true;
								if(isloadedIp) {
									hideLoading();
								}
								if (data.server_check==false){

									_self.ShowToast('info','请选择服务器')
									return false
								}
								if (data.rows.length!=0){
									$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
								}else{
									_self.ShowToast('info','没有数据')
								}
							}else if (data.code==30005){
								_self.ShowToast('warning','没有查看的权限')
							} 
							else {
								responseCodeFun(data);
							}
						},
						// 服务器错误提示
						// onLoadError: tableRequestError
					});
				})
		}
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			var start_time = GetDateStr(days) + '00:00:00'
			var end_time = GetDateStr(end_day) + '23:59:59'
			power_list = power_func();
			var power_list2 = getQueryString('server_list');
			if (power_list=='' && power_list2!=null){
				power_list = power_list2
			}
			isloadedIp = false;

			var type_flag2 = getQueryString('type_flag')
			if (type_flag2==null){
				type_flag2 = $("#player_type").val();
			}
			window.location.href = '?start_time='+start_time + '&end_time='+ end_time +'&server_list='+power_list + '&type_flag='+type_flag2+'&channel_list='+channel_list 
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			channel_list  = power_func2()
			var power_list2 = getQueryString('server_list');
			if (power_list=='' && power_list2!=null){
				power_list = power_list2
			}
			var channel_list2 = getQueryString('channel_list');
			if (channel_list=='' && channel_list2!=null){
				channel_list = channel_list2
			}
			var type_flag = $("#player_type").val()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/leveldis/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list + '&type_flag='+type_flag+'&channel_list=' +channel_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			var power_list2 = getQueryString('server_list')
			if (power_list=='' && power_list2!=null){
				power_list = power_list2
			}
			var channel_list2 = getQueryString('channel_list');
			if (channel_list=='' && channel_list2!=null){
				channel_list = channel_list2
			}
			// showLoading();
			// getTableData($table);
			var start_time = $("#start_time").val()
			var end_time = $("#end_time").val()
			var type_flag = $("#player_type").val()
			window.location.href = '?start_time='+start_time + '&end_time='+ end_time +'&server_list='+power_list + '&type_flag=' +type_flag +'&channel_list='+channel_list
			// get_data({start_time: start_time, end_time: end_time, server_list: power_list})
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			channel_list = power_func2()
			isloadedIp = false;
			var power_list2 = getQueryString('server_list')
			if (power_list=='' && power_list2!=null){
				power_list = power_list2
			}
			var channel_list2 = getQueryString('channel_list');
			if (channel_list=='' && channel_list2!=null){
				channel_list = channel_list2
			}
			// showLoading();
			// getTableData($table);
			var start_time = $("#start_time").val()
			var end_time = $("#end_time").val()
			var type_flag = $("#player_type").val()
			window.location.href = '?start_time='+start_time + '&end_time='+ end_time +'&server_list='+power_list + '&type_flag=' +type_flag+'&channel_list='+channel_list
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.s_uid){
					if(string_test!=''){
						string_test +=',' +obj.s_uid;
					}else{
						string_test = obj.s_uid
					}
				}
			});
			
			return string_test
		}
		function power_func2(){
			var string_test = '';
			var checked = $searchableTree2.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.href){
					if(string_test!=''){
						string_test +=','+obj.href;
					}else{
						string_test = obj.href
					}
				}
			});
			
			return string_test
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
	}


	// 登录流程
	this.PageLoginProcessSearch = function() {
		sidebarStatus('retain_loss', '/accountretain/');
		var $searchableTree;
		var power_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate: ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		screen()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getservermenu', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['s_uid'])
						};
						if(node.pid == 0) {
							node["nodes"] = [];
							dsk[0].nodes.push(node);
						} else {
							var parentslist = dsk[0].nodes;
							for(var j = 0; j < parentslist.length; j++) {
								var node2 = parentslist[j];
								if(node2.id == node.pid) {
									node["nodes"] = [];
									dsk[0].nodes[j].nodes.push(node);
								} else {
									var secondParentlist = node2.nodes;
									for(var k = 0; k < secondParentlist.length; k++) {
										var node3 = secondParentlist[k];
										if(node.id == node3.pid) {
											dsk[0].nodes[j].nodes[k].nodes.push(node);
										}
									}
								}
							}
						}
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			if (params['server_list']==''){
				return false;
			}
			params['activation_type'] = $("#activation_type").val()
			return params;
		}


		$table.bootstrapTable({
			url: '/loginprocess/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'd_date',
				title: ' 日期',
				sortable : true,
				order : 'desc',
				titleTooltip : '选择的日期'
			}, {
				field: 'channel',
				title: '渠道',
				titleTooltip : '选择的渠道'
			}, {
				field: 'once_retain',
				title: '激活数',
				titleTooltip : ' 当日激活设备数量'
			}, {
				field: 'three_retain',
				title: '开场动漫人数',
				titleTooltip : '完成开场动漫事件的人数'
			}, {
				field: 'four_retain',
				title: '开场动漫完成率',
				titleTooltip : '开场动画人数/新增激活'
			}, {
				field: 'five_retain',
				title: '公告确认人数',
				titleTooltip : '点击了公告确认按钮的人数'
			}, {
				field: 'six_retain',
				title: '公告完成率',
				titleTooltip : '公告确定人数/新增激活'
			}, {
				field: 'seven_retain',
				title: '点击登录人数',
				titleTooltip : '点击了点击登陆按钮的人数'
			}, {
				field: 'fifteen_retain',
				title: '完成率',
				titleTooltip : '点击登陆人数/新增激活'
			}, {
				field: 'thirty_retain',
				title: '服务器选择人数',
				titleTooltip : '点击服务器选择按钮的人数'
			},{
				field: 'forty_five_retain',
				title: '完成率',
				titleTooltip : '服务器选择人数/新增激活'
			}, {
				field: 'sixty_retain',
				title: '进入游戏的人数',
				titleTooltip : '点击进入游戏按钮的人数'
			}, {
				field: 'seventy_five_retain',
				title: '完整率',
				titleTooltip : '进入游戏人数/新增激活'
			}, {
				field: 'ninety_retain',
				title: '创建角色',
				titleTooltip : '点击了进入提交申请的人数'
			}, {
				field: 'ninety_retain',
				title: '完成率',
				titleTooltip : '创建角色人数/新增激活'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}
					if (data.rows.length!=0){
						$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/accountretain/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.pid==0){
					string_test +='|' + obj.text
				}else{
					string_test +=',' + obj.s_uid
				}
			});
			var _idnex = (string_test.indexOf('|')) +1
			return (string_test.substring(_idnex))
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}


	// 新手流程
	this.PageNoviceProcessSearch = function() {
		sidebarStatus('retain_loss', '/accountretain/');
		var $searchableTree;
		var power_list = '';
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		$(".feedback").remove();
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate: ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		screen()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/server/getservermenu', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['s_uid'])
						};
						if(node.pid == 0) {
							node["nodes"] = [];
							dsk[0].nodes.push(node);
						} else {
							var parentslist = dsk[0].nodes;
							for(var j = 0; j < parentslist.length; j++) {
								var node2 = parentslist[j];
								if(node2.id == node.pid) {
									node["nodes"] = [];
									dsk[0].nodes[j].nodes.push(node);
								} else {
									var secondParentlist = node2.nodes;
									for(var k = 0; k < secondParentlist.length; k++) {
										var node3 = secondParentlist[k];
										if(node.id == node3.pid) {
											dsk[0].nodes[j].nodes[k].nodes.push(node);
										}
									}
								}
							}
						}
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 1,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			if (params['server_list']==''){
				_self.ShowToast('info','选择服务器')
				return false;
			}
			params['activation_type'] = $("#activation_type").val()
			return params;
		}


		$table.bootstrapTable({
			url: '/noviceprocess/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			columns: [{
				field: 'd_date',
				title: '引导步骤',
				sortable : true,
				order : 'desc',
				titleTooltip : '事件名称'
			}, {
				field: 'channel',
				title: '事件数',
				titleTooltip : '所选日期该事件被触发的总次数'
			}, {
				field: 'once_retain',
				title: '达成事件人数',
				titleTooltip : '所选日期内，达成事件的人数'
			}, {
				field: 'three_retain',
				title: '达成率',
				titleTooltip : '达成事件人数/事件数'
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false){

						_self.ShowToast('info','请选择服务器')
						return false;
					}
					if (data.rows.length!=0){
						$("tbody").find("tr").first().css('background-color','rgba(255, 187, 102, 0.34)');
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days) + '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/accountretain/export?start_time='+start_time+'&end_time='+end_time+'&server_list='+power_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.pid==0){
					string_test +='|' + obj.text
				}else{
					string_test +=',' + obj.s_uid
				}
			});
			var _idnex = (string_test.indexOf('|')) +1
			return (string_test.substring(_idnex))
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}


	//  产出消耗分布
	this.PagedynamicSearch = function() {
		sidebarStatus('data_collect', '/oddistributoin/');
		var columns = [{
				field: 'type',
				title: '产出/消耗点',
				titleTooltip:'产出/消耗货币来源'
			}, {
				field: 'diff',
				title: '产出/消耗货币数',
				sortable: true,
				order : 'desc',
				titleTooltip:'产出/消耗货币的数量'
			}, {
				field: 'p_num',
				title: '人数',
				titleTooltip:'获取货币的玩家数'
			}, {
				field: 'num',
				title: '次数',
				titleTooltip:'获取货币的次数'
			}];
		var $searchableTree;
		var power_list = '';
		$(".feedback").remove();
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		screen()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "游戏服务器",
				"href": '',
				"nodes": []
			}];

			//  获取游戏服务器的所有东西，接口未做
			_self.AjaxGetData('/server/getservermenu', {

			}, function(data) {
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['ch_id']),
							'id': htmlspecialchars(checkdata[i]['id']),
							's_uid': htmlspecialchars(checkdata[i]['s_uid'])
						};
						if(node.pid == 0) {
							node["nodes"] = [];
							dsk[0].nodes.push(node);
						} else {
							var parentslist = dsk[0].nodes;
							for(var j = 0; j < parentslist.length; j++) {
								var node2 = parentslist[j];
								if(node2.id == node.pid) {
									node["nodes"] = [];
									dsk[0].nodes[j].nodes.push(node);
								} else {
									var secondParentlist = node2.nodes;
									for(var k = 0; k < secondParentlist.length; k++) {
										var node3 = secondParentlist[k];
										if(node.id == node3.pid) {
											dsk[0].nodes[j].nodes[k].nodes.push(node);
										}
									}
								}
							}
						}
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 2,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params["orderby"] = $("#order").val();
			params['server_list'] = power_list;
			check_currency = $("#check_currency").val();
			if (check_currency=='0'){
				_self.ShowToast('info','请选择货币类型');
				return false
			}
			output_drain = $("#output_drain").val();
			if (output_drain=='0'){
				_self.ShowToast('info','请选择货币情况')
				return false
			}
			params['c_type'] = check_currency
			params['status_flag'] = output_drain
			return params;
		}


		// 画饼状图
		function chart_draw(ele_id,json,data,title_name){
		    var echartsPie;  
			     
			    var option = {  
			            title : {  
			                text: title_name,  
			                x:'center'  
			            },  
			            tooltip : {  
			                trigger: 'item',  
			                formatter: "{b} : {c} ({d}%)"  
			            },
			            color:['#FF9869', '#87CEFA','#DA70D6','#32CD32','#6495ED','#FF69B4','#BA55D3','#CD5C5C','#FFA500','#40E0D0'],    // 选择颜色
			            legend: {  
			                // orient : 'vertical',  
			                x : 'left',  
			                y: 'bottom',
			                data:data  
			            },  
			            toolbox: {  
			                show : true,  
			                feature : {  
			                    mark : {show: true},  
			                    // dataView : {show: true, readOnly: false},  
			                    magicType : {  
			                        show: true,   
			                        type: ['pie', 'funnel'],  
			                        option: {  
			                            funnel: {  
			                                x: '25%',  
			                                width: '50%',  
			                                funnelAlign: 'left',  
			                                max: 100  
			                            }  
			                        }  
			                    },  
			                    // restore : {show: true},  
			                    saveAsImage : {show: true}  
			                }  
			            },  
			            // calculable : true,  
			            series : [  
			                {  
			                    type:'pie',  
			                    radius : '55%',//饼图的半径大小  
			                    center: ['50%', '45%'],//饼图的位置  
			                    data:json  
			                }  
			            ]  
			        };   
			      
			    echartsPie = echarts.init(document.getElementById(ele_id));  
			    $(function(){  
			        echartsPie.setOption(option);  
			          
			    });
			}
		//  接收数据的接口未做
		function show_table(object){
			_self.AjaxGetData('/overview/heh', {

				}, function(data) {
					columns=  data.data
					$table.bootstrapTable({
						url: '/oddistributoin/checkfilter',
						idField: 'id',
						pagination: true,
						pageList: [10, 25, 50],
						sidePagination: 'server',
						queryParams: queryParams,
						columns: columns,
						onLoadSuccess: function(data) {
							if (data.code==1){
								window.location.href = '/login/'
							}
							if(data.code == 0) {
								// 加进饼状图的回调函数
								isloadedIp = true;
								if(isloadedIp) {
									hideLoading();
								}
								if (data.server_check==false){

									_self.ShowToast('info','请选择服务器')
								}else{
									$('#is_show').css('display','block')
									// 服务器获取过来的top10的数据
									if (data.pay_names.length>0){
										
									}
									chart_draw('echartsPie',data.pay_datas,data.pay_names,data.diff_top10);
									chart_draw('echartsPie2',data.recharge_datas,data.recharge_names,data.num_top10);
								}
							}else if (data.code==30005){
								_self.ShowToast('warning','没有查看的权限')
							} 
							else {
								responseCodeFun(data);
							}
						},
						// 服务器错误提示
						// onLoadError: tableRequestError
					});
				})
		}
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			var end_day = 0
			if (days == -1){
				end_day = -1
			}
			$("#start_time").val(GetDateStr(days)+  '00:00:00');
			$("#end_time").val(GetDateStr(end_day) + '23:59:59');
			power_list = power_func()
			isloadedIp = false;
			show_table()
			showLoading();
			// getTableData($table);
		});

		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var c_type = $("#check_currency").val();
			var status_flag = $("#output_drain").val()
			var data = $('.no-records-found').val();
			power_list = power_func()
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/oddistributoin/export?start_time='+start_time+'&end_time='+end_time+'&orderby='+orderby+'&server_list='+power_list+'&c_type='+c_type+'&status_flag='+status_flag

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			// columns = []
			// isloadedIp = false;
			show_table()
			showLoading();
			// getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			// getTableDataCurrent($table);
		});

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.pid==0){
					string_test +='|' + obj.text
				}else{
					string_test +=',' + obj.s_uid
				}
			});
			var _idnex = (string_test.indexOf('|')) +1
			return (string_test.substring(_idnex))
		}

				// select
		$("#check_currency").change(function() {
			var option_value = $(this).val();
			// 获取被选中的text
			if (option_value!=0){
				var html_str = '<option value="0">请选择</option>'+
								'<option value="1">产出</option>'+
								'<option value="2">消耗</option>'
				$("#output_drain").html(html_str);
			}
		});
		$("#output_drain").unbind('click').click(function(){
			var output_drain_len =  $("#output_drain option").size()
			if(output_drain_len <=1){
				_self.ShowToast('info','请选择前一个');
			}
		})

		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}


	// 角色管理页面
	this.PageUserRole = function() {
		$(".feedback").remove();
		sidebarStatus('sys_config', '/config/');
		var isloaded = false;
		var $table = $("#table");
		$("#refresh").unbind('click').click(function() {
			isloaded = false;
			showLoading();
			getTableDataCurrent($table);
		});
		//  每条记录的操作
		function controlFormatter(value, row, index) {
			return [
				'<a href="/config/updaterole?id=' + htmlspecialchars(row.id) + '&role_name=' + htmlspecialchars(row.role_name) + '" type="button" class="set btn btn-primary btn-sm" style="margin: 5px;">修改</a>'
				// '<button type="button" class="remove btn btn-danger btn-sm" style="margin: 5px;">删除</button>'
			].join('');
		}
		window.control = {
			'click .remove': function(e, value, row, index) {
				$("#group_name").html(row.role_name);
				$("#group_name").attr("name",row.role_name);
				//  弹出视图
				$("#removeModal").modal('show');
				$("#btn_remove").unbind('click').click(function() {
					_self.AjaxPostData('/config/deleterole', {
						id: row.id
					}, function(data) {
						if(data.code == 0) {
							_self.ShowToast('success', '删除成功');
							$("#removeModal").modal('hide');
							isloaded = false;
							showLoading();
							getTableDataCurrent($table);
						} else {
							$("#removeModal").modal('hide');
						}
					});
				});
			}
		}

		$table.bootstrapTable({
			url: '/config/rolelist',
			idField: '',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			//				queryParams: queryParams,
			columns: [{
				field: 'role_name',
				title: '角色名称'
			},{
				field: 'role_describe',
				title: '角色描述'
			},{
				field: 'create_time',
				title: '创建时间'
			}, {
				field: 'control',
				title: '操作',
				events: control,
				formatter: controlFormatter
			}],
			onLoadSuccess: function(data) {
				if(data.code == 0) {
					isloaded = true;
					if(isloaded) {
						hideLoading();
					}
				}else if (data.code==30005){
					_self.ShowToast('error',data.msg);
				}else {
					responseCodeFun(data);
				}
			},
			onLoadError: tableRequestError
		});
	}
	// 添加角色
	this.PageAddUserRole = function() {
		$(".feedback").remove();
		sidebarStatus('sys_config', '/config/');

		var isLoadedTree = false;
		var checkdata = [];
		var dsk = [{
			"text": "研发后台",
			"href": '',
			"nodes": []
		}];
		_self.AjaxGetData('/config/getmenu', {

		}, function(data) {
			if(data.code == 0) {
				isLoadedTree = true;
				if(isLoadedTree) {
					hideLoading();
				}
				checkdata = data.rows;
				for(var i = 0; i < checkdata.length; i++) {

					var node = {
						"text": htmlspecialchars(checkdata[i]['name']),
						'href': htmlspecialchars(checkdata[i]['href']),
						'pid': htmlspecialchars(checkdata[i]['pid']),
						'id': htmlspecialchars(checkdata[i]['id'])
					};
					if(node.pid == 0) {
						node["nodes"] = [];
						dsk[0].nodes.push(node);
					} else {
						var parentslist = dsk[0].nodes;
						for(var j = 0; j < parentslist.length; j++) {
							var node2 = parentslist[j];
							if(node2.id == node.pid) {
								node["nodes"] = [];
								dsk[0].nodes[j].nodes.push(node);
							} else {
								var secondParentlist = node2.nodes;
								for(var k = 0; k < secondParentlist.length; k++) {
									var node3 = secondParentlist[k];
									if(node.pid == node3.id) {
										dsk[0].nodes[j].nodes[k].nodes.push(node);
									}
								}
							}
						}
					}
				}
				var defaultData = dsk;

				var $searchableTree = $('#treeview-checkable').treeview({
					data: defaultData,
					levels: 2,
					showCheckbox: true,
					showIcon: false,
					emptyIcon: '',
					nodeIcon: '',
					onNodeChecked: function(even, node) {
						checkNodes(node);
						checkParents(node);
					},
					onNodeUnchecked: function(even, node) {
						uncheckParents(node);
						uncheckNodes(node);
					},
					onNodeSelected: function(even, node) {

					},
					onNodeUnselected: function(even, node) {

					}

				});
				$("#btn_save").unbind('click').click(function() {
					var group_name = $("#group_name").val();
					var role_describe = $('#role_describe').val();
					var power_list = [];
					var checked = $searchableTree.treeview('getChecked', 0);
					$.each(checked, function(index, obj) {
						if(obj.href != '') {
							power_list.push(obj.id);
						}
					});
					if(group_name == '') {
						_self.ShowToast('error', '请输入用户组');
					} else if (power_list.length==0){
						_self.ShowToast('error','请为该角色选择权限')
					}
					else {
						_self.AjaxPostData('/config/addrole', {
							role_name: group_name,
							power_list: power_list.join(','),
							role_describe : role_describe,
						}, function(data) {
							if(data.code == 0) {
								_self.ShowToast('success', '添加成功');
								setTimeout(function() {
									window.location.href = '/config/';
								}, 500);
							} else {
								if(data.code == 30004) {
									_self.ShowToast('error', '请选择用户权限');
								}
							}
						});
					}
				});
			}
		});

		function checkNodes(node) {
			if(typeof(node.nodes) != "undefined") {
				for(var i = 0; i < node.nodes.length; i++) {
					$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
						silent: true
					}]);
					checkNodes(node.nodes[i]);
				}

			}
			checkParents(node);
		}

		function uncheckNodes(node) {
			if(typeof(node.nodes) != "undefined") {
				for(var i = 0; i < node.nodes.length; i++) {
					$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
						silent: true
					}]);
					uncheckNodes(node.nodes[i]);
				}
			}
		}

		function uncheckParents(node) {
			var parentNode = $('#treeview-checkable').treeview('getParent', node);
			if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
				var ischeck = false;
				for(var i = 0; i < parentNode.nodes.length; i++) {
					cNodes = parentNode.nodes[i];
					if(cNodes.state.checked) {
						ischeck = true;
						break;
					}
				}
				if(!ischeck) {
					$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
						silent: true
					}]);
					uncheckParents(parentNode);
				}

			}
		}

		function checkParents(node) {

			var parentNode = $('#treeview-checkable').treeview('getParent', node);

			if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
				if(typeof(parentNode.nodes) != "undefined") {

					$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
						silent: true
					}]);
					checkParents(parentNode);
				}
			}
		}

		function checkCrNodes() {
			var crNodeIds = [""];
			var checkdata = $('#treeview-checkable').treeview("getUnselected");

			for(var j = 0; j < crNodeIds.length; j++) {
				for(var i = 0; i < checkdata.length; i++) {
					if(checkdata[i].href == crNodeIds[j]) {
						var node = checkdata[i];
						$('#treeview-checkable').treeview('checkNode', [node, {
							silent: true
						}]);

						checkNodes(node);
						checkParents(node);
						break;
					}
				}
			}

		}

	}


	// 账号权限管理
	this.PageAddUserSecontrolRole = function() {
		$(".feedback").remove();
		sidebarStatus('sys_config', '/user/');
		var id = _self.GetParams('id');
		var isLoadedTree = false;
		var checkdata = [];
		var dsk = [{
			"text": "研发后台",
			"href": '',
			"nodes": []
		}];
		_self.AjaxGetData('/server/getservermenu', {

		}, function(data) {
			if(data.code == 0) {
				isLoadedTree = true;
				if(isLoadedTree) {
					hideLoading();
				}
				checkdata = data.rows;
				for(var i = 0; i < checkdata.length; i++) {

					var node = {
						"text": htmlspecialchars(checkdata[i]['name']),
						'href': htmlspecialchars(checkdata[i]['name']),
						'pid': htmlspecialchars(checkdata[i]['ch_id']),
						'id': htmlspecialchars(checkdata[i]['id']),
						's_uid': htmlspecialchars(checkdata[i]['s_uid'])
					};
					if(node.pid == 0) {
						node["nodes"] = [];
						dsk[0].nodes.push(node);
					} else {
						var parentslist = dsk[0].nodes;
						for(var j = 0; j < parentslist.length; j++) {
							var node2 = parentslist[j];
							if(node2.id == node.pid) {
								node["nodes"] = [];
								dsk[0].nodes[j].nodes.push(node);
							} 
						}
					}
				}
				var defaultData = dsk;

				var $searchableTree = $('#treeview-checkable').treeview({
					data: defaultData,
					levels: 2,
					showCheckbox: true,
					showIcon: false,
					emptyIcon: '',
					nodeIcon: '',
					onNodeChecked: function(even, node) {
						checkNodes(node);
						checkParents(node);
					},
					onNodeUnchecked: function(even, node) {
						uncheckParents(node);
						uncheckNodes(node);
					},
					onNodeSelected: function(even, node) {

					},
					onNodeUnselected: function(even, node) {

					}

				});
				$("#btn_save").unbind('click').click(function() {
					var power_list = [];
					var string_test = '';
					var checked = $('#treeview-checkable').treeview('getChecked', 0);
					$.each(checked, function(index, obj) {
						if (obj.pid==0){
							string_test +='|' + obj.text
						}else{
							string_test +=',' + obj.s_uid
						}
					});
					var _idnex = (string_test.indexOf('|')) +1
					power_list =  (string_test.substring(_idnex))
					if (power_list.length==0){
						_self.ShowToast('error','请为该角色选择权限')
					}
					else {
						_self.AjaxPostData('/server/add', {
							id:id,
							server_list: power_list,
						}, function(data) {
							if(data.code == 0) {
								_self.ShowToast('success', '添加成功');
								setTimeout(function() {
									window.location.href = '/user/';
								}, 500);
							} else {
								if(data.code == 20004) {
									_self.ShowToast('error', '玩家信息不存在');
								}else if (data.code==20005){
									_self.ShowToast('warning','没有权限');
								}
							}
						});
					}
				});
			}
		});

		function checkNodes(node) {
			if(typeof(node.nodes) != "undefined") {
				for(var i = 0; i < node.nodes.length; i++) {
					$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
						silent: true
					}]);
					checkNodes(node.nodes[i]);
				}

			}
			checkParents(node);
		}

		function uncheckNodes(node) {
			if(typeof(node.nodes) != "undefined") {
				for(var i = 0; i < node.nodes.length; i++) {
					$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
						silent: true
					}]);
					uncheckNodes(node.nodes[i]);
				}
			}
		}

		function uncheckParents(node) {
			var parentNode = $('#treeview-checkable').treeview('getParent', node);
			if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
				var ischeck = false;
				for(var i = 0; i < parentNode.nodes.length; i++) {
					cNodes = parentNode.nodes[i];
					if(cNodes.state.checked) {
						ischeck = true;
						break;
					}
				}
				if(!ischeck) {
					$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
						silent: true
					}]);
					uncheckParents(parentNode);
				}

			}
		}

		function checkParents(node) {

			var parentNode = $('#treeview-checkable').treeview('getParent', node);

			if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
				if(typeof(parentNode.nodes) != "undefined") {

					$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
						silent: true
					}]);
					checkParents(parentNode);
				}
			}
		}

		function checkCrNodes() {
			var crNodeIds = [""];
			var checkdata = $('#treeview-checkable').treeview("getUnselected");

			for(var j = 0; j < crNodeIds.length; j++) {
				for(var i = 0; i < checkdata.length; i++) {
					if(checkdata[i].href == crNodeIds[j]) {
						var node = checkdata[i];
						$('#treeview-checkable').treeview('checkNode', [node, {
							silent: true
						}]);

						checkNodes(node);
						checkParents(node);
						break;
					}
				}
			}

		}

	}



	// 菜单管理页面
	this.PageMenuList = function() {
		$(".feedback").remove();
		sidebarStatus('sys_config', '/config/menu');
		var isloaded = false;
		var $table = $("#table");
		$("#refresh").unbind('click').click(function() {
			isloaded = false;
			showLoading();
			getTableDataCurrent($table);
		});
		//  每条记录的操作
		function controlFormatter(value, row, index) {
			return [
				'<a href="/config/addmenu?id=' + htmlspecialchars(row.id) +'" type="button" class="set btn btn-primary btn-sm" style="margin: 5px;">修改</a>',
				'<button type="button" class="remove btn btn-danger btn-sm" style="margin: 5px;">删除</button>'
			].join('');
		}
		window.control = {
			'click .remove': function(e, value, row, index) {
				$("#group_name").html(row.name);
				//  弹出视图
				$("#removeModal").modal('show');
				$("#btn_remove").unbind('click').click(function() {
					_self.AjaxPostData('/config/deletemenu', {
						id: row.id
					}, function(data) {
						if(data.code == 0) {
							_self.ShowToast('success', '删除成功');
							$("#removeModal").modal('hide');
							isloaded = false;
							showLoading();
							getTableDataCurrent($table);
						} else if(data.code==1) {
							_self.ShowToast('error','操作失败')
							$("#removeModal").modal('hide');
						}else{
							$('#removeModal').modal('hide');
						}
					});
				});
			}
		}

		$table.bootstrapTable({
			url: '/config/menulist',
			idField: '',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			//				queryParams: queryParams,
			columns: [{
				field: 'id',
				title: '菜单ID'
			},{
				field: 'name',
				title: '菜单名称'
			},{
				field: 'pid',
				title: 'PID'
			},{
				field: 'link',
				title: '链接'
			}, {
				field: 'target',
				title: '目标定位'
			},{
				field: 'create_time',
				title: '创建时间'
			},{
				field: 'control',
				title: '操作',
				events: control,
				formatter: controlFormatter
			}],
			onLoadSuccess: function(data) {
				if(data.code == 0) {
					isloaded = true;
					if(isloaded) {
						hideLoading();
					}
				}else if(data.code==1){
					window.location.href = '/login/'
				} 
				else {
					responseCodeFun(data);
				}
			},
			onLoadError: tableRequestError
		});
	}
	// 添加模板
	this.PageAddSysMenu = function() {
		$(".feedback").remove();
		sidebarStatus('sys_config', '/config/menu');

		var isLoadedTree = false;
		
		$("#btn_save").unbind('click').click(function() {
			var m_id = $('#m_id').val();
			var menu_name = $("#menu_name").val();
			var link = $('#menu_link').val();
			var pid = $('#menu_p_id').val();
			var target = $('#target').val(); 
			var icon = $("#icon").val();
			var priority = $("#priority").val();
			if(menu_name == '') {
				_self.ShowToast('error', '请输入用菜单名称');
			}else if(link == ''){
				_self.ShowToast('error','请输入菜单链接!')
			} 
			else {
				_self.AjaxPostData('/config/addmenu', {
					menu_name: menu_name,
					link: link,
					pid: pid,
					target: target,
					m_id: m_id,
					icon: icon,
					priority : priority
				}, function(data) {
					if(data.code == 0) {
						_self.ShowToast('success', '添加成功');
						setTimeout(function() {
							window.location.href = '/config/menu';
						}, 500);
					} else {
						responseCodeFun(data)
					}
				});
			}
		});
	}

	// 修改角色访问权限
	this.PageUpdateUserRole = function() {
		$(".feedback").remove();
		sidebarStatus('sys_config', '/config/');

		var id = _self.GetParams('id');
		var role_name = _self.GetParams('role_name');
		$("#role_name").val(htmlspecialchars(role_name));

		var isLoadedTree = false;
		var checkdata = [];
		var dsk = [{
			"text": "研发开发",
			"href": '',
			"nodes": [],
			'state': {
				checked: true
			}
		}];
		_self.AjaxGetData('/config/getmenu', {

		}, function(data) {
			if(data.code == 0) {
				isLoadedTree = true;
				if(isLoadedTree) {
					hideLoading();
				}
				checkdata = data.rows;
				for(var i = 0; i < checkdata.length; i++) {

					var node = {
						"text": htmlspecialchars(checkdata[i]['name']),
						'href': htmlspecialchars(checkdata[i]['href']),
						'pid': htmlspecialchars(checkdata[i]['pid']),
						'id': htmlspecialchars(checkdata[i]['id'])
					};
					if(node.pid == 0) {
						node["nodes"] = [];
						dsk[0].nodes.push(node);
					} else {
						var parentslist = dsk[0].nodes;
						for(var j = 0; j < parentslist.length; j++) {
							var node2 = parentslist[j];
							if(node2.id == node.pid) {
								node["nodes"] = [];
								dsk[0].nodes[j].nodes.push(node);
							} else {
								var secondParentlist = node2.nodes;
								for(var k = 0; k < secondParentlist.length; k++) {
									var node3 = secondParentlist[k];
									if(node.pid == node3.id) {
										dsk[0].nodes[j].nodes[k].nodes.push(node);
									}
								}
							}
						}
					}
				}
				var defaultData = dsk;

				var $searchableTree = $('#treeview-checkable').treeview({
					data: defaultData,
					levels: 2,
					showCheckbox: true,
					showIcon: false,
					emptyIcon: '',
					nodeIcon: '',
					onNodeChecked: function(even, node) {
						checkNodes(node);
						checkParents(node);
					},
					onNodeUnchecked: function(even, node) {
						uncheckParents(node);
						uncheckNodes(node);
					},
					onNodeSelected: function(even, node) {

					},
					onNodeUnselected: function(even, node) {

					}

				});
				$("#btn_save").unbind('click').click(function() {
					var group_name = $("#role_name").val();
					var power_list = [];
					var checked = $searchableTree.treeview('getChecked', 0);
					$.each(checked, function(index, obj) {
						if(obj.href != 0) {
							power_list.push(obj.id);
						}
					});
					if (power_list.length>0){
						if(group_name != '' && power_list.length != 0) {
							_self.AjaxPostData('/config/updaterole', {
								id: id,
								menu_ids: power_list.toString()
							}, function(data) {
								if(data.code == 0) {
									_self.ShowToast('success', '修改成功');
									setTimeout(function() {
										window.location.href = '/config/';
									}, 1000);
								} else {
									if(data.code == 30004) {
										_self.ShowToast('warning', data.msg);
										setTimeout(function() {
										window.location.href = '/config/';
									}, 1000);
									}

								}
							});
						} else {
							if(group_name == '') {
								_self.ShowToast('error', '请输入用户组');
							}
							if(power_list.length == 0) {
								_self.ShowToast('error', '请选择用户权限');
							}

						}
					}else{
						_self.ShowToast('warning','请选择菜单')
					}
				});
			}
		});

		function checkNodes(node) {
			if(typeof(node.nodes) != "undefined") {
				for(var i = 0; i < node.nodes.length; i++) {
					$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
						silent: true
					}]);
					checkNodes(node.nodes[i]);
				}

			}
			checkParents(node);
		}

		function uncheckNodes(node) {
			if(typeof(node.nodes) != "undefined") {
				for(var i = 0; i < node.nodes.length; i++) {
					$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
						silent: true
					}]);
					uncheckNodes(node.nodes[i]);
				}
			}
		}

		function uncheckParents(node) {
			var parentNode = $('#treeview-checkable').treeview('getParent', node);
			if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
				var ischeck = false;
				for(var i = 0; i < parentNode.nodes.length; i++) {
					cNodes = parentNode.nodes[i];
					if(cNodes.state.checked) {
						ischeck = true;
						break;
					}
				}
				if(!ischeck) {
					$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
						silent: true
					}]);
					uncheckParents(parentNode);
				}

			}
		}

		function checkParents(node) {

			var parentNode = $('#treeview-checkable').treeview('getParent', node);

			if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
				if(typeof(parentNode.nodes) != "undefined") {

					$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
						silent: true
					}]);
					checkParents(parentNode);
				}
			}
		}

		function checkCrNodes() {
			var crNodeIds = [""];
			var checkdata = $('#treeview-checkable').treeview("getUnselected");

			for(var j = 0; j < crNodeIds.length; j++) {
				for(var i = 0; i < checkdata.length; i++) {
					if(checkdata[i].href == crNodeIds[j]) {
						var node = checkdata[i];
						$('#treeview-checkable').treeview('checkNode', [node, {
							silent: true
						}]);

						checkNodes(node);
						checkParents(node);
						break;
					}
				}
			}

		}

	}

	// 用户列表界面
	this.PageUserList = function() {
		$(".feedback").remove();
		sidebarStatus('sys_config', '/user/');
		var isloaded = false;
		var $table = $("#table");
		$("#refresh").unbind('click').click(function() {
			isloaded = false;
			showLoading();
			getTableDataCurrent($table);
		});
		//  每条记录的操作
		function controlFormatter(value, row, index) {
			var str_html = '<a href="/user/updatetorole?id=' + htmlspecialchars(row.id) + '&login_name=' + htmlspecialchars(row.login_name) + '" type="button" class="set btn btn-primary btn-sm" style="margin: 5px;float:left">修改</a>'
			var str_name  = ''
			if (row.delete_flag==0){
				str_name = '禁用'
			}else{
				str_name = '启用'
			}
			if (row.admin_flag==0){
				str_html+='<button type="button" class="remove btn btn-danger btn-sm" style="margin: 5px;float:left">'+str_name+'</button>'
			}
			str_html += '<a href="/server/?id=' + htmlspecialchars(row.id) + '&login_name=' + htmlspecialchars(row.login_name) + '" type="button" class="set btn btn-primary btn-sm" style="margin: 5px;float:left">权限设置</a>'
			// if (row.self_flag==false && row.admin_flag==1){
			// 	str_html = '';
			// }
			return str_html
			// return [
			// 	'<a href="/user/updatetorole?id=' + htmlspecialchars(row.id) + '&login_name=' + htmlspecialchars(row.login_name) + '" type="button" class="set btn btn-primary btn-sm" style="margin: 5px;">修改</a>',
			// 	'<button type="button" class="remove btn btn-danger btn-sm" style="margin: 5px;">删除</button>'
			// ].join('');
		}
		window.control = {
			'click .remove': function(e, value, row, index) {
				$("#group_name").html(row.login_name);
				//  弹出视图
				$("#removeModal").modal('show');
				$("#btn_remove").unbind('click').click(function() {
					_self.AjaxPostData('/user/delete', {
						id: row.id,
						delete_flag: row.delete_flag
					}, function(data) {
						if(data.code == 0) {
							_self.ShowToast('success', data.msg);
							$("#removeModal").modal('hide');
							isloaded = false;
							showLoading();
							getTableDataCurrent($table);
						} else {
							$("#removeModal").modal('hide');
						}
					});
				});
			}
		}

		$table.bootstrapTable({
			url: '/user/list',
			idField: '',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			//				queryParams: queryParams,
			columns: [{
				field: 'login_name',
				title: '用户账号'
			},{
				field: 'login_num',
				title: '登录次数'
			},{
				field: 'last_login_time',
				title: '最近登录时间'
			},{
				field: 'create_time',
				title: '创建时间'
			}, {
				field: 'control',
				title: '操作',
				events: control,
				formatter: controlFormatter
			}],
			onLoadSuccess: function(data) {
				if(data.code == 0) {
					isloaded = true;
					if(isloaded) {
						hideLoading();
					}
				} else {
					responseCodeFun(data);
				}
			},
			onLoadError: tableRequestError
		});
	}

	// 添加用户
	this.PageAddUser = function() {
		$(".feedback").remove();
		sidebarStatus('sys_config', '/user/');

		var isLoadedTree = false;
		var checkdata = [];
		var dsk = [{
			"text": "所有角色",
			"href": '',
			"nodes": []
		}];
		_self.AjaxGetData('/config/rolelists', {

		}, function(data) {
			if(data.code == 0) {
				isLoadedTree = true;
				if(isLoadedTree) {
					hideLoading();
				}
				checkdata = data.rows;
				for(var i = 0; i < checkdata.length; i++) {

					var node = {
						"text": htmlspecialchars(checkdata[i]['role_name']),
						'href': htmlspecialchars(checkdata[i]['role_name']),
						'pid': htmlspecialchars(checkdata[i]['pid']),
						'id': htmlspecialchars(checkdata[i]['id'])
					};
					node["nodes"] = [];
					dsk[0].nodes.push(node);
					
				}
				var defaultData = dsk;

				var $searchableTree = $('#treeview-checkable').treeview({
					data: defaultData,
					levels: 2,
					showCheckbox: true,
					showIcon: false,
					emptyIcon: '',
					nodeIcon: '',
					onNodeChecked: function(even, node) {
						checkNodes(node);
						checkParents(node);
					},
					onNodeUnchecked: function(even, node) {
						uncheckParents(node);
						uncheckNodes(node);
					},
					onNodeSelected: function(even, node) {

					},
					onNodeUnselected: function(even, node) {

					}

				});
				$("#btn_save").unbind('click').click(function() {
					var login_name = $("#login_name").val();
					var password = $('#password').val();
					var confirm_password = $('#confirm_password').val()
					var power_list = [];
					var checked = $searchableTree.treeview('getChecked', 0);
					$.each(checked, function(index, obj) {
						if(obj.href != '') {
							power_list.push(obj.id);
						}
					});
					if(login_name == '') {
						_self.ShowToast('error', '请输入登录账号名称');
					}else if (password==''){
						_self.ShowToast('error','请输入密码')
					} else if (confirm_password==''){
						_self.ShowToast('error','请输入确认密码')
					} else if(password!=confirm_password){
						_self.ShowToast('error','两次输入密码不一致')
					} else if (power_list.length==0){
						_self.ShowToast('error','请选择角色')
					}else {
						_self.AjaxPostData('/user/add', {
							login_name: login_name,
							role_ids: power_list.join(','),
							password : password,
							confirm_password: confirm_password,
						}, function(data) {
							if(data.code == 0) {
								_self.ShowToast('success', '添加成功');
								setTimeout(function() {
									window.location.href = '/user/';
								}, 500);
							}else if(data.code==30002){
								_self.ShowToast('error',data.msg)
							} 
							else {
								if(data.code == 30004) {
									_self.ShowToast('error', '请选择用户权限');
								}
							}
						});
					}
				});
			}
		});

		function checkNodes(node) {
			if(typeof(node.nodes) != "undefined") {
				for(var i = 0; i < node.nodes.length; i++) {
					$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
						silent: true
					}]);
					checkNodes(node.nodes[i]);
				}

			}
			checkParents(node);
		}

		function uncheckNodes(node) {
			if(typeof(node.nodes) != "undefined") {
				for(var i = 0; i < node.nodes.length; i++) {
					$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
						silent: true
					}]);
					uncheckNodes(node.nodes[i]);
				}
			}
		}

		function uncheckParents(node) {
			var parentNode = $('#treeview-checkable').treeview('getParent', node);
			if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
				var ischeck = false;
				for(var i = 0; i < parentNode.nodes.length; i++) {
					cNodes = parentNode.nodes[i];
					if(cNodes.state.checked) {
						ischeck = true;
						break;
					}
				}
				if(!ischeck) {
					$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
						silent: true
					}]);
					uncheckParents(parentNode);
				}

			}
		}

		function checkParents(node) {

			var parentNode = $('#treeview-checkable').treeview('getParent', node);

			if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
				if(typeof(parentNode.nodes) != "undefined") {

					$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
						silent: true
					}]);
					checkParents(parentNode);
				}
			}
		}

		function checkCrNodes() {
			var crNodeIds = [""];
			var checkdata = $('#treeview-checkable').treeview("getUnselected");

			for(var j = 0; j < crNodeIds.length; j++) {
				for(var i = 0; i < checkdata.length; i++) {
					if(checkdata[i].href == crNodeIds[j]) {
						var node = checkdata[i];
						$('#treeview-checkable').treeview('checkNode', [node, {
							silent: true
						}]);

						checkNodes(node);
						checkParents(node);
						break;
					}
				}
			}

		}

	}

	// 修改用户所属的角色
	this.PageUpdateUser = function() {
		$(".feedback").remove();
		sidebarStatus('sys_config', '/user/');

		var id = _self.GetParams('id');
		var role_name = _self.GetParams('login_name');
		$("#login_name").val(htmlspecialchars(role_name));

		var isLoadedTree = false;
		var checkdata = [];
		var dsk = [{
			"text": "所有角色",
			"href": '',
			"nodes": [],
			'state': {
				checked: true
			}
		}];
		_self.AjaxGetData('/config/rolelists', {

		}, function(data) {
			if(data.code == 0) {
				isLoadedTree = true;
				if(isLoadedTree) {
					hideLoading();
				}
				checkdata = data.rows;
				for(var i = 0; i < checkdata.length; i++) {

					var node = {
						"text": htmlspecialchars(checkdata[i]['role_name']),
						'href': htmlspecialchars(checkdata[i]['role_name']),
						'pid': htmlspecialchars(checkdata[i]['pid']),
						'id': htmlspecialchars(checkdata[i]['id'])
					};
					node["nodes"] = [];
					dsk[0].nodes.push(node);
				}
				var defaultData = dsk;

				var $searchableTree = $('#treeview-checkable').treeview({
					data: defaultData,
					levels: 2,
					showCheckbox: true,
					showIcon: false,
					emptyIcon: '',
					nodeIcon: '',
					onNodeChecked: function(even, node) {
						checkNodes(node);
						checkParents(node);
					},
					onNodeUnchecked: function(even, node) {
						uncheckParents(node);
						uncheckNodes(node);
					},
					onNodeSelected: function(even, node) {

					},
					onNodeUnselected: function(even, node) {

					}

				});
				$("#btn_save").unbind('click').click(function() {
					var group_name = $("#login_name").val();
					var power_list = [];
					var checked = $searchableTree.treeview('getChecked', 0);
					$.each(checked, function(index, obj) {
						if(obj.href != 0) {
							power_list.push(obj.id);
						}
					});
					if (power_list.length>0){
						if(group_name != '' && power_list.length != 0) {
							_self.AjaxPostData('/user/updatetorole', {
								id: id,
								role_ids: power_list.toString()
							}, function(data) {
								if(data.code == 0) {
									_self.ShowToast('success', '修改成功');
									setTimeout(function() {
										window.location.href = '/user/';
									}, 1000);
								} else {
									if(data.code == 30004) {
										_self.ShowToast('warning', data.msg);
										setTimeout(function() {
										window.location.href = '/user/';
									}, 1000);
									}

								}
							});
						} else {
							if(group_name == '') {
								_self.ShowToast('error', '请输入用户组');
							}
							if(power_list.length == 0) {
								_self.ShowToast('error', '请选择用户权限');
							}

						}
					}else{
						_self.ShowToast('warning','请选择菜单')
					}
				});
			}
		});

		function checkNodes(node) {
			if(typeof(node.nodes) != "undefined") {
				for(var i = 0; i < node.nodes.length; i++) {
					$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
						silent: true
					}]);
					checkNodes(node.nodes[i]);
				}

			}
			checkParents(node);
		}

		function uncheckNodes(node) {
			if(typeof(node.nodes) != "undefined") {
				for(var i = 0; i < node.nodes.length; i++) {
					$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
						silent: true
					}]);
					uncheckNodes(node.nodes[i]);
				}
			}
		}

		function uncheckParents(node) {
			var parentNode = $('#treeview-checkable').treeview('getParent', node);
			if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
				var ischeck = false;
				for(var i = 0; i < parentNode.nodes.length; i++) {
					cNodes = parentNode.nodes[i];
					if(cNodes.state.checked) {
						ischeck = true;
						break;
					}
				}
				if(!ischeck) {
					$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
						silent: true
					}]);
					uncheckParents(parentNode);
				}

			}
		}

		function checkParents(node) {

			var parentNode = $('#treeview-checkable').treeview('getParent', node);

			if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
				if(typeof(parentNode.nodes) != "undefined") {

					$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
						silent: true
					}]);
					checkParents(parentNode);
				}
			}
		}

		function checkCrNodes() {
			var crNodeIds = [""];
			var checkdata = $('#treeview-checkable').treeview("getUnselected");

			for(var j = 0; j < crNodeIds.length; j++) {
				for(var i = 0; i < checkdata.length; i++) {
					if(checkdata[i].href == crNodeIds[j]) {
						var node = checkdata[i];
						$('#treeview-checkable').treeview('checkNode', [node, {
							silent: true
						}]);

						checkNodes(node);
						checkParents(node);
						break;
					}
				}
			}

		}

	}


	//用户产出消耗查询
	this.PageuseroutSearch = function() {
		var count = 0;
		var data8;
		sidebarStatus('user_manage', '/userout/');
		var $searchableTree;
		var power_list = '';
		$(".feedback").remove();
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		$('#start_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate : ymd + ' 00:00:00'
		});
		$('#end_time').datetimepicker({
			useCurrent: false,
			locale: 'zh-cn',
			format: 'YYYY-MM-DD HH:mm:ss',
			viewDate: ymd + ' 23:59:59'
		});
		$("#start_time").on("dp.change", function(e) {
			$('#end_time').data("DateTimePicker").minDate(e.date);
		});
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		screen()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "产出消耗过滤",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/userout/getmodemenu', {

			}, function(data) {
				data8 = data;
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['pid']),
							'id': htmlspecialchars(checkdata[i]['id'])
						};
						if(node.pid == 0) {
							node["nodes"] = [];
							dsk[0].nodes.push(node);
						} else {
							var parentslist = dsk[0].nodes;
							for(var j = 0; j < parentslist.length; j++) {
								var node2 = parentslist[j];
								if(node2.id == node.pid) {
									node["nodes"] = [];
									dsk[0].nodes[j].nodes.push(node);
								} else {
									var secondParentlist = node2.nodes;
									for(var k = 0; k < secondParentlist.length; k++) {
										var node3 = secondParentlist[k];
										if(node.pid == node3.id) {
											dsk[0].nodes[j].nodes[k].nodes.push(node);
										}
									}
								}
							}
						}
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 2,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function queryParams(params) {
			params["start_time"] = $("#start_time").val();
			params["end_time"] = $("#end_time").val();
			params['cm_list'] = power_list;
			params['goods'] = $('#goods').val();
			params['playerIds'] = $('#playerId').val();
			params['s_uid'] = $('#servers').val();
			params['count'] = count;
			params['c_type'] = 3
			return params;
		}


		$table.bootstrapTable({
			url: '/userout/checkfilter2',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			striped : true,
			order : 'desc',
			// showColumns: true,
			columns: [{
				field: 'server',
				title: '服务器',
				titleTooltip: "选择的当前服务器",
			}, {
				field: 'uid',
				title: '账号ID',
				titleTooltip: "选择的玩家的账号ID",
			}, {
				field: 'pid',
				title: '玩家ID',
				titleTooltip: "选择的玩家的ID",
			}, {
				field: 'type',
				title: '出处',
				titleTooltip: "选择的物品出处",
			}, {
				field: 'time',
				title: '时间',
				titleTooltip: "物品产出的时间",
				sortable: true, //是否可排序
                order: "desc", //默认排序方式
			}, {
				field: 'diff',
				title: '记录',
				titleTooltip: "",
			}, {
				field: 'guild_id',
				title: '冒险团ID',
				titleTooltip: "所属冒险团的id",
			}],
			onLoadSuccess: function(data) {
				// if (count==0){
				// 	_self.ShowToast('info','首次不显示数据');
				// }
				count +=1;
				if (data.code==1){
					window.location.href = '/login/'
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
					if (data.server_check==false && count >1){

						_self.ShowToast('info','请选出处')
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$(".btn-time").unbind('click').click(function() {
			var $this = this;
			var days = parseInt($($this).attr('value'));
			$("#start_time").val(GetDateStr(days));
			$("#end_time").val(GetDateStr(0));
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func();
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/data/export?start_time='+start_time+'&end_time='+end_time+'&orderby='+orderby+'&server_list='+power_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});

		// select
		$("#goods").change(function() {
			var option_value = $(this).val();
			// 获取被选中的text
			if (option_value!=0){
				var html_str = '<option value="0">请选择</option>'
				for (var b=1;b<=option_value;b++){
					html_str +='<option value="'+b.toString()+'">'+"物品"+b.toString() +'</option>'
				}
				$("#goods2").html(html_str);
				$.ajax({
					type: "post",
					url: '/userout/goods',
					data: {"a":"aa"},
					success: function(data) {
						if(data.code==0){
						}else{
							_self.ShowToast('error',data.msg);
						}
					},
					error: function() {
						_self.ShowToast('error','服务器错误!')
					}
				});
			}
		});

		$("#goods2").unbind('click').click(function(){
			var goods2_len =  $("#goods2 option").size()
			if(goods2_len <=1){
				_self.ShowToast('info','请选择前一个');
			}
		})

		function power_func(){
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.pid>'0'){
					console.log(obj.id,obj.pid)
					string_test +=',' + obj.id
				}
			});
			var _idnex = (string_test.indexOf(',')) +1
			return string_test.substring(_idnex);
			return string_test
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}



	//冒险团boss记录
	this.PageguidbossrecordSearch = function() {
		var count = 0;
		var data8;
		sidebarStatus('guild_summary', '/guidbossrecord/');
		var $searchableTree;
		var power_list = '[]';
		$(".feedback").remove();
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		screen()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "产出消耗过滤",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/userout/getmodemenu', {

			}, function(data) {
				data8 = data;
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['pid']),
							'id': htmlspecialchars(checkdata[i]['id'])
						};
						if(node.pid == 0) {
							node["nodes"] = [];
							dsk[0].nodes.push(node);
						} else {
							var parentslist = dsk[0].nodes;
							for(var j = 0; j < parentslist.length; j++) {
								var node2 = parentslist[j];
								if(node2.id == node.pid) {
									node["nodes"] = [];
									dsk[0].nodes[j].nodes.push(node);
								} else {
									var secondParentlist = node2.nodes;
									for(var k = 0; k < secondParentlist.length; k++) {
										var node3 = secondParentlist[k];
										if(node.pid == node3.id) {
											dsk[0].nodes[j].nodes[k].nodes.push(node);
										}
									}
								}
							}
						}
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 2,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function queryParams(params) {
			params['s_uid'] = $('#servers').val();
			params['guildid'] = $('#GuildId').val();
			params['guidlname'] = $('#GuildName').val();
			return params;
		}

		function controlFormatter(value, row, index) {
			var str_html = '<a data-toggle="modal" class="btn btn-default btn-sm" data-target="#modal_'+htmlspecialchars(row.id)+'" href="/guidbossrecord/rewardboss?pid='+htmlspecialchars(row.id)+'">查看</a>'
			var modal_html = '<div class="modal fade" id="modal_'+htmlspecialchars(row.id)+'">'+
							    '<div class="modal-dialog" style="width: 700px">'+
							        '<div class="modal-content"></div>'+
							    '</div>'+
							'</div>'
			$("#manary_modal").append(modal_html)
			return str_html
		}
		$table.bootstrapTable({
			url: '/guidbossrecord/checkfilter',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			striped : true,
			order : 'desc',
			// showColumns: true,
			columns: [{
				field: 'boss_id',
				title: 'bossId',
				titleTooltip: "挑战boss的id",
			}, {
				field: 'start_time',
				title: 'boss开启时间',
				titleTooltip: "boss开启时间",
			}, {
				field: 'end_time',
				title: 'boss结束时间',
				titleTooltip: "boss结束时间",
			}, {
				field: 'result',
				title: '战果',
				titleTooltip: "挑战boss是否成功",
			}, {
				field: 'result',
				title: '排行榜',
				titleTooltip: "查看boss挑战的玩家信息",
				formatter:controlFormatter
			}],
			onLoadSuccess: function(data) {

				if (data.code==1){
					window.location.href = '/login/'
				}
				if (data.code==20005){
					_self.ShowToast('info',' 输入冒险团id');
				}else if (data.code ==20006){
					_self.ShowToast('info','选择服务器');
				}
				if(data.code == 0) {
					console.log(typeof(data))
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		// $(".btn-time").unbind('click').click(function() {
		// 	var $this = this;
		// 	var days = parseInt($($this).attr('value'));
		// 	$("#start_time").val(GetDateStr(days));
		// 	$("#end_time").val(GetDateStr(0));
		// 	power_list = power_func()
		// 	isloadedIp = false;
		// 	showLoading();
		// 	getTableData($table);
		// });
		$("#download_data").click(function(){
			var start_time = $('#start_time').val();
			var end_time = $('#end_time').val();
			var orderby = $('#order').val();
			var data = $('.no-records-found').val();
			power_list = power_func();
			if(data==''){
				_self.ShowToast('warning','没有对应的数据');
			}else{
				window.location.href = '/data/export?start_time='+start_time+'&end_time='+end_time+'&orderby='+orderby+'&server_list='+power_list

			}

		});
		$("#search").unbind('click').click(function() {
			power_list = power_func()
			var s_uid = $('#servers').val();
			if (s_uid==''){
				_self.ShowToast('info','选择服务器');
				return false;
			}
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#test123").unbind('click').click(function() {
			alert(111)
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func()
			var s_uid = $('#servers').val();
			if (s_uid==''){
				_self.ShowToast('info','选择服务器');
				return false;
			}
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});



		function power_func(){
			var power_lists = [];
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if(obj.href != '' && obj.pid!='0') {
					power_lists.push(obj.text);
				}
			});
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.pid==0){
					string_test +='|' + obj.text
				}else{
					string_test +=',' + obj.text
				}
			});
			var _idnex = (string_test.indexOf('|')) +1
			return string_test.substring(_idnex);
			// return JSON.stringify(power_lists)
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}




	//冒险团消息记录
	this.PageguidopmsgSearch = function() {
		var count = 0;
		var data8;
		sidebarStatus('guild_summary', '/guidbossrecord/guildopmsg');
		var $searchableTree;
		var power_list = '[]';
		$(".feedback").remove();
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		
		screen()
		// 服务器列表 
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "产出消耗过滤",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/userout/getmodemenu', {

			}, function(data) {
				data8 = data;
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['pid']),
							'id': htmlspecialchars(checkdata[i]['id'])
						};
						if(node.pid == 0) {
							node["nodes"] = [];
							dsk[0].nodes.push(node);
						} else {
							var parentslist = dsk[0].nodes;
							for(var j = 0; j < parentslist.length; j++) {
								var node2 = parentslist[j];
								if(node2.id == node.pid) {
									node["nodes"] = [];
									dsk[0].nodes[j].nodes.push(node);
								} else {
									var secondParentlist = node2.nodes;
									for(var k = 0; k < secondParentlist.length; k++) {
										var node3 = secondParentlist[k];
										if(node.pid == node3.id) {
											dsk[0].nodes[j].nodes[k].nodes.push(node);
										}
									}
								}
							}
						}
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 2,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}
		function queryParams(params) {
			params['s_uid'] = $('#servers').val();
			params['guildid'] = $('#GuildId').val();
			params['guildname'] = $('#GuildName').val();
			return params;
		}

		// function controlFormatter(value, row, index) {
		// 	var str_html = '<a data-toggle="modal" class="btn btn-default btn-sm" data-target="#modal_'+htmlspecialchars(row.id)+'" href="/guidbossrecord/rewardboss?pid='+htmlspecialchars(row.id)+'">查看</a>'
		// 	var modal_html = '<div class="modal fade" id="modal_'+htmlspecialchars(row.id)+'">'+
		// 					    '<div class="modal-dialog" style="width: 700px">'+
		// 					        '<div class="modal-content"></div>'+
		// 					    '</div>'+
		// 					'</div>'
		// 	$("#manary_modal").append(modal_html)
		// 	return str_html
		// }
		$table.bootstrapTable({
			url: '/guidbossrecord/checkfilterguildopmsg',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			striped : true,
			order : 'desc',
			// showColumns: true,
			columns: [{
				field: 'guild_id',
				title: '冒险团id',
				titleTooltip: "选择的冒险团的id",
			}, {
				field: 'server_name',
				title: '服务器',
				titleTooltip: "选择的冒险团所在的服务器",
			}, {
				field: 'operate',
				title: '操作',
				titleTooltip: "冒险团的操作",
			}, {
				field: 'level',
				title: '提升后等级',
				titleTooltip: "冒险团提升后的等级",
			}, {
				field: 'up_start_time',
				title: '开始升级时间',
				titleTooltip: "冒险团开始升级的时间",
			}, {
				field: 'up_end_time',
				title: '升级结束时间',
				titleTooltip: "冒险团升级结束的时间",
			}, {
				field: 'player_id',
				title: '创建的玩家id',
				titleTooltip: "该条记录操作者的id",
			}, {
				field: 'create_time',
				title: '创建时间',
				titleTooltip: "冒险团的创建时间",
			}, {
				field: 'disband_time',
				title: '解散时间',
				titleTooltip: "冒险团的解散时间",
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if (data.code==20005){
					_self.ShowToast('info',' 输入冒险团id');
				}else if (data.code ==20006){
					_self.ShowToast('info','选择服务器');
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		// $("#download_data").click(function(){
		// 	var start_time = $('#start_time').val();
		// 	var end_time = $('#end_time').val();
		// 	var orderby = $('#order').val();
		// 	var data = $('.no-records-found').val();
		// 	power_list = power_func();
		// 	if(data==''){
		// 		_self.ShowToast('warning','没有对应的数据');
		// 	}else{
		// 		window.location.href = '/data/export?start_time='+start_time+'&end_time='+end_time+'&orderby='+orderby+'&server_list='+power_list

		// 	}

		// });
		$("#search").unbind('click').click(function() {
			// power_list = power_func()
			var s_uid = $('#servers').val();
			if (s_uid==''){
				_self.ShowToast('info','选择服务器');
				return false;
			}
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			// power_list = power_func()
			var s_uid = $('#servers').val();
			if (s_uid==''){
				_self.ShowToast('info','选择服务器');
				return false;
			}
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});



		function power_func(){
			var power_lists = [];
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if(obj.href != '' && obj.pid!='0') {
					power_lists.push(obj.text);
				}
			});
			var string_test = '';
			var checked = $searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.pid==0){
					string_test +='|' + obj.text
				}else{
					string_test +=',' + obj.text
				}
			});
			var _idnex = (string_test.indexOf('|')) +1
			return string_test.substring(_idnex);
			// return JSON.stringify(power_lists)
		}
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}



	//冒险团产出消耗记录
	this.PageguidoutputconSearch = function() {
		var count = 0;
		var data8;
		sidebarStatus('guild_summary', '/guidbossrecord/guildoutputcon');
		var $searchableTree;
		var $searchableTree2;
		var power_list = '';
		var power_list2 = ''
		$(".feedback").remove();
		var ymd = (new Date()).toLocaleDateString()
		ymd = ymd.replace(/\//g,'-')
		var $table = $("#table");
		var requestTime = 0;
		var isloadedIp = false;
		
		$("#screen2").unbind('click').click(function() {
			$("#removeModal2").modal('show');
		});
		$("#screen").unbind('click').click(function() {
			$("#removeModal").modal('show');
		});
		screen()
		// 数据筛选
		function screen(){
			var checkdata = [];
			var dsk = [{
				"text": "产出消耗过滤",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/guidbossrecord/getguildoutputcon?type_flag=1', {

			}, function(data) {
				data8 = data;
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['pid']),
							'id': htmlspecialchars(checkdata[i]['id'])
						};
						if(node.pid == 0) {
							node["nodes"] = [];
							dsk[0].nodes.push(node);
						} else {
							var parentslist = dsk[0].nodes;
							for(var j = 0; j < parentslist.length; j++) {
								var node2 = parentslist[j];
								if(node2.id == node.pid) {
									node["nodes"] = [];
									dsk[0].nodes[j].nodes.push(node);
								} else {
									var secondParentlist = node2.nodes;
									for(var k = 0; k < secondParentlist.length; k++) {
										var node3 = secondParentlist[k];
										if(node.pid == node3.id) {
											dsk[0].nodes[j].nodes[k].nodes.push(node);
										}
									}
								}
							}
						}
					}
					ServerData = dsk;
					$searchableTree = $('#treeview-checkable2').treeview({
						data: ServerData,
						levels: 2,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable2').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable2').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable2').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable2').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable2').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable2').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable2').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}


		screen2()
		// 服务器列表 
		function screen2(){
			var checkdata = [];
			var dsk = [{
				"text": "产出消耗过滤",
				"href": '',
				"nodes": []
			}];
			_self.AjaxGetData('/guidbossrecord/getguildoutputcon?type_flag=0', {

			}, function(data) {
				data8 = data;
				if(data.code == 0) {
					isLoadedTree = true;
					if(isLoadedTree) {
						hideLoading();
					}
					checkdata = data.rows;
					for(var i = 0; i < checkdata.length; i++) {

						var node = {
							"text": htmlspecialchars(checkdata[i]['name']),
							'href': htmlspecialchars(checkdata[i]['name']),
							'pid': htmlspecialchars(checkdata[i]['pid']),
							'id': htmlspecialchars(checkdata[i]['id'])
						};
						if(node.pid == 0) {
							node["nodes"] = [];
							dsk[0].nodes.push(node);
						} 
					}
					ServerData = dsk;
					$searchableTree2 = $('#treeview-checkable').treeview({
						data: ServerData,
						levels: 2,
						showCheckbox: true,
						showIcon: false,
						emptyIcon: '',
						nodeIcon: '',
						onNodeChecked: function(even, node) {
							checkNodes(node);
							checkParents(node);
						},
						onNodeUnchecked: function(even, node) {
							uncheckParents(node);
							uncheckNodes(node);
						},
						onNodeSelected: function(even, node) {

						},
						onNodeUnselected: function(even, node) {

						}

					});
				}
			});

			function checkNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('checkNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						checkNodes(node.nodes[i]);
					}

				}
				checkParents(node);
			}

			function uncheckNodes(node) {
				if(typeof(node.nodes) != "undefined") {
					for(var i = 0; i < node.nodes.length; i++) {
						$('#treeview-checkable').treeview('uncheckNode', [node.nodes[i].nodeId, {
							silent: true
						}]);
						uncheckNodes(node.nodes[i]);
					}
				}
			}

			function uncheckParents(node) {
				var parentNode = $('#treeview-checkable').treeview('getParent', node);
				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					var ischeck = false;
					for(var i = 0; i < parentNode.nodes.length; i++) {
						cNodes = parentNode.nodes[i];
						if(cNodes.state.checked) {
							ischeck = true;
							break;
						}
					}
					if(!ischeck) {
						$('#treeview-checkable').treeview('uncheckNode', [parentNode.nodeId, {
							silent: true
						}]);
						uncheckParents(parentNode);
					}

				}
			}

			function checkParents(node) {

				var parentNode = $('#treeview-checkable').treeview('getParent', node);

				if(typeof(parentNode) != "undefined" && typeof(parentNode.href) != "undefined") {
					if(typeof(parentNode.nodes) != "undefined") {

						$('#treeview-checkable').treeview('checkNode', [parentNode.nodeId, {
							silent: true
						}]);
						checkParents(parentNode);
					}
				}
			}

			function checkCrNodes() {
				var crNodeIds = [""];
				var checkdata = $('#treeview-checkable').treeview("getUnselected");

				for(var j = 0; j < crNodeIds.length; j++) {
					for(var i = 0; i < checkdata.length; i++) {
						if(checkdata[i].href == crNodeIds[j]) {
							var node = checkdata[i];
							$('#treeview-checkable').treeview('checkNode', [node, {
								silent: true
							}]);

							checkNodes(node);
							checkParents(node);
							break;
						}
					}
				}

			}
		}



		function queryParams(params) {
			params['s_uid'] = $('#servers').val();
			params['guildid'] = $('#GuildId').val();
			params['guildname'] = $('#GuildName').val();
			params['check_data'] = power_list2;
			params['check_way'] = power_list;
			console.log(params)
			return params;
		}

		// function controlFormatter(value, row, index) {
		// 	var str_html = '<a data-toggle="modal" class="btn btn-default btn-sm" data-target="#modal_'+htmlspecialchars(row.id)+'" href="/guidbossrecord/rewardboss?pid='+htmlspecialchars(row.id)+'">查看</a>'
		// 	var modal_html = '<div class="modal fade" id="modal_'+htmlspecialchars(row.id)+'">'+
		// 					    '<div class="modal-dialog" style="width: 700px">'+
		// 					        '<div class="modal-content"></div>'+
		// 					    '</div>'+
		// 					'</div>'
		// 	$("#manary_modal").append(modal_html)
		// 	return str_html
		// }
		$table.bootstrapTable({
			url: '/guidbossrecord/checkfilterguildoutputcon',
			idField: 'id',
			pagination: true,
			pageList: [10, 25, 50],
			sidePagination: 'server',
			queryParams: queryParams,
			striped : true,
			order : 'desc',
			// showColumns: true,
			columns: [{
				field: 'guild_id',
				title: '冒险团id',
				titleTooltip: "选择的冒险团的id",
			}, {
				field: 'server_name',
				title: '服务器',
				titleTooltip: "选择的冒险团所在的服务器",
			}, {
				field: 'r_type',
				title: '资源类型',
				titleTooltip: "冒险团的资源类型",
			}, {
				field: 'r_change',
				title: '资金改变量',
				titleTooltip: "冒险团资金改变量",
			}, {
				field: 'r_total',
				title: '剩余量',
				titleTooltip: "冒险团剩余量",
			}, {
				field: 'way',
				title: '途径',
				titleTooltip: "",
			}, {
				field: 'player_id',
				title: '操作者id',
				titleTooltip: "该条记录操作者的id",
			}, {
				field: 'create_time',
				title: '操作时间',
				titleTooltip: "该条记录的操作时间",
			}],
			onLoadSuccess: function(data) {
				if (data.code==1){
					window.location.href = '/login/'
				}
				if (data.code==20005){
					_self.ShowToast('info',' 输入冒险团id');
				}else if (data.code ==20006){
					_self.ShowToast('info','选择服务器');
				}
				if(data.code == 0) {
					isloadedIp = true;
					if(isloadedIp) {
						hideLoading();
					}
				}else if (data.code==30005){
					_self.ShowToast('warning','没有查看的权限')
				} 
				else {
					responseCodeFun(data);
				}
			},
			// 服务器错误提示
			// onLoadError: tableRequestError
		});
		$("#search").unbind('click').click(function() {
			power_list = power_func($searchableTree)
			power_list2 = power_func($searchableTree2)
			var s_uid = $('#servers').val();
			if (s_uid==''){
				_self.ShowToast('info','选择服务器');
				return false;
			}
			isloadedIp = false;
			showLoading();
			getTableData($table);
		});
		$("#refresh").unbind('click').click(function() {
			power_list = power_func($searchableTree)
			power_list2 = power_func($searchableTree2)
			var s_uid = $('#servers').val();
			if (s_uid==''){
				_self.ShowToast('info','选择服务器');
				return false;
			}
			isloadedIp = false;
			showLoading();
			getTableDataCurrent($table);
		});



		function power_func(searchableTree){
			var string_test = '';
			var checked = searchableTree.treeview('getChecked', 0);
			$.each(checked, function(index, obj) {
				if (obj.id>0){
					string_test +=',' + obj.id
				}
			});
			var _idnex = (string_test.indexOf(',')) +1
			return string_test.substring(_idnex);
			// return JSON.stringify(power_lists)
		}
		$("#confirm2").unbind('click').click(function() {
			$("#removeModal2").modal('hide');
		});
		$("#confirm").unbind('click').click(function() {
			$("#removeModal").modal('hide');
		});
	}
	//刷新表格
	var getTableData = function($table) {
		var tboption = $table.bootstrapTable('getOptions');
		tboption.pageNumber = 1;
		$table.bootstrapTable('refreshOptions', tboption);
		$table.bootstrapTable('refresh');
	}
	//刷新表格 留在当前页
	var getTableDataCurrent = function($table) {
		var tboption = $table.bootstrapTable('getOptions');
		$table.bootstrapTable('refreshOptions', tboption);
		$table.bootstrapTable('refresh');
	}

	//数组去重
	var unique = function(arr) {
		var n = {},
			r = []; //n为hash表，r为临时数组
		for(var i = 0; i < arr.length; i++) //遍历当前数组
		{
			if(!n[arr[i].name]) //如果hash表中没有当前项
			{
				n[arr[i].name] = true; //存入hash表
				r.push(arr[i]); //把当前数组的当前项push到临时数组里面
			}
		}
		return r;
	}

	//获取token
	var getUserToken = function() {
		if(typeof(localStorage.hy_token) != "undefined") {
			return htmlspecialchars(localStorage.hy_token);
		} else {
			return null;
		}
	}
	//获取token
	var getRememberMeUserToken = function() {
		if(typeof(localStorage.remember_me_token) != "undefined") {
			return htmlspecialchars(localStorage.remember_me_token);
		} else {
			return null;
		}
	}
	//显示遮罩层
	var showLoading = function() {
		$("#loading_shade").css('display', 'block');
		$("#loading_window").css('display', 'block');
	}
	//隐藏遮罩层
	var hideLoading = function() {
		$("#loading_shade").css('display', 'none');
		$("#loading_window").css('display', 'none');
	}
	//初始化遮罩层
	var initLoading = function() {
	}
	

	//初始化菜单栏
	var initMenuBar = function(pagename, href) {
		//菜单栏
		navHtml = "";
		//navbar-brand
		navbarBrand = [{
			"href": "/data/",
			"aText": "诺文尼亚幻想"
		}];
		//  获取菜单栏权限   请求接口

		var username ;
		_self.AjaxPostDataSync('/data/menu', {

		}, function(data) {
			if(data.code == 0) {
					sideBar =  data.menu;
					username = data.user_name
				}else if(data.code==1){
					cleandata()
					_self.ShowToast('error','该用户没有访问的权限');
					window.location.href = '/login/';
				}
				else{
					sideBar =  null;
				}
			})
		if (sideBar===null){
			window.location.href = '/login/'
		}
		//顶部菜单
		navBar = [{
			"href": "javascript:void(0)",
			"iconClass": "glyphicon ",
			"aText": ""+username+" <span id='server_time'></span>"
		}, {
			"href": "#", //用户信息的链接
			"iconClass": "iconfont icon-user",
			"aText": " " + htmlspecialchars(getdata('userName'))
		}];

		//给navbar-brand填充内容
		var navbarBrandHtml = "";
		$.each(navbarBrand, function(index, obj) {
			navbarBrandHtml = '<a class="navbar-brand hy-main-navbar-brand" href="' + obj.href + '"><div style="position:relative;"> <span style="margin-left:-30px">' + obj.aText + '</span></div></a>';
		});
		//给侧边栏菜单填充内容
		var sideBarHtml = "";

		$.each(sideBar, function(index, obj) {
			if(typeof(obj.aData) == "undefined") {
				obj.aData = "null";
			}
			var sideBarSubHtml = "";
			$.each(obj.subItem, function(i, o) {
				sideBarSubHtml += '<li style="display:none;" class="subitem subitem_' + htmlspecialchars(obj.collapseClass) + '"><a style="padding-left:65px;" href="' + htmlspecialchars(o.href) + '">' + htmlspecialchars(o.aText) + '</a></li>';
			});
			sideBarHtml += '<li  class="item"  adata="' + htmlspecialchars(obj.aData) + '"   data="' + htmlspecialchars(obj.collapseClass) + '">' +
				'<a href="' + htmlspecialchars(obj.href) + '" >' +
				'<i class="' + htmlspecialchars(obj.iconClass) + '"></i>&nbsp;' + htmlspecialchars(obj.aText) + '<i class="right-icon ' + htmlspecialchars(obj.rightIconClass) + ' pull-right"></i>' +
				'</a>' +
				'</li>' + sideBarSubHtml;

		});

		//给顶部菜单栏填充内容
		var navBarHtml = "";
		$.each(navBar, function(index, obj) {
			if(href == obj.href) {
				navBarHtml += '<li><a href="' + obj.href + '" class="active"><i class="' + obj.iconClass + '"></i>&nbsp;' + obj.aText + '</a></li>';
			} else {
				navBarHtml += '<li><a href="' + obj.href + '"><i class="' + obj.iconClass + '"></i>&nbsp;' + obj.aText + '</a></li>';
			}
		});

		navHtml = '<div class="sidebar-control hy-main-sidebar-control">' +
			'<a href="javascript:void(0)" id="sidebar_control"><i class="iconfont icon-close"></i></a>' +
			'</div>' +
			'<nav class="navbar navbar-default navbar-fixed-top hy-main-navbar-default" role="navigation">' +
			'<div class="navbar-header hy-main-navbar-header">' +
			'<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">' +
			'<span class="sr-only">Toggle navigation</span>' +
			'<span class="icon-bar"></span>' +
			'<span class="icon-bar"></span>' +
			'<span class="icon-bar"></span>' +
			'</button>' +
			navbarBrandHtml +
			'</div>' +
			'<div class="collapse navbar-collapse navbar-ex1-collapse">';
		navHtml += '<ul class="nav navbar-nav side-nav hy-main-sidebar" id="sidebar">' +
			sideBarHtml +
			'</ul>';
		navHtml += '<ul class="nav navbar-nav navbar-right navbar-user hy-main-navbar-right" id="navbar-right">' +
			navBarHtml +
			'<li><a href="#" class="logout"><i class="iconfont icon-log-out"></i>&nbsp; 退出</a></li>' +
			'</ul>' +
			'</div>' +
			'</nav>';
		$("#page-wrapper").before(navHtml);

		$("#sidebar_control").unbind('click').click(function() {
			var $this = this;
			var icon = $($this).children('i');
			var sidebarControl = $($this).parent();
			if(icon.hasClass('icon-close')) {
				icon.attr('class', 'iconfont icon-open');
				$("#sidebar").attr('class', 'nav navbar-nav side-nav hy-main-sidebar move_left');
				$("#wrapper").css('padding-left', '0');
				$(".navbar-brand").css('background-color', '#00A2CA');
				$(".navbar-brand i").css('color', '#283643');
				sidebarControl.css('left', '0')
			} else {
				icon.attr('class', 'iconfont icon-close');
				$("#sidebar").attr('class', 'nav navbar-nav side-nav hy-main-sidebar move_right');
				$("#wrapper").css('padding-left', '260px');
				$(".navbar-brand").css('background-color', '#283643');
				$(".navbar-brand i").css('color', '#00A2CA');
				sidebarControl.css('left', '260px')
			}
		});

		$(".item").unbind('click').click(function() {
			var parent = $(this);
			var data = $(this).attr('data');

			$(".subitem_" + data).fadeToggle(200, function() {
				if($(this).is(':hidden')) {
					parent.find('.right-icon').attr('class', 'right-icon glyphicon glyphicon-chevron-left pull-right');
				} else {
					parent.find('.right-icon').attr('class', 'right-icon glyphicon glyphicon-chevron-down pull-right');
				}
			});

		});

	}

	//初始化模态框
	var initModal = function() {
		var modalHtml = '<div class="modal fade" id="Modal" tabindex="-1" role="dialog" aria-labelledby="ModalLabel">' +
			'<div class="modal-dialog" role="document">' +
			'<div class="modal-content">' +
			'<div class="modal-header">' +
			'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
			'<h4 class="modal-title" id="ModalLabel">提示！</h4>' +
			'</div>' +
			'<div class="modal-body">' +
			'<div id="logout_tip" class="text-center col-xs-12"></div>' +
			'<div class="form-group text-right" style="margin-top: 20px;">' +
			'<button type="button" class="btn btn-primary modal-btn" data-dismiss="modal" id="yes">确定</button>' +
			'<button type="button" class="btn btn-default modal-btn" data-dismiss="modal" style="margin-left: 10px;">关闭</button>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'<div class="modal fade" id="tipModal" tabindex="-1" role="dialog" aria-labelledby="ModalLabel">' +
			'<div class="modal-dialog" role="document">' +
			'<div class="modal-content">' +
			'<div class="modal-header">' +
			'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
			'<h4 class="modal-title" id="ModalLabel">提示！</h4>' +
			'</div>' +
			'<div class="modal-body">' +
			'<div id="tip" class="text-center col-xs-12">服务器错误！</div>' +
			'<div class="form-group text-right" style="margin-top: 20px;">' +
			'<button type="button" class="btn btn-default modal-btn" data-dismiss="modal" style="margin-left: 10px;">关闭</button>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'<div class="modal fade" id="controlModal" tabindex="-1" role="dialog" aria-labelledby="controlModalLabel">' +
			'<div class="modal-dialog" role="document">' +
			'<div class="modal-content">' +
			'<div class="modal-header">' +
			'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
			'<h4 class="modal-title" id="controlModalLabel"></h4>' +
			'</div>' +
			'<div class="modal-body">' +
			'<div id="control_tip" class="text-center col-xs-12"></div>' +
			'<div class="form-group text-right" style="margin-top: 20px;">' +
			'<button type="button" class="btn btn-danger modal-btn" style="margin-left: 10px;">确定</button>' +
			'<button type="button" class="btn btn-default modal-btn" data-dismiss="modal" style="margin-left: 10px;">关闭</button>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>';
		$("#wrapper").append(modalHtml);
	}

	//退出按钮监听
	var setLogoutClickEvent = function() {
		$(".navbar-right li a[class='logout']").unbind('click').click(function() {
			$("#logout_tip").html("是否退出登录？");
			$("#Modal").modal("show");
			$("#yes").unbind('click').click(function() {
				_self.AjaxPostDataSync('/login/logout',{

				}, function(data) {
					if(data.code == 0) {
						cleandata();
						$("#Modal").modal("hide");
						window.location.href = '/login/';
					}
				});

			});
		});
	}

	function htmlspecialchars(string) {
		varcreateDiv = document.createElement("textarea");
		varcreateDiv.innerHTML = string;
		return varcreateDiv.innerHTML;
	}
	//localStorage保存并加密
	function pushdata(k, v) {
		try {
			var hd = localStorage.getItem('jxsec_hd');
			if(typeof(hd) != 'undefined' && hd != null && hd != '') {
				hd = getdata();
			} else {
				hd = {};
			}
			hd[k] = v;
			hd = JSON.stringify(hd);
			var ciphertext = CryptoJS.AES.encrypt(hd, getUserToken());
			localStorage.setItem('jxsec_hd', ciphertext.toString());
		} catch(e) {
			cleandata();
		}

	}
	//localStorage解密并获取
	function getdata(k) {
		try {
			var hd = localStorage.getItem('jxsec_hd');
			if(typeof(hd) != 'undefined' && hd != null && hd != '') {
				var bytes = CryptoJS.AES.decrypt(hd, getUserToken());
				var descstring = bytes.toString(CryptoJS.enc.Utf8);
				var decryptedData = JSON.parse(descstring);
				if(typeof(k) != 'undefined' && k != null && k != '') {
					return decryptedData[k];
				} else {
					return decryptedData;
				}
			} else {
				return null;
			}
		} catch(e) {
			cleandata();
		}

	}

	//清除localStorage
	function cleandata() {
		localStorage.removeItem('jxsec_hd');
		localStorage.removeItem('hy_token');
		localStorage.removeItem('user_id');
		localStorage.removeItem('user_name');
	}

	function cookpushdata(k, v) {
		var token = getRememberMeUserToken();
		var hd = "";
		try {
			hd = document.cookie;
			if(typeof(hd) != 'undefined' && hd != null && hd != '') {
				hd = cookgetdata();
			} else {
				hd = {};
			}

			hd[k] = v;

			hd = JSON.stringify(hd);
			hd = aesEnc(token, hd);
			var time = new Date();
			time.setTime(time.getTime() + 3 * 24 * 60 * 60 * 1000);
			document.cookie = "hd=" + hd + ";expires=" + time.toGMTString();;
		} catch(e) {
			clearCookie();
		}
	}

	function cookgetdata(k) {
		var token = getRememberMeUserToken();
		var hd = getcookie("hd");
		if(typeof(hd) != 'undefined' && hd != '' && token != '') {
			var descstring = '';
			try {
				descstring = aesDnc(token, hd);
			} catch(e) {
				descstring = '';
			}
			var decryptedData = '';
			if(descstring != '') {
				decryptedData = JSON.parse(descstring);
			} else {
				decryptedData = {};
			}
			if(typeof(k) != 'undefined' && k != null && k != '') {
				return decryptedData[k];
			} else {
				return decryptedData;
			}
		} else {
			return {};
		}
	}

	function getcookie(name) {
		var strcookie = document.cookie;
		var arrcookie = strcookie.split("; ");
		for(var i = 0; i < arrcookie.length; i++) {
			var arr = arrcookie[i].split("=");
			if(arr[0] == name) return arr[1];
		}
		return "";
	}

	function aesEnc(k, v) {
		var ciphertext = CryptoJS.AES.encrypt(v, k);
		return ciphertext;

	}

	function aesDnc(k, v) {
		var bytes = CryptoJS.AES.decrypt(v, k);
		var descstring = bytes.toString(CryptoJS.enc.Utf8);
		return descstring;
	}

	function add0(m) {
		return m < 10 ? '0' + m : m
	}

	function ChangeDateFormat(shijianchuo) {

		//shijianchuo是整数，否则要parseInt转换
		var time = new Date(parseInt(shijianchuo) * 1000);
		var y = time.getFullYear();
		var m = time.getMonth() + 1;
		var d = time.getDate();
		var h = time.getHours();
		var mm = time.getMinutes();
		var s = time.getSeconds();
		return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);

	}


	//获取时间 n代表n天后， -n代表n天前
	function GetDateStr(AddDayCount) {
		var dd = new Date();
		dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期  
		var y = dd.getFullYear();
		var m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1); //获取当前月份的日期，不足10补0  
		var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate(); //获取当前几号，不足10补0  
		var hh = dd.getHours() < 10 ? "0" + dd.getHours() : dd.getHours();
		var mm = dd.getMinutes() < 10 ? "0" + dd.getMinutes() : dd.getMinutes();
		var ss = dd.getSeconds() < 10 ? "0" + dd.getSeconds() : dd.getSeconds();
		return y + "-" + m + "-" + d + ' ';
	}

	//键值对数组根据key进行排序
	function keysrt(key, desc) {
		return function(a, b) {
			return desc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
		}
	}

	//判断IP合法性
	function isValidIP(ip) {
		var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])|0\/24)$/
		return reg.test(ip);
	}

	//初始化
	var init = function() {

	}

	init();
}