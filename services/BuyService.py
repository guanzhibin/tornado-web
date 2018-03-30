#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
db = DbAccessor('default',('num_of_phy_pur'))

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
		text_array.append("`d_date` >= %s")
		val_array.append(int(params.get('start_time','').replace('-','')))
	if params.get('end_time'):
		text_array.append("`d_date` <= %s")
		val_array.append(int(params.get('end_time','').replace('-','')))

	if params.get('vip_level'):
		text_array.append("`vip_level` = %s")
		val_array.append(params.get('vip_level'))
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
	orderString = 'create_time ' + order_by + ' , vip_level '
	list_data = yield db.Find(offset,limit,whereString,orderString,tuple(val_array))
	return list_data


### --------------------------------------------
## 汇总查询
#----------------------------------------------
@tornado.gen.coroutine
def total_select(params):
	sql =  '''
			select sum(total_vip_num) as total_vip_num, sum(once_pay_num) as once_pay_num,
			sum(twice_pay_num) as twice_pay_num, sum(three_pay_num) as three_pay_num,
			sum(four_pay_num) as four_pay_num , sum(five_pay_num) as five_pay_num,
			sum(six_pay_num) as six_pay_num, sum(seven_pay_num) as seven_pay_num,
			sum(eight_pay_num) eight_pay_num, sum(nine_pay_num) as nine_pay_num,
			sum(ten_pay_num) as ten_pay_num ,sum(eleven_pay_num) as eleven_pay_num,
			sum(twelve_pay_num) as twelve_pay_num, sum(thirt_pay_num) as thirt_pay_num,
			sum(fourt_pay_num) as fourt_pay_num, sum(fift_pay_num) as fift_pay_num,
			sum(sixt_pay_num) as sixt_pay_num
			from num_of_phy_pur 
	'''
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('start_time'):
		text_array.append("`d_date` >= %s")
		val_array.append(int(params.get('start_time','').replace('-','')))
	if params.get('end_time'):
		text_array.append("`d_date` <= %s")
		val_array.append(int(params.get('end_time','').replace('-','')))


	if params.get('vip_level'):
		text_array.append("`vip_level` = %s")
		val_array.append(params.get('vip_level'))
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
	whereString = ' and '.join(text_array)
	if whereString:
		whereString  = ' where ' + whereString
	if whereString:
		sql += whereString
	items = yield DbAccessor.Select('default',sql,tuple(val_array))
	return items[0]

