#coding:utf-8
import tornado.web
from services import *
from web_p.handlers import *
from tornzen.handlers import *
#----------------------------------------------------------------
#登录页面
#----------------------------------------------------------------

class index(BaseHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		self.render_view('/login.html')


class cumulativebyplayer(BaseHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		pids = self.get_argument('pid','')
		pid_list = pids.split(',')
		result_data = dict()
		code = 0
		for pid in pid_list:
			data = yield UserService.playerlogincount(dict(pid = pid))
			for _data in data:
				result_data.update({str(_data.get('s_uid',''))+'_'+str(_data.get('pid')):_data.get('count',0)})
		if result_data:
			code = 1
		self.finish(dict(result = result_data,code = code))
		return
