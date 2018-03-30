#coding:utf-8
import tornado.web
import datetime
from configs import *
from services import *
from web_p.handlers import *
import time

#----------------------------------------------------------------
# 冒险团boss记录页面
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		self.render_view('/skin.html',title='皮肤统计')

#------------------------------------------------------------
#  通过条件查询返回数据
#------------------------------------------------------------
class checkFilter(WebBaseHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		order = (self.get_argument('order',''))

		s_uid = self.get_argument('s_uid','')
		pid_str =  self.get_argument('pid','')
		start_time = self.get_argument('start_time',0)
		end_time = self.get_argument('end_time',0)
		pid_list = []
		if pid_str:
			pid_list = pid_str.split(',')
		datas = yield  buyskinService.GetByFilter(offset,limit,dict(s_uid = s_uid,
																	start_time =int(start_time),
																	end_time = int(end_time),
																	pid_list = tuple(pid_list),
																	order_by = order
																	))
		ret_datas = []
		for data in datas[1]:
			s_uid = data.get('s_uid','')
			ret_datas.append(dict(
					buytime = data.get('buytime',0),
					s_uid =s_uid,
					pid = data.get('pid',0),
					skinid = data.get('skinid',''),
					type = data.get('type',1),
					cost = data.get('cost',0)
				))

		self.finish(dict(code=0,rows=ret_datas,total=datas[0]))
		return

#------------------------------------------------------------
#  通过条件查询返回数据
#------------------------------------------------------------
class gettotal(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		import json
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		server_list = self.get_argument('server_list','')
		if not server_list:
			server_list = self.server_string
		start_time = self.get_argument('start_time',0)

		end_time = self.get_argument('end_time',0)
		if start_time:
			start_time = int(time.mktime(time.strptime(start_time, '%Y-%m-%d %H:%M:%S')))
		if end_time:
			end_time = int(time.mktime(time.strptime(end_time, '%Y-%m-%d %H:%M:%S')))
		check_cond = dict(server_list = server_list,start_time =start_time,end_time = end_time)
		datas = yield  buyskinService.sistc_total(offset,limit,check_cond)
		type_data = dict()
		for _type in datas[1]:
			type_data[_type.get('type',1)]=int(_type.get('cost',0))
		ret_datas = []
		total = datas[0][0]['total']
		skin_data = yield buyskinService.getskindata()
		skin_origin = dict()
		if skin_data:
			skin_origin = json.loads(skin_data[0]['data'])

		for data in datas[2]:
			_total = data.get('total',0)
			skinid = data['skinid']
			data_dict = dict(sale_total = _total,
							num_rate = '%.2f%%'%(_total*100/total if total else 0),
							skin_name = skin_origin.get(str(skinid),skinid),
							diamond_desc = '0',
							diamond_rate = '0',
							skin_roll_desc = '0',
							skin_roll_rate = '0',
							piece_desc = '0',
							piece_rate = '0'
				)
			check_cond['skinid'] = skinid
			_data = yield buyskinService.get_buy_skinid(check_cond)
			for __data in _data:
				_type = __data.get('type',1)
				cost = __data.get('cost',0)
				_rate = '%.2f%%' %(cost*100/type_data.get(_type) if type_data.get(_type) else 0)
				if _type==1:
					data_dict['diamond_desc'] = str(cost) + '钻石'
					data_dict['diamond_rate'] = _rate
				elif _type==2:
					data_dict['skin_roll_desc'] = str(cost) + '皮肤卷'
					data_dict['skin_roll_rate'] = _rate
				elif _type ==3 :
					data_dict['piece_desc'] = str(cost) + '皮肤碎片'
					data_dict['piece_rate'] = _rate
			ret_datas.append(data_dict)
		self.finish(dict(code=0,rows=ret_datas,total=datas[3][0]['page_num']))
		return