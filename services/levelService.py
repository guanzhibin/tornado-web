#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime


#----------------------------------------------
# 获取表头
#--------------------------------------------
@tornado.gen.coroutine
def Get_table_top(params):
	sql = '''select distinct ld.level from daily_levelbase as dlb left join 
	 level_dis as ld on dlb.id = ld.b_id %s order by ld.level '''
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('type_flag'):
		text_array.append("`type_flag` = %s")
		val_array.append(params.get('type_flag'))
	if params.get('start_time'):
		text_array.append("`time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))
	# if params.get('server_list'):
	# 	_sql = "(`channel_name` = %s and `s_uid` in%s)"
	# 	__server_list = []
	# 	for _server_list in params.get('server_list'):
	# 		_server_list = _server_list.split(',')
	# 		channel_name = _server_list[0]
	# 		del _server_list[0]
	# 		__server_list.append(_sql)
	# 		val_array.append(channel_name)
	# 		val_array.append(tuple(_server_list))
	# 	text_array.append(' (' + (' or '.join(__server_list)) + ') ')
	if server_list and channel_list:

		__sql = "(`channel_name` = %s and `s_uid` in%s)"
		server_list = tuple(server_list.split(','))
		__server_list = []
		for channel_name in tuple(channel_list.split(',')):
			__server_list.append(__sql)
			val_array.append(channel_name)
			val_array.append(tuple(server_list))
		text_array.append(' (' + (' or '.join(__server_list)) + ') ')

	elif server_list:
		text_array.append("`s_uid` in%s")
		val_array.append(tuple(server_list.split(',')))
	elif channel_list:
		text_array.append("`channel_name` in%s")
		val_array.append(tuple(channel_list.split(',')))	
	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	sql = sql % (whereString)
	data = yield DbAccessor.Select('default',sql, tuple(val_array))
	return data



#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params,count = None):
	sql = '''select server_name, channel_name, dlb.time, dlb.s_uid, ld.level, ld.num from  (select * from daily_levelbase  %s)  as dlb left join 
	level_dis as ld on dlb.id = ld.b_id '''


	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('type_flag'):
		text_array.append("`type_flag` = %s")
		val_array.append(params.get('type_flag'))

	if params.get('start_time'):
		text_array.append("`time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))

	# if params.get('server_list'):
	# 	_sql = "(`channel_name` = %s and `s_uid` in%s)"
	# 	__server_list = []
	# 	for _server_list in params.get('server_list'):
	# 		_server_list = _server_list.split(',')
	# 		channel_name = _server_list[0]
	# 		del _server_list[0]
	# 		__server_list.append(_sql)
	# 		val_array.append(channel_name)
	# 		val_array.append(tuple(_server_list))
	# 	text_array.append(' (' + (' or '.join(__server_list)) + ') ')
	if server_list and channel_list:

		__sql = "(`channel_name` = %s and `s_uid` in%s)"
		server_list = tuple(server_list.split(','))
		__server_list = []
		for channel_name in tuple(channel_list.split(',')):
			__server_list.append(__sql)
			val_array.append(channel_name)
			val_array.append(tuple(server_list))
		text_array.append(' (' + (' or '.join(__server_list)) + ') ')

	elif server_list:
		text_array.append("`s_uid` in%s")
		val_array.append(tuple(server_list.split(',')))
	elif channel_list:
		text_array.append("`channel_name` in%s")
		val_array.append(tuple(channel_list.split(',')))	
	whereString = ' and '.join(text_array)
	order = ' order by time %s,id desc' %(params.get('order_by') if params.get('order_by') else 'desc')
	_limit = ''
	if limit:
		_limit = ' limit %s, %s'% (offset, limit)
	if whereString:
		whereString = ' where ' + whereString 
	whereString2 = whereString  + order + _limit
	sql = sql % whereString2
	data = yield DbAccessor.Select('default',sql, tuple(val_array))
	if count is True:
		sql_ = 'SELECT count(distinct s_uid,channel_name,d_date) as count FROM daily_levelbase %s'
		sql_ = sql_ % whereString
		counts = yield DbAccessor.Select('default',sql_, tuple(val_array))
		count = 0
		if counts:
			count = counts[0]['count']
		return data,count
	return data

###--------------------------------------------
### 查找等级范围
###--------------------------------------------


@tornado.gen.coroutine
def get_level(offset, limit, params):
	sql = '''select distinct ld.level from daily_levelbase as dlb left join level_dis as ld on dlb.id = ld.b_id 
	%s order by ld.level limit ''' + str(offset) + ',' + str(limit)
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('type_flag'):
		text_array.append("`type_flag` = %s")
		val_array.append(params.get('type_flag'))

	if params.get('start_time'):
		text_array.append("`time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))

	# if params.get('server_list'):
	# 	_sql = "(`channel_name` = %s and `s_uid` in%s)"
	# 	__server_list = []
	# 	for _server_list in params.get('server_list'):
	# 		_server_list = _server_list.split(',')
	# 		channel_name = _server_list[0]
	# 		del _server_list[0]
	# 		__server_list.append(_sql)
	# 		val_array.append(channel_name)
	# 		val_array.append(tuple(_server_list))
	# 	text_array.append(' (' + (' or '.join(__server_list)) + ') ')
	if server_list and channel_list:

		__sql = "(`channel_name` = %s and `s_uid` in%s)"
		server_list = tuple(server_list.split(','))
		__server_list = []
		for channel_name in tuple(channel_list.split(',')):
			__server_list.append(__sql)
			val_array.append(channel_name)
			val_array.append(tuple(server_list))
		text_array.append(' (' + (' or '.join(__server_list)) + ') ')

	elif server_list:
		text_array.append("`s_uid` in%s")
		val_array.append(tuple(server_list.split(',')))
	elif channel_list:
		text_array.append("`channel_name` in%s")
		val_array.append(tuple(channel_list.split(',')))	
	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	sql = sql % whereString

	datas = yield DbAccessor.Select('default',sql, tuple(val_array))
	return datas
### --------------------------------------------
## 汇总查询
#----------------------------------------------
@tornado.gen.coroutine
def total_select(params):
	sql =  '''
		select ld.level, sum(ld.num) as num from  (select * from daily_levelbase  %s)  as dlb left join 
		level_dis as ld on dlb.id = ld.b_id  group by level
	'''
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('type_flag'):
		text_array.append("`type_flag` = %s")
		val_array.append(params.get('type_flag'))

	if params.get('start_time'):
		text_array.append("`time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))


	# if params.get('server_list'):
	# 	_sql = "(`channel_name` = %s and `s_uid` in%s)"
	# 	__server_list = []
	# 	for _server_list in params.get('server_list'):
	# 		_server_list = _server_list.split(',')
	# 		channel_name = _server_list[0]
	# 		del _server_list[0]
	# 		__server_list.append(_sql)
	# 		val_array.append(channel_name)
	# 		val_array.append(tuple(_server_list))
	# 	text_array.append(' (' + (' or '.join(__server_list)) + ') ')
	if server_list and channel_list:

		__sql = "(`channel_name` = %s and `s_uid` in%s)"
		server_list = tuple(server_list.split(','))
		__server_list = []
		for channel_name in tuple(channel_list.split(',')):
			__server_list.append(__sql)
			val_array.append(channel_name)
			val_array.append(tuple(server_list))
		text_array.append(' (' + (' or '.join(__server_list)) + ') ')

	elif server_list:
		text_array.append("`s_uid` in%s")
		val_array.append(tuple(server_list.split(',')))
	elif channel_list:
		text_array.append("`channel_name` in%s")
		val_array.append(tuple(channel_list.split(',')))	
	whereString = ' and '.join(text_array)
	if whereString:
		whereString  = ' where ' + whereString
	sql = sql % whereString
	items = yield DbAccessor.Select('default',sql,tuple(val_array))
	return items

