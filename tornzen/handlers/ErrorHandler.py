#coding: utf-8
import tornado.web

class RequestHandler(tornado.web.RequestHandler):

	# @tornado.web.asynchronous
	def prepare(self):
		self.finish('404 page not found')
