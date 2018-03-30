#coding:utf-8
import tornado.web
import datetime
from configs import *
from tornzen import utils
from services import storyService
from web_p.handlers import *
import io
import json

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		self.render_view('/medal.html',title='关卡皇冠完成度')

#------------------------------------------------------------
# 按服务器来查数据
#------------------------------------------------------------
class getmedal(UserCenterHandler.RequestHandler):
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
		onece  = self.get_argument('isonece',"0")
		if not server_list:
			server_list = self.server_string
		order = (self.get_argument('order',''))

		datas = []
		medal_datas = yield storyService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list = server_list,
											onece = onece
										))
		srv_datas = yield self.get_server_data()
		for medal in medal_datas[1]:
			s_uid = medal.get('s_uid','')
			zero_medal = medal.get('zero_medal',0)
			one_medal = medal.get('one_medal',0)
			two_medal = medal.get('two_medal',0)
			three_medal  = medal.get('three_medal',0)
			total_num  =zero_medal + one_medal + two_medal + three_medal
			datas.append(dict(
						id = medal.get('id',1),
						d_date = medal.get('create_time').strftime('%Y/%m/%d'),
						server = srv_datas.get(s_uid,s_uid),
						event_id = medal.get('event_id',''),
						name = medal.get('name',''),
						total_num = total_num,
						zero_medal = zero_medal,
						one_medal = one_medal,
						two_medal = two_medal,
						three_medal  = three_medal,
						zero_medal_rate = '%.2f%%' % (zero_medal*100/total_num if total_num else 0),
						one_medal_rate  = '%.2f%%' % (one_medal*100/total_num if total_num else 0),
						two_medal_rate  = '%.2f%%' % (two_medal*100/total_num if total_num else 0 ),
						three_medal_rate = '%.2f%%' %(three_medal*100/total_num if total_num else 0 ),
						sweepnum = medal.get('sweepnum',0)
					))

		self.finish(dict(code=0,rows=datas,total=medal_datas[0]))
		return

# ---------------------------------------------------------------------------------------
# 导出数据
# ---------------------------------------------------------------------------------------
class medalExport(UserCenterHandler.RequestHandler):

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
				order_by = self.get_argument('orderby',''),
				onece = self.get_argument('isonece',0)
			)
		server_list = self.get_argument('server_list','')
		if not server_list:
			server_list = self.server_string
		filter_params['server_list']  = server_list
		list_data = yield storyService.GetByFilter(0,1000000,filter_params)
		if list_data[0]<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','服务器','关卡id','关卡名称','关卡通关人数','0皇冠人数','1皇冠人数','2皇冠人数','3皇冠人数','0皇冠占比','1皇冠占比','2皇冠占比',
		'3皇冠占比','扫荡总次数']

		rows = [ ','.join(titles) ]
		srv_datas = yield self.get_server_data()
		for item_data in list_data[1]:
			s_uid = item_data.get('s_uid','')
			zero_medal = item_data.get('zero_medal',0)
			one_medal = item_data.get('one_medal',0)
			two_medal = item_data.get('two_medal',0)
			three_medal = item_data.get('three_medal',0)
			total_num  =  zero_medal + one_medal+  two_medal + three_medal 
			rows.append(','.join([
			item_data.get('create_time').strftime('%Y/%m/%d'),
			srv_datas.get(s_uid,s_uid),
			str(item_data.get('event_id','')),
			str(item_data.get('name','')),
			str(total_num),
			str(zero_medal),
			str(one_medal),
			str(two_medal),
			str(three_medal),
			'%.2f%%' %(zero_medal*100/total_num if total_num else 0),
			'%.2f%%' % (one_medal*100/total_num if total_num else 0),
			'%.2f%%' % (two_medal*100/total_num if total_num else 0),
			'%.2f%%' % (three_medal*100/total_num if total_num else 0),
			str(item_data.get('sweepnum',0))
			]))

		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('关卡皇冠完成度') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return

class CheckPoint(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		self.render_view('/checkpoint.html',title='关卡通关时长')



#------------------------------------------------------------
# 按服务器来查数据
#------------------------------------------------------------
class getcheckpoint(UserCenterHandler.RequestHandler):
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

		datas = []
		medal_datas = yield storyService.GetCheckPoint(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list = server_list
										))
		srv_datas = yield self.get_server_data()
		for data in medal_datas[1]:
			s_uid = data.get('s_uid','')
			_time =  yield self.dealtime(data.get('time'),"%Y/%m/%d")
			datas.append(dict(
						id = data.get('id',1),
						d_date = _time,
						server = srv_datas.get(s_uid,s_uid),
						event_id = data.get('event_id',''),
						name = data.get('name',''),
						pid = data.get('pid',''),
						finish_time = data.get('finish_time',0)
					))

		self.finish(dict(code=0,rows=datas,total=medal_datas[0]))
		return

# ---------------------------------------------------------------------------------------
# 导出数据
# ---------------------------------------------------------------------------------------
class checkpointExport(UserCenterHandler.RequestHandler):

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
				order_by = self.get_argument('orderby',''),
				onece = self.get_argument('isonece',0)
			)
		server_list = self.get_argument('server_list','')
		if not server_list:
			server_list = self.server_string
		filter_params['server_list']  = server_list
		list_data = yield storyService.GetCheckPoint(0,1000000,filter_params)
		if list_data[0]<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','服务器','关卡id','关卡名称','玩家ID','时长（秒）']

		rows = [ ','.join(titles) ]
		srv_datas = yield self.get_server_data()
		for item_data in list_data[1]:
			s_uid = item_data.get('s_uid','')
			_time = yield self.dealtime(item_data.get('time'),"%Y/%m/%d")
			rows.append(','.join([
			_time,
			srv_datas.get(s_uid,s_uid),
			str(item_data.get('event_id','')),
			str(item_data.get('name','')),
			str(item_data.get('pid','')),
			str(item_data.get('finish_time',0))
			]))

		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('关卡通关时长') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return

class CheckPointLV(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		self.render_view('/checkpointlv.html',title='关卡通关等级')



#------------------------------------------------------------
# 按服务器来查数据
#------------------------------------------------------------
class getcheckpointLV(UserCenterHandler.RequestHandler):
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

		datas = []
		medal_datas = yield storyService.GetCheckPointLV(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list = server_list
										))
		srv_datas = yield self.get_server_data()
		for data in medal_datas[1]:
			s_uid = data.get('s_uid','')
			player_lvs = data.get('player_lvs','{}')
			player_lvs = json.loads(player_lvs)
			total_num = 0
			for i in player_lvs.values():
				total_num +=i
			ret_dict = dict(
						id = data.get('id',1),
						d_date = data.get('create_time').strftime('%Y/%m/%d'),
						server = srv_datas.get(s_uid,s_uid),
						event_id = data.get('event_id',''),
						name = data.get('name',''),
						total_num = total_num
					)
			ret_dict.update(player_lvs)
			datas.append(ret_dict)
		self.finish(dict(code=0,rows=datas,total=medal_datas[0]))
		return

# ---------------------------------------------------------------------------------------
# 导出数据
# ---------------------------------------------------------------------------------------
class checkpointExportLV(UserCenterHandler.RequestHandler):

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
				order_by = self.get_argument('orderby',''),
				onece = self.get_argument('isonece',0)
			)
		server_list = self.get_argument('server_list','')
		if not server_list:
			server_list = self.server_string
		filter_params['server_list']  = server_list
		list_data = yield storyService.GetCheckPointLV(0,1000000,filter_params)
		if list_data[0]<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','服务器','关卡id','关卡名称','关卡人数']

		for i in range(1,61):
			titles.append(str(i))
		rows = [ ','.join(titles) ]
		srv_datas = yield self.get_server_data()
		for item_data in list_data[1]:
			s_uid = item_data.get('s_uid','')
			player_lvs = json.loads(item_data.get('player_lvs','{}'))
			total_num = 0
			for i in player_lvs.values():
				total_num +=i
			ret_data = [
			item_data.get('create_time').strftime('%Y/%m/%d'),
			srv_datas.get(s_uid,s_uid),
			str(item_data.get('event_id','')),
			str(item_data.get('name','')),
			str(total_num),
			]
			for i in range(1,61):
				ret_data.append(str(player_lvs.get(str(i),0)))
			rows.append(','.join(ret_data))

		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('关卡通关时长') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return