#coding:utf-8
import tornado.web
import datetime
from configs import *
from tornzen import utils
from services import DailyNewspaperService,RetainService
from web_p.handlers import *
import io
# import xlsxwriter

XLSX_ENABLE = True


#----------------------------------------------------------------
# 分服日报页面
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		self.render_view('/divid_daily_paper.html',title='分服日报')


#------------------------------------------------------------
#  通过条件查询返回数据
#------------------------------------------------------------
class get_data_by_condition(UserCenterHandler.RequestHandler):
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
		if self.admin_flag is False and not self.channel_string and not self.server_string:
			self.finish(dict(code=30005,rows=[],total=0))
			return
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		start_time = self.get_argument('start_time','')
		end_time = self.get_argument('end_time','')
		order_by = self.get_argument('orderby','')
		server_list = self.get_argument('server_list','')
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string
		order = (self.get_argument('order',''))
		server_name = True
		if server_name is False:
			self.finish(dict(code=0,rows=[],total=0))
		datas = []
		daily_datas = yield DailyNewspaperService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list = server_list,
											channel_list = channel_list
										))
		srv_datas = yield self.get_server_data()
		for daily_data in daily_datas[1]:
			new_login_accont  =daily_data.get('new_login_accont',0) 
			login_account = daily_data.get('login_account',0)
			income = daily_data.get('income',0)
			pay_account_num = daily_data.get('pay_account_num',0)
			new_login_pay_income = daily_data.get('new_login_pay_income',0.00)
			new_login_pay_num = daily_data.get('new_login_pay_num',0)
			s_uid = daily_data.get('s_uid','')
			channel_name = daily_data.get('channel_name','')
			d_date = daily_data.get('d_date')
			retain_data   = yield RetainService.GetByFilter(0,2,dict(d_date = d_date,s_uid =s_uid ,channel_name = channel_name))
			retain_data  = retain_data[1][0] if retain_data[1] else dict()
			datas.append(dict(
						id = daily_data.get('id'),
						server = srv_datas.get(s_uid,s_uid),
						d_date = daily_data.get('create_time').strftime('%Y/%m/%d'),
						channel  = channel_name,
						new_login_accont = new_login_accont,
						login_account = login_account,
						pay_account_num = pay_account_num,
						atm_num = daily_data.get('atm_num',0),
						income = str(income),
						first_pay_account = daily_data.get('first_pay_account',0),
						first_pay_account_income = str(daily_data.get('first_pay_account_income',0)),
						new_login_pay_num = new_login_pay_num,
						new_login_pay_income  = str(daily_data.get('new_login_pay_income',0.00)),
						pay_ARPU  = '%.2f' % (float(income)/float(pay_account_num) if pay_account_num else 0.00),
						DAU_ARPU  = '%.2f' % (float(income)/float(login_account) if login_account else 0.00),
						new_pay_ARPU  = '%.2f' % (float(new_login_pay_income)/float(new_login_pay_num) if new_login_pay_num else 0.00),
						new_DAU_ARPU  = '%.2f' % (float(new_login_pay_income)/float(new_login_accont) if new_login_accont else 0.00),
						account_pay_rate  ='%.2f%%' % (daily_data.get('pay_account_num',0)*100/login_account if login_account else 0),
						new_account_pay_rate = '%.2f%%' % (daily_data.get('new_login_pay_num',0)*100/new_login_accont if new_login_accont else 0),

						two_d_rate = '%.2f%%' % retain_data.get('once_retain',0),
						th_d_rate = '%.2f%%' % retain_data.get('three_retain',0),
						four_retain = '%.2f%%' % retain_data.get('four_retain',0),
						five_retain = '%.2f%%' % retain_data.get('five_retain',0),
						six_retain = '%.2f%%' % retain_data.get('six_retain',0),
						s_d_rate = '%.2f%%' % retain_data.get('seven_retain',0),
						fifteen_retain = '%.2f%%' % retain_data.get('fifteen_retain',0),
						thirty_retain = '%.2f%%' % retain_data.get('thirty_retain',0),
						sixty_retain = '%.2f%%' % retain_data.get('sixty_retain',0),
						ninety_retain = '%.2f%%' % retain_data.get('ninety_retain',0),
						forty_five_retain = '%.2f%%' % retain_data.get('forty_five_retain',0),
						seventy_five_retain = '%.2f%%' % retain_data.get('seventy_five_retain',0),

					))
		if len(datas)>0:
			##  汇总的数据
			total_ = yield DailyNewspaperService.total_select(dict(start_time = start_time, end_time =end_time, 
				server_list =server_list,channel_list = channel_list))
			_data = dict(d_date= '汇总')
			retain_total = yield RetainService.total_select(dict(start_time = start_time, end_time =end_time, 
				server_list =server_list,channel_list = channel_list))
			if total_[0]:
				new_login_accont = int(total_[0].get('new_login_accont',0))
				login_account = int(total_[0].get('login_account',0))
				income = total_[0].get('income',0)
				pay_account_num  =int(total_[0].get('pay_account_num',0))
				new_login_pay_income = total_[0].get('new_login_pay_income',0.00)
				new_login_pay_num = int(total_[0].get('new_login_pay_num',0))
				_data['new_login_accont'] = new_login_accont
				_data['login_account'] = login_account
				_data['pay_account_num'] = pay_account_num
				_data['atm_num'] = int(total_[0].get('atm_num',0))
				_data['income'] = str(income)
				_data['first_pay_account'] = int(total_[0].get('first_pay_account',0))
				_data['first_pay_account_income'] = str(total_[0].get('first_pay_account_income',0))
				_data['new_login_pay_num']  = int(total_[0].get('new_login_pay_num',0))
				_data['new_login_pay_income'] = str((total_[0].get('new_login_pay_income',0.00)))
				_data['pay_ARPU'] = '%.2f' % (float(income)/float(pay_account_num) if pay_account_num else 0.00)
				_data['DAU_ARPU'] = '%.2f' % (float(income)/float(login_account) if login_account else 0.00)
				_data['new_pay_ARPU'] = '%.2f' % (float(new_login_pay_income)/float(new_login_pay_num) if new_login_pay_num else 0.00)
				_data['new_DAU_ARPU'] = '%.2f' % (float(new_login_pay_income)/float(new_login_accont) if new_login_accont else 0.00)
				_data['account_pay_rate'] = '%.2f%%' % ((pay_account_num*100)/login_account if login_account else 0)
				_data['new_account_pay_rate'] = '%.2f%%' % (int(total_[0].get('new_login_pay_num',0)*100)/new_login_accont if new_login_accont else 0)
				_data['two_d_rate'] = '%.2f%%' % (retain_total[0].get('once_retain',0) if retain_total[0].get('once_retain',0) else 0)
				_data['th_d_rate'] = '%.2f%%' % (retain_total[0].get('three_retain',0) if retain_total[0].get('three_retain',0) else 0)
				_data['s_d_rate'] = '%.2f%%' % (retain_total[0].get('seven_retain',0) if  retain_total[0].get('seven_retain',0) else 0)
				_data['four_retain'] = '%.2f%%' % (retain_total[0].get('four_retain',0) if retain_total[0].get('four_retain',0) else 0 )
				_data['five_retain'] = '%.2f%%' % (retain_total[0].get('five_retain',0) if retain_total[0].get('five_retain',0) else 0)
				_data['six_retain'] = '%.2f%%' % (retain_total[0].get('six_retain',0) if retain_total[0].get('six_retain',0) else 0)
				_data['fifteen_retain'] = '%.2f%%' % (retain_total[0].get('fifteen_retain',0) if retain_total[0].get('fifteen_retain',0) else 0)
				_data['thirty_retain'] = '%.2f%%' % (retain_total[0].get('thirty_retain',0) if retain_total[0].get('thirty_retain',0) else 0)
				_data['forty_five_retain'] = '%.2f%%' % (retain_total[0].get('forty_five_retain',0) if retain_total[0].get('forty_five_retain',0) else 0)
				_data['sixty_retain'] = '%.2f%%' % (retain_total[0].get('sixty_retain',0) if retain_total[0].get('sixty_retain',0) else 0)
				_data['seventy_five_retain'] = '%.2f%%' % (retain_total[0].get('seventy_five_retain',0) if retain_total[0].get('seventy_five_retain',0) else 0)
				_data['ninety_retain'] = '%.2f%%' % (retain_total[0].get('ninety_retain',0) if retain_total[0].get('ninety_retain',0) else 0)


				# _data['avg_online'] = int(total_[0].get('average_number_online',0))
				# _data['highest_online'] = int(total_[0].get('highest_online',0))
			datas.insert(0,_data)

		self.finish(dict(code=0,rows=datas,total=daily_datas[0]))
		return

#----------------------------------------------------------------------
# 获取用户菜单权限
#  -------------------------------------------------------------------
class menu(WebBaseHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def post(self):
		try:
			########### 通过用户获取角色再获取角色相应的权限
			##   首次用户登录时获取该用户的所有权限，做个缓存
			yield self.get_menu()
			if not self.current_user:
				self.redirect('/login/')
				return
			self.finish(dict(code = 0,menu = self.menu_data,user_name=(self.get_secure_cookie("user_name")).decode()))
			return
		except Exception as e:
			self.finish(dict(code=1))
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
		if self.admin_flag is False and not self.channel_string and not self.server_string:
			self.write('没有权限')
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
		filter_params['server_list']  = server_list
		filter_params['channel_list']  = channel_list
		list_data = yield DailyNewspaperService.GetByFilter(0,1000000,filter_params)
		if list_data[0]<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','渠道','服务器','新登账号','登录账号','付费账号数','总充值次数','收入','首次付费账号','首次付费收入','新登付费数','新登账号收入',
		'付费ARPU','DAU ARPU','账号付费率','新增账号付费率','新登用户ARPU','新登用户ARPPU','次日存留','3日存留','4日存留','5日存留',
		'6日存留','7日存留','15日存留','30日存留','45日存留','60日存留','75日存留','90日存留']

		rows = [ ','.join(titles) ]
		srv_datas = yield self.get_server_data()
		total_ = yield DailyNewspaperService.total_select(filter_params)
		if total_[0]:
			new_login_accont = int(total_[0].get('new_login_accont',0))
			login_account = int(total_[0].get('login_account',0))
			income = total_[0].get('income',0)
			pay_account_num  =int(total_[0].get('pay_account_num',0))
			new_login_pay_income = (total_[0].get('new_login_pay_income',0))
			new_login_pay_num = int(total_[0].get('new_login_pay_num',0))
			retain_total = yield RetainService.total_select(filter_params)
			rows.append(','.join(['汇总','-','-',
								str(new_login_accont),
								str(login_account),
								str(pay_account_num),
								str(total_[0].get('atm_num',0)),
								str(income),
								str(total_[0].get('first_pay_account',0)),
								str(total_[0].get('first_pay_account_income',0)),
								str(total_[0].get('new_login_pay_num',0)),
								str((total_[0].get('new_login_pay_income',0.00))),
								'%.2f' % (float(income)/float(pay_account_num) if pay_account_num else 0.00),
								'%.2f' % (float(income)/float(login_account) if login_account else 0.00),
								'%.2f%%' % ((pay_account_num*100)/login_account if login_account else 0),
								'%.2f%%' % (int(total_[0].get('new_login_pay_num',0)*100)/new_login_accont if new_login_accont else 0),
								'%.2f' % (float(new_login_pay_income)/float(new_login_pay_num) if new_login_pay_num else 0.00),
								'%.2f' % (float(new_login_pay_income)/float(new_login_accont) if new_login_accont else 0.00),
								'%.2f%%' % (retain_total[0].get('once_retain',0) if retain_total[0].get('once_retain',0) else 0),
								'%.2f%%' % (retain_total[0].get('three_retain',0) if retain_total[0].get('three_retain',0) else 0),
								'%.2f%%' % (retain_total[0].get('four_retain',0) if retain_total[0].get('four_retain',0) else 0 ),
								'%.2f%%' % (retain_total[0].get('five_retain',0) if retain_total[0].get('five_retain',0) else 0),
								'%.2f%%' % (retain_total[0].get('six_retain',0) if retain_total[0].get('six_retain',0) else 0 ),
								'%.2f%%' % (retain_total[0].get('seven_retain',0) if retain_total[0].get('seven_retain',0) else 0),
								'%.2f%%' % (retain_total[0].get('fifteen_retain',0) if retain_total[0].get('fifteen_retain',0) else 0),
								'%.2f%%' % (retain_total[0].get('thirty_retain',0) if retain_total[0].get('thirty_retain',0) else 0),
								'%.2f%%' % (retain_total[0].get('forty_five_retain',0) if retain_total[0].get('forty_five_retain',0) else 0),
								'%.2f%%' % (retain_total[0].get('sixty_retain',0) if retain_total[0].get('sixty_retain',0) else 0 ),
								'%.2f%%' % (retain_total[0].get('seventy_five_retain',0) if retain_total[0].get('seventy_five_retain',0) else 0),
								'%.2f%%' % (retain_total[0].get('ninety_retain',0) if retain_total[0].get('ninety_retain',0) else 0 ),
				]))

		for item_data in list_data[1]:
			new_login_accont  = item_data.get('new_login_accont',0) 
			new_login_pay_income = item_data.get('new_login_pay_income',0)
			new_login_pay_num = item_data.get('new_login_pay_num',0)
			channel_name = item_data.get('channel_name','')
			s_uid = item_data.get('s_uid','')
			d_date = item_data.get('d_date')
			retain_data   = yield RetainService.GetByFilter(0,1,dict(d_date = d_date,s_uid =s_uid ,channel_name = channel_name))
			retain_data  = retain_data[1][0] if retain_data[1] else dict()

			rows.append(','.join([
			item_data.get('create_time').strftime('%Y/%m/%d'),
			channel_name,
			srv_datas.get(s_uid,s_uid),
			str(new_login_accont),
			str(item_data.get('login_account',0)),
			str(item_data.get('pay_account_num','')),
			str(item_data.get('atm_num',0)),
			str(item_data.get('income',0)),
			str(item_data.get('first_pay_account',0)),
			str(item_data.get('first_pay_account_income',0)),
			str(item_data.get('new_login_pay_num',0)),
			str(item_data.get('new_login_pay_income',0.00)),
			str(item_data.get('pay_ARPU',0.00)),
			str(item_data.get('DAU_ARPU',0.00)),
			'%.2f%%' % (item_data.get('pay_account_num',0)*100/item_data.get('login_account') if item_data.get('login_account') else 0),
			'%.2f%%' % (item_data.get('new_login_pay_num',0)*100/new_login_accont if new_login_accont else 0),
			'%.2f' % (float(new_login_pay_income)/float(new_login_pay_num) if new_login_pay_num else 0.00),
			'%.2f' % (float(new_login_pay_income)/float(new_login_accont) if new_login_accont else 0.00),
			'%.2f%%' % (item_data.get('once_retain',0)),
			'%.2f%%' % (item_data.get('three_retain',0)),
			'%.2f%%' % (retain_data.get('four_retain',0)),
			'%.2f%%' % (retain_data.get('five_retain',0)),
			'%.2f%%' % (retain_data.get('six_retain',0)),
			'%.2f%%' % (item_data.get('seven_retain',0)),
			'%.2f%%' % (retain_data.get('fifteen_retain',0)),
			'%.2f%%' % (retain_data.get('thirty_retain',0)),
			'%.2f%%' % (retain_data.get('forty_five_retain',0)),
			'%.2f%%' % (retain_data.get('sixty_retain',0)),
			'%.2f%%' % (retain_data.get('seventy_five_retain',0)),
			'%.2f%%' % (retain_data.get('ninety_retain',0))
			]))

		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('分服日报') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return

class DailyData(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		self.render_view('/daily_paper.html',title='日报')

#------------------------------------------------------------
# 按服务器来查数据
#------------------------------------------------------------
class get_daily_data(UserCenterHandler.RequestHandler):
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
		if self.admin_flag is False and not self.channel_string and not self.server_string:
			self.finish(dict(code=30005,rows=[],total=0))
			return
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		start_time = self.get_argument('start_time','')
		end_time = self.get_argument('end_time','')
		order_by = self.get_argument('orderby','')
		server_list = self.get_argument('server_list','')

		if not server_list:
			server_list = self.server_string
		order = (self.get_argument('order',''))
		server_name = True
		if server_name is False:
			self.finish(dict(code=0,rows=[],total=0))
		datas = []
		daily_datas = yield DailyNewspaperService.getdailyserverdata(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list = server_list
										))
		srv_datas = yield self.get_server_data()
		for daily_data in daily_datas[1]:
			new_login_accont  = int(daily_data.get('new_login_accont',0))
			login_account = int(daily_data.get('login_account',0))
			income = daily_data.get('income',0)
			pay_account_num = int(daily_data.get('pay_account_num',0))

			new_login_pay_income = daily_data.get('new_login_pay_income',0.00)
			new_login_pay_num = daily_data.get('new_login_pay_income',0)
			datas.append(dict(
						id = daily_data.get('id'),
						server = srv_datas.get(daily_data.get('s_uid','')),
						d_date = daily_data.get('create_time').strftime('%Y/%m/%d'),
						new_login_accont = new_login_accont,
						login_account = login_account,
						pay_account_num = pay_account_num,
						atm_num = daily_data.get('atm_num',0),
						income = str(income),
						first_pay_account = str(daily_data.get('first_pay_account',0)),
						first_pay_account_income = str(daily_data.get('first_pay_account_income',0)),
						new_login_pay_num = str(daily_data.get('new_login_pay_num',0)),
						new_login_pay_income  = str(daily_data.get('new_login_pay_income',0.00)),
						pay_ARPU  = '%.2f' % (float(income)/float(pay_account_num) if pay_account_num else 0.00),
						DAU_ARPU  = '%.2f' % (float(income)/float(login_account) if login_account else 0.00),
						new_pay_ARPU  = '%.2f' % (float(new_login_pay_income)/float(new_login_pay_num) if new_login_pay_num else 0.00),
						new_DAU_ARPU  = '%.2f' % (float(new_login_pay_income)/float(new_login_accont) if new_login_accont else 0.00),
						account_pay_rate  ='%.2f%%' % (daily_data.get('pay_account_num',0)*100/login_account if login_account else 0),
						new_account_pay_rate = '%.2f%%' % (daily_data.get('new_login_pay_num',0)*100/new_login_accont if new_login_accont else 0),
						two_d_rate = '%.2f%%' %  (daily_data.get('once_retain',0)*100/new_login_accont if new_login_accont else 0),
						th_d_rate = '%.2f%%' % (daily_data.get('three_retain',0)*100/new_login_accont if new_login_accont else 0),
						fr_d_rate = '%.2f%%' % (daily_data.get('four_retain',0)*100/new_login_accont if new_login_accont else 0),
						fv_d_rate = '%.2f%%' % (daily_data.get('five_retain',0)*100/new_login_accont if new_login_accont else 0),
						sx_d_rate = '%.2f%%' % (daily_data.get('six_retain',0)*100/new_login_accont if new_login_accont else 0),
						s_d_rate = '%.2f%%' % (daily_data.get('seven_retain',0)*100/new_login_accont if new_login_accont else 0),
						fifteen_retain = '%.2f%%' % (daily_data.get('fifteen_retain',0)*100/new_login_accont if new_login_accont else 0),
						thirty_retain = '%.2f%%' % (daily_data.get('thirty_retain',0)*100/new_login_accont if new_login_accont else 0),
						sixty_retain = '%.2f%%' % (daily_data.get('sixty_retain',0)*100/new_login_accont if new_login_accont else 0),
						ninety_retain = '%.2f%%' % (daily_data.get('ninety_retain',0)*100/new_login_accont if new_login_accont else 0),
					))
		if len(datas)>0:
			##  汇总的数据
			total_ = yield DailyNewspaperService.total_select_to_server(dict(start_time = start_time, end_time =end_time, 
				server_list =server_list))
			_data = dict(d_date= '',server='服务器')
			if total_[0]:
				new_login_accont = int(total_[0].get('new_login_accont',0))
				login_account = int(total_[0].get('login_account',0))
				income = total_[0].get('income',0)
				page = daily_datas[0]
				pay_account_num  =int(total_[0].get('pay_account_num',0))

				new_login_pay_income = total_[0].get('new_login_pay_income',0.00)
				new_login_pay_num = total_[0].get('new_login_pay_num',0.00)

				_data['new_login_accont'] = new_login_accont
				_data['login_account'] = login_account
				_data['pay_account_num'] = pay_account_num
				_data['atm_num'] = int(total_[0].get('atm_num',0))
				_data['income'] = str(income)
				_data['first_pay_account'] = int(total_[0].get('first_pay_account',0))
				_data['first_pay_account_income'] = str(total_[0].get('first_pay_account_income',0))
				_data['new_login_pay_num']  = int(total_[0].get('new_login_pay_num',0))
				_data['new_login_pay_income'] = str((total_[0].get('new_login_pay_income',0.00)))
				_data['pay_ARPU'] = '%.2f' % (float(income)/float(pay_account_num) if pay_account_num else 0.00)
				_data['DAU_ARPU'] = '%.2f' % (float(income)/float(login_account) if login_account else 0.00)
				_data['new_pay_ARPU'] = '%.2f' % (float(new_login_pay_income)/float(new_login_pay_num) if new_login_pay_num else 0.00)
				_data['new_DAU_ARPU'] = '%.2f' % (float(new_login_pay_income)/float(new_login_accont) if new_login_accont else 0.00)
				_data['account_pay_rate'] = '%.2f%%' % ((pay_account_num*100)/login_account if login_account else 0)
				_data['new_account_pay_rate'] = '%.2f%%' % (int(total_[0].get('new_login_pay_num',0)*100)/new_login_accont if new_login_accont else 0)
				_data['two_d_rate'] = '%.2f%%' % (total_[0].get('once_retain',0)*100/page if page and total_[0].get('once_retain',0) else 0)
				_data['th_d_rate'] = '%.2f%%' % (total_[0].get('three_retain',0)*100/page if page and total_[0].get('three_retain',0) else 0)
				_data['fr_d_rate'] = '%.2f%%' % (total_[0].get('four_retain',0)*100/page if page and total_[0].get('four_retain',0) else 0)
				_data['fv_d_rate'] = '%.2f%%' % (total_[0].get('five_retain',0)*100/page if page and total_[0].get('five_retain',0) else 0)
				_data['sx_d_rate'] = '%.2f%%' % (total_[0].get('six_retain',0)*100/page if page and total_[0].get('six_retain',0) else 0)
				_data['s_d_rate'] = '%.2f%%' % (total_[0].get('seven_retain',0)*100/page if page and total_[0].get('seven_retain',0) else 0)
				_data['fifteen_retain'] = '%.2f%%' % (total_[0].get('fifteen_retain',0)*100/page  if page and total_[0].get('fifteen_retain',0) else 0)
				_data['thirty_retain'] = '%.2f%%' % (total_[0].get('thirty_retain',0)*100/page if page and total_[0].get('thirty_retain',0) else 0)
				_data['sixty_retain'] = '%.2f%%' % (total_[0].get('sixty_retain',0)*100/page if page and total_[0].get('sixty_retain',0) else 0)
				_data['ninety_retain'] = '%.2f%%' % (total_[0].get('ninety_retain',0)*100/page if page and total_[0].get('ninety_retain',0) else 0)
			datas.insert(0,_data)
		self.finish(dict(code=0,rows=datas,total=daily_datas[0]))
		return

# ---------------------------------------------------------------------------------------
# 导出数据
# ---------------------------------------------------------------------------------------
class ServerExport(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write('没有权限')
			return
		if not (self.current_user):
			self.write('请登录')
			return 
		if self.admin_flag is False and not self.channel_string and not self.server_string:
			self.write('没有权限')
			return
		timenow = datetime.datetime.now()
		filter_params = dict(
				start_time = self.get_argument('start_time',''),
				end_time = self.get_argument('end_time',''),
				order_by = self.get_argument('orderby','')
			)
		server_list = self.get_argument('server_list','')
		if not server_list:
			server_list = self.server_string
		filter_params['server_list']  = server_list
		list_data = yield DailyNewspaperService.getdailyserverdata(0,1000000,filter_params)
		if list_data[0]<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','服务器','新登账号','登录账号','付费账号数','总充值次数','收入','首次付费账号','首次付费收入','新登付费数','新登账号收入',
		'付费ARPU','DAU ARPU','账号付费率','新增账号付费率','新登用户ARPU','新登用户ARPPU','次日存留','3日存留','4日存留','5日存留','6日存留','7日存留','15日存留','30日存留','60日存留','90日存留']

		rows = [ ','.join(titles) ]
		srv_datas = yield self.get_server_data()
		total_ = yield DailyNewspaperService.total_select_to_server(filter_params)
		page = list_data[0]
		if total_[0]:
			new_login_accont = int(total_[0].get('new_login_accont',0))
			login_account = int(total_[0].get('login_account',0))
			income = total_[0].get('income',0)
			pay_account_num  =int(total_[0].get('pay_account_num',0))


			new_login_pay_income = (total_[0].get('new_login_pay_income',0.00))
			new_login_pay_num = (total_[0].get('new_login_pay_num',0.00))
			rows.append(','.join(['','服务器',
								str(new_login_accont),
								str(login_account),
								str(pay_account_num),
								str(int(total_[0].get('atm_num',0))),
								str(income),
								str(total_[0].get('first_pay_account',0)),
								str(total_[0].get('first_pay_account_income',0)),
								str(total_[0].get('new_login_pay_num',0)),
								str((total_[0].get('new_login_pay_income',0.00))),
								'%.2f' % (float(income)/float(pay_account_num) if pay_account_num else 0.00),
								'%.2f' % (float(income)/float(login_account) if login_account else 0.00),
								'%.2f%%' % ((pay_account_num*100)/login_account if login_account else 0),
								'%.2f%%' % (int(total_[0].get('new_login_pay_num',0)*100)/new_login_accont if new_login_accont else 0),
								'%.2f' % (float(new_login_pay_income)/float(new_login_pay_num) if new_login_pay_num else 0.00),
								'%.2f' % (float(new_login_pay_income)/float(new_login_accont) if new_login_accont else 0.00),
								'%.2f%%' % (total_[0].get('once_retain',0)*100/page if page else 0),
								'%.2f%%' % (total_[0].get('three_retain',0)*100/page if page else 0),
								'%.2f%%' % (total_[0].get('four_retain',0)*100/page if page else 0),
								'%.2f%%' % (total_[0].get('five_retain',0)*100/page if page else 0),
								'%.2f%%' % (total_[0].get('six_retain',0)*100/page if page else 0),
								'%.2f%%' % (total_[0].get('seven_retain',0)*100/page if page else 0),
								'%.2f%%' % (total_[0].get('fifteen_retain',0)*100/page if page else 0),
								'%.2f%%' % (total_[0].get('thirty_retain',0)*100/page if page else 0),
								'%.2f%%' % (total_[0].get('sixty_retain',0)*100/page if page else 0),
								'%.2f%%' % (total_[0].get('ninety_retain',0)*100/page if page else 0)
				]))


		for item_data in list_data[1]:
			new_login_accont  = int(item_data.get('new_login_accont',0))
			pay_account_num = int(item_data.get('pay_account_num',0))
			login_account = int(item_data.get('login_account',0))
			_income = item_data.get('income',0)

			new_login_pay_income = item_data.get('new_login_pay_income',0)
			new_login_pay_num = item_data.get('new_login_pay_num',0)
			rows.append(','.join([
			item_data.get('create_time').strftime('%Y/%m/%d'),
			srv_datas.get(item_data.get('s_uid','')),
			str(new_login_accont),
			str(login_account),
			str(pay_account_num),
			str(item_data.get('atm_num',0)),
			str(_income),
			str(item_data.get('first_pay_account',0)),
			str(item_data.get('first_pay_account_income',0)),
			str(new_login_pay_num),
			str(new_login_pay_income),
			'%.2f' % (float(_income)/float(pay_account_num) if pay_account_num else 0.00),
			'%.2f' % (float(_income)/float(login_account) if login_account else 0.00),
			'%.2f%%' % (pay_account_num*100/login_account if login_account else 0),
			'%.2f%%' % (new_login_pay_num*100/new_login_accont if new_login_accont else 0),
			'%.2f' % (float(new_login_pay_income)/float(new_login_pay_num) if new_login_pay_num else 0.00),
			'%.2f' % (float(new_login_pay_income)/float(new_login_accont) if new_login_accont else 0.00),
			'%.2f%%' % (item_data.get('once_retain',0)*100/new_login_accont if new_login_accont else 0),
			'%.2f%%' % (item_data.get('three_retain',0)*100/new_login_accont if new_login_accont else 0),
			'%.2f%%' % (item_data.get('four_retain',0)*100/new_login_accont if new_login_accont else 0),
			'%.2f%%' % (item_data.get('five_retain',0)*100/new_login_accont if new_login_accont else 0),
			'%.2f%%' % (item_data.get('six_retain',0)*100/new_login_accont if new_login_accont else 0),
			'%.2f%%' % (item_data.get('seven_retain',0)*100/new_login_accont if new_login_accont else 0),
			'%.2f%%' % (item_data.get('fifteen_retain',0)*100/new_login_accont if new_login_accont else 0),
			'%.2f%%' % (item_data.get('thirty_retain',0)*100/new_login_accont if new_login_accont else 0),
			'%.2f%%' % (item_data.get('sixty_retain',0)*100/new_login_accont if new_login_accont else 0),
			'%.2f%%' % (item_data.get('ninety_retain',0)*100/new_login_accont if new_login_accont else 0)
			]))

		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('日报') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return