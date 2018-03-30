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
		spirit_list = [{"id":1,"name":"剑士守护精灵"},{"id":2,"name":"骑士守护精灵"},
		{"id":3,"name":"弓手守护精灵"},{"id":4,"name":"法师守护精灵"}]
		self.render_view('/spirit_level.html',title='精灵等级分布',spirit_list = spirit_list)


#------------------------------------------------------------
#  通过条件查询返回数据
#------------------------------------------------------------
class checkFilter(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		# if self.privilege is False:
		# 	self.finish(dict(code=30005,rows=[],total=0))
		# 	return
		# if not (self.current_user):
		# 	self.finish(dict(code=1))
		# 	return 
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		start_time = self.get_argument('start_time','')
		end_time = self.get_argument('end_time','')
		order_by = self.get_argument('orderby','')
		server_list = self.get_argument('server_list','')
		name = self.get_argument('name','剑士守护精灵')
		onclick = self.get_argument('onclick','')
		order = (self.get_argument('order',''))
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		datas = []
		spirit_datas = yield spiritService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list = server_list,
											name = name,onclick = onclick,channel_list = channel_list
										),count = True)
		srv_datas = yield  self.get_server_data()
		for _spirit in spirit_datas[1]:
			num_owner = int(_spirit.get('num_owner',0))
			t_num_owner = int(_spirit.get('t_num_owner',0))
			for l_data in spirit_datas[2]:
				s_uid = l_data.get('s_uid')
				if _spirit.get('s_uid') == s_uid:
					datas.append(dict(
									server = srv_datas.get(str(s_uid),str(s_uid)),
									channel = _spirit.get('ch',''),
									name = _spirit.get('name'),
									level = _spirit.get('level',1),
									num_owner = num_owner,
									rate = '%.2f%%' % (num_owner*100/t_num_owner if num_owner else 0)
							))
					continue

		self.finish(dict(code=0,rows=datas,total=spirit_datas[0]))
		return

# ---------------------------------------------------------------------------------------
# 导出数据
# ---------------------------------------------------------------------------------------
class Export(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		timenow = datetime.datetime.now()
		filter_params = dict(
				start_time = self.get_argument('start_time',''),
				end_time = self.get_argument('end_time',''),
				order_by = self.get_argument('orderby',''),
				name = self.get_argument('name','剑士守护精灵')
			)
		server_list = self.get_argument('server_list','')
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string
		if server_list:
			filter_params['server_list'] = server_list
		filter_params['channel_list'] = channel_list
		list_data = yield spiritService.GetByFilter(0,10000000,filter_params)
		if len(list_data[0])<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['服务器','渠道','精灵名称','精灵等级','拥有人数','占比']

		rows = [ ','.join(titles) ]
		srv_datas = yield  self.get_server_data()
		for item_data in list_data[0]:
			s_uid = item_data.get('s_uid','')
			for __item in list_data[1]:
				if __item.get('s_uid')==s_uid:
					item_data['server_name'] = srv_datas.get(str(s_uid),str(s_uid))
			num_owner = int(item_data.get('num_owner',0))
			t_num_owner = int(item_data.get('t_num_owner',0))
			rows.append(','.join([
			item_data.get('server_name',''),
			item_data.get('ch',''),
			item_data.get('name',''),
			str(item_data.get('level',1)),
			str(num_owner),
			'%.2f%%' % (num_owner*100/t_num_owner if num_owner else 0)
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('精灵等级分布') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return
