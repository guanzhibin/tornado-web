#coding:utf-8
import tornado.web
import datetime
from configs import *
from services import *
from web_p.handlers import *
import time
#----------------------------------------------------------------
#角色管理页面
#----------------------------------------------------------------
class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		# self.get_url()
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/roles_manage.html',privilege = self.privilege)
#--------------------------------------------------------------------------
#  获取角色列表
#-------------------------------------------------------------------------

class roleList(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		try:
			if self.privilege is False:
				self.finish(dict(code=30005,msg = '没有查看的权限的权限'))
				return 
			datas = []
			offset = self.get_int('offset',0)
			limit = self.get_int('limit',10)
			all_roles = yield RoleService.GetByFilter(0,10,params=dict())
			for role in all_roles[1]:
				datas.append(dict(
							id = role.get('id'),
							role_name = role.get('role_name',''),
							create_time = role.get('create_time').strftime('%Y-%m-%d %H:%M:%S'),
							role_describe = role.get('role_describe','')
						))
			self.finish(dict(code=0,rows=datas,total=all_roles[0]))
			return 
		except Exception as e:
			self.finish(dict(code=1,msg=str(e)))
			return


#--------------------------------------------------------------------------
#  获取所有的角色列表
#-------------------------------------------------------------------------

class roleLists(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		try:
			if self.privilege is False:
				self.finish(dict(code=30005,msg = '没有操作的权限'))
				return 
			datas = []
			all_roles = yield RoleService.GetByFilter(0,10,params=dict())
			for role in all_roles[1]:
				datas.append(dict(
							id = role.get('id'),
							role_name = role.get('role_name','')
						))
			self.finish(dict(code=0,rows=datas,total=all_roles[0]))
			return 
		except Exception as e:
			self.finish(dict(code=1,msg=str(e)))
			return

#-----------------------------------------------------------------------
#删除角色
#-----------------------------------------------------------------------
class deleteRole(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def post(self):
		if self.privilege is False:
			self.finish(dict(code=30005,msg = '没有操作的权限'))
			return 
		r_id = self.get_int('id','')
		if not r_id:
			self.finish(dict(code=1,msg='参数错误'))
		ret = yield RoleService.Delete(r_id)
		code = 0
		if ret is False: 
			code=1
		yield PrivilegeService.DeleteRoleAccess(r_id)
		self.finish(dict(code=code))
		return

#--------------------------------------------------------------------
#添加角色
#-------------------------------------------------------------------

class AddRole(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/add_role.html')

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def post(self):
		if self.privilege is False:
			self.finish(dict(code=30005,msg = '没有操作的权限'))
			return 
		##  是否做该用户是否有权限做这个操作，这个权限如何控制最好
		role_name = self.get_argument('role_name','')
		if not role_name:
			self.finish(dict(code=30002,msg='角色名称不能为空'))
		role_describe = self.get_argument('role_describe','')
		power_list = self.get_argument('power_list','').split(',')
		if len(power_list)==0:
			self.finish(dict(code=1))
			return 
		last_id = yield RoleService.Add(dict(
								role_name = role_name,
								role_describe = role_describe,
								create_time = datetime.datetime.now()
				))
		if last_id:
			ret_status = yield PrivilegeService.SetRoleAccess(last_id,power_list)
			if ret_status is True:
				self.finish(dict(code=0))
				return
		self.finish(dict(code=0))
		return

#----------------------------------------------------------------------
# 修改角色
#----------------------------------------------------------------------

class updateRole(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/update_user_role.html')
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def post(self):
		if self.privilege is False:
			self.finish(dict(code=30005,msg = '没有操作的权限'))
			return 
		role_id = self.get_int('id',0)
		menu_ids = self.get_argument('menu_ids','').split(',')
		if not role_id or len(menu_ids)==0:
			self.finish(dict(code=30004,msg='非法操作'))
		role_data = yield PrivilegeService.DeleteMenuAccessByRId(role_id)
		ret_status = yield PrivilegeService.SetRoleAccess(role_id,menu_ids)
		if ret_status is True:
			self.finish(dict(code=0))
			return
		self.finish(dict(code=0,msg='没有修改的权限'))
		return 


#-------------------------------------------------------------------------------------
# 菜单显示列表
#-------------------------------------------------------------------------------------
class menuList(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		try:
			if self.privilege is False:
				self.finish(dict(code=30005,msg = '没有操作的权限'))
				return 
			datas = []
			offset = self.get_int('offset',0)
			limit = self.get_int('limit',10)
			all_menus = yield MenuService.GetByFilter(offset,limit,params=dict(delete_flag='\x00'))
			for menu in all_menus[1]:
				datas.append(dict(
							id = menu.get('id'),
							name = menu.get('name',''),
							create_time = menu.get('create_time').strftime('%Y-%m-%d %H:%M:%S'),
							link  = menu.get('link',''),
							pid = menu.get('pid',''),
							target = menu.get('target','')
						))
			self.finish(dict(code=0,rows=datas,total=all_menus[0]))
			return 
		except Exception as e:
			self.finish(dict(code=0,rows=[]))
			return

#---------------------------------------------------------------------------
#  获取所有菜单
#--------------------------------------------------------------------------
class getMenu(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.finish(dict(code=30005,msg = '没有操作的权限'))
			return 
		all_menus = yield MenuService.GetAll()
		datas = []
		for menu in all_menus:
			datas.append(dict(
							id = menu.get('id',0),
							href = menu.get('link',''),
							pid = menu.get('pid',0),
							name = menu.get('name',''),
							target = menu.get('target','')
						))
		self.finish(dict(code=0,rows=datas))

#---------------------------------------------------------------------
#  菜单显示页面
#---------------------------------------------------------------------
class menu(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/menu_manage.html')

#--------------------------------------------------------------------
#  添加菜单页面以及添加菜单的接口
#-------------------------------------------------------------------
class addMenu(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		m_id = self.get_int('id','')
		data = yield MenuService.Get(m_id)
		if not data:
			data = dict()
		self.render_view('/add_menu.html',data = data)


	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def post(self):
		if self.privilege is False:
			self.finish(dict(code=30005, msg = '没有添加菜单的权限'))
		name = self.get_argument('menu_name','')
		link = self.get_argument('link','')
		pid = self.get_int('pid',0)
		target  = self.get_argument('target','')
		m_id  = self.get_int('m_id','')
		icon = self.get_argument('icon','')
		priority = self.get_int('priority',0)
		_now  = datetime.datetime.now()
		menu_data = dict(
							name = name,
							link = link,
							pid = pid,
							target = target,
							icon = icon,
							priority = priority
							)
		if m_id:
			menu_data['id'] = m_id
			menu_data['update_time'] = _now
			ret = yield MenuService.Update(menu_data)
		else:
			menu_data['create_time'] = _now
			ret = yield MenuService.Add(menu_data)
		###   定义添加错误统一的返回的状态码
		if not ret:
			self.finish(dict(code=30004, msg = '操作失败'))
			return
		self.finish(dict(code=0))
		return

#--------------------------------------
#  删除菜单
#--------------------------------------

class deleteMenu(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def post(self):
		if self.privilege is False:
			self.finish(dict(code=30005, msg = '没有删除菜单权限'))
		m_id  =self.get_int('id')
		if not m_id:
			self.finish(dict(code=1,msg='参数错误'))
		ret = yield MenuService.Update(dict(id = m_id,delete_flag='\x01'))
		code = 0
		if ret is False: 
			code=30004
		self.finish(dict(code=code))
		return


