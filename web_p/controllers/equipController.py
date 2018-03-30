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
		self.render_view('/equip.html',title='新增设备账号')
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
		if server_list:
			server_list  =(server_list.split('|'))
		elif self.admin_flag is False or self.channel_string:
			server_list = self.channel_string.split(',') 
		else:
			server_list = []

		datas = []
		equip_datas = yield equipService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list =server_list
										))

		for equip_data in equip_datas[1]:
			datas.append(dict(
							d_date = equip_data.get('create_time').strftime('%Y/%m/%d'),
							channel =equip_data.get('channel_name',''),
							new_equipment = equip_data.get('new_equipment',''),
							new_equip_login = equip_data.get('new_equip_login',0),
							new_login_account = equip_data.get('new_login_account',0),
							start_equip = equip_data.get('start_equip',0),
							login_account = equip_data.get('login_account',0)
					))
		if datas:
			total_ = yield equipService.total_select(dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list =server_list
										))
			_data = dict(d_date = '',channel = '渠道')
			if total_:
				_data['new_equipment'] = str(total_[0].get('new_equipment',0))
				_data['new_equip_login'] = str(total_[0].get('new_equip_login',0))
				_data['new_login_account'] = str(total_[0].get('new_login_account',0))
				_data['start_equip']  = str(total_[0].get('start_equip',0))
				_data['login_account'] = str(total_[0].get('login_account',0))
			datas.insert(0,_data)
		self.finish(dict(code=0,rows=datas,total=equip_datas[0]))
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
		elif self.admin_flag is False or self.channel_string:
			server_list = self.channel_string.split(',') 
		else:
			server_list = []			
		filter_params['server_list'] = server_list
		list_data = yield equipService.GetByFilter(0,100000,filter_params)
		if list_data[0]<1:
			self.write(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','渠道','新增设备','新登设备','新登账号','启动设备数','登录账号']



		rows = [ ','.join(titles) ]

		total_ = yield equipService.total_select(filter_params)
		_data = dict(d_date = '',channel = '渠道')
		if total_:
			rows.append(','.join(['','渠道',
								str(total_[0].get('new_equipment',0)),
								str(total_[0].get('new_login_account',0)),
								str(total_[0].get('new_equip_login',0)),
								str(total_[0].get('start_equip',0)),
								str(total_[0].get('login_account',0))
				])) 
		for item_data in list_data[1]:
			rows.append(','.join([
			item_data.get('create_time').strftime('%Y/%m/%d'),
			item_data.get('channel_name',''),
			str(item_data.get('new_equipment',0)),
			str(item_data.get('new_login_account',0)),
			str(item_data.get('new_equip_login',0)),
			str(item_data.get('start_equip',0)),
			str(item_data.get('login_account',0))
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('新增设备账号') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return