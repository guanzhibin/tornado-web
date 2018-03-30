#coding:utf-8
import tornado.web
import datetime
from configs import *
from tornzen import utils
from services import ChannelService,RetainService
from web_p.handlers import *
import io



#----------------------------------------------------------------
# 分服日报页面
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		self.render_view('/ch_news_paper.html',title='分渠道日报')


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
		order_by = self.get_argument('orderby','')
		server_list = self.get_argument('server_list','')
		order = (self.get_argument('order',''))
		if server_list:
			server_list  =(server_list.split('|'))
		elif self.channel_string:
			server_list = (self.channel_string).split(',')
		else:
			server_list = []
		datas = []
		daily_datas = yield ChannelService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list = tuple(server_list)
										))

		for daily_data in daily_datas[1]:
			new_login_accont  =daily_data.get('new_login_accont',0) 
			login_account = daily_data.get('login_account',0)
			new_equipment = daily_data.get('new_equipment',0)
			income = daily_data.get('income',0)
			pay_account_num = daily_data.get('pay_account_num',0)

			new_login_pay_income = daily_data.get('new_login_pay_income',0.00)
			new_login_pay_num = daily_data.get('new_login_pay_num',0)
			channel_name = daily_data.get('channel_name','')
			d_date = daily_data.get('d_date')
			retain_data   = yield RetainService.GetByFilter(0,2,dict(d_date = d_date,channel_name = channel_name))
			retain_data  = retain_data[1][0] if retain_data[1] else dict()
			datas.append(dict(
						d_date = daily_data.get('create_time').strftime('%Y/%m/%d'),
						channel  = daily_data.get('channel_name',''),
						new_equipment = new_equipment,
						valid_rate = '%.2f%%' % (daily_data.get('valid_e_num',0)*100/new_equipment if new_equipment else 0),
						new_login_accont = new_login_accont,
						login_account = login_account,
						pay_account_num = pay_account_num,
						atm_num = daily_data.get('atm_num',0),
						income = str(income),
						first_pay_account = daily_data.get('first_pay_account',0),
						first_pay_account_income = str(daily_data.get('first_pay_account_income',0)),
						new_login_pay_num = daily_data.get('new_login_pay_num',0),
						new_login_pay_income  = str(daily_data.get('new_login_pay_income',0.00)),
						pay_ARPU  = '%.2f' % (float(income)/float(pay_account_num) if pay_account_num else 0),
						DAU_ARPU  = '%.2f' % (float(income)/float(login_account) if login_account else 0),
						account_pay_rate  ='%.2f%%' % (pay_account_num*100/login_account if login_account else 0),
						new_account_pay_rate = '%.2f%%' % (daily_data.get('new_login_pay_num',0)*100/new_login_accont if new_login_accont else 0),
						new_pay_ARPU  = '%.2f' % (float(new_login_pay_income)/float(new_login_pay_num) if new_login_pay_num else 0.00),
						new_DAU_ARPU  = '%.2f' % (float(new_login_pay_income)/float(new_login_accont) if new_login_accont else 0.00),
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
			total_ = yield ChannelService.total_select(dict(start_time = start_time, end_time =end_time, server_list =server_list))
			_data = dict(d_date= '汇总')
			retain_total = yield RetainService.total_select(dict(start_time = start_time, end_time =end_time, 
				channel_list =','.join(server_list)))
			if total_[0]:
				new_login_accont = int(total_[0].get('new_login_accont',0))
				login_account = int(total_[0].get('login_account',0))
				new_equipment = int(total_[0].get('new_equipment',0))
				income = total_[0].get('income',0)
				pay_account_num = int(total_[0].get('pay_account_num',0))

				new_login_pay_income = total_[0].get('new_login_pay_income',0.00)
				new_login_pay_num = int(total_[0].get('new_login_pay_num',0))
				_data['new_equipment'] = new_equipment
				_data['valid_rate'] = '%.2f%%' % (total_[0].get('valid_e_num',0)*100/new_equipment if new_equipment else 0)
				_data['new_login_accont'] = new_login_accont
				_data['login_account'] = login_account
				_data['pay_account_num'] = pay_account_num
				_data['atm_num'] = int(total_[0].get('atm_num',0))
				_data['income'] = str(income)
				_data['first_pay_account'] = int(total_[0].get('first_pay_account',0))
				_data['first_pay_account_income'] = str(total_[0].get('first_pay_account_income',0))
				_data['new_login_pay_num']  = int(total_[0].get('new_login_pay_num',0))
				_data['new_login_pay_income'] = str((total_[0].get('new_login_pay_income',0.00)))
				_data['pay_ARPU'] = '%.2f' % (float(income)/float(pay_account_num) if pay_account_num else 0)
				_data['DAU_ARPU'] = '%.2f' % (float(income)/float(login_account) if login_account else 0)
				_data['account_pay_rate'] = '%.2f%%' % (pay_account_num*100/login_account if login_account else 0)
				_data['new_account_pay_rate'] = '%.2f%%' % (int(total_[0].get('new_login_pay_num',0)*100)/new_login_accont if new_login_accont else 0)
				_data['two_d_rate'] = '%.2f%%' % (retain_total[0].get('once_retain',0) if retain_total[0].get('once_retain',0) else 0)
				_data['th_d_rate'] = '%.2f%%' % (retain_total[0].get('three_retain',0) if retain_total[0].get('three_retain',0) else 0)
				_data['s_d_rate'] = '%.2f%%' % (retain_total[0].get('seven_retain',0) if retain_total[0].get('seven_retain',0) else 0)
				_data['four_retain'] = '%.2f%%' % (retain_total[0].get('four_retain',0) if retain_total[0].get('four_retain',0) else 0)
				_data['five_retain'] = '%.2f%%' % (retain_total[0].get('five_retain',0) if retain_total[0].get('five_retain',0) else 0)
				_data['six_retain'] = '%.2f%%' % (retain_total[0].get('six_retain',0) if retain_total[0].get('six_retain',0) else 0)
				_data['fifteen_retain'] = '%.2f%%' % (retain_total[0].get('fifteen_retain',0) if retain_total[0].get('fifteen_retain',0) else 0)
				_data['thirty_retain'] = '%.2f%%' % (retain_total[0].get('thirty_retain',0) if retain_total[0].get('thirty_retain',0) else 0)
				_data['forty_five_retain'] = '%.2f%%' % (retain_total[0].get('forty_five_retain',0) if retain_total[0].get('forty_five_retain',0) else 0)
				_data['sixty_retain'] = '%.2f%%' % (retain_total[0].get('sixty_retain',0) if retain_total[0].get('sixty_retain',0) else 0)
				_data['seventy_five_retain'] = '%.2f%%' % (retain_total[0].get('seventy_five_retain',0) if retain_total[0].get('seventy_five_retain',0) else 0)
				_data['ninety_retain'] = '%.2f%%' % (retain_total[0].get('ninety_retain',0) if retain_total[0].get('ninety_retain',0) else 0)
				_data['new_pay_ARPU'] = '%.2f' % (float(new_login_pay_income)/float(new_login_pay_num) if new_login_pay_num else 0.00)
				_data['new_DAU_ARPU'] = '%.2f' % (float(new_login_pay_income)/float(new_login_accont) if new_login_accont else 0.00)
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
		timenow = datetime.datetime.now()
		filter_params = dict(
				start_time = self.get_argument('start_time',''),
				end_time = self.get_argument('end_time',''),
				order_by = self.get_argument('orderby','')
			)
		server_list = self.get_argument('server_list','')
		if server_list:
			server_list  =(server_list.split('|'))
		else:
			server_list = []
		filter_params['server_list']  = tuple(server_list)
		list_data = yield ChannelService.GetByFilter(0,10000000,filter_params)
		if list_data[0]<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','渠道','新增设备','转化率','新登账号','登录账号','付费账号数','总充值次数','收入','首次付费账号','首次付费收入','新登付费数','新登账号收入',
		'付费ARPU','DAU ARPU','账号付费率','新增账号付费率','新登用户ARPU','新登用户ARPPU','次日存留','3日存留','4日存留','5日存留',
		'6日存留','7日存留','15日存留','30日存留','60日存留','90日存留']



		rows = [ ','.join(titles) ]
		total_ = yield ChannelService.total_select(filter_params)
		if total_[0]:
			new_login_accont = int(total_[0].get('new_login_accont',0))
			login_account = int(total_[0].get('login_account',0))
			new_equipment = int(total_[0].get('new_equipment',0))
			income = total_[0].get('income',0)
			pay_account_num = int(total_[0].get('pay_account_num',0))

			new_login_pay_income = (total_[0].get('new_login_pay_income',0))
			new_login_pay_num = int(total_[0].get('new_login_pay_num',0))
			filter_params.pop('server_list',0)
			filter_params['channel_list'] = ','.join(server_list)
			retain_total = yield RetainService.total_select(filter_params)
			rows.append(','.join(['','渠道',
								str(new_equipment),
								'%.2f%%' % (total_[0].get('valid_e_num',0)*100/new_equipment if new_equipment else 0),
								str(new_login_accont),
								str(login_account),
								str(pay_account_num),
								str(total_[0].get('atm_num',0)),
								str(income),
								str(total_[0].get('first_pay_account',0)),
								str(total_[0].get('first_pay_account_income',0)),
								str(total_[0].get('new_login_pay_num',0)),
								str((total_[0].get('new_login_pay_income',0.00))),
								'%.2f' % (float(income)/float(pay_account_num) if pay_account_num else 0),
								'%.2f' % (float(income)/float(login_account) if login_account else 0),
								'%.2f%%' % (pay_account_num*100/login_account if login_account else 0),
								'%.2f%%' % (int(total_[0].get('new_login_pay_num',0)*100)/new_login_accont if new_login_accont else 0),
								'%.2f' % (float(new_login_pay_income)/float(new_login_pay_num) if new_login_pay_num else 0.00),
								'%.2f' % (float(new_login_pay_income)/float(new_login_accont) if new_login_accont else 0.00),
								'%.2f%%' % (retain_total[0].get('once_retain',0) if retain_total[0].get('once_retain',0) else 0 ),
								'%.2f%%' % (retain_total[0].get('three_retain',0) if retain_total[0].get('three_retain',0) else 0 ),
								'%.2f%%' % (retain_total[0].get('four_retain',0) if retain_total[0].get('four_retain',0) else 0),
								'%.2f%%' % (retain_total[0].get('five_retain',0) if retain_total[0].get('five_retain',0) else 0),
								'%.2f%%' % (retain_total[0].get('six_retain',0) if retain_total[0].get('six_retain',0) else 0),
								'%.2f%%' % (retain_total[0].get('seven_retain',0) if retain_total[0].get('seven_retain',0) else 0),
								'%.2f%%' % (retain_total[0].get('fifteen_retain',0) if retain_total[0].get('fifteen_retain',0) else 0 ),
								'%.2f%%' % (retain_total[0].get('thirty_retain',0) if retain_total[0].get('thirty_retain',0) else 0),
								'%.2f%%' % (retain_total[0].get('sixty_retain',0) if retain_total[0].get('sixty_retain',0) else 0),
								'%.2f%%' % (retain_total[0].get('ninety_retain',0) if retain_total[0].get('ninety_retain',0) else 0),
				]))

		for item_data in list_data[1]:
			new_login_accont  = item_data.get('new_login_accont',0) 
			login_account = item_data.get('login_account',0)
			new_equipment = item_data.get('new_equipment',0)
			income = item_data.get('income',0)
			pay_account_num = int(item_data.get('pay_account_num',0))

			new_login_pay_income = item_data.get('new_login_pay_income',0)
			new_login_pay_num = item_data.get('new_login_pay_num',0)
			channel_name = item_data.get('channel_name','')
			d_date = item_data.get('d_date')
			retain_data   = yield RetainService.GetByFilter(0,1,dict(d_date = d_date,channel_name = channel_name))
			retain_data  = retain_data[1][0] if retain_data[1] else dict()

			rows.append(','.join([
			item_data.get('create_time').strftime('%Y/%m/%d'),
			item_data.get('channel_name',''),
			str(new_equipment),
			'%.2f%%' % (item_data.get('valid_e_num',0)*100/new_equipment if new_equipment else 0),
			str(new_login_accont),
			str(login_account),
			str(pay_account_num),
			str(item_data.get('atm_num',0)),
			str(income),
			str(item_data.get('first_pay_account',0)),
			str(item_data.get('first_pay_account_income',0)),
			str(item_data.get('new_login_pay_num',0)),
			str(item_data.get('new_login_pay_income',0.00)),
			'%.2f' %(float(income)/float(pay_account_num) if pay_account_num else 0),
			'%.2f' % (float(income)/float(login_account) if login_account else 0),
			'%.2f%%' % (pay_account_num*100/login_account if login_account else 0),
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
			'%.2f%%' % (retain_data.get('sixty_retain',0)),
			'%.2f%%' % (retain_data.get('ninety_retain',0))
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('分渠道日报') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return

