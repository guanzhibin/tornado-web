#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime

#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params, count = None):
	sql = '''SELECT name, type, b_type, sum(challenge_num)challenge_num, sum(success)success, sum(player_num)player_num, 
	avg(avg_time)avg_time,sum(create_room_num)create_room_num,sum(dis_room_num)dis_room_num FROM task_checkpoint %s group by  b_type, name %s %s'''

	t_sql = '''select count(1)total from (SELECT id FROM task_checkpoint %s group by b_type, name)t'''
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('b_type'):
		text_array.append("`b_type` = %s")
		val_array.append(params.get('b_type'))

	if params.get('start_time'):
		text_array.append("`time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))


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
	orderString = ''
	_limit = ''
	total = 0
	if count:
		order_by = 'asc' if params.get('order_by')=='desc' else 'desc'
		orderString = ' order by name ' + order_by

		_limit = ' limit %s, %s' % (offset, limit)
		t_sql = t_sql % whereString
		_total = yield DbAccessor.Select('default', t_sql, tuple(val_array))
		total = _total[0]['total']

	sql = sql % (whereString, orderString, _limit)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return total,list_data


@tornado.gen.coroutine
def GetPlayerNum(params):
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	sql = '''select count(distinct pid)player_num, count(*)total_num, name, type,b_type, ch as channel_name, s_uid from 
	relic_hero %s group by name,b_type'''

	if params.get('start_time'):
		text_array.append("`time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))

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
	if params.get('name_type'):
		_sql2 = "(`name` = %s and `b_type` =%s)"
		name_type = []
		for _name_type in params.get('name_type'):
			_name_type = _name_type.split(',')
			name_type.append(_sql2)
			val_array.append(_name_type[0])
			val_array.append(_name_type[1])
		text_array.append(' (' + (' or '.join(name_type)) + ') ')

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	sql = sql % whereString
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data


