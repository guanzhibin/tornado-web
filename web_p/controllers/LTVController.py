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
# LTV价值页面
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/ltv_cost.html',title='测试')
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
		if self.admin_flag is False and not self.channel_string and not self.server_string:
			self.finish(dict(code=30005,rows=[],total=0))
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
		ltv_datas = yield LTVService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list =server_list,
											channel_list = channel_list
										))
		srv_datas = yield  self.get_server_data()
		for ltv_data in ltv_datas[1]:
			s_uid = str(ltv_data.get('s_uid',''))
			datas.append(dict(
							d_date = ltv_data.get('create_time').strftime('%Y/%m/%d'),
							server = srv_datas.get(s_uid,s_uid),
							channel = ltv_data.get('channel_name',''),
							new_account_num = ltv_data.get('new_account_num',0),
							one_day_ltv = str(ltv_data.get('one_day_ltv',0.00)),
							two_day_ltv = str(ltv_data.get('two_day_ltv',0.00)),
							three_days_ltv = str(ltv_data.get('three_days_ltv',0.00)),
							four_day_ltv = str(ltv_data.get('four_day_ltv',0.00)),
							five_day_ltv = str(ltv_data.get('five_day_ltv',0.00)),
							six_day_ltv = str(ltv_data.get('six_day_ltv',0.00)),
							seven_days_ltv = str(ltv_data.get('seven_days_ltv',0.00)),
							eight_day_ltv = str(ltv_data.get('eight_day_ltv',0.00)),
							nine_day_ltv = str(ltv_data.get('nine_day_ltv',0.00)),
							ten_day_ltv = str(ltv_data.get('ten_day_ltv',0.00)),
							eleven_day_ltv = str(ltv_data.get('eleven_day_ltv',0.00)),
							twelve_day_ltv = str(ltv_data.get('twelve_day_ltv',0.00)),
							thirteen_day_ltv = str(ltv_data.get('thirteen_day_ltv',0.00)),
							fourteen_day_ltv = str(ltv_data.get('fourteen_day_ltv',0.00)),
							half_moon_ltv = str(ltv_data.get('half_moon_ltv',0.00)),
							one_month_ltv = str(ltv_data.get('one_month_ltv',0.00)),
							forty_five_ltv = str(ltv_data.get('forty_five_ltv',0.00)),
							sixty_ltv = str(ltv_data.get('sixty_ltv',0.00)),
							seventy_five_ltv = str(ltv_data.get('seventy_five_ltv',0.00)),
							ninety_ltv = str(ltv_data.get('ninety_ltv',0.00)),
							four_month_ltv = str(ltv_data.get('four_month_ltv',0.00)),
							five_month_ltv = str(ltv_data.get('five_month_ltv',0.00)),
							six_month_ltv = str(ltv_data.get('six_month_ltv',0.00))
					))
		if len(datas)>0:
			##  汇总的数据
			total_ = yield LTVService.total_select(dict(start_time = start_time, 
				end_time =end_time, server_list = server_list))
			_data = dict(d_date='汇总')
			if total_[0]:
				_data['new_account_num'] = str(total_[0].get('new_account_num',0))
				_data['one_day_ltv'] = "%.2f" %(total_[0].get('one_day_ltv',0.00))
				_data['two_day_ltv']  = "%.2f" %(total_[0].get('two_day_ltv',0.00))
				_data['three_days_ltv'] = "%.2f" %(total_[0].get('three_days_ltv',0.00))
				_data['four_day_ltv'] = "%.2f" %(total_[0].get('four_day_ltv',0.00))
				_data['five_day_ltv'] = "%.2f" %(total_[0].get('five_day_ltv',0.00))
				_data['six_day_ltv'] = "%.2f" %(total_[0].get('six_day_ltv',0.00))
				_data['seven_days_ltv'] = "%.2f" %(total_[0].get('seven_days_ltv',0.00))
				_data['eight_day_ltv'] = "%.2f" %(total_[0].get('eight_day_ltv',0.00))
				_data['nine_day_ltv'] = "%.2f" %(total_[0].get('nine_day_ltv',0.00))
				_data['ten_day_ltv'] = "%.2f" %(total_[0].get('ten_day_ltv',0.00))
				_data['eleven_day_ltv'] = "%.2f" %(total_[0].get('eleven_day_ltv',0.00))
				_data['twelve_day_ltv'] = "%.2f" %(total_[0].get('twelve_day_ltv',0.00))
				_data['thirteen_day_ltv'] = "%.2f" %(total_[0].get('thirteen_day_ltv',0.00))
				_data['fourteen_day_ltv'] = "%.2f" %(total_[0].get('fourteen_day_ltv',0.00))
				_data['half_moon_ltv'] = "%.2f" %(total_[0].get('half_moon_ltv',0.00))
				_data['one_month_ltv'] = "%.2f" %(total_[0].get('one_month_ltv',0.00))
				_data['forty_five_ltv'] = "%.2f" %(total_[0].get('forty_five_ltv',0.00))
				_data['sixty_ltv'] = "%.2f" %(total_[0].get('sixty_ltv',0.00))
				_data['seventy_five_ltv'] = "%.2f" %(total_[0].get('seventy_five_ltv',0.00))
				_data['ninety_ltv'] = "%.2f" %(total_[0].get('ninety_ltv',0.00))
				_data['four_month_ltv'] = "%.2f" %(total_[0].get('four_month_ltv',0.00))
				_data['five_month_ltv'] = "%.2f" %(total_[0].get('five_month_ltv',0.00))
				_data['six_month_ltv'] = "%.2f" %(total_[0].get('six_month_ltv',0.00))
			datas.insert(0,_data)
		self.finish(dict(code=0,rows=datas,total=ltv_datas[0]))
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
		filter_params['channel_list']  = channel_list
		list_data = yield LTVService.GetByFilter(0,1000000,filter_params)
		if list_data[0]<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','渠道','服务器','新登账号数','D1','D2','D3','D4',
		'D5','D6','D7','D8','D9','D10','D11','D12','D13','D14','D15','D30',
		'D45','D60','D75','D90','D120','D150','D180']


		rows = [ ','.join(titles) ]


		total_ = yield LTVService.total_select(filter_params)
		srv_datas = yield  self.get_server_data()
		_data = dict(d_date='',server='服务器',channel='渠道')
		if total_[0]:

			rows.append(','.join(['','','',
							str(total_[0].get('new_account_num',0)),
							'%.2f' % (total_[0].get('one_day_ltv',0.00)),
							'%.2f' % (total_[0].get('two_day_ltv',0.00)),
							'%.2f' % (total_[0].get('three_days_ltv',0.00)),
							'%.2f' % (total_[0].get('four_day_ltv',0.00)),
							'%.2f' % (total_[0].get('five_day_ltv',0.00)),
							'%.2f' % (total_[0].get('six_day_ltv',0.00))
							,'%.2f' % (total_[0].get('seven_days_ltv',0.00))
							,'%.2f' % (total_[0].get('eight_day_ltv',0.00))
							,'%.2f' % (total_[0].get('nine_day_ltv',0.00))
							,'%.2f' % (total_[0].get('ten_day_ltv',0.00))
							,'%.2f' % (total_[0].get('eleven_day_ltv',0.00))
							,'%.2f' % (total_[0].get('twelve_day_ltv',0.00))
							,'%.2f' % (total_[0].get('thirteen_day_ltv',0.00))
							,'%.2f' % (total_[0].get('fourteen_day_ltv',0.00))
							,'%.2f' % (total_[0].get('half_moon_ltv',0.00))
							,'%.2f' % (total_[0].get('one_month_ltv',0.00))
							,'%.2f' % (total_[0].get('forty_five_ltv',0.00))	
							,'%.2f' % (total_[0].get('sixty_ltv',0.00))	
							,'%.2f' % (total_[0].get('seventy_five_ltv',0.00))	
							,'%.2f' % (total_[0].get('ninety_ltv',0.00))	
							,'%.2f' % (total_[0].get('four_month_ltv',0.00))	
							,'%.2f' % (total_[0].get('five_month_ltv',0.00))	
							,'%.2f' % (total_[0].get('six_month_ltv',0.00))	


				]))

		for item_data in list_data[1]:
			s_uid = str(item_data.get('s_uid',''))
			rows.append(','.join([
					item_data.get('create_time').strftime('%Y/%m/%d'),
					item_data.get('channel_name',''),
					srv_datas.get(s_uid,s_uid),
					str(item_data.get('new_account_num','')),
					str(item_data.get('one_day_ltv',0.00)),
					str(item_data.get('two_day_ltv',0.00)),
					str(item_data.get('three_days_ltv',0.00)),
					str(item_data.get('four_day_ltv',0.00)),
					str(item_data.get('five_day_ltv',0.00)),
					str(item_data.get('six_day_ltv',0.00)),
					str(item_data.get('seven_days_ltv',0.00)),
					str(item_data.get('eight_day_ltv',0.00)),
					str(item_data.get('nine_day_ltv',0.00)),
					str(item_data.get('ten_day_ltv',0.00)),
					str(item_data.get('eleven_day_ltv',0.00)),
					str(item_data.get('twelve_day_ltv',0.00)),
					str(item_data.get('thirteen_day_ltv',0.00)),
					str(item_data.get('fourteen_day_ltv',0.00)),
					str(item_data.get('half_moon_ltv',0.00)),
					str(item_data.get('one_month_ltv',0.00)),
					str(item_data.get('forty_five_ltv',0.00)),
					str(item_data.get('sixty_ltv',0.00)),
					str(item_data.get('seventy_five_ltv',0.00)),
					str(item_data.get('ninety_ltv',0.00)),
					str(item_data.get('four_month_ltv',0.00)),
					str(item_data.get('five_month_ltv',0.00)),
					str(item_data.get('six_month_ltv',0.00)),
				]))

		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('LTV价值') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)

		return