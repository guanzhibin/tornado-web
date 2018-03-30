
import tornado.web
from tornzen.database import DbAccessor
from tornzen import http,logger,utils,caching
import hashlib

_dbMenuAccess = DbAccessor('default',('menu-access'))
_dbMenu = DbAccessor('default',('menus'))
_dbEmployeeRole = DbAccessor('default',('user-role'))
_DB_Privilege = DbAccessor('default',('dc-privilege'))
_DB_SeControl = DbAccessor('default',('dc-secontrol'))


_CAHCE_KEY_MENUS = 'CACHE:ONE-SYS-PRIVILEGE-MENU'
_CAHCE_KEY_PRIVI = 'CACHE:ONE-SYS-PRIVILEGE-ITEM'


@tornado.gen.coroutine
def GetAllMenus():
	
	list_data = caching.get(_CAHCE_KEY_MENUS)

	if not list_data:
		list_data = yield _dbMenu.FindAll()
		caching.set(_CAHCE_KEY_MENUS,list_data,10)

	return list_data

@tornado.gen.coroutine
def DeleteRoleAccess(role_id):
	ret = yield _dbMenuAccess.DeleteBy('role_id = '+ str(role_id))
	return ret	


@tornado.gen.coroutine
def SetRoleAccess(roleid,menu_ids):
	
	yield _dbMenuAccess.DeleteBy('role_id = '+ str(roleid))
	insert_false = []
	for menu_id in menu_ids:
		last_id = yield _dbMenuAccess.Insert({ 'role_id':str(roleid),'menu_id':menu_id })
		if not last_id:
			insert_false.append(False)
	if len(insert_false)>0:
		return False
	return True

@tornado.gen.coroutine
def GetRoleAccess(roleid):
	
	menu_accesses = yield _dbMenuAccess.FindAll('role_id = '+ str(roleid))

	return menu_accesses


## ----------------------------------------------------------------------------------------
## 通过role_id删除menu_access表中的数据
##-----------------------------------------------------------------------------------------
@tornado.gen.coroutine
def DeleteMenuAccessByRId(role_id):
	ret = yield _dbMenuAccess.DeleteBy('role_id = '+ str(role_id))
	return ret


@tornado.gen.coroutine
def GetRolesByUserId(uid):

	list_data = yield _dbEmployeeRole.FindAll('u_id = '+ str(uid))
	return [x.get('role_id') for x in list_data]


@tornado.gen.coroutine
def SetRolesByEmpId(user_id,role_ids):

	yield _dbEmployeeRole.DeleteBy('u_id = '+ str(user_id))

	for role_id in role_ids:
		yield _dbEmployeeRole.Insert({ 'role_id':role_id,'u_id':user_id })
	return True


@tornado.gen.coroutine
def GetAllPrivileges():
	
	list_data = caching.get(_CAHCE_KEY_PRIVI)
	list_data = None
	if not list_data:
		list_data = yield _DB_Privilege.FindAll()
		caching.set(_CAHCE_KEY_PRIVI,list_data,10)

	return list_data


@tornado.gen.coroutine
def GetPrivilegeAccess(eid):
	
	roles = yield GetRolesByEmpId(eid)
	
	privi_accesses = []

	for roleid in roles:
		_privi_accesses = yield GetSecontrolAccess(roleid)
		privi_accesses = privi_accesses + _privi_accesses

	list_dat = []
	for x in privi_accesses:
		result = yield _DB_Privilege.Get(x.get('privilege_id'))
		list_dat.append(result['code'])

	menu_set = set(list_dat)



	return menu_set

@tornado.gen.coroutine
def SetSecontrolAccess(roleid,privilege_ids):
	
	yield _DB_SeControl.DeleteBy('role_id = '+ str(roleid))

	for privilege_id in privilege_ids:
		yield _DB_SeControl.Insert({ 'role_id':str(roleid),'privilege_id':privilege_id })
	return True


@tornado.gen.coroutine
def GetSecontrolAccess(roleid):
	
	privilege_accesses = yield _DB_SeControl.FindAll('role_id = '+ str(roleid))

	return privilege_accesses

