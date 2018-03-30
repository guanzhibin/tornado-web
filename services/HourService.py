#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
db = DbAccessor('default',('hours_statistics'))

#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(params):
	sql  = '''SELECT sum(new_equip) as new_equip, sum(new_account) as new_account,
		sum(actoin) as actoin,sum(pay_account) as pay_account,sum(pay_income) as pay_income,hours,create_time
		FROM hours_statistics %s group by hours'''

	text_array = []
	val_array = []

	if params.get('start_time'):
		text_array.append("`create_time` >= %s")
		start_time = datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S")
		val_array.append(start_time)
		end_time = datetime.datetime(start_time.year, start_time.month, start_time.day,23, 59, 59)
		text_array.append("`create_time` <= %s")
		val_array.append(end_time)

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
	if whereString:
		whereString = ' where ' + whereString
	sql = sql %(whereString)
	sql +=' order by id '
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data


### =------------------------------
## 汇总数据
### -------------------------------

@tornado.gen.coroutine
def Summary(params):
	sql =  '''
		select sum(new_login_accont) as new_login_accont, sum(login_account) as login_account,
		sum(pay_account_num) as pay_account_num, sum(income) as income from mg_daily_newspaper 
	'''
	text_array = []
	val_array = []

	if params.get('start_time'):
		text_array.append("`create_time` >= %s")
		start_time = datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S")
		val_array.append(start_time)
		end_time = datetime.datetime(start_time.year, start_time.month, start_time.day,23, 59, 59)
		text_array.append("`create_time` <= %s")
		val_array.append(end_time)


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
	if whereString:
		whereString  = ' where ' + whereString
	if whereString:
		sql += whereString
	items = yield DbAccessor.Select('default',sql,tuple(val_array))
	return items






