#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
db = DbAccessor('default',('ltv-value'))

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
	orderString = 'create_time ' + order_by + ',id desc'
	list_data = yield db.Find(offset,limit,whereString,orderString,tuple(val_array))
	return list_data


### --------------------------------------------
## 汇总查询
#----------------------------------------------
@tornado.gen.coroutine
def total_select(params):
	sql =  '''
			select sum(new_account_num) as new_account_num, avg(one_day_ltv) as one_day_ltv,
			avg(two_day_ltv) as two_day_ltv, avg(three_days_ltv) as three_days_ltv,
			avg(four_day_ltv) as four_day_ltv , avg(five_day_ltv) as five_day_ltv,
			avg(six_day_ltv) as six_day_ltv, avg(seven_days_ltv) as seven_days_ltv,
			avg(eight_day_ltv) as eight_day_ltv, avg(nine_day_ltv) as nine_day_ltv,
			avg(ten_day_ltv) as ten_day_ltv, avg(eleven_day_ltv) as eleven_day_ltv,
			avg(twelve_day_ltv) as twelve_day_ltv, avg(thirteen_day_ltv) as thirteen_day_ltv,
			avg(fourteen_day_ltv) as fourteen_day_ltv, avg(half_moon_ltv) as half_moon_ltv,
			avg(one_month_ltv) as one_month_ltv, avg(forty_five_ltv) as forty_five_ltv,
			avg(sixty_ltv) as sixty_ltv,avg(seventy_five_ltv) as seventy_five_ltv,
			avg(ninety_ltv) as ninety_ltv,avg(four_month_ltv) as four_month_ltv,
			avg(five_month_ltv) as five_month_ltv,avg(six_month_ltv) as six_month_ltv
			from ltv_value 
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

