#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
db = DbAccessor('default',('pay-points'))

#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params):
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	sql_count = '''select count(1) as count from (SELECT id FROM pay_points %s group by pay_points)a'''
	sql_data = '''SELECT id,sum(pay_num) as pay_num, sum(amount_of_recharge)amount_of_recharge,pay_points FROM pay_points  %s group by pay_points %s'''
	if params.get('start_time'):
		text_array.append("`pay_time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`pay_time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))

	# if params.get('server_list'):
	# 	_sql = "(`ch` = %s and `s_uid` in%s)"
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

		sql = "(`ch` = %s and `s_uid` in%s)"
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
		text_array.append("`ch` in%s")
		val_array.append(tuple(channel_list.split(',')))

	whereString = ' and '.join(text_array)
	order_by = 'asc' if not params.get('order_by') else params.get('order_by')
	orderString = ' order by pay_num ' + order_by  + ',id asc  limit ' + str(offset) + ',' +str(limit)
	# list_data = yield db.Find(offset,limit,whereString,orderString,tuple(val_array))
	if whereString:
		whereString = ' where ' + whereString

	sql_data = sql_data % (whereString,orderString)
	list_data = yield DbAccessor.Select('default', sql_data, tuple(val_array))
	if params.get('top'):
		_sql = '''select pay_points as name,sum(%s) as value from pay_points ''' 
		pay_sql = _sql % ('pay_num')
		__sql = _sql % ('amount_of_recharge')
		if whereString:
			pay_sql +=whereString
			__sql += whereString
		pay_sql += ' group by pay_points order by value desc,id asc limit 10'
		__sql += ' group by pay_points order by amount_of_recharge desc limit 10' 
		sql_count = sql_count % whereString
		count = yield DbAccessor.Select('default',sql_count,tuple(val_array))
		pay_datas  =  yield DbAccessor.Select('default',pay_sql,tuple(val_array))
		recharge_datas = yield DbAccessor.Select('default',__sql,tuple(val_array))
		return list_data,pay_datas,recharge_datas,count[0]['count']
	return list_data


