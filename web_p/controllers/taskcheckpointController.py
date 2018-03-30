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
		task_checkpoint = [{"id":1,"name":"古神遗迹"},{"id":2,"name":"英雄试炼"},
		{"id":3,"name":"组队探索"}]
		self.render_view('/task_checkpoint.html',title='任务关卡',task_checkpoint = task_checkpoint)


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
		ac_type = self.get_int('activation_type',1)
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string
		order = (self.get_argument('order',''))

		server_name = True
		if server_name is False:
			self.finish(dict(code=0,rows=[],total=0))
		checkpoint_datas = yield taskcheckpointService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list = server_list,
											b_type = ac_type,channel_list = channel_list
										),count = True)
		name_list = []
		init_dict = dict()
		for _checkpoint in checkpoint_datas[1]:

			challenge_num = int(_checkpoint.get('challenge_num',0))
			success = int(_checkpoint.get('success',0))
			fail_to_boss = challenge_num - success
			avg_time = int(_checkpoint.get('avg_time',0))
			avg_time = yield self.deal_time(avg_time)
			name = _checkpoint.get('name','')
			_type = str(_checkpoint.get('b_type',''))
			key = name + '_' + _type
			init_dict[key]=dict(
							name = name,
							type = _checkpoint.get('type',''),
							challenge_num = challenge_num,
							fail_to_boss = fail_to_boss,
							fail_rate = '%.2f%%' % (fail_to_boss*100/challenge_num if challenge_num else 0),
							avg_time = avg_time,
							create_room_num = int(_checkpoint.get('create_room_num',0)),
							dis_room_num = int(_checkpoint.get('dis_room_num',0))
					)	
			name_list.append(name +','+_type)
		data =  yield taskcheckpointService.GetPlayerNum(dict(
														start_time = start_time,
														end_time = end_time if end_time else datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
														server_list = server_list,
														name_type = name_list,
														channel_list = channel_list
							))
		for _data in data:
			key = _data.get('name','') + '_' + str(_data.get('b_type'))
			if init_dict.get(key):
				_dict = init_dict[key]
				_dict.update(_data)
		datas = list(init_dict.values())
		datas.sort(key=lambda s:s['name'] ,reverse = False)
		self.finish(dict(code=0,rows=datas,total=checkpoint_datas[0]))
		return



# ---------------------------------------------------------------------------------------
# 导出数据
# ---------------------------------------------------------------------------------------
class Export(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		timenow = datetime.datetime.now()
		filter_params = dict(
				start_time = self.get_argument('start_time',''),
				end_time = self.get_argument('end_time',''),
				order_by = self.get_argument('orderby',''),
				b_type = self.get_int('activation_type',1)
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
		list_data = yield taskcheckpointService.GetByFilter(0,10000000,filter_params)
		if len(list_data[1])<1:
			self.write('没有数据')
			return
		titles = ['名称','类型','创建次数','解散次数','进入人数','进入次数','平均完成时间','失败次数','失败率']

		rows = [ ','.join(titles) ]
		name_type = []
		init_dict = dict()
		for item_data in list_data[1]:
			challenge_num = int(item_data.get('challenge_num',0))
			success = int(item_data.get('success',0))
			fail_to_boss = challenge_num - success
			avg_time = int(item_data.get('avg_time',0))
			avg_time = yield self.deal_time(avg_time)
			name = item_data.get('name','')
			_type = str(item_data.get('b_type',''))
			init_dict[name+'_'+_type] = dict(
			name = name,
			_type = item_data.get('type',''),
			player_num =str(item_data.get('player_num',0)),
			challenge_num =str(challenge_num),
			avg_time =str(avg_time),
			fail_to_boss =str(fail_to_boss),
			fail_rate ='%.2f%%' % (int(fail_to_boss)*100/int(challenge_num) if challenge_num else 0),
			create_room_num = str(item_data.get('create_room_num',0)),
			dis_room_num = str(item_data.get('dis_room_num',0))
			)
			name_type.append(name + ',' + _type)
		data =  yield taskcheckpointService.GetPlayerNum(dict(
												start_time = filter_params.get('start_time',''),
												end_time = filter_params.get('end_time','') if filter_params.get('end_time','') else datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
												server_list = server_list,
												name_type = name_type,
												channel_list = channel_list
					))
		if data:
			for _data in data:
				key = _data.get('name','') + '_' + str(_data.get('b_type'))
				if init_dict.get(key):
					rows.append(','.join([
							init_dict[key].get('name',''),
							init_dict[key].get('_type',''),
							init_dict[key].get('create_room_num'),
							init_dict[key].get('dis_room_num'),
							str(_data.get('player_num',0)),
							init_dict[key].get('challenge_num'),
							init_dict[key].get('avg_time'),
							init_dict[key].get('fail_to_boss'),
							init_dict[key].get('fail_rate')
							]))
		else:
			for v in init_dict.values():
				rows.append(','.join([
							v.get('name',''),
							v.get('_type',''),
							v.get('create_room_num'),
							v.get('dis_room_num'),
							'0',
							v.get('challenge_num'),
							v.get('avg_time'),
							v.get('fail_to_boss'),
							v.get('fail_rate')
							]))
		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('任务关卡') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return
