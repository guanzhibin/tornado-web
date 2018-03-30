#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
from tornzen import caching
import time
db = DbAccessor('default',('output-drain'))
cm_db = DbAccessor('default',('cons-mode'))
lcontribute = DbAccessor('default',('lcontribute'))
lexplore = DbAccessor('default',('lexplore'))
lequipments = DbAccessor('default',('lequipments'))
litems = DbAccessor('default',('litems'))
ldiamond = DbAccessor('default',('ldiamond'))
lgold = DbAccessor('default',('lgold'))
player_get = DbAccessor('default',('player_get'))
#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params):
	text_array = []
	val_array = []
	c_type = params.get('c_type',2)
	if c_type==1:
		_db = ldiamond
	elif c_type ==2:
		_db = lgold
	elif c_type==3:
		_db = litems
	elif c_type ==4:
		_db = lequipments
	elif c_type ==5:
		_db = lexplore
	elif c_type ==6:
		_db = lcontribute
	elif c_type in (7,8,9):
		_db = player_get
	else:
		_db = lgold
	if params.get('s_uid'):
		text_array.append("`s_uid` = %s")
		val_array.append(params.get('s_uid'))


	if c_type==7:
		text_array.append('`type` = %s')
		val_array.append(1)
	elif c_type ==8:
		text_array.append('`type` = %s')
		val_array.append(2)
	elif c_type==9:
		text_array.append('`type`= %s')
		val_array.append(3)

	if params.get('cm_list'):
		cm_list = tuple(params.get('cm_list'))
		if c_type  in (7,8,9):
			text_array.append('`Path` in %s')
			val_array.append(cm_list)
		else:
			text_array.append("`type` in%s")
			val_array.append(cm_list)

	if params.get('playerIds'):
		text_array.append("`pid` in%s")
		val_array.append(params.get('playerIds'))
	
	if params.get('start_time'):
		text_array.append("`time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('goods_source_dict'):

		text_array.append("`goods_id` in%s")
		val_array.append(params.get('goods_source_dict'))
	whereString = ' and '.join(text_array)
	order_by = 'desc' if not params.get('order_by') else params.get('order_by')
	orderString = 'time ' + order_by + ',id desc'
	list_data = yield _db.Find(offset,limit,whereString,orderString,tuple(val_array))

	return list_data


#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter2(offset,limit,params):
	text_array = []
	val_array = []
	if params.get('s_uid'):
		text_array.append("`s_uid` = %s")
		val_array.append(params.get('s_uid'))
	if params.get('cm_list'):
		text_array.append("`type` in%s")
		val_array.append(tuple(params.get('cm_list')))

	if params.get('playerIds'):
		text_array.append("`pid` in%s")
		val_array.append(params.get('playerIds'))
	
	if params.get('start_time'):
		text_array.append("`time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('goods_source_dict'):
		goods_source_dict =  params.get('goods_source_dict')
		goods_sql = "( `goods_id` in%s)"
		goods_list = []
		for k,v in goods_source_dict.items():
			goods_list.append(goods_sql)
			val_array.append(k)
			val_array.append(tuple(v))
		text_array.append(' (' + (' or '.join(goods_list)) + ') ')
	whereString = ' and '.join(text_array)
	order_by = 'desc' if not params.get('order_by') else params.get('order_by')
	orderString = 'time ' + order_by
	list_data = yield db.Find(offset,limit,whereString,orderString,tuple(val_array))

	return list_data

## ----------------------------
## 获取所有的出处菜单
##---------------

@tornado.gen.coroutine
def GetAllCM():
	CAHCE_KEY = 'CONS_MODE:CACHE'
	list_data = caching.get(CAHCE_KEY)

	if not list_data:
		list_data = yield cm_db.FindAll()
		caching.set(CAHCE_KEY,list_data,10)

	return list_data

## ----------------------------
## 获取所有的出处菜单
##---------------

@tornado.gen.coroutine
def GetAllCM2(whereString):

	list_data = yield cm_db.FindAll(whereString)
	return list_data


### -------------------------------------
###  附近信息
### -------------------------------------
@tornado.gen.coroutine
def annex_information():
	sql = '''
	SELECT data FROM origin_data 
	'''
	list_data = yield DbAccessor.Select('default',sql,())
	if list_data:
		return list_data[0]
	return dict()

### -------------------------------------
###  获取服务器信息
### -------------------------------------
@tornado.gen.coroutine
def get_server_data():
	sql = '''
	SELECT uid,name FROM servers_data 
	'''
	list_data = yield DbAccessor.Select('default',sql,())
	return list_data