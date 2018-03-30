#coding:utf-8
import tornado.web
from configs import *
from tornzen import utils,caching
from services import *
from web_p.handlers import *
import datetime

#----------------------------------------------------------------
# 概况
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/system_overview.html',title='概况')


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
		start_time = self.get_argument('start_time','')
		end_time = self.get_argument('end_time','')
		server_list = self.get_argument('server_list','')
		if server_list:
			server_list  =(server_list.split('|'))
		elif self.channel_string:
			server_list = (self.channel_string).split(',')
		else:
			server_list = []
		overview_datas  = yield overviewService.total_select(dict(start_time= start_time,end_time = end_time,
			server_list = tuple(server_list)))
		diff_d = 1
		if end_time:
			_end_time = datetime.datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S")
		else:
			_end_time = datetime.datetime.now()
		if not start_time:
			start_time = datetime.datetime.now() + datetime.timedelta(days=-29)
			_start_time = start_time
		else:
			_start_time = datetime.datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")
		diff_d = (_end_time - _start_time).days + 1
		new_login_account =overview_datas[0].get('new_login_account')
		new_equipment = overview_datas[0].get('new_equipment')
		pay_income = overview_datas[0].get('pay_income')
		pay_account = overview_datas[0].get('pay_account')
		login_account = overview_datas[0].get('login_account')
		data = dict(
						new_equipment = int(new_equipment) if new_equipment else 0,
						new_login_account = int(new_login_account) if new_login_account else 0,
						pay_income = str(pay_income) if pay_income else 0,
						login_account = int(int(login_account)/diff_d) if login_account else 0,
						pay_account = str(pay_account) if pay_account else 0
			)

		self.finish(dict(code=0,data =data))
		return