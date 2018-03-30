#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
db = DbAccessor('default',('daily_online'))

#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params,count = None):
	sql  = '''SELECT sum(num) as num, sum(avg) as avg,start_time 
	FROM daily_online %s group by d_date order by start_time %s limit %s,%s'''
	text_array = []
	val_array = []

	if params.get('start_time'):
		text_array.append("`start_time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`start_time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))

	if params.get('server_list'):
		text_array.append("`s_uid` in%s")
		val_array.append(params.get('server_list'))
	whereString = ' and '.join(text_array)
	if whereString:
		whereString =  ' where ' + whereString
	order_by = 'desc' if not params.get('order_by') else params.get('order_by')
	sql = sql %(whereString,order_by + ',id desc',offset,limit) 
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	if count:
		_sql ='''select count(distinct d_date) as total from daily_online %s''' % (whereString)
		total = yield DbAccessor.Select('default',_sql,tuple(val_array))
		return list_data,total[0]['total']
	return list_data