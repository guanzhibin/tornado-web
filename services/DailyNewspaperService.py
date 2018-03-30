#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from tornzen import caching
from configs.app_code import *
import datetime
db = DbAccessor('default',('daily_newspaper'))
server_db = DbAccessor('default',('mg_daily_serverspaper'))
CAHCE_KEY = 'CACHE:ONE-SYS-MENU'
#----------------------------------------------
# 添加分服日报数据
#-----------------------------------------------


@tornado.gen.coroutine
def Add(item):
	
	lastid = yield db.Insert(item)
	if(lastid > 0):
		FLushCache()

	return lastid


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
	whereString = ' and '.join(text_array)
	order_by = 'asc' if not params.get('order_by') else params.get('order_by')
	orderString = 'create_time ' + order_by + ', id desc'
	list_data = yield db.Find(offset,limit,whereString,orderString,tuple(val_array))
	return list_data


### --------------------------------------------
## 汇总查询
#----------------------------------------------
@tornado.gen.coroutine
def total_select(params):
	sql =  '''
			select sum(new_login_accont) as new_login_accont, sum(login_account) as login_account,
			sum(pay_account_num) as pay_account_num, sum(income) as income,
			sum(first_pay_account) as first_pay_account , sum(first_pay_account_income) as first_pay_account_income,
			sum(new_login_pay_num) as new_login_pay_num, sum(new_login_pay_income) as new_login_pay_income,
			avg(one_retain_days) as one_retain_days, avg(three_retain_days) as three_retain_days,
			avg(seven_retain_days) as seven_retain_days,avg(average_number_online) as average_number_online,
			sum(atm_num) as atm_num from mg_daily_newspaper 
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
		for channel_name in channel_list.split(','):
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

def FLushCache():
	caching.remove(CAHCE_KEY)

### --------------------------------------------
## 汇总查询
#----------------------------------------------
@tornado.gen.coroutine
def getdailyserverdata(offset,limit,params):
	text_array = []
	val_array = []
	server_list = params.get('server_list','')
	if params.get('start_time'):
		text_array.append("`create_time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`create_time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))


	if server_list:
		text_array.append("`s_uid` in%s")
		val_array.append(tuple(server_list.split(',')))	
	whereString = ' and '.join(text_array)
	order_by = 'asc' if not params.get('order_by') else params.get('order_by')
	orderString = 'create_time ' + order_by + ', id desc'
	list_data = yield server_db.Find(offset,limit,whereString,orderString,tuple(val_array))
	return list_data

### --------------------------------------------
## 汇总查询
#----------------------------------------------
@tornado.gen.coroutine
def total_select_to_server(params):
	sql =  '''
			select sum(new_login_accont) as new_login_accont, sum(login_account) as login_account,
			sum(pay_account_num) as pay_account_num, sum(income) as income,
			sum(first_pay_account) as first_pay_account , sum(first_pay_account_income) as first_pay_account_income,
			sum(new_login_pay_num) as new_login_pay_num, sum(new_login_pay_income) as new_login_pay_income,
			sum(once_retain/new_login_accont) as once_retain, sum(three_retain/new_login_accont) as three_retain,
			sum(four_retain/new_login_accont) as four_retain,
            sum(five_retain/new_login_accont) as five_retain,sum(six_retain/new_login_accont) as six_retain,sum(atm_num) as atm_num,
			sum(seven_retain/new_login_accont) as seven_retain ,sum(fifteen_retain/new_login_accont) as fifteen_retain,
			sum(thirty_retain/new_login_accont) as  thirty_retain,sum(sixty_retain/new_login_accont) as sixty_retain,
			sum(ninety_retain/new_login_accont) as ninety_retain
			from mg_daily_serverspaper
	'''
	text_array = []
	val_array = []
	server_list = params.get('server_list','')
	if params.get('start_time'):
		text_array.append("`create_time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`create_time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))


	if server_list:
		text_array.append("`s_uid` in%s")
		val_array.append(tuple(server_list.split(',')))
	whereString = ' and '.join(text_array)
	if whereString:
		whereString  = ' where ' + whereString
	if whereString:
		sql += whereString
	items = yield DbAccessor.Select('default',sql,tuple(val_array))
	return items