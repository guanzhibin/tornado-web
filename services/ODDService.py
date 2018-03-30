#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
db = DbAccessor('default',('OD_distributoin'))

#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params):
	sql  = '''SELECT sum(diff) as diff, sum(p_num) as p_num,
	sum(num) as num,type
	FROM OD_distributoin %s group by type %s'''
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('c_type'):
		text_array.append("`c_type` = %s")
		val_array.append(params.get('c_type'))

	if params.get('status_flag'):
		text_array.append("`status_flag` = %s")
		val_array.append(params.get('status_flag'))

	# if params.get('server_list'):
	# 	pass 
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
		whereString = ' where ' + whereString
	order_by = 'desc' if not params.get('order_by') else params.get('order_by')
	orderString = ' order by sum(diff) ' + order_by + ' limit ' + str(offset) + ',' + str(limit)
	sql = sql % (whereString,orderString)
	list_data = yield DbAccessor.Select('default',sql, tuple(val_array))
	if params.get('top'):
		_sql  = '''SELECT %s as value,type as name
				FROM OD_distributoin %s group by type %s''' 

		__sql = '''SELECT count(1)count from(SELECT *
				FROM OD_distributoin %s group by type)a ''' % whereString
		count = yield DbAccessor.Select('default',__sql, tuple(val_array))
		diff_top_sql = _sql % ('sum(diff)',whereString,'order by ABS(sum(diff)) desc limit 10')
		num_top_sql = _sql % ('sum(num)',whereString,'order by sum(num) desc limit 10')
		pay_datas  =  yield DbAccessor.Select('default',diff_top_sql,tuple(val_array))
		recharge_datas = yield DbAccessor.Select('default',num_top_sql,tuple(val_array))
		return count[0]['count'],list_data,pay_datas,recharge_datas
	return list_data