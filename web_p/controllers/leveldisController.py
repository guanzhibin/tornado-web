#coding:utf-8
import tornado.web
from configs import *
from services import *
from tornzen import utils
from web_p.handlers import *
import io
import datetime
# import xlsxwriter


#----------------------------------------------------------------
#  货币进毁存界面
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		currency_data = []
		self.render_view('/level_dis.html',title='等级分布')

##______________
## 获取table头
##-------------------

class GetTableTop(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		start_time = self.get_argument('start_time','')
		end_time = self.get_argument('end_time','')
		server_list = self.get_argument('server_list','')
		type_flag = self.get_int('type_flag',1)
		channel_list = self.get_argument('channel_list','')
		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		datas = []
		all_data = yield levelService.Get_table_top(dict(start_time =start_time,
														end_time = end_time,
														server_list = server_list,
														type_flag = type_flag,
														channel_list =channel_list
										))
		for _all_data in all_data:
			level = _all_data.get('level')
			if level is None:
				continue
			datas.append(dict(
						title = str(level) +'级',
						field = 'level' + str(_all_data.get('level'))
				))
		if datas:
			datas.insert(0,{"title":"渠道", "field":"channel"})
			datas.insert(0,{"title":"服务器", "field":"server"})
			datas.insert(0, {"title":'日期',"field":"d_date"})	
		self.finish(dict(code=0,data = datas))
		return
#------------------------------------------------------------
#  通过条件查询返回数据
#------------------------------------------------------------
class checkFilter(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		if self.privilege is False:
			self.finish(dict(code=30005,rows=[],total=0))
			return
		if not (self.current_user):
			self.finish(dict(code=1))
			return 
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		start_time = self.get_argument('start_time','')
		end_time = self.get_argument('end_time','')
		server_list = self.get_argument('server_list','')
		order = (self.get_argument('order',''))
		type_flag = self.get_int('type_flag',1)
		channel_list = self.get_argument('channel_list','')
		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		level_data = yield levelService.get_level(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list =server_list,
											type_flag = type_flag,channel_list   =channel_list
										))
		datas = []
		_data = dict()
		level_datas,count = yield levelService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list =server_list,
											type_flag = type_flag,channel_list =channel_list
										),count =True)
		srv_datas = yield  self.get_server_data()
		for _level_data in level_datas:
			level = _level_data.get('level')
			num = _level_data.get('num')
			if level and num:
				_time = _level_data.get('time')
				# if type_flag==3:
				# 	_time = _time + datetime.timedelta(days=-7)
				channel_name = _level_data.get('channel_name','')
				s_uid = str(_level_data.get('s_uid',''))
				server_name = srv_datas.get(s_uid,s_uid)
				s_uid = _level_data.get('s_uid','')
				d_date = _time.strftime('%Y/%m/%d')
				key = channel_name + '_' + s_uid + '_' + d_date
				_now_d = {'level' + str(level):str(num)}
				if _data.get(key):
					__data = _data[key]
					__data.update(_now_d)
				else:
					_now_d['channel'] = channel_name
					_now_d['s_uid'] = s_uid
					_now_d['d_date'] = d_date
					_now_d['server'] = server_name
					_data[key] = _now_d
		datas = list(_data.values())
		datas.sort(key=lambda s:s['d_date'] ,reverse =True)  
		if datas:
			total_d = dict(d_date = '',channel='渠道', server = '服务器')
			all_num = 0
			total_ = yield levelService.total_select(dict(start_time =start_time,
														end_time = end_time,
														server_list = server_list,
														type_flag = type_flag,
														channel_list = channel_list
									))
			for _total in total_:
				level = _total.get('level')
				num = _total.get('num')
				if level and num:
					key ='level' + str(_total.get('level'))
					num = int(_total.get('num',0))
					all_num+=num
					total_d[key] = num
			# total_d['d_date'] = all_num
			datas.insert(0, total_d)
		self.finish(dict(code=0,rows=datas,total=count))
		return

# ---------------------------------------------------------------------------------------
# 导出数据
# ---------------------------------------------------------------------------------------
class Export(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write('没有权限')
			return
		if not (self.current_user):
			self.write('请登录')
			return 
		timenow = datetime.datetime.now()
		type_flag = self.get_int('type_flag',1)
		filter_params = dict(
				start_time = self.get_argument('start_time',''),
				end_time = self.get_argument('end_time',''),
				order_by = self.get_argument('orderby',''),
				type_flag = type_flag
			)
		server_list = self.get_argument('server_list','')
		channel_list = self.get_argument('channel_list','')
		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string
		filter_params['server_list'] = server_list
		filter_params['channel_list'] = channel_list
		list_data = yield levelService.GetByFilter(0,1000000,filter_params)
		if len(list_data) <1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		datas = []
		_data = dict()
		srv_datas = yield  self.get_server_data()
		for _level_data in list_data:
			_time = _level_data.get('time')
			# if type_flag==3:
			# 	_time = _time + datetime.timedelta(days =-7)
			channel_name = _level_data.get('channel_name','')
			s_uid = str(_level_data.get('s_uid',''))
			server_name = srv_datas.get(s_uid,s_uid)
			s_uid = _level_data.get('s_uid','')
			d_date = _time.strftime('%Y/%m/%d')
			key = channel_name + '_' + s_uid + '_' + d_date
			if _level_data.get('level'):
				_now_d = {'level' + str(_level_data.get('level')):str(_level_data.get('num'))}
				if _data.get(key):
					__data = _data[key]
					__data.update(_now_d)
				else:
					_now_d['channel'] = channel_name
					_now_d['s_uid'] = s_uid
					_now_d['d_date'] = d_date
					_now_d['server'] = server_name
					_data[key] = _now_d
		datas = list(_data.values())
		datas.sort(key=lambda s:s['d_date'] ,reverse =True) 
		title_data = yield levelService.Get_table_top(filter_params)
		titles = ['日期','渠道','服务器']
		fields = []
		for _title_data in title_data:
			if _title_data.get('level'):
				_level = str(_title_data.get('level'))
				titles.append(_level+'级')
				fields.append('level'+_level)


		_title = '等级分布'
		if type_flag==1:
			_title += '_所有玩家'
		elif type_flag==2:
			_title +='_新增玩家' 
		elif type_flag ==3:
			_title +='流失玩家'
		rows = [ ','.join(titles) ]

		# total_d = dict()
		total_ = yield levelService.total_select(filter_params)
		total_list = ['','渠道','服务器']
		for _total in total_:
			if _total.get('level') and _total.get('num',0):

				# key ='level' + str(_total.get('level'))
				# print(key)
				num = int(_total.get('num',0))
				# print(num)
				# total_d[key] = num
				total_list.append(str(num))
		rows.append(','.join(total_list))
		# if total_d:
		# 	total_l = sorted(total_d.items(), key = lambda x:x[0])
		# 	print(total_l)
		# 	for _total_l in total_l:
		# 		total_list.append(str(_total_l[1]))

		for item_data in datas:
			field_len = len(fields)
			d_list = []
			d_list.append(str(item_data.get('d_date','')))
			d_list.append(item_data.get('channel',''))
			d_list.append(item_data.get('server',''))
			for i in range(0, field_len):
				d_list.append(item_data.get(fields[i],''))
			rows.append(','.join(d_list))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent(_title) + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return