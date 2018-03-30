#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime

#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params):
	sql = '''select partner_name,group_concat(device_level)device_level_l,group_concat(t_own_num)t_own_num_l,sum(t_own_num)t_own_num from 
		(SELECT device_level,partner_name,sum(own_num)t_own_num FROM partner_device %s group by partner_name , device_level)a 
		group by partner_name order by sum(t_own_num) desc %s '''

	t_sql = '''select count(distinct partner_name)count from partner_device %s '''
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('end_time'):
		d_date = int(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S").strftime('%Y%m%d'))
	else:
		d_date = int(datetime.datetime.now().strftime('%Y%m%d'))
	text_array.append("`d_date` = %s")
	val_array.append(d_date)

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

		__sql = "(`ch` = %s and `s_uid` in%s)"
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
		text_array.append("`ch` in%s")
		val_array.append(tuple(channel_list.split(',')))	
	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	_limit = ''
	count = 0
	if limit:
		_limit = ' limit %s , %s ' %(offset, limit)
		t_sql = t_sql % whereString
		counts = yield DbAccessor.Select('default',t_sql,tuple(val_array))
		count = counts[0]['count']
	sql = sql % (whereString, _limit)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return count,list_data


#----------------------------------------------
# 查找魔石使用情况的数据
#--------------------------------------------
@tornado.gen.coroutine
def GetmgstByFilter(offset,limit,params):
	sql = '''SELECT magic_stone_name, sum(magic_stone_num)magic_stone_num FROM magic_stone %s group by magic_stone_name %s %s '''

	t_sql = '''select count(distinct magic_stone_name)count from magic_stone %s '''
	top_sql = '''SELECT magic_stone_name, sum(magic_stone_num)magic_stone_num FROM 
	magic_stone %s group by magic_stone_name order by sum(magic_stone_num) desc limit 10'''
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('start_time'):
		text_array.append("`time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`time` <= %s")
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

		__sql = "(`ch` = %s and `s_uid` in%s)"
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
		text_array.append("`ch` in%s")
		val_array.append(tuple(channel_list.split(',')))	
	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	_limit = ''
	orderby = ''
	count = 0
	top_datas = []
	if limit:
		_limit = ' limit %s , %s ' %(offset, limit)
		t_sql = t_sql % whereString
		top_sql  = top_sql % whereString
		counts = yield DbAccessor.Select('default',t_sql,tuple(val_array))
		top_datas = yield DbAccessor.Select('default',top_sql,tuple(val_array))
		count = counts[0]['count']
	if params.get('order_by'):
		orderby = ' order by sum(magic_stone_num) %s ' % params.get('order_by')
	sql = sql % (whereString, orderby, _limit)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return count,list_data,top_datas

##--------------------------------------------------------------------------
## 获取纹章魔石
##-------------------------------------------------------------------------
@tornado.gen.coroutine
def GetDeviceStonesByFilter(offset,limit,params):
	sql = '''SELECT sum(device_power)device_power,sum(ster_stone)ster_stone,count(distinct pid)player_num,time 
	FROM device_power_ster %s group by d_date  %s %s '''

	t_sql = '''SELECT count(distinct d_date)count FROM device_power_ster %s '''
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('start_time'):
		text_array.append("`time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`time` <= %s")
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

		__sql = "(`ch` = %s and `s_uid` in%s)"
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
		text_array.append("`ch` in%s")
		val_array.append(tuple(channel_list.split(',')))	
	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	_limit = ''
	orderby = ''
	count = 0
	if limit:
		_limit = ' limit %s , %s ' %(offset, limit)
		t_sql = t_sql % whereString
		counts = yield DbAccessor.Select('default',t_sql,tuple(val_array))
		count = counts[0]['count']
	if params.get('order_by'):
		orderby = ' order by time %s ' % params.get('order_by')
	sql = sql % (whereString, orderby, _limit)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return count,list_data



