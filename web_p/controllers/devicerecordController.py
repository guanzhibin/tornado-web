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
# 纹章记录
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/device_record.html',title='纹章记录')


###-----------------------------------------------
## 伙伴文章等级情况
####---------------------------------------------
class partner(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		device_level_ls = ['1','2','3','4','5','6']
		device_fiedl = ['one_level','two_level','three_level','four_level','five_level','six_level']
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		start_time = self.get_argument('start_time','')
		end_time = self.get_argument('end_time','')
		server_list = self.get_argument('server_list','')
		order = (self.get_argument('order',''))
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		datas = []
		total, _datas = yield deviceService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list = server_list,
											channel_list = channel_list
										))
		names = []
		one_nums = []
		two_nums = []
		three_nums = []
		four_nums = []
		five_nums = []
		six_nums =[]
		for _data in _datas:
			name = _data.get('partner_name','')
			_dict = dict(name = name,t_own_num = int(_data.get('t_own_num','')))
			names.append(name)
			device_level_l = _data.get('device_level_l','').split(',')
			t_own_num_l = _data.get('t_own_num_l','').split(',')
			for i in range(len(device_level_l)):
				_dict[device_fiedl[int(device_level_l[i])-1]] = t_own_num_l[i]
			datas.append(_dict)
			one_nums.append(_dict.get('one_level',0))
			two_nums.append(_dict.get('two_level',0))
			three_nums.append(_dict.get('three_level',0))
			four_nums.append(_dict.get('four_level',0))
			five_nums.append(_dict.get('five_level',0))
			six_nums.append(_dict.get('six_level',0))
		return self.finish(dict(code = 0, rows = datas, total = total,names = names,
			one_nums = one_nums, two_nums = two_nums, three_nums = three_nums,
			four_nums = four_nums, five_nums = five_nums, six_nums = six_nums))

# ---------------------------------------------------------------------------------------
# 导出数据伙伴文章等级情况
# ---------------------------------------------------------------------------------------
class partnerExport(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		device_level_ls = ['1','2','3','4','5','6']
		device_fiedl = ['one_level','two_level','three_level','four_level','five_level','six_level']
		timenow = datetime.datetime.now()
		filter_params = dict(
				start_time = self.get_argument('start_time',''),
				end_time = self.get_argument('end_time',''),
				order_by = self.get_argument('order','')
			)
		server_list = self.get_argument('server_list','')
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string
		filter_params['server_list'] = server_list
		filter_params['channel_list'] = channel_list
		list_data = yield deviceService.GetByFilter(0,0,filter_params)
		if len(list_data[1])<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['伙伴名称','开启人数','纹章1级','纹章2级','纹章3级','纹章4级','纹章5级','纹章6级']



		rows = [ ','.join(titles) ]
		for item_data in list_data[1]:
			name = item_data.get('partner_name','')
			_dict = dict(name = name,t_own_num = int(item_data.get('t_own_num','')))
			device_level_l = item_data.get('device_level_l','').split(',')
			t_own_num_l = item_data.get('t_own_num_l','').split(',')
			for i in range(len(device_level_l)):
				_dict[device_fiedl[int(device_level_l[i])-1]] = t_own_num_l[i]
			rows.append(','.join([
				_dict.get('name',''),
				str(_dict.get('t_own_num',0)),
				str(_dict.get('one_level',0)),
				str(_dict.get('two_level',0)),
				str(_dict.get('three_level',0)),
				str(_dict.get('four_level',0)),
				str(_dict.get('five_level',0)),
				str(_dict.get('six_level',0))
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('伙伴纹章等级') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return

#-----------------------------------------------------------------------
#获取魔石数据
#-----------------------------------------------------------------------

class getmgstone(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		device_level_ls = ['1','2','3','4','5','6']
		device_fiedl = ['one_level','two_level','three_level','four_level','five_level','six_level']
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		start_time = self.get_argument('start_time','')
		end_time = self.get_argument('end_time','')
		server_list = self.get_argument('server_list','')
		order = (self.get_argument('order',''))
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		datas = []
		names = []
		chart_datas = []
		total, _datas, top_datas = yield deviceService.GetmgstByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list = server_list,
											channel_list = channel_list
										))

		for _data in _datas:
			datas.append(dict(
						name = _data.get('magic_stone_name',''),
						num = int(_data.get('magic_stone_num',0))
				))

		for top_data in top_datas:
			name = top_data.get('magic_stone_name','')
			names.append(name)
			chart_datas.append(dict(
								name = name,
								value = int(top_data.get('magic_stone_num',0))
								))
		return self.finish(dict(code = 0, rows = datas, total = total, 
			names = names, top_datas = chart_datas))


# ---------------------------------------------------------------------------------------
# 导出数据魔石数据
# ---------------------------------------------------------------------------------------
class mgstoneExport(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		timenow = datetime.datetime.now()
		filter_params = dict(
				start_time = self.get_argument('start_time',''),
				end_time = self.get_argument('end_time',''),
				order_by = self.get_argument('order','')
			)
		server_list = self.get_argument('server_list','')
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		filter_params['server_list'] = server_list
		filter_params['channel_list'] =channel_list
		list_data = yield deviceService.GetmgstByFilter(0,0,filter_params)
		if len(list_data[1])<1:
			self.write('没有相关数据')
			return
		titles = ['魔石名称','使用数量']



		rows = [ ','.join(titles) ]
		for item_data in list_data[1]:
			rows.append(','.join([
				item_data.get('magic_stone_name',''),
				str(item_data.get('magic_stone_num',0))
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('魔石使用量') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return



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
		server_list = self.get_argument('server_list','')
		order = (self.get_argument('order',''))
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		datas = []
		total, _datas = yield deviceService.GetDeviceStonesByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list = server_list,
											channel_list = channel_list
										))
		for _data in _datas:
			device_power = int(_data.get('device_power',0))
			ster_stone = int(_data.get('ster_stone',0))
			player_num = int(_data.get('player_num',0))
			datas.append(dict(
						d_date = _data.get("time").strftime("%Y/%m/%d"),
						device_power = device_power,
						ster_stone = ster_stone,
						device_power_avg = '%.f' %(device_power/player_num if player_num else 0),
						ster_stone_avg = '%.f' % (ster_stone/player_num if player_num else 0)
				))
		self.finish(dict(code=0,rows=datas,total=total ))
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
				order_by = self.get_argument('order','')
			)
		server_list = self.get_argument('server_list','')
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		filter_params['server_list'] = server_list
		filter_params['channel_list'] = channel_list
		list_data = yield deviceService.GetDeviceStonesByFilter(0,0,filter_params)
		if len(list_data[1])<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','纹章力量','星石数','平均纹章力量','平均星石数']



		rows = [ ','.join(titles) ]
		for item_data in list_data[1]:
			device_power = int(item_data.get('device_power',0))
			ster_stone = int(item_data.get('ster_stone',0))
			player_num = int(item_data.get('player_num',0))
			rows.append(','.join([
				str(item_data.get('time').strftime("%Y/%m/%d")),
				str(device_power),
				str(ster_stone),
				'%.f' %(device_power/player_num if player_num else 0),
				'%.f' % (ster_stone/player_num if player_num else 0)
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('纹章力量星石') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return