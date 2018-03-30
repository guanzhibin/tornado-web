#coding
import tornado.web
from tornzen.database import DbAccessor
from tornzen import caching
from configs.app_code import *

db = DbAccessor('default',('roles'))

CAHCE_KEY = 'CACHE:ONE-SYS-ROLE'


@tornado.gen.coroutine
def GetAll():
	

	list_data = caching.get(CAHCE_KEY)

	if not list_data:
		list_data = yield db.FindAll('delete_flag = 0')
		caching.set(CAHCE_KEY,list_data,10)

	return list_data


@tornado.gen.coroutine
def Get(cid):
	
	list_data = yield GetAll()

	for item_data in list_data:

		if item_data.get('id') == cid:
			return item_data

	return None


@tornado.gen.coroutine
def Add(item):
	
	lastid = yield db.Insert(item)
	if(lastid > 0):
		FLushCache()

	return lastid


@tornado.gen.coroutine
def Update(item):
	
	item_data = yield Get(item.get('id'))
	if not item_data or not item_data.get('delete_flag'):
		return False

	r = yield db.Update(item)
	if r > 0:
		FLushCache()
	return r > 0


@tornado.gen.coroutine
def Delete(cid):
	
	item_data = yield Get(cid)

	if not item_data or not item_data.get('delete_flag'):
		return False

	r = yield db.Update({'delete_flag':True,'id':cid})
	if r >0:
		FLushCache()
	return r > 0


def FLushCache():
	caching.remove(CAHCE_KEY)

@tornado.gen.coroutine
def GetByFilter(offset,limit,params):
	text_array = []
	val_array = []

	if params.get('role_id'):
		text_array.append("`id` = %s")
		val_array.append(params.get('role_id'))

	text_array.append("`delete_flag` = 0")

	whereString = ' and '.join(text_array)
	orderString = 'create_time desc'
	list_data = yield db.Find(offset,limit,whereString,orderString,tuple(val_array))

	return list_data
