#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
db = DbAccessor('default',('currency_cond'))

#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params):
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('c_type'):
		text_array.append("`c_type` =%s")
		val_array.append(params.get('c_type'))
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
	if params.get('start_time'):
		text_array.append("`create_time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`create_time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))
	if server_list and channel_list:

		sql = "(`channel_name` = %s and `s_uid` in%s)"
		server_list = tuple(server_list.split(','))
		__server_list = []
		for channel_name in tuple(channel_list.split(',')):
			__server_list.append(sql)
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
	order_by = 'asc' if not params.get('order_by') else params.get('order_by')
	orderString = 'id ' + order_by
	list_data = yield db.Find(offset,limit,whereString,orderString,tuple(val_array))
	return list_data


### --------------------------------------------
## 汇总查询
#----------------------------------------------
@tornado.gen.coroutine
def total_select(params):
	sql =  '''
			select sum(start_inventory) as start_inventory, sum(atm_get) as atm_get,
			sum(system_output) as system_output, sum(total_drain) as total_drain,
			sum(end_inventory) as end_inventory from currency_cond 
	'''
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('c_type'):
		text_array.append("`c_type` = %s")
		val_array.append(params.get('c_type'))

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

		_sql = "(`channel_name` = %s and `s_uid` in%s)"
		server_list = tuple(server_list.split(','))
		__server_list = []
		for channel_name in tuple(channel_list.split(',')):
			__server_list.append(_sql)
			val_array.append(channel_name)
			val_array.append(tuple(server_list))
		text_array.append(' (' + (' or '.join(__server_list)) + ') ')

	elif server_list:
		text_array.append("`s_uid` in%s")
		val_array.append(tuple(server_list.split(',')))
	elif channel_list:
		text_array.append("`channel_name` in%s")
		val_array.append(tuple(channel_list.split(',')))	
	if params.get('start_time'):
		text_array.append("`create_time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`create_time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))



	whereString = ' and '.join(text_array)
	if whereString:
		whereString  = ' where ' + whereString
	if whereString:
		sql += whereString
	items = yield DbAccessor.Select('default',sql,tuple(val_array))
	return items

