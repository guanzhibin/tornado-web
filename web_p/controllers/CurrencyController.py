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
		self.render_view('/currency.html',title='货币进毁存')
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
		c_type = (self.get_int('c_type',0))
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		datas = []
		currency_datas = yield currencyService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list =server_list,
											c_type = c_type,channel_list = channel_list
										))
		srv_datas = yield  self.get_server_data()
		for currency_data in currency_datas[1]:
			atm_get = currency_data.get('atm_get',0)
			system_output = currency_data.get('system_output',0)
			total_get = atm_get + system_output
			total_drain =  abs(currency_data.get('total_drain',0))
			s_uid = str(currency_data.get('s_uid',''))
			datas.append(dict(
							d_date = currency_data.get('create_time').strftime('%Y/%m/%d'),
							server = srv_datas.get(s_uid,s_uid),
							channel = currency_data.get('channel_name',''),
							start_inventory = currency_data.get('start_inventory',0),
							atm_get = atm_get,
							system_output = system_output,
							total_get = total_get,
							total_drain =total_drain,
							diff = total_get - total_drain,
							end_inventory = currency_data.get('end_inventory',0)
					))
		# if len(datas)>0:
		# 	##  汇总的数据
		# 	##  后期搞缓存
		# 	total_ = yield currencyService.total_select(dict(start_time = start_time, 
		# 		end_time =end_time, server_list = server_list,c_type =c_type))
		# 	_data = dict(d_date='',server='服务器',channel='渠道')
		# 	if total_[0]:
		# 		atm_get = int(total_[0].get('atm_get',0))
		# 		system_output = int(total_[0].get('system_output',0))
		# 		total_drain = abs(int(total_[0].get('total_drain',0)))
		# 		total_get = atm_get + system_output
		# 		_data['start_inventory'] = int(total_[0].get('start_inventory',0))
		# 		_data['system_output'] = system_output
		# 		_data['atm_get'] = atm_get
		# 		_data['total_get'] = total_get
		# 		_data['total_drain'] = total_drain
		# 		_data['diff'] =total_get - total_drain
		# 		_data['end_inventory'] = int(total_[0].get('end_inventory',0))
		# 		pass
		# 	datas.insert(0,_data)
		self.finish(dict(code=0,rows=datas,total=currency_datas[0]))
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
				order_by = self.get_argument('orderby',''),
				c_type = self.get_int('c_type',0)
			)
		server_list = self.get_argument('server_list','')
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string
		if server_list:
			filter_params['server_list'] = server_list
		filter_params['channel_list'] =channel_list
		list_data = yield currencyService.GetByFilter(0,100000,filter_params)
		if list_data[0]<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','服务器','渠道','期初库存','充值所得','系统产出','获得总额','消耗总额','差额',
		'期末库存']




		rows = [ ','.join(titles) ]

		total_ = yield currencyService.total_select(filter_params)
		if total_[0]:
			atm_get = int(total_[0].get('atm_get',0))
			system_output = int(total_[0].get('system_output',0))
			total_drain = abs(int(total_[0].get('total_drain',0)))
			total_get = atm_get + system_output

			rows.append(','.join(['','服务器','渠道',
								str(total_[0].get('start_inventory',0)),
								str(atm_get),
								str(system_output),
								str(total_get),
								str(total_drain),
								str(total_get - total_drain),
								str(total_[0].get('end_inventory',0))
				]))
		srv_datas = yield  self.get_server_data()
		for item_data in list_data[1]:
			s_uid = str(item_data.get('s_uid',''))
			atm_get = item_data.get('atm_get',0)
			system_output = item_data.get('system_output',0)
			total_get = atm_get + system_output
			total_drain =  abs(item_data.get('total_drain',0))
			rows.append(','.join([
			str(item_data.get('create_time').strftime('%Y/%m/%d')),
			srv_datas.get(s_uid,s_uid),
			str(item_data.get('channel_name','')),
			str(item_data.get('start_inventory',0)),
			str(atm_get),
			str(system_output),
			str(total_get),
			str(total_drain),
			str(total_get -total_drain),
			str(item_data.get('end_inventory',0))
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('货币进毁存') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return