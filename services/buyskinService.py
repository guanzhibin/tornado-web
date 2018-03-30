#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
from tornzen import caching
import time
db = DbAccessor('default',('buy_skin'))

#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params):
	text_array = []
	val_array = []
	if params.get('s_uid'):
		text_array.append("`s_uid` = %s")
		val_array.append(params.get('s_uid'))

	if params.get('pid_list'):
		text_array.append("`pid` in%s")
		val_array.append(params.get('pid_list'))


	if params.get('start_time'):
		text_array.append("`buytime`  >= %s ")
		val_array.append(params.get('start_time'))

	if params.get('end_time'):
		text_array.append("`buytime`  <= %s ")
		val_array.append(params.get('end_time'))
	whereString = ' and '.join(text_array)
	order_by = 'desc' if not params.get('order_by') else params.get('order_by')
	orderString = ' buytime ' + order_by
	list_data = yield db.Find(offset,limit,whereString,orderString,tuple(val_array))

	return list_data

#----------------------------------------------
# 汇总数据
#--------------------------------------------
@tornado.gen.coroutine
def sistc_total(offset,limit,params):
	total = ''' select count(1)total from buy_skin '''
	type_sql  =''' SELECT sum(cost)cost,type FROM buy_skin '''
	check_sql = ''' select count(1)total,skinid from buy_skin '''

	text_array = []
	val_array = []

	if params.get('server_list'):
		text_array.append("`s_uid` in%s")
		val_array.append(tuple(params.get('server_list').split(',')))
	if params.get('start_time'):
		text_array.append("`buytime`  >= %s ")
		val_array.append(params.get('start_time'))

	if params.get('end_time'):
		text_array.append("`buytime`  <= %s ")
		val_array.append(params.get('end_time'))

	whereString = ' and '.join(text_array)


	## 总的数据
	if whereString:
		total = total +' where ' +whereString
		type_sql  = type_sql + ' where ' +whereString
		check_sql+= ' where ' + whereString
	page_sql = ''' select count(1)page_num from( ''' + check_sql + ''' group by skinid)a'''
	check_end  = ' group by skinid order by total desc,skinid limit %s,%s '%(offset,limit)
	type_sql += ' group by type '
	check_sql +=check_end
	totals = yield DbAccessor.Select('default',total,tuple(val_array))
	type_total = yield DbAccessor.Select('default',type_sql,tuple(val_array))
	check_data = yield DbAccessor.Select('default',check_sql,tuple(val_array))
	page_data = yield DbAccessor.Select('default',page_sql,tuple(val_array))
	return totals,type_total,check_data,page_data

#----------------------------------------------
# 根据皮肤id来汇总信息
#--------------------------------------------
@tornado.gen.coroutine
def get_buy_skinid(params):
	sql = ''' select sum(cost)cost,type  from buy_skin '''
	text_array = []
	val_array = []
	if params.get('s_uid'):
		text_array.append("`s_uid` = %s")
		val_array.append(params.get('s_uid'))

	if params.get('start_time'):
		text_array.append("`buytime`  >= %s ")
		val_array.append(params.get('start_time'))

	if params.get('end_time'):
		text_array.append("`buytime`  <= %s ")
		val_array.append(params.get('end_time'))

	if params.get('skinid'):
		text_array.append("`skinid`  = %s ")
		val_array.append(params.get('skinid'))		
	whereString = ' and '.join(text_array)

	if whereString:
		sql+=' where ' +whereString
	sql +=' group by type '
	datas = yield DbAccessor.Select('default',sql,tuple(val_array))
	return datas

@tornado.gen.coroutine
def getskindata():
	sql = ''' select data from skin_data'''
	datas = yield DbAccessor.Select('default',sql,())
	return datas