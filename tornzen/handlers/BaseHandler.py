#coding: utf-8
import tornado.web
from tornzen import logger
import os
import datetime
import json
import json

class RequestHandler(tornado.web.RequestHandler):
	'''

	'''
	def parent(self):
		return super(RequestHandler, self)

	def initialize(self):

		# 日志记录
		self.logger = logger.create(name = self.__class__.__name__)

		self._is_robot = None

		self.base64_blank_img = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

		

	@tornado.gen.coroutine
	def prepare(self):
		'''
			预留
		'''
		return

	def render_view(self, template_name, **kwargs):

		module_name = self.__module__
		action_idx = module_name.rfind('.')
		
		view_path = os.getcwd() + '/' + module_name[0:module_name.rfind('.',0,action_idx)].replace('.','/')

		if template_name[0] == '/':
			return self.parent().render(view_path + "/views" + template_name, **kwargs)
		elif template_name[0:2] == '~/':
			return self.parent().render(template_name[2:], **kwargs)
		else:
			raise Exception('参数错误')



	def get_ip(self):
		''' 获取IP地址
			如果 nginx 在前做负载的时候使用X-Read-Ip头
		'''
		return self.request.headers['X-Real-Ip'] if self.request.headers.get('X-Real-Ip') else self.request.remote_ip


	def is_robot(self):
		''' 根据 user_agent 判断是否是搜索引擎 '''
		if self._is_robot != None:
			return self._is_robot
		user_agent = ''
		user_agent = user_agent.lower()
		self._is_robot =  user_agent.find('bot') > -1 or user_agent.find('splider') > -1 or user_agent.find('slurp') > -1
		return self._is_robot


	def get_bool(self,name,defaultValue = ''):
		''''''
		v = self.get_argument(name,defaultValue)
		if v in ['true','1','True','TRUE']:
			v = True
		else:
			v = False
		return v

	def get_int(self,name,defaultValue = ''):
		v = self.get_argument(name,defaultValue)
		v = 0 if not v.isdigit() else int(v)
		return v

	def get_byte(self,name,defaultValue = ''):
		
		v = self.get_argument(name,defaultValue)

		if v in ['true','1','True','TRUE']:
			v = b'\x01'
		else:
			v = b'\x00'

		return v


	def get_date(self,name):

		v = self.get_argument(name,'')
		if not v:

			return None
		d = None
		try:
			
			d = datetime.datetime.strptime(v,'%Y-%m-%d')
		except:
			pass
		return d

	def get_datetime(self,name):

		v = self.get_argument(name,'')
		if not v:
			return None
		d = None
		try:
			d = datetime.datetime.strptime(v,'%Y-%m-%d %H:%M:%S')
		except:
			pass
			
		return d

	def get_json(self,name):
		v = self.get_argument(name,'')
		if not v:
			return None
		d = None
		try:
			d = json.loads(v)
		except:
			pass
			
		return d


	def write_error(self, status_code, **kwargs):

		if status_code == 500:
			if kwargs:
				self.logger.error(kwargs)
			try:
				error_log = traceback.format_exc()
				self.logger.error(error_log)
			except:
				self.logger.error('traceback context is None')

			self.render('error/50x.html')
		else:
			if kwargs:
				self.logger.error(status_code,kwargs)
				super().write_error(status_code,**kwargs)
			else:
				self.logger.error(status_code,'kwargs None')
		
	