#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
db = DbAccessor('default',('mg_daily_chs'))

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
		text_array.append("`channel_name` in%s")
		val_array.append(params.get('server_list'))

	whereString = ' and '.join(text_array)
	order_by = 'asc' if not params.get('order_by') else params.get('order_by')
	orderString = 'id ' + order_by
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
			sum(atm_num) as atm_num ,sum(new_equipment) as new_equipment,
			sum(valid_e_num) as valid_e_num from mg_daily_chs 
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
		text_array.append("`channel_name` in%s")
		val_array.append(params.get('server_list'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString  = ' where ' + whereString
	if whereString:
		sql += whereString
	items = yield DbAccessor.Select('default',sql,tuple(val_array))
	return items

