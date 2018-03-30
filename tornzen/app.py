#coding:utf-8

# tornzen 0.1.0

import tornado.web
import os

from tornzen.handlers import ErrorHandler
from tornzen.config import *
from tornado.httpclient import AsyncHTTPClient
from tornzen import logger
import datetime

class Application(object):
	"""docstring for Application"""
	def __init__(self, settings,router_handlers,tornzen_setting = None):
		self.settings = settings
		self.router_handlers = router_handlers
		self.tornzen_setting = tornzen_setting

	def run(self,port):

		__settings = dict(
			debug = True,
			xheaders=True,
			default_handler_class = ErrorHandler.RequestHandler,
    		# xsrf_cookies= True
			# default_handler_class = None
		)

		__settings.update(self.settings)

		if HTTP_CLIENT_TYPE:
		    AsyncHTTPClient.configure(HTTP_CLIENT_TYPE)


		application = tornado.web.Application(handlers = self.router_handlers, **__settings)
		application.listen(str(port))
		logger.info('Development server is running at http://127.0.0.1:%s/' % str(port))
		logger.info('Quit the server with CONTROL-C')

		tornado.ioloop.IOLoop.instance().start()
		
		