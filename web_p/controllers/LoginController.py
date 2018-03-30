#coding:utf-8
import tornado.web
import datetime
from configs import *
from tornzen import http,logger,utils,caching
from services import *
from web_p.handlers import *
import random,time
from tornzen.handlers import *
#----------------------------------------------------------------
#登录页面
#----------------------------------------------------------------

class index(BaseHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		self.render_view('/login.html')

		
class Login(BaseHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def post(self):
		login_name = self.get_argument('login_name','')
		password = self.get_argument('password','')
		if not login_name:
			self.finish(code=1,msg='用户名为空')
			return
		if not password:
			self.finish(code=1,msg='密码为为空')
			return
		user = yield UserService.GetByLoginName(login_name)
		if not user:
			self.finish(dict(code=1,msg='用户名不存在'))
			return
		msg = ''
		code=0
		self.set_secure_cookie("user_id", str(user.get('id')),expires_days=None)
		self.set_secure_cookie("user_name",str(user.get('login_name')),expires_days=None)
		privi_flag = '0'
		if user.get('admin_flag')==b'\x01':
			privi_flag = '1'
		self.set_secure_cookie("admin_flag",privi_flag,expires_days=None)
		##  判断用户是否访问的权限
		if user['delete_flag'] == b'\x01':
			msg = '该用户已被锁定,暂时无法登录'
			code=1


		encypt_pwd = UserService.EncryptPassword(password,app_setting.salt)

		
		
		if encypt_pwd != user['password']:
			code=1
			msg='密码错误'
		if msg=='':
			yield UserService.Update(dict(
										id= user['id'],
										login_num = user['login_num']+1,
										last_login_time = datetime.datetime.now()
									))
		self.finish( dict(
				code = code,
				msg=msg
			))
		return 
		#分配AccessCode
		access_code = self.get_rand_str(32)
		# 登录时间
		expires_in = app_setting.LOGIN_EXPIRE_TIME

		expire_time = int(time.time()) + expires_in
		yield self.set_current_user(access_code,user['id'],expire_time)
		self.finish( dict(
				uid = user['id'],
				name = user['name'],
				access_code = access_code
			))

	@tornado.gen.coroutine
	def set_current_user(self,access_code,value,expire_time):

		
		yield LoginService.SetAccessCode(dict(
										access_code = access_code,
										expire_time =expire_time,
										p_id=value
									))
		
		self.set_cookie(app_setting.PROMOTE_COOKIES_KEY,access_code)

		return True



	def get_rand_str(self,length):
		return ''.join(random.choice('0123456789abcdefhijklkmnopqrstuvwxyzABCDEFHIJKLKMNOPQRSTUVWXYZ') for n in range(length))

		return result

#-------------------------------------------------------------------------------------------------------------------------
#  退出登录 并清除所有的cookie
#-------------------------------------------------------------------------------------------------------------------------

class logout(WebBaseHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def post(self):
		self.set_secure_cookie('user_id','')
		self.set_secure_cookie('user_name','')
		# self.clear_all_cookies()
		self.finish(dict(code=0))
		return