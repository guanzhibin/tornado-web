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
# 付费点分布页面
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/pay_distribution.html',title='测试',data='<h4>Popover 中的一些内容 —— options 方法</h4>')


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
		channel_list =self.get_argument('channel_list','')
		order = (self.get_argument('order',''))
		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string
		datas = []
		ppoint_datas,pay_datas,recharge_datas,total = yield PayPointService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list =server_list,top = True,
											channel_list = channel_list
										))
		pay_names = []
		recharge_names = []
		for i in range(len(pay_datas)):
			pay_datas[i]['value'] = str(pay_datas[i]['value'])
			pay_names.append(pay_datas[i].get('name'))
		for j in range(len(recharge_datas)):
			recharge_datas[j]['value'] = str(recharge_datas[j]['value'])
			recharge_names.append(recharge_datas[j].get('name'))
		for _ppoint_data in ppoint_datas:
			datas.append(dict(
							pay_point = _ppoint_data.get('pay_points',''),
							pay_num = str(_ppoint_data.get('pay_num',0)),
							amount_of_recharge = str(_ppoint_data.get('amount_of_recharge',''))
						))
		self.finish(dict(code=0,rows=datas,total=total, pay_datas = pay_datas, pay_names = pay_names,
			recharge_datas = recharge_datas, recharge_names = recharge_names))
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
				order_by = self.get_argument('order','')
			)
		server_list = self.get_argument('server_list','')
		channel_list = self.get_argument('channel_list','')
		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		filter_params['server_list'] = server_list
		filter_params['channel_list'] = channel_list
		list_data = yield PayPointService.GetByFilter(0,10000000,filter_params)
		if not list_data:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['付费点','购买数量','充值金额']

		rows = [ ','.join(titles) ]
		for item_data in list_data:
			rows.append(','.join([
			# item_data.get('pay_time').strftime('%Y/%m/%d'),
			item_data.get('pay_points',''),
			str(item_data.get('pay_num',0)),
			str(item_data.get('amount_of_recharge',0))
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('付费点') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return