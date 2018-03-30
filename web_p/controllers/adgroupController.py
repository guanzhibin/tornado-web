#coding:utf-8
import tornado.web
from configs import *
from tornzen import utils,caching
from services import *
from web_p.handlers import *
import io
# import xlsxwriter
import datetime

#----------------------------------------------------------------
# 冒险团数据
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		self.render_view('/ad_group.html',title='冒险团数据')


#------------------------------------------------------------
#  通过条件查询返回数据
#------------------------------------------------------------
class checkFilter(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		start_time = self.get_argument('start_time','')
		end_time = self.get_argument('end_time','')
		server_list = self.get_argument('server_list','')
		order = (self.get_argument('order',''))
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		ad_datas = yield adgroupService.GetADDatasByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list = server_list,
											channel_list = channel_list
										))
		datas = []
		srv_datas = yield  self.get_server_data()
		for _ad_data in ad_datas[1]:
			ad_num = _ad_data.get('ad_num',0)
			ad_player_num = _ad_data.get('ad_player_num',0)
			residual_con = _ad_data.get('residual_con',0)
			diam_donation = _ad_data.get('diam_donation',0)
			logging_camp = _ad_data.get('logging_camp',0)
			mine_num = _ad_data.get('mine_num',0)
			open_boss = _ad_data.get('open_boss',0)
			kill_boss = _ad_data.get('kill_boss',0)
			s_uid = str(_ad_data.get('s_uid',''))
			datas.append(dict(
							d_date = _ad_data.get('create_time').strftime('%Y/%m/%d'),
							server = srv_datas.get(s_uid,s_uid),
							channel = _ad_data.get('channel_name',''),
							ad_num = ad_num,
							ad_dis_num = _ad_data.get('ad_dis_num',0),
							ad_player_num = ad_player_num,
							residual_con = residual_con,
							residual_con_ag = '%.2f' %(residual_con/ad_player_num if ad_player_num else 0),
							diam_donation =diam_donation,
							diam_donation_rate = '%.2f' % (diam_donation/ad_num if ad_num else 0),
							logging_camp = logging_camp,
							logging_camp_rate = '%.2f' %(logging_camp/ad_num if ad_num else 0),
							mine_num = mine_num,
							mine_num_rate = '%.2f' %(mine_num/ad_num if ad_num else 0),
							open_boss = open_boss,
							open_boss_rate = '%.2f%%' % (open_boss*100/ad_num if ad_num else 0),
							kill_boss = kill_boss if open_boss else 0,
							fail_boss = (open_boss - kill_boss) if open_boss else 0,
							surplus_funds = _ad_data.get('surplus_funds',0),
							surplus_woods = _ad_data.get('surplus_woods',0),
							surplus_stones = _ad_data.get('surplus_stones',0),
							sur_ori_stone = _ad_data.get('sur_ori_stone',0)
						))
		self.finish(dict(code=0,rows=datas,total=ad_datas[0]))
		return

#------------------------------------------------------------
#  通过条件查询返回数据
#------------------------------------------------------------
class checkFilter2(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		start_time = self.get_argument('start_time','')
		end_time = self.get_argument('end_time','')
		server_list = self.get_argument('server_list','')
		order = (self.get_argument('order',''))
		_type  = self.get_int('_type',1)
		channel_list = self.get_argument('channel_list','')
		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		datas = []
		d_date = int((datetime.datetime.now() + datetime.timedelta(days = -1)).strftime('%Y%m%d'))
		if end_time!='':
			end_time = datetime.datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S")
			if end_time.strftime('%Y%m%d')!=datetime.datetime.now().strftime('%Y%m%d'):
				d_date = int(end_time.strftime("%Y%m%d"))

		adgroup_datas,total = yield adgroupService.GetByFilter(offset,limit,dict(d_date =d_date,
											order_by = order,server_list = server_list,
											_type = _type,channel_list = channel_list
										),count  = True)
		
		date_list = []
		num_list = []
		for _adgroup_data in adgroup_datas:
			num = int(_adgroup_data.get('num',0))
			level = int(_adgroup_data.get('level',0))
			datas.append(dict(
							num = num,
							level = level
						))
			date_list.insert(0,_adgroup_data.get('level',1))
			num_list.insert(0,num)
		self.finish(dict(code=0,rows=datas,total=total,date_list = date_list,
			num_list = num_list))
		return



# ---------------------------------------------------------------------------------------
# 导出数据
# ---------------------------------------------------------------------------------------
class Export(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write('没有权限')
			return
		if not (self.current_user):
			self.write('请登录')
			return 
		timenow = datetime.datetime.now()
		filter_params = dict(
				start_time = self.get_argument('start_time',''),
				end_time = self.get_argument('end_time',''),
				order_by = self.get_argument('order','')
			)
		server_list = self.get_argument('server_list','')
		channel_list = self.get_argument('channel_list','')
		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		filter_params['server_list'] = server_list
		filter_params['channel_list'] = channel_list
		list_data = yield adgroupService.export(filter_params)
		if len(list_data)<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','服务器','渠道','冒险团数量','冒险团解散数','在团玩家数','剩余贡献',
		'平均贡献','钻石捐献次数','钻石捐献比率','伐木场次数','伐木场比率','矿场次数','矿场比率',
		'讨伐boss开启次数','讨伐boss开启比率','讨伐boss成功次数','讨伐boss失败次数',
		'剩余资金总量','剩余木材总量','剩余石头总量']



		rows = [ ','.join(titles) ]
		srv_datas = yield  self.get_server_data()
		for item_data in list_data:
			ad_num = item_data.get('ad_num',0)
			ad_player_num = item_data.get('ad_player_num',0)
			residual_con = item_data.get('residual_con',0)
			diam_donation = item_data.get('diam_donation',0)
			logging_camp = item_data.get('logging_camp',0)
			mine_num = item_data.get('mine_num',0)
			open_boss = item_data.get('open_boss',0)
			kill_boss = item_data.get('kill_boss',0)
			s_uid = str(item_data.get('s_uid',''))
			rows.append(','.join([
			item_data.get('create_time').strftime('%Y/%m/%d'),
			srv_datas.get(s_uid,s_uid),
			item_data.get('channel_name',''),
			str(ad_num),
			str(item_data.get('ad_dis_num',0)),
			str(ad_player_num),
			str(residual_con),
			str(int(residual_con/ad_player_num if ad_player_num else 0)),
			str(diam_donation),
			'%.2f' %(diam_donation/ad_num if ad_num else 0),
			str(logging_camp),
			'%.2f' %(logging_camp/ad_num if ad_num else 0),
			str(mine_num),
			'%.2f' %(mine_num/ad_num if ad_num else 0),
			str(open_boss),
			'%.2f' % (open_boss/ad_num if ad_num else 0),
			str(kill_boss),
			str(open_boss - kill_boss),
			str(item_data.get('surplus_funds',0)),
			str(item_data.get('surplus_woods',0)),
			str(item_data.get('surplus_stones',0))
			# str(item_data.get('sur_ori_stone',0))
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('冒险团数据') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return