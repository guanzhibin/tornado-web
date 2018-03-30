#coding:utf-8
import tornado.web
from configs import *
from tornzen import utils,caching
from services import *
from web_p.handlers import *
import io
# import xlsxwriter
import datetime
import time

#----------------------------------------------------------------
# 超觉醒数据
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		## 获取服务器的所有名称
		server_datas = yield ServerService.GetAllServer()
		server_list = []
		for _server_data in server_datas:
			server_list.append(dict(
							uid = _server_data.get('uid',''),
							name = _server_data.get('name','')
					))
		self.render_view('/superstar.html',title='超觉醒数据',server_list = server_list)

###-----------------------------------------------
##  角色超觉醒属性类型占比
####---------------------------------------------
class attrper(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		attr_type_d = {1:"hp_rate",2:"atk_rate",3:"reply_rate",4:'defense_rate',5:"crt_rate"}
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		end_time = self.get_argument('end_time','')
		s_uid = self.get_argument('s_uid','')
		order = (self.get_argument('order',''))

		if end_time:
			end_time = int(time.mktime(time.strptime(end_time, '%Y-%m-%d %H:%M:%S')))
		# if not server_list:
		# 	server_list = self.server_string
		list_data = yield SuperstarService.supattrsts(offset,limit,dict(s_uid = s_uid, op_type = 1,end_time =end_time))
		# list_data = yield SuperstarService.GetByFilter(offset,limit,dict(s_uid = s_uid))
		datas = []
		srv_datas = yield  self.get_server_data()
		for data in list_data[1]:
			s_uid = data.get('s_uid','')
			fid = data.get('fid','')
			total_attr_num = data.get('total_attr_num',0)
			_data = dict(
					server_name = srv_datas.get(str(s_uid),s_uid),
					fname = data.get('fname',''),
					fid = data.get('fid',''),
					unlock_num = data.get('unlock_num',0),
					total_attr_num = total_attr_num
				)
			ck_cond = dict(s_uid = s_uid, fid = fid, op_type = (1,3),end_time = end_time)
			ck_cond_p = dict(s_uid = s_uid , op_type = 1, fid = fid, end_time  = end_time)
			attr_type = yield SuperstarService.supattrtype(ck_cond)
			# kingd = yield SuperstarService.getdataking(dict(s_uid =s_uid , fid = fid , quality = 6))
			## 
			sup_p_num = yield SuperstarService.sup_p_numdata(ck_cond_p)
			all_p_num =  yield SuperstarService.all_suppdata(ck_cond_p)
			kingd = yield SuperstarService.supking(ck_cond)
			kingd_n  = kingd[0]['count']
			attr_t_dict = dict(
						hp_rate = '0.00%',
						atk_rate = '0.00%',
						reply_rate = '0.00%',
						defense_rate = '0.00%',
						crt_rate = '0.00%',
						king_n = kingd_n,
						king_rate = '%.2f%%' %(kingd_n*100/total_attr_num if total_attr_num else 0),
						sup_p_num = sup_p_num,
						all_p_num = all_p_num
				)
			for _attr in attr_type:
				type_num = _attr.get('attr_type')
				count = _attr.get('count',0)
				attr_t_dict[attr_type_d.get(type_num)] = '%.2f%%' %(count*100/total_attr_num if total_attr_num else 0)
			_data.update(attr_t_dict)

			datas.append(_data)

		return self.finish(dict(code = 0, rows = datas, total = list_data[0] ))

###-----------------------------------------------
##  区服超觉醒玩家排行
####---------------------------------------------
class playerrank(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		s_uid = self.get_argument('s_uid','')
		end_time = self.get_argument('end_time','')
		if end_time:
			end_time = int(time.mktime(time.strptime(end_time, '%Y-%m-%d %H:%M:%S')))

		list_data = yield SuperstarService.playerdata(offset,limit,dict(s_uid=s_uid,op_type =1,end_time  = end_time))
		# list_data = yield SuperstarService.dataofplayer(offset,limit,dict(s_uid = s_uid))
		datas  = []
		srv_datas = yield  self.get_server_data()
		for data in list_data[1]:
			pid  = data.get('pid',0)
			s_uid = data.get('s_uid','')
			ak_attr_num = data.get('total_attr_num',0)

			k_data = yield SuperstarService.supking(dict(s_uid = s_uid ,pid  = pid, op_type = (1,3),end_time = end_time ))
			all_sup_role = yield SuperstarService.player_role_all_sup(dict(s_uid = s_uid ,pid  = pid, op_type = 1,end_time = end_time ))
			king_num = data.get('king_num',0)
			if k_data:
				king_num = k_data[0].get('count',0)
			reset_num = 0
			ldiamond = 0
			baseldiamond = 0
			oneattr_reset = 0
			oneuserld = 0
			twoattr_reste = 0
			twouser_ld = 0

			reset_datas = yield SuperstarService.playerdatareset(dict(
																s_uid = s_uid,
																pid = pid,
																op_type = 2,
																end_time = end_time

				))
			for _reset_data in reset_datas:
				_lock_type = _reset_data.get('lock_type',0)
				_baseldiamond = int(_reset_data.get('basediamond',0))
				_lock_user_diamond = int(_reset_data.get('lock_user_diamond',0))
				_reset_num = _reset_data.get('lock_num',0)
				reset_num +=_reset_num
				baseldiamond += _baseldiamond
				ldiamond += _baseldiamond + _lock_user_diamond
				if _lock_type==1:
					oneattr_reset +=_reset_num
					oneuserld += _lock_user_diamond
				elif _lock_type ==2:
					twoattr_reste +=_reset_num
					twouser_ld += _lock_user_diamond
			ret_data = dict(
						server_name = srv_datas.get(str(s_uid),s_uid),
						pid = pid,
						pname = data.get('pname',''),
						ak_num = data.get('ak_num',0),
						ak_attr_num = ak_attr_num,
						king_num = king_num,
						king_rate = '%.2f%%' %(king_num*100/ak_attr_num if ak_attr_num else 0),
						reset_num = reset_num,
						ldiamond = ldiamond,
						baseldiamond = baseldiamond,
						oneattr_reset = oneattr_reset,
						oneuserld = oneuserld,
						twoattr_reste = twoattr_reste,
						twouser_ld = twouser_ld,
						all_sup_role = all_sup_role
				)
			datas.append(ret_data)
		return self.finish(dict(code = 0, rows = datas, total = list_data[0] ))


###-----------------------------------------------
##  区服超觉醒数据
####---------------------------------------------
class superdata(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		s_uid = self.get_argument('s_uid','')
		m_data = self.get_argument('m_data','')
		w_data = self.get_argument('w_data','')
		d_data = self.get_argument('d_data','')
		start_time = self.get_argument('start_time','')

		title = '区服超觉醒月数据'
		if not s_uid:
			return self.finish(dict(code = 0, rows = [], total = 0,
			d_date_list = [] , st_p_num_list = [],
			ak_num_list = [] , ldiamond_list = [],
			reset_num_list = [],index = 0,title = title))

		search_time = datetime.datetime.now()
		if start_time:
			search_time = datetime.datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")

		query  = dict(s_uid = s_uid)
		_year_t=search_time.isocalendar()
		##  day
		now = datetime.datetime.now()
		_now_yt = now.isocalendar()
		_now_year = _now_yt[0]
		_now_week = _now_yt[1]
		_now_month = now.month
		_now_d_date = int(now.strftime('%Y%m%d'))


		__week = int(str(_now_year) + str(_now_week))
		__month = int(str(_now_year) + str(_now_month))
		check_week_d = yield SuperstarService.dataofsuperbywm(dict(
		                                                    s_uid = s_uid,
		                                                    week = __week
		    ))
		check_month_d = yield SuperstarService.dataofsuperbywm(dict(
		                                                    s_uid = s_uid,
		                                                    month = __month
		    ))
		if not check_week_d:
			__check_w = dict(s_uid = s_uid,
					year = _now_year,
					week = _now_week
				)
			_mw_d = yield  SuperstarService.dataofsupersgeam(__check_w)
			now_data = yield  SuperstarService.dataofsupers(__check_w)
			w_ret_d = dict()
			for k,v in (_mw_d[0]).items():
				if v:
					w_ret_d[k] = int(v)

			for k,v in now_data[0].items():
				if v:
					w_ret_d[k] = v
			if w_ret_d:
				Monday = now  + datetime.timedelta(days  = 1-_now_yt[2])
				Sunday = now  + datetime.timedelta(days  = 7-_now_yt[2])
				w_ret_d['week_date'] = str(int(Monday.month)) + '.' + str(Monday.day) + '-' + str(int(Sunday.month)) + '.' + str(Sunday.day)
				w_ret_d['year'] = _now_year
				w_ret_d['week'] = int(str(_now_year) + str(_now_week))
				w_ret_d['s_uid'] = s_uid
				yield  SuperstarService.Add(w_ret_d,'week')

		if not check_month_d:
			__check_w = dict(s_uid = s_uid,
					year = _now_year,
					month = _now_month
				)
			_mw_d = yield  SuperstarService.dataofsupersgeam(__check_w)
			now_data = yield  SuperstarService.dataofsupers(__check_w)
			w_ret_d = dict()
			for k,v in (_mw_d[0]).items():
				if v:
					w_ret_d[k] = int(v)

			for k,v in now_data[0].items():
				if v:
					w_ret_d[k] = v
			if w_ret_d:
				w_ret_d['year'] = _now_year
				w_ret_d['month'] = __month
				w_ret_d['s_uid'] = s_uid
				yield  SuperstarService.Add(w_ret_d,'month')

		
		if d_data:
			query['d_date'] = int(search_time.strftime('%Y%m%d'))
			title = '区服超觉醒日数据'
			
		elif w_data:
			query['week'] = _year_t[1]
			query['year'] = _year_t[0]
			title = '区服超觉醒周数据'
		elif m_data:
			query['month'] = int(search_time.strftime('%m'))
			query['year'] = _year_t[0]
			
		count,list_data = yield SuperstarService.dataofsuper(offset,limit,query)
		datas  = []
		d_date_list = []
		st_p_num_list  = []
		ak_num_list = []
		reset_num_list = []
		ldiamond_list = []
		baseldiamond_list = []
		list_data_len = len(list_data)
		mw_count = 0
		for data in list_data:
			st_p_num = data.get('st_p_num',0)
			ak_num = data.get('ak_num',0)
			reset_num = data.get('reset_num',0)
			ldiamond = data.get('ldiamond',0)
			oneattr_reset = data.get('oneattr_reset',0)
			oneuserld = data.get('oneuserld',0)
			twoattr_reste = data.get('twoattr_reste',0)
			twouser_ld = data.get('twouser_ld',0)




			year = data.get('year','')
			d_date = ''
			now_data = []
			mw_d = []
			if m_data:
				_month = data.get('month','')
				d_date = str(year) + '年'+str(_month)[len(str(year)):] + '月'
				if d_date == (str(_now_year) + '年'+str(_now_month) + '月'):
					m_d = dict(s_uid =s_uid,year = _now_year, month = _now_month)
					now_data = yield  SuperstarService.dataofsupers(m_d)
					mw_d = yield  SuperstarService.dataofsupersgeam(m_d)
			elif w_data:
				d_date = str(data.get('week_date',''))
				if str(data.get('week',''))==(str(year) + str(_now_week)):
					w_d = dict(s_uid =s_uid,year = _now_year, week = _now_week)
					now_data = yield  SuperstarService.dataofsupers(w_d)
					mw_d = yield  SuperstarService.dataofsupersgeam(w_d)

			elif d_data:
				d_date = str(data.get('d_date',''))
				if d_date ==str(_now_d_date):
					now_data = yield  SuperstarService.dataofsupers(dict(s_uid = s_uid,d_date = int(now.strftime('%Y%m%d'))))

			if now_data:
				st_p_num = now_data[0].get('st_p_num',0)


			# if list_data_len>1 and list_data_len>mw_count+1 and not d_data:
			# 	mw_ck_d = []
			# 	if m_data:
			# 		v_key = 'month'
			# 	elif w_data:
			# 		v_key = 'week'
			# 	else :
			# 		v_key = 'd_date'
			# 	for i in range(mw_count,list_data_len):
			# 		__data = list_data[i]
			# 		if not d_data:
			# 			mw_ck_d.append({__data.get('year'):int(str(__data.get(v_key))[len(str(__data.get('year'))):])})
			# 		else:
			# 			mw_ck_d.append(__data.get('d_date'))
			# 	mw_ck_cond = dict(s_uid = s_uid)
			# 	mw_ck_cond[v_key] = mw_ck_d
			# 	mw_ck_data = yield SuperstarService.getdatayearmw(mw_ck_cond)
			# 	if mw_ck_data:
			# 		st_p_num = mw_ck_data[0].get('st_p_num',0)
			# 		print (data,st_p_num)
			if mw_d:
				ak_num = int(mw_d[0].get('ak_num',0)) if mw_d[0].get('ak_num') else ak_num
				reset_num = int(mw_d[0].get('reset_num',0))  if mw_d[0].get('reset_num',0) else reset_num 
				ldiamond = int(mw_d[0].get('ldiamond',0)) if mw_d[0].get('ldiamond') else ldiamond
				oneattr_reset = int(mw_d[0].get('oneattr_reset',0)) if mw_d[0].get('oneattr_reset') else oneattr_reset
				oneuserld = int(mw_d[0].get('oneuserld',0)) if mw_d[0].get('oneuserld') else oneuserld
				twoattr_reste = int(mw_d[0].get('twoattr_reste',0)) if mw_d[0].get('twoattr_reste') else twoattr_reste
				twouser_ld = int(mw_d[0].get('twouser_ld',0)) if mw_d[0].get('twouser_ld') else twouser_ld
			baseldiamond = ldiamond - oneuserld - twouser_ld
			d_date_list.insert(0,d_date)
			st_p_num_list.insert(0,st_p_num)
			ak_num_list.insert(0,ak_num)
			reset_num_list.insert(0,reset_num)
			ldiamond_list.insert(0,ldiamond)
			baseldiamond_list.insert(0,baseldiamond)
			datas.append(dict(
					d_date  = d_date,
					st_p_num = st_p_num,
					ak_num = ak_num ,
					reset_num = reset_num,
					ldiamond = ldiamond,
					oneattr_reset= oneattr_reset,
					oneuserld = oneuserld,
					twoattr_reste = twoattr_reste,
					twouser_ld = twouser_ld,
					baseldiamond = baseldiamond

				))
			mw_count+=1
		return self.finish(dict(code = 0, rows = datas, total = len(datas),
			d_date_list = d_date_list , st_p_num_list = st_p_num_list,
			ak_num_list = ak_num_list , ldiamond_list = ldiamond_list,
			reset_num_list = reset_num_list,index = str(count),title = title,
			baseldiamond_list = baseldiamond_list))