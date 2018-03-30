#coding
import tornado.web
from tornzen.database import DbAccessor
from tornzen import caching
from configs.app_code import *
import hashlib
import datetime
db = DbAccessor('default',('users'))
user_secontrol_db = DbAccessor('default',('user_secontrol'))
CAHCE_KEY = 'CACHE:ONE-SYS-ROLE'


#-----------------------------------------------------------------------
#  根据用户名
#-----------------------------------------------------------------------
@tornado.gen.coroutine
def GetByLoginName(login_name):

	list_data = yield db.FindByOffset(0,1,'login_name = %s','',(login_name,))
	if len(list_data) == 0:
		return None
	else:
		return list_data[0]


@tornado.gen.coroutine
def GetAll():
	

	list_data = caching.get(CAHCE_KEY)

	if not list_data:
		list_data = yield db.FindAll('delete_flag = 0')
		caching.set(CAHCE_KEY,list_data,10)

	return list_data


@tornado.gen.coroutine
def Get(user_id):

	item = yield db.Get(user_id)

	return item


@tornado.gen.coroutine
def GetByUser(user_id):

	item = yield user_secontrol_db.FindByOffset(0,1,'u_id = %s','',(user_id,))
	if len(item)==0:
		return None
	return item[0]

@tornado.gen.coroutine
def Add(item):
	
	lastid = yield db.Insert(item)
	if(lastid > 0):
		FLushCache()

	return lastid


@tornado.gen.coroutine
def AddByUser(item):
	
	lastid = yield user_secontrol_db.Insert(item)
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
def Delete(u_id,delete_flag =1):
	list_data = yield db.FindByOffset(0,1,'id = %s','',(u_id,))
	if len(list_data)==0:
		return False

	ret = yield db.Execute('default','update users set delete_flag = %s where id = %s',(delete_flag,u_id))
	return ret

@tornado.gen.coroutine
def addorupdate(item):
	u_id = item.get('u_id')
	list_data = yield user_secontrol_db.FindByOffset(0,1,'u_id = %s','',(u_id,))
	if len(list_data)==0:
		yield user_secontrol_db.Insert(item)

	ret = yield db.Execute('default','update user_secontrol set secontrol = %s,update_time = %s where u_id = %s',(item.get('secontrol',''),datetime.datetime.now(),u_id))
	return ret


def FLushCache():
	caching.remove(CAHCE_KEY)

@tornado.gen.coroutine
def GetByFilter(offset,limit,params):
	text_array = []
	val_array = []

	if params.get('role_id'):
		text_array.append("`id` = %s")
		val_array.append(params.get('role_id'))

	# text_array.append("`delete_flag` = 0")

	whereString = ' and '.join(text_array)
	orderString = 'create_time desc'
	list_data = yield db.Find(offset,limit,whereString,orderString,tuple(val_array))

	return list_data

# ---------------------------------------------------------------------------------------
# 加密
# ---------------------------------------------------------------------------------------
def EncryptPassword(password,salt):

	return hashlib.md5((password + salt).encode()).hexdigest().upper()


@tornado.gen.coroutine
def playerlogincount(item):
	ret = yield DbAccessor.Select('default','SELECT count(distinct d_date) as count,s_uid,pid  FROM player_login where pid = %s group by s_uid',(item.get('pid','')))
	return ret