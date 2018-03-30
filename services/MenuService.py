
import tornado.web
from tornzen.database import DbAccessor
from tornzen import http,logger,utils,caching
import hashlib

db = DbAccessor('default',('menus'))
# DB = DbAccessor('default',('cpc-onto'))

CAHCE_KEY = 'CACHE:ONE-SYS-MENU'

@tornado.gen.coroutine
def GetById(m_id):
	data = yield db.Execute('default','select * from mg_menus where id= %s',(m_id,))
	return data

@tornado.gen.coroutine
def GetcpcList():

	list_data = yield DB.FindAll('delete_flag = 0')

	return list_data

@tornado.gen.coroutine
def GetAll():
	
	list_data = caching.get(CAHCE_KEY)

	if not list_data:
		list_data = yield db.FindAll('delete_flag = 0 order by create_time')
		caching.set(CAHCE_KEY,list_data,10)

	return list_data


@tornado.gen.coroutine
def Get(cid):
	
	list_data = yield db.FindAll()

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
	
	r = yield db.Update(item)
	if r > 0:
		FLushCache()
	return r > 0


@tornado.gen.coroutine
def Delete(cid):
	
	r = yield db.Delete(cid)
	if r >0:
		FLushCache()
	return r > 0


def FLushCache():
	caching.remove(CAHCE_KEY)


@tornado.gen.coroutine
def GetByFilter(offset,limit,params):
	text_array = []
	val_array = []

	if params.get('menu_id'):
		text_array.append("`id` = %s")
		val_array.append(params.get('menu_id'))

	text_array.append("`delete_flag` = 0")

	whereString = ' and '.join(text_array)
	orderString = 'create_time desc'
	list_data = yield db.Find(offset,limit,whereString,orderString,tuple(val_array))

	return list_data
