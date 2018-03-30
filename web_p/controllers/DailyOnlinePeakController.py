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
# 每日在线峰值
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/Daily_online_peak.html',title='每日在线峰值')


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
			server_list  =(server_list[1:]).split(',')

		else:
			server_list = []

		# _limit =1
		# if start_time:
		# 	_start_time = datetime.datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")
		# 	_end_time = datetime.datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S") if end_time else datetime.datetime.now()
		# 	_limit = (_end_time - _start_time).days + _limit
		datas = []
		peak_datas,total = yield PeakService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list = tuple(server_list)
										),count  = True)
		date_list = []
		num_list = []
		avg_list = []
		for _peak_data in peak_datas:
			num = int(_peak_data.get('num',0))
			avg = int(_peak_data.get('avg',''))
			datas.append(dict(
							d_date = _peak_data.get('start_time').strftime('%Y/%m/%d'),
							num = num,
							avg = avg
						))
			date_list.insert(0,_peak_data.get('start_time').strftime('%m-%d'))
			num_list.insert(0,num)
			avg_list.insert(0,avg) 
		if len(datas)>10:
			datas = datas[limit*offset:limit*offset + limit]
		self.finish(dict(code=0,rows=datas,total=total,date_list = date_list,
			num_list = num_list, avg_list = avg_list))
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
		if server_list:
			server_list  =(server_list[1:]).split(',')
		else:
			server_list = []

		filter_params['server_list'] = server_list
		list_data = yield PeakService.GetByFilter(0,100000,filter_params)
		if len(list_data)<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','在线峰值人数','平均在线人数']



		rows = [ ','.join(titles) ]
		for item_data in list_data:
			rows.append(','.join([
			item_data.get('start_time').strftime('%Y/%m/%d'),
			str(item_data.get('num',0)),
			str(item_data.get('avg',0))
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('每日在线峰值') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return