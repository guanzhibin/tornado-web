#coding: utf-8

import tornado.web
from web_p.handlers import WebBaseHandler
from tornzen import caching
import datetime
from services import UserService
import json
# ---------------------------------------------------------------------------------------
# 个人中心
# ---------------------------------------------------------------------------------------
class RequestHandler(WebBaseHandler.RequestHandler):

	@tornado.gen.coroutine
	def prepare(self):
		self.channel_string = ''
		self.server_string = []
		ip = self.get_ip()
		if ip!='192.168.2.70':
			print(ip)
		user_id = self.current_user
		self.start_now = datetime.datetime.now().strftime('%Y-%m-%d 00:00:00')
		if not user_id:
			self.redirect('/login/')	
		self.url = (self.request.uri.split('?')[0])
		self.urls = (caching.get(str(user_id)))
		self.privilege = True
		if self.urls is not None:
			if self.admin_flag is False:
				if self.url not in (list(self.urls.values()) if self.urls else []):
					self.privilege = False
		if self.admin_flag is False:
			user_secontrol_data = yield UserService.GetByUser(int(user_id))
			secontrol = json.loads(user_secontrol_data.get('secontrol','{}'))
			for k,v in secontrol.items():
				if self.channel_string:
					self.channel_string+=',' + k
				else:
					self.channel_string = k
				self.server_string+=v
		self.server_string = ','.join(self.server_string)
	@tornado.gen.coroutine
	def get_url(self):
		if self.privilege is True:
			self.finish(dict(code=30005, msg = '没有权限'))
			return False
		return True

	@tornado.gen.coroutine
	def deal_time(self,avg_time):
		str_time = ''
		_hours = avg_time//3600
		if _hours > 0:
			str_time += str(_hours) + '小时'
		left_time = avg_time - (_hours*3600)
		_m = left_time//60
		if _m > 0:
			str_time += str(_m) + '分'
		_s = left_time - _m*60
		str_time += str(_s) + '秒'
		return str_time

		


