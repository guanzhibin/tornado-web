#coding:utf-8
import tornado.web
import datetime
from configs import *
from services import *
from web_p.handlers import *
import time

#----------------------------------------------------------------
# 冒险团boss记录页面
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

		self.render_view('/guid_boss_record.html',title='冒险团boss记录',server_list = server_list)

#-----------------------------------------------------------------
#  奖励api
#-----------------------------------------------------------------

class RewardBoss(WebBaseHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		p_id = self.get_int('pid',1)
		result_data= yield GuildBossRecordService.GetByPid(p_id)
		datas = []
		for data in result_data:
			datas.append(dict(
						sort = data.get('num',''),
						player_id = data.get('player_id',''),
						total_damage =  data.get('total_damage'),
						bonus_grant =data.get('bonus_grant',''),
						bonus_grant_time_str =data.get('bonus_grant_time').strftime('%Y-%m-%d %H:%M:%S'),
						bonus_id =data.get('bonus_id',''),
						color = 'color:red' if data.get('bonus_grant',0)==0 else ''
					))

		self.render_view('/reward_boss.html',ranking = datas)


#-----------------------------------------------------------------
#  奖励api
#-----------------------------------------------------------------

class RewardToBoss(WebBaseHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		p_id = self.get_int('pid',1)
		result_data= yield GuildBossRecordService.GetByPid(p_id)
		datas = []
		for data in result_data:
			datas.append(dict(
						sort = data.get('num',''),
						player_id = data.get('player_id',''),
						total_damage =  data.get('total_damage'),
						bonus_grant =data.get('bonus_grant',''),
						bonus_grant_time_str =data.get('bonus_grant_time').strftime('%Y-%m-%d %H:%M:%S'),
						bonus_id =data.get('bonus_id',''),
						color = 'color:red' if data.get('bonus_grant',0)==0 else ''
					))

		self.finish(dict(code= 0, total = len(datas), rows = datas))

#-----------------------------------------------------------------
#  冒险团消息记录页面
#-----------------------------------------------------------------

class guildopmsg(UserCenterHandler.RequestHandler):

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
		self.render_view('/guild_operate_msg.html',title='冒险团消息记录',server_list = server_list)



#-----------------------------------------------------------------
#  冒险团产出消耗记录页面
#-----------------------------------------------------------------

class guildoutputcon(UserCenterHandler.RequestHandler):

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
		self.render_view('/guild_output_con.html',title='冒险团产出消耗记录',server_list = server_list)



#------------------------------------------------------------
#  通过条件查询返回数据
#------------------------------------------------------------
class checkFilter(WebBaseHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	# @tornado.web.authenticated
	def get(self):

		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		start_time = self.get_argument('start_time','')
		end_time = self.get_argument("end_time",'')
		order = (self.get_argument('order',''))
		guild_id  = self.get_argument('guildid','')
		guild_name = self.get_argument('guildname','')
		guild_lv = self.get_argument('guild_lv','')
		prosperity_lv = self.get_argument('prosperity_lv','')
		s_uid = self.get_argument('s_uid','')
		if not s_uid:
			self.finish(dict(code = 20006 , rows = [], total = 0))
			return
		# if not guild_id and not guild_name:
		# 	self.finish(dict(code = 20005,rows = [],total = 0))
		# 	return 
		p_list = []
		gn_list = []
		guild_lv_list = []
		prosperity_lv_list = []
		if guild_id:
			p_list = guild_id.split(',')
		if guild_name:
			gn_list = guild_name.split(',')
		if prosperity_lv:
			prosperity_lv_list = prosperity_lv.split(',')
		if guild_lv:
			guild_lv_list = guild_lv.split(',')
		datas = []
		drain_datas = yield GuildBossRecordService.GetByFilter(offset,limit,dict(order_by =order if order else 'desc',
											guild_id = tuple(p_list),s_uid = s_uid,guild_name = tuple(gn_list),
											prosperity_lv =tuple(prosperity_lv_list),guild_lv = tuple(guild_lv_list),start_time = start_time,
											end_time  = end_time
										))
		for drain_data in drain_datas[1]:
			result = drain_data.get('result',0)
			bosshp =drain_data.get('bosshp')
			bosshp_max = drain_data.get('bosshp_max')
			datas.append(dict(
							id = drain_data.get('id'),
							guild_id = drain_data.get('guild_id',''),
							boss_id = drain_data.get('boss_id',''),
							guild_lv = drain_data.get('guild_lv',1), ## 冒险团等级
							prosperity_lv = drain_data.get('prosperity_lv',1), ## 繁荣度等级
							bosshp = drain_data.get('bosshp') if result ==0 else '-', ## boss剩余血量
							left_rate = '%.2f%%' % (bosshp*100/bosshp_max) if result == 0 and bosshp_max!=0 else '-', ## 
							kill_time = drain_data.get('kill_time',0),
							start_time = drain_data.get('boss_starttime').strftime('%Y-%m-%d %H:%M:%S'),
							end_time = drain_data.get('boss_endtime').strftime('%Y-%m-%d %H:%M:%S'),
							result ='成功' if result  else '失败',
					))
		## 汇总信息
		if datas:
			_data =dict(id ='-',boss_id = '-',guild_lv = '-',guild_id = '-',
				prosperity_lv = '-',start_time = '-', end_time = '-',left_rate = '-')
			total_ = yield GuildBossRecordService.total_select(dict(
											guild_id = tuple(p_list),s_uid = s_uid,guild_name = tuple(gn_list),
											prosperity_lv =tuple(prosperity_lv_list),guild_lv = tuple(guild_lv_list),start_time = start_time,
											end_time = end_time
										))
			total_NUM = drain_datas[0]
			success_num = total_[1]
			fail_num = (total_NUM - success_num)
			_data['bosshp'] = int(int(total_[0].get('booshp_left',0))/fail_num) if fail_num else '-'
			_data['kill_time'] = int(int(total_[0].get('kill_time'))/success_num) if success_num else '-'
			_data['result'] = '%.2f%%' % (success_num*100/total_NUM) if total_NUM else '-'
			datas.insert(0,_data)
		self.finish(dict(code=0,rows=datas,total=drain_datas[0]))
		return



#------------------------------------------------------------
#  查看冒险团消息记录
#------------------------------------------------------------
class checkFilterguildopmsg(WebBaseHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	# @tornado.web.authenticated
	def get(self):
		## 根绝页面有的查询的条件为 s_uid,guild_id,guild_name
		# if self.privilege is False:
		# 	self.finish(dict(code=30005,rows=[],total=0))
		# 	return
		# if not (self.current_user):
		# 	self.finish(dict(code=1))
		# 	return 
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		order = (self.get_argument('order',''))
		guild_id  = self.get_argument('guildid','')
		guild_name = self.get_argument('guildname','')
		operated_p_id = self.get_argument('pid','')
		s_uid = self.get_argument('s_uid','')
		if not s_uid:
			self.finish(dict(code = 20006 , rows = [], total = 0))
			return
		# if not guild_id and not guild_name:
		# 	self.finish(dict(code = 20005,rows = [],total = 0))
		# 	return 
		p_list = []
		gn_list = []
		pid_list  = []
		if guild_id:
			p_list = guild_id.split(',')
		if guild_name:
			gn_list = guild_name.split(',')
		if operated_p_id:
			pid_list  =operated_p_id.split(',')
		datas = []
		drain_datas = yield GuildBossRecordService.GetGuildopmsg(offset,limit,dict(
																	order = order,
																	guild_id = tuple(p_list),
																	guild_name = tuple(gn_list),
																	s_uid = s_uid,
																	pid_list = tuple(pid_list)
															))
		srv_datas = yield  self.get_server_data()
		for drain_data in drain_datas[1]:
			up_start_time = drain_data.get('up_start_time',0)
			up_end_time = drain_data.get('up_end_time',0)
			create_time = drain_data.get('create_time',0)
			disband_time = drain_data.get('disband_time',0)
			s_uid = str(drain_data.get('s_uid',''))
			datas.append(dict(
							id = drain_data.get('id'),
							guild_id = drain_data.get('guild_id',''),
							server_name = srv_datas.get(s_uid,s_uid),
							operate = drain_data.get('operate',0),
							level = drain_data.get('level',0),
							up_start_time =dealtime(up_end_time),
							up_end_time = dealtime(up_end_time),
							player_id = drain_data.get('player_id',0),
							create_time = dealtime(create_time),
							disband_time =dealtime(disband_time),
							pid = drain_data.get('operated_p_id',0),
							guild_num = drain_data.get('guild_num',0)
					))
		self.finish(dict(code=0,rows=datas,total=drain_datas[0]))
		return

def dealtime(timestemp):
	time_str = '0'
	if  timestemp and timestemp !='0' and timestemp!=0:
		time_local = time.localtime(timestemp)
		time_str = time.strftime("%Y-%m-%d %H:%M:%S",time_local)
	return time_str
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
## 获取冒险团产出消耗的数据来源
##---------------------------------------------------------------

class getguildoutputcon(WebBaseHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		type_flag  = self.get_int('type_flag',0)
		datas = []
		cm_datas = yield  GuildBossRecordService.GetGuildOutputCon(type_flag)
		for cm_data in cm_datas:
			datas.append(dict(
							id = cm_data.get('id',0),
							pid = 0,
							name = cm_data.get('name',''),
						))
		self.finish(dict(code=0,rows=datas))
		return 

## 获取冒险团产出消耗的数据来源
##---------------------------------------------------------------

class getguildoutputcon2(WebBaseHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		from collections import OrderedDict
		# type_flag  = self.get_int('type_flag',0)
		datas = OrderedDict()
		way_datas = OrderedDict()
		cm_datas = yield  GuildBossRecordService.GetGuildOutputCon()
		for cm_data in cm_datas:
			if cm_data.get('type_flag',0)==0:
				datas[cm_data['id']] = cm_data['name']
			else:
				way_datas[cm_data['id']] = cm_data['name']
		self.finish(dict(code=0,datas=datas,way_datas = way_datas))
		return 


#------------------------------------------------------------
#  通过条件查询返回数据
#------------------------------------------------------------
class checkFilterguildoutputcon(WebBaseHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		order = (self.get_argument('order',''))
		guild_id  = self.get_argument('guildid','')
		guild_name = self.get_argument('guildname','')
		check_data = self.get_argument('check_data','')
		check_way = self.get_argument('check_way','')
		s_uid = self.get_argument('s_uid','')
		start_time = self.get_argument('start_time','')
		end_time = self.get_argument('end_time','')
		if not s_uid:
			self.finish(dict(code = 20006 , rows = [], total = 0))
			return
		if not guild_id and not guild_name:
			self.finish(dict(code = 20005,rows = [],total = 0))
			return 
		p_list = []
		gn_list = []
		check_datas = []
		check_ways = []
		if guild_id:
			p_list = guild_id.split(',')
		if guild_name:
			gn_list = guild_name.split(',')
		if check_data:
			check_datas = check_data.split(',')
		if check_way:
			check_ways = check_way.split(',')

		way_data = yield self.getdata_way()
		datas = []
		drain_datas = yield GuildBossRecordService.GetByFilterCost(offset,limit,dict(
																	order = order,
																	guild_id = tuple(p_list),
																	guild_name = tuple(gn_list),
																	s_uid = s_uid,
																	check_ways = tuple(check_ways),
																	check_datas = tuple(check_datas),
																	start_time =  start_time,
																	end_time = end_time
															))

		for drain_data in drain_datas[1]:
			operate_time = drain_data.get('operate_time',0)
			r_type = drain_data.get('r_type','')
			_way = drain_data.get('way','')
			datas.append(dict(
							id = drain_data.get('id'),
							guild_id = drain_data.get('guild_id',''),
							server_name = drain_data.get('server_name',''),
							r_type = way_data.get(r_type,r_type),
							r_change = drain_data.get('r_change',0),
							r_total =drain_data.get('r_total',0),
							way =way_data.get(_way,_way),
							player_id = drain_data.get('operator',0),
							create_time = dealtime(operate_time)
					))
		self.finish(dict(code=0,rows=datas,total=drain_datas[0]))
		return