
#coding:utf-8
import tornado.web
# from PIL import Image, ImageDraw, ImageFont, ImageFilter
from tornzen import http,logger,utils
from tornzen import caching
from configs import *
from tornzen.handlers import *
from services import *
import random
import traceback
import json
import time
# ---------------------------------------------------------------------------------------
# 页面基类
# ---------------------------------------------------------------------------------------
_random_str = str(random.random())

class RequestHandler(BaseHandler.RequestHandler):

	def initialize(self):
		super().initialize()

		self._vars_configs = None
		self.wechat_user = None
		self._current_wechat_user = None
		self.menu_data = []
		self.srv_datas =dict()
	def get_current_user(self):
		admin_flag = (self.get_secure_cookie("admin_flag"))
		if admin_flag is None:
			self.admin_flag = False
		else:  
			self.admin_flag = admin_flag.decode()=='1'
		return self.get_secure_cookie("user_id")



	@tornado.gen.coroutine
	def prepare(self):
		pass

	@tornado.gen.coroutine
	def get_menu(self):
		if not (self.current_user):
			self.redirect('/login/')
			return
		roles = yield PrivilegeService.GetRolesByUserId(int(self.current_user))
		menu_accesses = []
		for roleid in roles:
			_menu_accesses = yield PrivilegeService.GetRoleAccess(roleid)
			menu_accesses = menu_accesses + _menu_accesses
		if len(menu_accesses)==0:
			self.finish(dict(code=1))
			return
		menus = yield MenuService.GetAll()
		menu_set = set([ x.get('menu_id') for x in menu_accesses ])
		try:
			self.links=dict()
			for menu in  (filter(lambda x:x.get('pid') == 0,menus)):
				if menu['id'] not in menu_set:
					continue
				_menu_item = dict()
				_target = menu.get('target','')
				_menu_item['href'] = menu.get('link','')
				_menu_item['aText'] = menu.get('name','')
				_menu_item['aData'] = _target
				_menu_item['collapseClass'] = 'collapse-' + _target
				_menu_item['iconClass'] = 'iconfont ' + menu.get('icon','')
				_menu_item['rightIconClass'] = 'glyphicon glyphicon-chevron-left'
				_menu_item['subItem'] = []
				subItem = []
				for _menu in (filter(lambda x:x.get('pid')==menu.get('id'),menus)):
					if _menu.get('id',0) not in menu_set:
						continue
					self.links[(_menu.get('link').replace('/','_'))] = _menu.get('link')
					for __menu in (filter(lambda y:y.get('pid')==_menu.get('id'),menus)):
						if __menu.get('id',0) not in menu_set:
							continue
						self.links[(__menu.get('link').replace('/','_'))] = __menu.get('link')
					subItem.append(dict(href = _menu.get('link',''),aText=_menu.get('name','')))
					_menu_item['subItem'] = subItem
				self.menu_data.append(_menu_item)
			caching.set(str(self.current_user),self.links,60*60*24)

		except Exception as e:
			self.finish(dict(code=1))
			return
		


	# 获取系统配置变量值
	def get_var(self,varName,defaultValue = ''):
		if not self._var_values:
			return ''
		return self._var_values.get(varName) if self._var_values.get(varName) else defaultValue

	@tornado.gen.coroutine
	def __init_vars(self):

		result = caching.get('GLOBAL-VAR-CONFIG')

		if not result:
			result = yield self.__fetch_vars()
			if isinstance(result,list):
				configs = {}
				for item in result:
					configs[item['key_name']] = item['var_value']
				self._var_values = configs

				caching.set('GLOBAL-VAR-CONFIG',configs,60)
		else:
			self._var_values = result
		pass

	@tornado.gen.coroutine
	def __fetch_vars(self):

		list_data = yield SysService.GetAll()

		return [ 
			{ 
				'key_name':item['var_name'],
				'var_value':item['var_value'],
				'update_time':item['update_time'].strftime('%Y-%m-%d %H:%M:%S')
			} for item in list_data ]




	def get_rand_domain(self,random_domain = True):

		domain = self.request.host
		if app_setting.DEBUG_MODE or not random_domain:
			return domain

		load_balance_domains = self.GetVars('load_balance_domain')
		if load_balance_domains:
			load_balance_domains = load_balance_domains.split(',')
			domain = random.choice(load_balance_domains)
		return domain


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
		
	def get_check(self):

		user_agent = self.request.headers.get('User-Agent')

		if not user_agent:
			user_agent = ''

		user_agent = user_agent.lower()

		ua_s = ['nokia', 'sony', 'ericsson', 'mot', 'samsung', 'htc', 'sgh', 'lg', 'sharp', 'sie-'
		,'philips', 'panasonic', 'alcatel', 'lenovo', 'iphone', 'ipod', 'blackberry', 'meizu', 
		'android', 'netfront', 'symbian', 'ucweb', 'windowsce', 'palm', 'operamini', 
		'operamobi', 'opera mobi', 'openwave', 'nexusone', 'cldc', 'midp', 'wap']

		is_mobile = False
		for ua in ua_s:
			if ua in user_agent:
				is_mobile = True
				break

		return is_mobile

	#图片压缩
	def Resizeimg(self,imgurl,save_q,saveimgurl,image_w=None,image_h=None):
		im = Image.open(imgurl)
		if image_h is None or image_w is None:
			image_w,image_h  = im.size
		else:
			image_w = int(image_w)
			image_h = int(image_h)
		im.resize((image_w,image_h),Image.ANTIALIAS).save(saveimgurl,quality=save_q)


	## 获取附近信息
	@tornado.gen.coroutine
	def get_information(self):
		information_data =caching.get('annex_information')

		if information_data is None:
			information_data = yield OutputDrainService.annex_information()
			## information 中5代表的物品，8代表的是装备7角色名称

			information_data = json.loads(information_data.get('data','{}'))
			caching.set('annex_information',information_data,60*60)
		return information_data

	## 获取服务器信息
	@tornado.gen.coroutine
	def get_server_data(self):
		srv_datas = caching.get('s_data')
		if srv_datas is None:
			srv_data = yield OutputDrainService.get_server_data()
			srv_datas =dict()
			for _srv_data in srv_data:
				srv_datas[_srv_data.get('uid','')] = _srv_data.get('name','')
			caching.set('s_data',srv_datas,60*60)

		return srv_datas

	## 获取菜单信息
	@tornado.gen.coroutine
	def get_goods_menu(self):
		result_dict = dict()
		type_datas = yield  OutputDrainService.GetAllCM2(' pid !=0 ')
		for _type in type_datas:
			result_dict[str(_type['id'])] = _type.get('name','')
		return result_dict
	## 获取冒险团数据和途径信息
	@tornado.gen.coroutine
	def getdata_way(self):
		result_dict = dict()
		data = yield  GuildBossRecordService.GetGuildOutputCon()
		for _data in data:
			result_dict[str(_data['id'])] = _data['name']
		return result_dict
	@tornado.gen.coroutine
	def dealtime(self,timestemp,ret_str):
		time_str = '0'
		if  timestemp and timestemp !='0' and timestemp!=0:
			time_local = time.localtime(timestemp)
			time_str = time.strftime(ret_str,time_local)
		return time_str


	


		