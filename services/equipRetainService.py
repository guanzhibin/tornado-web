#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
db = DbAccessor('default',('equipment-retain'))

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
			avg(seventy_five_retain) as seventy_five_retain, sum(new_equipment) as new_equipment,
			sum(equipment_login_accont) as equipment_login_accont, sum(new_start_login_accont) as new_start_login_accont
			from equipment_retain 
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

