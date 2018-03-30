#coding:utf-8
import tornado.web
from configs import *
from tornzen import utils,caching
from services import *
from web_p.handlers import *
import io
# import xlsxwriter
import datetime

#----------------------------------------------------------------
# 产出消耗分布
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		data= [dict(value =1, name = '钻石'),dict(value =2, name = '金币')]
		self.render_view('/ODdistribute.html',title='产出消耗分布',data = data)


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
		c_type = self.get_int('c_type',1)
		status_flag = self.get_int('status_flag',1)
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		datas = []
		count,ppoint_datas,pay_datas,recharge_datas = yield ODDService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list =server_list,top = True,
											c_type = c_type, status_flag =status_flag,channel_list =channel_list
										))
		pay_names = []
		recharge_names = []
		type_datas = yield self.get_goods_menu()
		for _pay_data in pay_datas:
			_name = _pay_data.get('name')
			_name = type_datas.get(_name,_name)
			_pay_data['name'] = _name
			pay_names.append(_name)
			_pay_data['value'] = abs(int(_pay_data.get('value',0)))
		for _recharge_data in recharge_datas:
			__name = _recharge_data.get('name')
			__name = type_datas.get(__name,__name)
			_recharge_data['name'] = __name
			recharge_names.append(__name)
			_recharge_data['value'] = int(_recharge_data.get('value',0))
		for _ppoint_data in ppoint_datas:
			_type = _ppoint_data.get('type','')
			datas.append(dict(
							type = type_datas.get(_type,_type),
							diff = abs(int(_ppoint_data.get('diff',0))),
							p_num = int(_ppoint_data.get('p_num',0)),
							num = int(_ppoint_data.get('num',0))
						))
		currency = {1:'钻石',2:'金币'}
		output_drain = {1:'产出',2:'消耗'}
		base = currency[c_type] + output_drain[status_flag]
		diff_top10 =  base+ '数量TOP10'
		num_top10 = base + '次数TOP10'
		self.finish(dict(code=0,rows=datas,total=count, pay_datas = pay_datas, pay_names = pay_names,
			recharge_datas = recharge_datas, recharge_names = recharge_names,diff_top10 =diff_top10,num_top10=num_top10))
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
		filter_params = dict(
				start_time = self.get_argument('start_time',''),
				end_time = self.get_argument('end_time',''),
				order_by = self.get_argument('order',''),
				c_type = self.get_int('c_type',0),
				status_flag = self.get_int('status_flag',0)
			)
		server_list = self.get_argument('server_list','')
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		filter_params['server_list'] = server_list
		filter_params['channel_list'] =channel_list
		list_data = yield ODDService.GetByFilter(0,100000,filter_params)
		if len(list_data)<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['产出/消耗点','产出/消耗货币数','人数','次数']


		type_datas = yield self.get_goods_menu()
		rows = [ ','.join(titles) ]
		for item_data in list_data:
			_type = str(item_data.get('type',''))
			rows.append(','.join([
			type_datas.get(_type,_type),
			str(abs(int(item_data.get('diff',0)))),
			str(item_data.get('p_num',0)),
			str(item_data.get('num',0))
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('产出消耗分布') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return