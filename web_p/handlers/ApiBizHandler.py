#coding:utf-8
from tornzen.handlers import ApiBaseHandler
from services import *
from tornzen import caching
import tornado.web
import traceback
import json,datetime
import time
from configs import *
# ---------------------------------------------------------------------------------------
# 
# ---------------------------------------------------------------------------------------
class RequestHandler(ApiBaseHandler.RequestHandler):

	def initialize(self):
		super().initialize()

		self.current_user = None

		

	@tornado.gen.coroutine
	def prepare(self):
		yield super().prepare()

		if not self.need_authorize():
			return
		#加载用户
		access_code = self.get_cookie(app_setting.AUTH_COOKIES_KEY)
		user_id = 0

		# if DEBUG_MODE:
		# 	self.current_user = yield LoginService.Get(1)
		# 	return

		if access_code:

			login_token  = yield LoginService.GetByAccessCode(access_code)

			if not login_token:
				self.redirect('/pc/login/')
				return	

			user_id = login_token['userid']
			expire_time = login_token['expire_time']
			
			if not user_id or time.time() - expire_time > app_setting.LOGIN_EXPIRE_TIME:
				self.redirect('/pc/login/')
				return

			self.current_user = yield LoginService.Get(user_id)
			
			if not self.current_user:
				self.redirect('/pc/login/')
				return
			else:
				yield LoginService.UpdatExpireTime(dict(
												access_code = access_code,
												expire_time  = time.time()
											))

	@tornado.gen.coroutine
	def get_privileges(self,eid):
		
		privileges_sets = yield PrivilegeService.GetPrivilegeAccess(eid)

		return privileges_sets



	def need_authorize(self):
		return True

	












