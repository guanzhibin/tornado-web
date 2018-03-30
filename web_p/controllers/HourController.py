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
# 每日实时数据统计到每小时
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/dailyhour.html',title='每日实时数据')


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
		server_list = self.get_argument('server_list','')
		if server_list:
			server_list  =(server_list.split('|'))
		else:
			server_list = []

		datas = []

		hour_datas = yield HourService.GetByFilter(dict(start_time= start_time,server_list =server_list))
		hours  =[]
		new_equips = []
		new_accounts = []
		actions = []
		pay_accounts = []
		pay_incomes = []
		total_new_equip = 0 
		total_new_account = 0
		total_actoin = 0
		total_pay_account = 0
		total_pay_income = 0
		for hour_data in hour_datas:
			hour = hour_data.get('hours',0)
			new_equip  =int(hour_data.get('new_equip',0))
			new_account = int(hour_data.get('new_account',0))
			action  =int(hour_data.get('actoin',0))
			pay_account = int(hour_data.get('pay_account',0))
			pay_income = hour_data.get('pay_income',0)
			datas.append(dict(
							hour = hour,
							new_equip = new_equip,
							new_account = new_account,
							actoin = action,
							pay_account = pay_account,
							pay_income = str(pay_income)
						))
			hours.append(hour)
			new_equips.append(new_equip)
			new_accounts.append(new_account)
			actions.append(action)
			pay_accounts.append(pay_account)
			pay_incomes.append(str(pay_income))
			total_new_equip +=new_equip
			total_new_account += new_account
			total_actoin  += action
			total_pay_account += pay_account
			total_pay_income  +=pay_income
		totals =[]
		if len(datas)>0:
			total_ =yield HourService.Summary(dict(start_time = start_time, server_list = server_list))
			if total_:
				new_account = total_[0].get('new_login_accont',0)
				actoin  = total_[0].get('login_account',0)
				pay_account = total_[0].get('pay_account_num',0)
				pay_income = total_[0].get('income',0.00)
				totals.append(dict(
							new_account = int(new_account) if  new_account else 0,
							actoin = int(actoin) if actoin else 0,
							pay_account = int(pay_account) if pay_account else 0,
							pay_income = str(pay_income) if pay_income else 0.00
					))

		self.finish(dict(code=0,rows=datas,total=len(datas),hours = hours,
			new_equips = new_equips,new_accounts = new_accounts,actions = actions,
			pay_accounts = pay_accounts, pay_incomes = pay_incomes,totals=totals
			))
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
			)
		server_list = self.get_argument('server_list','')
		if server_list:
			server_list  =(server_list.split('|'))
		else:
			server_list = []

		filter_params['server_list'] = server_list
		list_data = yield HourService.GetByFilter(filter_params)
		if len(list_data)<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','时间点','新增设备','新增账号数','活跃人数','付费人数','付费金额']


		rows = [ ','.join(titles) ]
		for item_data in list_data:
			rows.append(','.join([
			item_data.get('create_time').strftime('%Y/%m/%d'),
			str(item_data.get('hours','')),
			str(item_data.get('new_equip',0)),
			str(item_data.get('new_account',0)),
			str(item_data.get('actoin',0)),
			str(item_data.get('pay_account',0)),
			str(item_data.get('pay_income',0))
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('每日实时数据') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return