#coding:utf-8
import tornado.web
from configs import *
from tornzen import utils
from services import *
from web_p.handlers import *
import io
import datetime
# import xlsxwriter


#----------------------------------------------------------------
# LTV价值页面
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return

		self.render_view('/login_process.html',title='登录流程')


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
		ac_type = self.get_int('activation_type',1)
		if server_list:
			server_list  =(server_list.split('|'))
		else:
			server_list = []
		order = (self.get_argument('order',''))
		if len(server_list) ==0:
			self.finish(dict(code=0,rows=[],total=0,server_check=False))
			return
		server_name = True
		if server_name is False:
			self.finish(dict(code=0,rows=[],total=0))
		datas = []
		retain_datas = yield RetainService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list = server_list
										))

		for retain_data in retain_datas[1]:
			# new_login_accont = retain_data.get('new_login_accont')
			datas.append(dict(
							d_date = retain_data.get('create_time').strftime('%Y/%m/%d'),
							server = retain_data.get('server_name',''),
							channel = retain_data.get('channel_name',''),
							once_retain = '%.2f%%' % retain_data.get('once_retain',0),
							three_retain = '%.2f%%' % retain_data.get('three_retain',0),
							four_retain = '%.2f%%' % retain_data.get('four_retain',0),
							five_retain = '%.2f%%' % retain_data.get('five_retain',0),
							six_retain = '%.2f%%' % retain_data.get('six_retain',0),
							seven_retain = '%.2f%%' % retain_data.get('seven_retain',0),
							fifteen_retain = '%.2f%%' % retain_data.get('fifteen_retain',0),
							thirty_retain = '%.2f%%' % retain_data.get('thirty_retain',0),
							sixty_retain = '%.2f%%' % retain_data.get('sixty_retain',0),
							ninety_retain = '%.2f%%' % retain_data.get('ninety_retain',0),
							forty_five_retain = '%.2f%%' % retain_data.get('forty_five_retain',0),
							seventy_five_retain = '%.2f%%' % retain_data.get('seventy_five_retain',0)
					))
		if len(datas)>0:
			##  汇总的数据
			##  后期搞缓存
			total_ = yield RetainService.total_select(dict(start_time = start_time, end_time =end_time,server_list =server_list))
			_data = dict(d_date='',server='服务器',channel='渠道')
			if total_[0]:
				# _new_login_accont = int(total_[0].get('new_login_accont'))
				_data['once_retain'] = '%.2f%%' % total_[0].get('once_retain',0)
				_data['three_retain'] = '%.2f%%' % total_[0].get('three_retain',0)
				_data['four_retain'] = '%.2f%%' % total_[0].get('four_retain',0)
				_data['five_retain'] = '%.2f%%' % total_[0].get('five_retain',0)
				_data['six_retain'] = '%.2f%%' % total_[0].get('six_retain',0)
				_data['seven_retain'] = '%.2f%%' % total_[0].get('seven_retain',0)
				_data['fifteen_retain'] = '%.2f%%' % total_[0].get('fifteen_retain',0)
				_data['thirty_retain'] = '%.2f%%' % total_[0].get('thirty_retain',0)
				_data['forty_five_retain'] ='%.2f%%' % total_[0].get('forty_five_retain',0)
				_data['sixty_retain'] = '%.2f%%' % total_[0].get('sixty_retain',0)
				_data['seventy_five_retain'] = '%.2f%%' % total_[0].get('seventy_five_retain',0)
				_data['ninety_retain'] = '%.2f%%' % total_[0].get('ninety_retain',0)
			datas.insert(0,_data)
		self.finish(dict(code=0,rows=datas,total=retain_datas[0]))
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
		if server_list:
			filter_params['server_list'] = server_list
		list_data = yield RetainService.GetByFilter(0,100000,filter_params)
		if list_data[0]<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','渠道','服务器','次日存留率','3日存留率','4日存留率','5日存留率',
		'6日存留率','7日存留率','15日存留率','30日存留率','45日存留率','60日存留率','75日存留率','90日存留率']

		rows = [ ','.join(titles) ]

		total_ = yield RetainService.total_select(filter_params)
		if total_[0]:
			rows.append(','.join(['','渠道','服务器',
									'%.2f%%' % total_[0].get('once_retain',0),
									'%.2f%%' % total_[0].get('three_retain',0),
									'%.2f%%' % total_[0].get('four_retain',0),
									'%.2f%%' % total_[0].get('five_retain',0),
									'%.2f%%' % total_[0].get('six_retain',0),
									'%.2f%%' % total_[0].get('seven_retain',0),
									'%.2f%%' % total_[0].get('fifteen_retain',0),
									'%.2f%%' % total_[0].get('thirty_retain',0),
									'%.2f%%' % total_[0].get('forty_five_retain',0),
									'%.2f%%' % total_[0].get('sixty_retain',0),
									'%.2f%%' % total_[0].get('seventy_five_retain',0),
									'%.2f%%' % total_[0].get('ninety_retain',0)
				]))
		for item_data in list_data[1]:
			# new_login_accont  = item_data.get('new_login_accont',0) 
			rows.append(','.join([
			item_data.get('create_time').strftime('%Y/%m/%d'),
			item_data.get('channel_name',''),
			item_data.get('server_name',''),
			'%.2f%%' % item_data.get('once_retain',0),
			'%.2f%%' % item_data.get('three_retain',0),
			'%.2f%%' % item_data.get('four_retain',0),
			'%.2f%%' % item_data.get('five_retain',0),
			'%.2f%%' % item_data.get('six_retain',0),
			'%.2f%%' % item_data.get('seven_retain',0),
			'%.2f%%' % item_data.get('fifteen_retain',0),
			'%.2f%%' % item_data.get('thirty_retain',0),
			'%.2f%%' % item_data.get('forty_five_retain',0),
			'%.2f%%' % item_data.get('sixty_retain',0),
			'%.2f%%' % item_data.get('seventy_five_retain',0),
			'%.2f%%' % item_data.get('ninety_retain',0)
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('用户留存') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return
