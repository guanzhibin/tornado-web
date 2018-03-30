#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from tornzen import caching
from configs.app_code import *
import datetime
story_medal = DbAccessor('default',('cstory_adventure_medal'))
cstory_adventure = DbAccessor('default',('cstory_adventure'))
cstory_adventure_playerlv = DbAccessor('default',('cstory_adventure_playerlv'))
#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params):
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	text_array.append("`onece` = %s")
	val_array.append(params.get('onece',0))
	if params.get('start_time'):
		text_array.append("`d_date` >= %s")
		val_array.append(int(params.get('start_time').replace('-','')))
	if params.get('end_time'):
		text_array.append("`d_date` <= %s")
		val_array.append(int(params.get('end_time').replace('-','')))

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
	orderString = ' d_date ' + order_by + ',s_uid,event_id,  id desc'
	list_data = yield story_medal.Find(offset,limit,whereString,orderString,tuple(val_array))
	return list_data


#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetCheckPoint(offset,limit,params):
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	text_array.append("`onece` = %s")
	val_array.append(1)
	if params.get('start_time'):
		text_array.append("`d_date` >= %s")
		val_array.append(int(params.get('start_time').replace('-','')))
	if params.get('end_time'):
		text_array.append("`d_date` <= %s")
		val_array.append(int(params.get('end_time').replace('-','')))

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
	orderString = ' d_date ' + order_by + ',s_uid,event_id,  id desc'
	list_data = yield cstory_adventure.Find(offset,limit,whereString,orderString,tuple(val_array))
	return list_data

#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetCheckPointLV(offset,limit,params):
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')

	if params.get('start_time'):
		text_array.append("`d_date` >= %s")
		val_array.append(int(params.get('start_time').replace('-','')))
	if params.get('end_time'):
		text_array.append("`d_date` <= %s")
		val_array.append(int(params.get('end_time').replace('-','')))

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
	orderString = ' d_date ' + order_by + ',s_uid,event_id,  id desc'
	list_data = yield cstory_adventure_playerlv.Find(offset,limit,whereString,orderString,tuple(val_array))
	return list_data