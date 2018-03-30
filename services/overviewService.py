#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
db = DbAccessor('default',('overview'))

#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params):
	text_array = []
	val_array = []

	if params.get('start_time'):
		text_array.append("`create_time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`create_time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))

	if params.get('server_list'):
		_sql = "(`channel_name` = %s and `s_uid` in%s)"
		__server_list = []
		for _server_list in params.get('server_list'):
			_server_list = _server_list.split(',')
			channel_name = _server_list[0]
			del _server_list[0]
			__server_list.append(_sql)
			val_array.append(channel_name)
			val_array.append(tuple(_server_list))
		text_array.append(' (' + (' or '.join(__server_list)) + ') ')

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
			select sum(new_equipment) as new_equipment, sum(new_login_account) as new_login_account,
			sum(pay_income) as pay_income,sum(login_account) as login_account, sum(pay_account) as pay_account from overview 
	'''
	text_array = []
	val_array = []

	if params.get('start_time'):
		text_array.append("`create_time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`create_time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))


	if params.get('server_list'):
		text_array.append("`channel_name` in %s")
		val_array.append((params.get('server_list')))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString  = ' where ' + whereString
	if whereString:
		sql += whereString
	items = yield DbAccessor.Select('default',sql,tuple(val_array))
	return items