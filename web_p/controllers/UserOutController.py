#coding:utf-8
import tornado.web
import datetime
from configs import *
from services import *
from web_p.handlers import *
import json
from tornzen import caching
import os


#----------------------------------------------------------------
# 用户消耗产出页面
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		## 获取服务器的所有名称
		server_datas = yield ServerService.GetAllServer()
		server_list = []
		for _server_data in server_datas:
			server_list.append(dict(
							uid = _server_data.get('uid',''),
							name = _server_data.get('name','')
					))
		self.render_view('/user_out_con.html',title='用户产出消耗查询',server_list = server_list)

#-----------------------------------------------------------------
#  获取物品接口
#-----------------------------------------------------------------

class goods(WebBaseHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def post(self):
		
		self.finish(dict(code=0,a='kjh'))
		return

#------------------------------------------------------------
#  通过条件查询返回数据
#------------------------------------------------------------
class checkFilter(WebBaseHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	# @tornado.web.authenticated
	def get(self):
		import json

		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		start_time = self.get_argument('start_time','')
		end_time = self.get_argument('end_time','')
		cm_list = self.get_argument('cm_list','')
		order = (self.get_argument('order',''))
		playerIds = self.get_argument('playerIds','')
		s_uid = self.get_argument('s_uid','')
		goods_source  = self.get_argument('goods_source','',strip=True)
		c_type = self.get_argument('c_type','金币')
		if c_type=='金币':
			c_type = 2
		elif c_type =='钻石':
			c_type = 1
		elif c_type=='物品':
			c_type = 3
		elif c_type =='装备':
			c_type = 4
		elif c_type=='探索值':
			c_type = 5
		elif c_type =='贡献值':
			c_type = 6
		elif c_type =='等级':
			c_type =7
		elif c_type =='角色':
			c_type = 8
		elif c_type =='皮肤':
			c_type = 9
		## c_type =7 等级 8 角色整卡 9 皮肤整卡
		p_list = []

		if playerIds:
			p_list = playerIds.split(',')
		server_name = True
		if server_name is False:
			self.finish(dict(code=0,rows=[],total=0))
		if cm_list:
			cm_list = cm_list.split(',')
		else:
			cm_list =[]
		datas = []
		drain_datas = yield OutputDrainService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by =order if order else 'desc',cm_list = cm_list,
											playerIds = tuple(p_list),s_uid = s_uid,goods_source_dict = tuple(goods_source.split(',')) if goods_source else '',
											c_type = c_type
										))
		information_data = yield self.get_information()
		srv_datas = yield  self.get_server_data()
		type_datas = yield self.get_goods_menu()

		skin_data = yield buyskinService.getskindata()
		skin_origin = dict()
		if skin_data:
			skin_origin = json.loads(skin_data[0]['data'])
		for drain_data in drain_datas[1]:
			max_type = ''
			min_type = ''
			diff = drain_data.get('diff',0)
			_have = drain_data.get('have',0)
			guild_id = drain_data.get('guild_id',0)
			status_flag = drain_data.get('status_flag',1)
			if c_type ==1:
				max_type = '钻石'
			elif c_type==2:
				max_type = '金币'
			elif c_type ==6:
				max_type = '贡献值'

			if status_flag==1 or status_flag ==3:
				min_type = ' 获得 '
			else:
				min_type = ' 消耗 '
			_new = drain_data.get('new',0)
			if c_type==3:
				desc_list = drain_data.get('item_desc','').split(',')
				goods_id = str(drain_data.get('goods_id',''))
				item_desc = min_type +str(desc_list[0]) +'个'+ str(information_data.get('5',dict()).get(goods_id,goods_id)) + '， 当前拥有 '+ str(desc_list[1])+ '个'
			elif c_type ==4:
				desc_list = drain_data.get('item_desc','').split(',')
				goods_id = str(drain_data.get('goods_id',''))
				item_desc = min_type +str(desc_list[0]) +'个'+ str(information_data.get('8',dict()).get(goods_id,goods_id))
			elif c_type ==5:
				desc_list = drain_data.get('item_desc','').split(',')
				goods_id = str(drain_data.get('goods_id',''))
				item_desc = '角色 : ' + str(information_data.get('7',dict()).get(goods_id,goods_id)) +min_type + str(abs(diff))+  ', 当前拥有'+str(_have+ diff)
				if len(desc_list)>1:
					if desc_list[1]!='0':
						item_desc += '上限增加'+str(desc_list[1])+', 当前上限为'+str(desc_list[0])
			elif c_type ==7:
				item_desc = '提升 %s 级，当前 %s 级' %(str(_new - drain_data.get('old',)),_new)
			elif c_type ==8 :
				item_desc = '获得1个%s'%str(information_data.get('7',dict()).get(str(_new),str(_new)))
			elif c_type ==9:
				item_desc = '获得1个%s'% skin_origin.get(str(_new),str(_new))
			else:
				item_desc = min_type + str(abs(diff)) +max_type+  ', 当前拥有'+str(_have+ diff)

			if c_type == 0:
				item_desc = drain_data.get('item_desc','')
			if c_type in (7,8,9):
				drain_data['type'] = drain_data.pop('Path','')

			type_name = type_datas.get(drain_data.get('type',''),'')
			datas.append(dict(
							server = srv_datas.get(drain_data.get('s_uid',''),''),
							uid = drain_data.get('uid',''),
							pid = drain_data.get('pid',''),
							type = type_name if type_name else drain_data.get('type',''),
							time = drain_data.get('time').strftime('%Y-%m-%d %H:%M:%S'),
							diff = item_desc,
							guild_id =guild_id if guild_id else ''
					))

		self.finish(dict(code=0,rows=datas,total=drain_datas[0]))
		return

#------------------------------------------------------------
#  通过条件查询返回数据
#------------------------------------------------------------
class checkFilter2(WebBaseHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	# @tornado.web.authenticated
	def get(self):
		import json
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
		cm_list = self.get_argument('cm_list','')
		order = (self.get_argument('order',''))
		playerIds = self.get_argument('playerIds','')
		s_uid = self.get_argument('s_uid','')
		goods_source  = self.get_argument('goods_source','',strip=True)
		# c_type = self.get_argument('c_type',1)
		p_list = []

		if playerIds:
			p_list = playerIds.split(',')
		server_name = True
		if server_name is False:
			self.finish(dict(code=0,rows=[],total=0))
		if cm_list:
			cm_list = cm_list.split(',')
		else:
			cm_list =[]
		goods_source_dict = dict()
		if goods_source:
			goods_s = goods_source.split(',')
			for _goods in goods_s:
				_goods = _goods.split('-')
				_goods_name = _goods[0]
				if _goods_name=='物品':
					_litem = goods_source_dict.get(3)
					if _litem:
						_litem.append(_goods[1])
					else:
						goods_source_dict[3] = [_goods[1]]
				elif _goods_name =='装备':
					_lequipment = goods_source_dict.get(4)
					if _lequipment:
						_lequipment.append(_goods[1])
					else:
						goods_source_dict[4] = [_goods[1]]
		datas = []
		drain_datas = yield OutputDrainService.GetByFilter2(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by =order if order else 'desc',cm_list = cm_list,
											playerIds = tuple(p_list),s_uid = s_uid,goods_source_dict = goods_source_dict
										))
		information_data = yield self.get_information()
		srv_datas = yield  self.get_server_data()
		type_datas = yield self.get_goods_menu()
		for drain_data in drain_datas[1]:
			max_type = ''
			min_type = ''
			c_type = drain_data.get('c_type',0)
			status_flag = drain_data.get('status_flag',0)
			diff = drain_data.get('diff',0)
			_have = drain_data.get('have',0)
			guild_id = drain_data.get('guild_id',0)
			if c_type ==1:
				max_type = '钻石'
			elif c_type==2:
				max_type = '金币'
			elif c_type ==6:
				max_type = '贡献值'

			if diff>0:
				min_type = ' 获得 '
			else:
				min_type = ' 消耗 '

			## c_type==3代表的是物品
			if c_type==3:
				desc_list = drain_data.get('item_desc','').split(',')
				item_desc = min_type +str(desc_list[1]) +'个'+ str(information_data.get('5',dict()).get(desc_list[0],desc_list[0])) + '， 当前拥有 '+ str(desc_list[2])+ '个'
			elif c_type ==4:
				desc_list = drain_data.get('item_desc','').split(',')
				item_desc = min_type +str(desc_list[1]) +'个'+ str(information_data.get('8',dict()).get(desc_list[0],desc_list[0]))
			elif c_type ==5:
				desc_list = drain_data.get('item_desc','').split(',')
				item_desc = '角色 : ' + str(information_data.get('7',dict()).get(desc_list[0],desc_list[0])) +min_type + str(abs(diff))+  ', 当前拥有'+str(_have+ diff)
				if len(desc_list)>1:
					if desc_list[2]!='0':
						item_desc += '上限增加'+str(desc_list[2])+', 当前上限为'+str(desc_list[1])
			elif c_type ==7:
				item_desc == ''
			elif c_type ==8 :
				item_desc = ''
			elif c_type ==9:
				item_desc = ''
			else:
				item_desc = min_type + str(abs(diff)) +max_type+  ', 当前拥有'+str(_have+ diff)

			if c_type == 0:
				item_desc = drain_data.get('item_desc','')
			type_name = type_datas.get(drain_data.get('type',''),'')
			datas.append(dict(
							server = srv_datas.get(drain_data.get('s_uid',''),''),
							uid = drain_data.get('uid',''),
							pid = drain_data.get('pid',''),
							type = type_name if type_name else drain_data.get('type',''),
							time = drain_data.get('time').strftime('%Y-%m-%d %H:%M:%S'),
							diff = item_desc,
							guild_id =guild_id if guild_id else ''
					))

		self.finish(dict(code=0,rows=datas,total=drain_datas[0]))
		return

##  ------------------------------------------------------------
## 获取出处菜单
##---------------------------------------------------------------

class getModeMenu(WebBaseHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		cm_datas = yield  OutputDrainService.GetAllCM()
		datas = []
		for cm_data in cm_datas:
			datas.append(dict(
							id = cm_data.get('id',0),
							pid = cm_data.get('pid',0),
							name = cm_data.get('name',''),
						))
		self.finish(dict(code=0,rows=datas))

##  ------------------------------------------------------------
## 获取出处菜单
##---------------------------------------------------------------

class getModeMenu2(WebBaseHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		from collections import OrderedDict
		cm_datas = yield  OutputDrainService.GetAllCM2( ' pid = 0 ')
		datas = OrderedDict()
		cach_dict = dict()
		items = []
		for cm_data in cm_datas:
			key =str(cm_data['id'])
			if not cach_dict.get(key):
				cach_dict[key] = cm_data['name']
		type_datas = yield  OutputDrainService.GetAllCM2(' pid !=0 ')
		for _type in type_datas:
			big_type_name  = cach_dict.get(str(_type['pid']))
			
			m_data = {_type['id']:_type.get('name','')}
			if big_type_name:
				if big_type_name  not in items:
					items.append(big_type_name)
				type_dict = datas.get(big_type_name)
				if type_dict is None:
					datas[big_type_name] = m_data
				else:
					type_dict.update(m_data)
		diff = list(set(list(cach_dict.values())).difference(set(items)))
		for i in diff:
			datas[i] = dict()
		self.finish(dict(code=0,data=datas))