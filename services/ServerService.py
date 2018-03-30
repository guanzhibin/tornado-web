#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from tornzen import caching

db = DbAccessor('default',('channels'))
server_db = DbAccessor('default',('servers_data'))
CAHCE_KEY = 'CACHE:ONE-SERVER-MENU'


@tornado.gen.coroutine
def GetAll():
	
	list_data = caching.get(CAHCE_KEY)

	if not list_data:
		list_data = yield db.FindAll(  orderString =' name desc')
		caching.set(CAHCE_KEY,list_data,100)

	return list_data


@tornado.gen.coroutine
def  GetAllCS():
	list_data = yield DbAccessor.Select('default','SELECT ch_s.id,ch_s.ch_id,sd.name, ch_s.s_uid,chs.name as channel_name FROM channel_server as ch_s left join servers_data as sd on ch_s.s_uid = sd.uid left join channels as chs on chs.id=ch_s.ch_id',())
	return list_data

## 获取所有的服务器
@tornado.gen.coroutine
def GetAllServer():
	CAHCE_KEY = 'CACHE:ALL:SERVERS'
	list_data = caching.get(CAHCE_KEY)

	if not list_data:
		list_data = yield server_db.FindAll( orderString = ' uid asc' )
		caching.set(CAHCE_KEY,list_data,100)

	return list_data