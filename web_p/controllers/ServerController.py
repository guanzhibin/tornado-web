#coding:utf-8
import tornado.web
import datetime
from configs import *
from services import *
from web_p.handlers import *
import json

class index(WebBaseHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		self.render_view('/account.html',title='为账号增加权限')
#---------------------------------------------------------------------------
#  获取所有游戏列表
#--------------------------------------------------------------------------
class getServerMenu(WebBaseHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		admin_data =yield UserService.Get(int(self.current_user))
		all_chs = yield ServerService.GetAll()
		all_datas = yield ServerService.GetAllCS()
		if  admin_data and admin_data.get('admin_flag')==b'\x01':
			for _all_ch in all_chs:
				_all_ch['ch_id'] = 0
				_all_ch['s_uid'] = '0'
				all_datas.insert(0,_all_ch)
			self.finish(dict(code=0,rows=all_datas))
			return
		else:
			new_chs = []
			new_all_datas = []
			user_secontrol_data = yield UserService.GetByUser(admin_data.get('id'))
			secontrol = json.loads(user_secontrol_data.get('secontrol','{}'))
			server_list = []
			for k,v in secontrol.items():
				server_list +=v
				for chs in all_chs:
					if k==chs.get('name',''):
						new_chs.append(chs)
				for data in all_datas:
					if data.get('channel_name','') == k and data.get('s_uid','') in v:
						new_all_datas.append(data)

			for _new_chs in new_chs:
				_new_chs['ch_id'] = 0
				_new_chs['s_uid'] = '0'
				new_all_datas.insert(0,_new_chs)
			self.finish(dict(code = 0,rows = new_all_datas))
			return

class Add(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def post(self):
		u_id = self.get_int('id','')
		user_data = yield UserService.Get(u_id)
		if not user_data or user_data.get('admin_flag')==b'\x01':
			self.finish(dict(code = 20005))
			return
		server_list = self.get_argument('server_list','')
		server_list = server_list.split('|')
		data_dict =dict()
		for i in server_list:
			i = i.split(',')
			data_dict.update({i[0]:i[1:]})
		yield UserService.addorupdate(dict(u_id = u_id,secontrol = json.dumps(data_dict)))
		self.finish(dict(code=0,msg = 'msg'))
		return


class GetChannel(WebBaseHandler.RequestHandler):
	
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):

		admin_data =yield UserService.Get(int(self.current_user))
		all_chs = yield ServerService.GetAll()
		if  admin_data and admin_data.get('admin_flag')==b'\x01':
			self.finish(dict(code = 0,rows = all_chs))
			return
		else:
			new_chs = []
			user_secontrol_data = yield UserService.GetByUser(admin_data.get('id'))
			secontrol = json.loads(user_secontrol_data.get('secontrol','{}'))
			for k in secontrol.keys():
				for ch in all_chs:
					if ch.get('name','') ==k:
						ch['uid'] ='0'
						new_chs.append(ch)

			self.finish(dict(code = 0,rows =new_chs))
			return 

class GetServer(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		admin_data =yield UserService.Get(int(self.current_user))
		all_servers = yield ServerService.GetAllServer()
		new_servers = []
		if  admin_data and admin_data.get('admin_flag')==b'\x01':
			for server in all_servers:
				new_servers.append(dict(id= server['id'],name  =server['name'],uid=server['uid']))
			self.finish(dict(code = 0,rows = new_servers))
			return 
		else:
			user_secontrol_data = yield UserService.GetByUser(admin_data.get('id'))
			secontrol = json.loads(user_secontrol_data.get('secontrol','{}'))
			_v = []
			for v in secontrol.values():
				_v +=v
			_v = list(set(_v))
			for __v in _v:
				for server in all_servers:
					if server.get('uid','') == __v:
						new_servers.append(dict(
								id = server.get('id'),
								uid = server.get('uid'),
								name = server.get('name','')
							))
			self.finish(dict(code = 0,rows = new_servers))
			return