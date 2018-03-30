#coding:utf-8

from tornzen.handlers import BaseHandler
from tornzen import logger,http
import tornado.web
import traceback
import json,datetime

# ---------------------------------------------------------------------------------------
# JSON API 接口处理类
# ---------------------------------------------------------------------------------------
class RequestHandler(BaseHandler.RequestHandler):

	def initialize(self):
		super().initialize()

	@tornado.gen.coroutine
	def prepare(self):
		yield super().prepare()
		self.set_header('Content-Type','text/json')


	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		result = yield self._process()
		if result != None :	self.write(json.dumps(result))
		if not self._finished:
			self.finish()

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def post(self):
		result = yield self._process()
		if result != None :	self.write(json.dumps(result))
		if not self._finished:
			self.finish()


	@tornado.gen.coroutine
	def _process(self):
		result = None
		try:
			result = yield self.process()
		except Exception as e:
			raise
		return result


	@tornado.gen.coroutine
	def process(self):
		'''
			该接口未实现
		'''
		return { 'err':-2,'msg':'not implement' }

	def JsonResult(self,code,msg):
		return { 'err':code,'msg':msg }


	def write_error(self, status_code, **kwargs):

		if status_code == 500:
			if kwargs:
				self.logger.error(kwargs)
			try:
				error_log = traceback.format_exc()
				self.logger.error(error_log)
			except:
				self.logger.error('traceback context is None')

			self.finish('err 500')
		else:
			if kwargs:
				self.logger.error(status_code,kwargs)
				super().write_error(status_code,**kwargs)
			else:
				self.logger.error(status_code,'kwargs None')
		


