#coding:utf-8
import tornado.web
import datetime
from configs import *
from services import *
from web_p.handlers import *
import time
#----------------------------------------------------------------
#用户列表
#----------------------------------------------------------------
class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/user_manage.html')

#--------------------------------------------------------------
#  用户列表
#--------------------------------------------------------------

class list(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		try:
			if self.privilege is False:
				self.finish(dict(code=30005,msg = '没有操作的权限'))
				return 
			datas = []
			login_id =  int(self.get_current_user())
			offset = self.get_int('offset',0)
			limit = self.get_int('limit',10)
			user_list = yield UserService.GetByFilter(0,10,params=dict())
			for user in user_list[1]:
				datas.append(dict(
							id = user.get('id'),
							login_name = user.get('login_name',''),
							create_time = user.get('create_time').strftime('%Y-%m-%d %H:%M:%S'),
							last_login_time = user.get('last_login_time').strftime('%Y-%m-%d %H:%M:%S'),
							login_num = user.get('login_num') if user.get('login_num','') else '',
							delete_flag  = 0 if user.get('delete_flag')==b'\x00' else 1,
							admin_flag = 1 if user.get('admin_flag') ==b'\x01' or login_id==user.get('id') else 0,
							self_flag = True if login_id==user.get('id') else False,
							secontrol = True if user.get('admin_flag') ==b'\x01' else False
						))
			self.finish(dict(code=0,rows=datas,total=user_list[0]))
			return 
		except Exception as e:
			self.finish(dict(code=1,msg='dsgd'))
			return

##------------------------------------------------------------
###  添加用户
#-------------------------------------------------------------
class Add(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/add_user.html')


	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def post(self):
		if self.privilege is False:
			self.finish(dict(code=30005,msg = '没有操作的权限'))
			return 
		login_name  =self.get_argument('login_name','')
		if not login_name:
			self.finish(dict(code=30002,msg='登录名称不能为空'))
			return 
		password = self.get_argument('password','')
		if not password:
			self.finish(dict(code=30002,msg='密码不能为空'))
			return 
		confirm_password = self.get_argument('confirm_password','')
		if not confirm_password:
			self.finish(dict(code=30002,msg ='确认密码不能为空'))
			return
		if password!=confirm_password:
			self.finish(dict(code=30002,msg='两次密码不一致'))
			return
		role_ids = self.get_argument('role_ids','').split(',')
		if len(role_ids)==0:
			self.finish(dict(code=30002,msg='请选择角色'))
			return 
		## 添加用户
		check_user = yield UserService.GetByLoginName(login_name)
		if check_user:
			self.finish(dict(code=30002,msg='用户已存在'))
			return
		password=UserService.EncryptPassword(str(password),app_setting.salt)
		last_id = yield UserService.Add(dict(login_name = login_name,
			password = password,create_time = datetime.datetime.now()))
		if last_id:
			ret_status = yield PrivilegeService.SetRolesByEmpId(last_id,role_ids)
			if ret_status is True:
				self.finish(dict(code=0))
				return
		self.finish(dict(code=0))
		return

#-------------------------------------------------------------------------
# 删除用户
#-------------------------------------------------------------------------

class delete(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def post(self):
		if self.privilege is False:
			self.finish(dict(code=30005,msg = '没有操作的权限'))
			return 
		u_id = self.get_int('id','')
		if not u_id:
			self.finish(dict(code=1,msg='参数错误'))
		delete_flag = (self.get_int('delete_flag'))
		if delete_flag ==1:
			_delete_flag = 0
			msg = '成功启用该用户'
		else:
			_delete_flag = 1
			msg = '成功禁止该用户'
		ret = yield UserService.Delete(u_id,delete_flag = _delete_flag)
		code = 0
		if ret is False: 
			code=1

		self.finish(dict(code=code,msg = msg))
		return

class updateToRole(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/update_user.html')

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def post(self):
		if self.privilege is False:
			self.finish(dict(code=30005,msg = '没有操作的权限'))
			return 
		u_id = self.get_int('id','')
		role_ids = self.get_argument('role_ids','').split(',')
		if not u_id or len(role_ids)==0:
			self.finish(dict(code=30004,msg='非法操作'))
			return 

		ret_status = yield PrivilegeService.SetRolesByEmpId(u_id,role_ids)
		if ret_status:
			self.finish(dict(code=0))
			return
		self.finish(dict(code=30002,msg='修改失败'))


