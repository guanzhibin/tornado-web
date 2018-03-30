#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
db = DbAccessor('default',('player-retain'))

#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params):
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

	if params.get('d_date'):
		text_array.append("`d_date` = %s")
		val_array.append(params.get("d_date"))

	if params.get('s_uid'):
		text_array.append("`s_uid` = %s")
		val_array.append(params.get('s_uid'))

	if params.get('channel_name'):
		text_array.append("`channel_name` = %s")
		val_array.append(params.get('channel_name'))
		
	whereString = ' and '.join(text_array)
	order_by = 'desc' if not params.get('order_by') else params.get('order_by')
	orderString = 'create_time ' + order_by + ',id desc'
	list_data = yield db.Find(offset,limit,whereString,orderString,tuple(val_array))
	return list_data


### --------------------------------------------
## 汇总查询
#----------------------------------------------
@tornado.gen.coroutine
def total_select(params):
	sql =  '''
			select avg(once_retain) as once_retain,
			avg(three_retain) as three_retain, avg(four_retain) as four_retain,
			avg(five_retain) as five_retain , avg(six_retain) as six_retain,
			avg(seven_retain) as seven_retain, avg(fifteen_retain) as fifteen_retain,
			avg(thirty_retain) as thirty_retain, avg(sixty_retain) as sixty_retain,
			avg(ninety_retain) as ninety_retain, avg(forty_five_retain) as forty_five_retain,
			avg(seventy_five_retain) as seventy_five_retain, sum(regist_account) as regist_account,
			sum(login_account) as login_account, sum(new_login_accont) as new_login_accont
			from player_retain 
	'''
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
	if whereString:
		sql += whereString
	items = yield DbAccessor.Select('default',sql,tuple(val_array))
	return items

