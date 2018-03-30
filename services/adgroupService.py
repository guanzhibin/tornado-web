#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
db = DbAccessor('default',('ad_datas'))
#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params,count = None):
	sql  = '''SELECT sum(num) as num, level
	FROM ad_level %s group by level order by level %s limit %s,%s'''
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('_type'):
		text_array.append("`type` = %s")
		val_array.append(params.get('_type'))

	if params.get('d_date'):
		text_array.append("`d_date` = %s")
		val_array.append(params.get('d_date'))

	# if params.get('start_time'):
	# 	text_array.append("`create_time` >= %s")
	# 	val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	# if params.get('end_time'):
	# 	text_array.append("`create_time` <= %s")
	# 	val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))

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

	whereString = ' and '.join(text_array)
	if whereString:
		whereString =  ' where ' + whereString
	order_by = 'desc' if not params.get('order_by') else params.get('order_by')
	sql = sql %(whereString,order_by,offset,limit) 
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	if count:
		_sql ='''select count(1)total from (SELECT * FROM ad_level %s group by level)a''' % (whereString)
		total = yield DbAccessor.Select('default',_sql,tuple(val_array))
		return list_data,total[0]['total']
	return list_data


#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetADDatasByFilter(offset,limit,params):
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')

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
	order_by = 'desc' if not params.get('order_by') else params.get('order_by')
	orderString = 'create_time ' + order_by + ', id desc'
	list_data = yield db.Find(offset,limit,whereString,orderString,tuple(val_array))
	return list_data

#----------------------------------------------
# 下载
#--------------------------------------------
@tornado.gen.coroutine
def export(params):
	sql = ''' SELECT * FROM ad_datas %s %s'''
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('start_time'):
		text_array.append("`create_time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`create_time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))

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

	whereString = ' and '.join(text_array)
	if whereString :
		whereString  = ' where ' + whereString
	order_by = 'desc' if not params.get('order_by') else params.get('order_by')
	orderString = ' order by create_time ' + order_by
	sql  =  sql % (whereString, orderString)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data