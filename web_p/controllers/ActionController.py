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
		self.render_view('/action_user.html',title='活跃用户')
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
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		datas = []
		act_datas = yield ActionService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list =server_list
											,channel_list =channel_list
										))
		srv_datas = yield  self.get_server_data()
		for act_data in act_datas[1]:
			s_uid = str(act_data.get('s_uid',''))
			datas.append(dict(
							d_date = act_data.get('create_time').strftime('%Y/%m/%d'),
							server = srv_datas.get(s_uid,s_uid),
							channel = act_data.get('channel_name',''),
							td_ac_num = str(act_data.get('td_ac_num',0)),
							th_ac_num = str(act_data.get('th_ac_num',0)),
							w_ac_num = str(act_data.get('w_ac_num',0)),
							mth_ac_num = str(act_data.get('mth_ac_num',0)),
							dw_ac = str(act_data.get('dw_ac',0.00)),
							dm_ac = str(act_data.get('dm_ac',0.00))
					))

		self.finish(dict(code=0,rows=datas,total=act_datas[0]))
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
		filter_params['server_list'] =server_list
		filter_params['channel_list'] = channel_list
		list_data = yield ActionService.GetByFilter(0,100000,filter_params)
		if list_data[0]<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','渠道','服务器','日活跃','3日活跃','周活跃','月活跃','DAU/WAU','DAU/MAU']



		rows = [ ','.join(titles) ]
		srv_datas = yield  self.get_server_data()
		for item_data in list_data[1]:
			s_uid = str(item_data.get('s_uid',''))
			rows.append(','.join([
			item_data.get('create_time').strftime('%Y/%m/%d'),
			item_data.get('channel_name',''),
			srv_datas.get(s_uid,s_uid),
			str(item_data.get('td_ac_num',0)),
			str(item_data.get('th_ac_num',0)),
			str(item_data.get('w_ac_num',0)),
			str(item_data.get('mth_ac_num',0)),
			str(item_data.get('dw_ac',0.00)),
			str(item_data.get('dm_ac',0.00))
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('活跃用户') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return