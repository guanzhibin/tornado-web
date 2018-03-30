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
# 活跃用户界面
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/whale.html',title='鲸鱼用户')
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
		channel_list = self.get_argument('channel_list','')
		order = (self.get_argument('order',''))
		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string
		datas = []
		whale_datas = yield whaleService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list =server_list,
											channel_list  = channel_list
										))
		srv_datas = yield  self.get_server_data()
		for whale_data in whale_datas[1]:
			s_uid = str(whale_data.get('s_uid',''))
			datas.append(dict(
							last_pay_time = whale_data.get('last_pay_time').strftime('%Y/%m/%d'),
							server = srv_datas.get(s_uid,s_uid),
							channel = whale_data.get('channel_name',''),
							pid = whale_data.get('pid',0),
							player = whale_data.get('player',''),
							uuid = whale_data.get('uuid',''),
							rechargemoney = str(whale_data.get('rechargemoney',0)),
							fp_level = whale_data.get('fp_level',0),
							ac_level = whale_data.get('ac_level',''),
							reg_time = whale_data.get('reg_time').strftime('%Y/%m/%d'),
							fp_time = whale_data.get('fp_time').strftime('%Y/%m/%d'),
							llogin_time = whale_data.get('llogin_time').strftime('%Y/%m/%d'),
							has_diamond = whale_data.get('has_diamond',0),
							cons_diamond = whale_data.get('cons_diamond',0)
					))

		self.finish(dict(code=0,rows=datas,total=whale_datas[0]))
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
				order_by = self.get_argument('orderby','')
			)
		server_list = self.get_argument('server_list','')
		channel_list = self.get_argument('channel_list','')
		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string
		filter_params['server_list'] = server_list
		filter_params['channel_list'] = channel_list
		list_data = yield whaleService.GetByFilter(0,100000,filter_params)
		if list_data[0]<1:
			self.write(dict(code=2,msg="没有数据"))
			return
		titles = ['最后充值日期','角色名称','角色ID','所在游戏服','充值渠道','设备','充值金额','首次充值等级',
		'当前等级','注册日期','首次充值日期','最后活跃日期','虚拟币拥有量','虚拟币总消耗量']

		srv_datas = yield  self.get_server_data()
		rows = [ ','.join(titles) ]
		for item_data in list_data[1]:
			s_uid = str(item_data.get('s_uid',''))
			rows.append(','.join([
			item_data.get('last_pay_time').strftime('%Y/%m/%d'),
			item_data.get('player',''),
			str(item_data.get('pid','')),
			srv_datas.get(s_uid,s_uid),
			str(item_data.get('channel_name','')),
			str(item_data.get('uuid','')),
			str(item_data.get('rechargemoney',0)),
			str(item_data.get('fp_level',0)),
			str(item_data.get('ac_level',0)),
			item_data.get('reg_time').strftime('%Y/%m/%d'),
			item_data.get('fp_time').strftime('%Y/%m/%d'),
			item_data.get('llogin_time').strftime('%Y/%m/%d'),
			str(item_data.get('has_diamond',0)),
			str(item_data.get('cons_diamond',0))
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('鲸鱼用户') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return