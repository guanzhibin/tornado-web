#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
from tornzen import caching
import time
db = DbAccessor('default',('guild_boss_record'))

db_reward = DbAccessor('default',('guild_boss_reward'))
guild_production_cost_msg = DbAccessor('default',('guild_production_cost_msg'))
#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params):
	text_array = []
	val_array = []
	if params.get('s_uid'):
		text_array.append("`s_uid` = %s")
		val_array.append(params.get('s_uid'))

	if params.get('guild_lv'):
		text_array.append("`guild_lv`  in %s")
		val_array.append(params.get('guild_lv'))

	if params.get('prosperity_lv'):
		text_array.append("`prosperity_lv` in %s")
		val_array.append(params.get('prosperity_lv'))

	if params.get('guild_id'):
		text_array.append("`guild_id` in%s")
		val_array.append(params.get('guild_id'))

	if params.get('start_time'):
		text_array.append("`boss_starttime` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`boss_starttime` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))

	if params.get('guild_name'):
		text_array.append("`guild_name` in%s ")
		val_array.append(params.get('guild_name'))
	whereString = ' and '.join(text_array)
	order_by = 'desc' if not params.get('order_by') else params.get('order_by')
	orderString = ' boss_starttime ' + order_by
	list_data = yield db.Find(offset,limit,whereString,orderString,tuple(val_array))

	return list_data

### --------------------------------------------
## 汇总查询
#----------------------------------------------
@tornado.gen.coroutine
def total_select(params):

	sql = '''
		SELECT sum(bosshp)booshp_left,sum(kill_time)kill_time FROM guild_boss_record

	'''
	kill_sql = '''
		SELECT count(1)as kill_success FROM guild_boss_record where result = 1 

	'''
	text_array = []
	val_array = []
	if params.get('s_uid'):
		text_array.append("`s_uid` = %s")
		val_array.append(params.get('s_uid'))

	if params.get('guild_lv'):
		text_array.append("`guild_lv` in %s")
		val_array.append(params.get('guild_lv'))

	if params.get('prosperity_lv'):
		text_array.append("`prosperity_lv` in %s")
		val_array.append(params.get('prosperity_lv'))

	if params.get('guild_id'):
		text_array.append("`guild_id` in%s")
		val_array.append(params.get('guild_id'))


	if params.get('guild_name'):
		text_array.append("`guild_name` in%s ")
		val_array.append(params.get('guild_name'))
	whereString = ' and '.join(text_array)
	if whereString:
		kill_sql +=  ' and '  + whereString
		whereString  = ' where ' + whereString
	if whereString:
		sql += whereString
	items = yield DbAccessor.Select('default',sql,tuple(val_array))
	kill_items = yield DbAccessor.Select('default',kill_sql,tuple(val_array))
	return items[0],kill_items[0]['kill_success']
@tornado.gen.coroutine
def GetByFilterCost(offset,limit,params):
	text_array = []
	val_array = []
	if params.get('s_uid'):
		text_array.append("`s_uid` = %s")
		val_array.append(params.get('s_uid'))

	if params.get('guild_id'):
		text_array.append("`guild_id` in%s")
		val_array.append(params.get('guild_id'))


	if params.get('guild_name'):
		text_array.append("`guild_name` in%s ")
		val_array.append(params.get('guild_name'))
	if params.get('check_ways'):
		text_array.append("`way` in%s ")
		val_array.append(params.get('check_ways'))

	if params.get('start_time'):
		text_array.append("`operate_time` >= %s")
		val_array.append(params.get('start_time'))
	if params.get('end_time'):
		text_array.append("`operate_time` <= %s")
		val_array.append(params.get('end_time'))

	if params.get('check_datas'):
		text_array.append("`r_type` in%s ")
		val_array.append(params.get('check_datas'))
	whereString = ' and '.join(text_array)
	order_by = ' desc ' if not params.get('order_by') else params.get('order_by')
	orderString =' operate_time  ' + order_by + ',id desc'
	list_data = yield guild_production_cost_msg.Find(offset,limit,whereString,orderString,tuple(val_array))

	return list_data
#----------------------------------------------
# 根绝boss开启表来差奖励
#--------------------------------------------
@tornado.gen.coroutine
def GetByPid(pid):
	result_data =  yield db_reward.FindAll(whereString = 'p_id = %s'% pid,orderString= ' num asc')
	return result_data


### -------------------------------------
### 
### -------------------------------------
@tornado.gen.coroutine
def GetGuildopmsg(offset, limit, params):
	sql = '''
		select opmsg.*,srv.name from  (SELECT * FROM guild_operate_msg %s %s %s) as opmsg left join 
		(select uid,name from servers_data) as srv on opmsg.s_uid = srv.uid
	'''
	count_sql = '''
		SELECT count(1) as count FROM guild_operate_msg %s	
	'''
	text_array = []
	val_array = []
	if params.get('s_uid'):
		text_array.append("`s_uid` = %s")
		val_array.append(params.get('s_uid'))

	if params.get('guild_id'):
		text_array.append("`guild_id` in%s")
		val_array.append(params.get('guild_id'))



	if params.get('guild_name'):
		text_array.append("`guild_name` in%s ")
		val_array.append(params.get('guild_name'))

	if params.get('pid_list'):
		text_array.append("`operated_p_id` in%s ")
		val_array.append(params.get('pid_list'))
	whereString = ''
	orderString = ' order by operate_time desc '
	oplimit = ''
	if text_array:
		whereString = ' where '
		whereString += ' and '.join(text_array)
	if params.get('order'):
		orderString = 'order by id desc'
	sql = sql % (whereString, orderString, oplimit)
	count_sql = count_sql % whereString
	# order_by = 'desc' if not params.get('order_by') else params.get('order_by')
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	count = yield DbAccessor.Select('default', count_sql, tuple(val_array))
	return count[0].get('count',0),list_data

### -------------------------------------
###  获取冒险团产出消耗来源数据
### -------------------------------------
@tornado.gen.coroutine
def GetGuildOutputCon(type_flag=None):
	sql = '''
	SELECT id,name,type_flag FROM guild_data_way
	'''

	if type_flag is not None:
		whereString = ' where type_flag=%s' % type_flag
		sql +=whereString
	list_data = yield DbAccessor.Select('default',sql,())
	return list_data

