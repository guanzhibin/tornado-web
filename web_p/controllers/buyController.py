#coding:utf-8
import tornado.web
import datetime
from configs import *
from tornzen import logger,utils,caching
from services import *
from web_p.handlers import *
import random,time
import copy
import io

#----------------------------------------------------------------
# 体力购买次数
#----------------------------------------------------------------

class index(UserCenterHandler.RequestHandler):

	@tornado.web.asynchronous
	@tornado.gen.coroutine
	def get(self):
		if self.privilege is False:
			self.write(app_setting.PRIVILEGE_DESCRIPTION)
			return
		vip_data = []
		for i in range(16):
			vip_data.append(dict(
							id = "VIP"+ str(i),
							vip_level = "VIP"+ str(i)
						))
		self.render_view('/phs_pnum.html',title='体力购买次数',vip_data = vip_data)



#------------------------------------------------------------
#  通过条件查询返回数据
#------------------------------------------------------------
class checkFilter(UserCenterHandler.RequestHandler):
	@tornado.web.asynchronous
	@tornado.gen.coroutine
	@tornado.web.authenticated
	def get(self):
		if self.privilege is False:
			self.finish(dict(code=30005,rows=[],total=0))
			return
		if not (self.current_user):
			self.finish(dict(code=1))
			return 
		offset = self.get_int('offset',0)
		limit = self.get_int('limit',10)
		start_time = self.get_argument('start_time','')
		end_time = self.get_argument('end_time','')
		server_list = self.get_argument('server_list','')
		order = (self.get_argument('order',''))
		vip_level = self.get_argument('vip_level','')
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string

		datas = []
		buy_datas = yield BuyService.GetByFilter(offset,limit,dict(start_time= start_time,
											end_time = end_time,order_by = order,server_list =server_list,
											vip_level = vip_level,channel_list = channel_list
										))
		srv_datas = yield  self.get_server_data()
		for _buy_data in buy_datas[1]:
			s_uid = str(_buy_data.get('s_uid',''))
			_total_vip_num = _buy_data.get('total_vip_num',0)
			d_date = _buy_data.get('d_date')
			create_time_date = _buy_data.get('create_time',datetime.datetime.now())
			if int((create_time_date + datetime.timedelta(days = -1)).strftime('%Y%m%d')) ==d_date:
				create_time_date =create_time_date + datetime.timedelta(days = -1)
			datas.append(dict(
					d_date = create_time_date.strftime('%Y/%m/%d'),
					server = srv_datas.get(s_uid,s_uid),
					channel = _buy_data.get('channel_name',''),
					vip_level = _buy_data.get('vip_level','')[3:],
					total_vip_num = _total_vip_num,
					once_pay_num = _buy_data.get('once_pay_num',0),
					once_pay_num_rate = '%.2f%%' % (_buy_data.get('once_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					twice_pay_num = _buy_data.get('twice_pay_num',0),
					twice_pay_num_rate = '%.2f%%' % (_buy_data.get('twice_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					three_pay_num = _buy_data.get('three_pay_num',0),
					three_pay_num_rate = '%.2f%%' % (_buy_data.get('three_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					four_pay_num = _buy_data.get('four_pay_num',0),
					four_pay_num_rate= '%.2f%%' % (_buy_data.get('four_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					five_pay_num = _buy_data.get('five_pay_num',0),
					five_pay_num_rate = '%.2f%%' % (_buy_data.get('five_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					six_pay_num = _buy_data.get('six_pay_num',0),
					six_pay_num_rate = '%.2f%%' % (_buy_data.get('six_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					seven_pay_num = _buy_data.get('seven_pay_num',0),
					seven_pay_num_rate = '%.2f%%' % (_buy_data.get('seven_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					eight_pay_num = _buy_data.get('eight_pay_num',0),
					eight_pay_num_rate = '%.2f%%' % (_buy_data.get('eight_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					nine_pay_num = _buy_data.get('nine_pay_num',0),
					nine_pay_num_rate = '%.2f%%' % (_buy_data.get('nine_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					ten_pay_num = _buy_data.get('ten_pay_num',''),
					ten_pay_num_rate = '%.2f%%' % (_buy_data.get('ten_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					eleven_pay_num = _buy_data.get('eleven_pay_num',0),
					eleven_pay_num_rate = '%.2f%%' % (_buy_data.get('eleven_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					twelve_pay_num = _buy_data.get('twelve_pay_num',0),
					twelve_pay_num_rate = '%.2f%%' % (_buy_data.get('twelve_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					thirt_pay_num = _buy_data.get('thirt_pay_num',0),
					thirt_pay_num_rate = '%.2f%%' % (_buy_data.get('thirt_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					fourt_pay_num = _buy_data.get('fourt_pay_num',0),
					fourt_pay_num_rate = '%.2f%%' % (_buy_data.get('fourt_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					fift_pay_num = _buy_data.get('fift_pay_num',0),
					fift_pay_num_rate = '%.2f%%' % (_buy_data.get('fift_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
					sixt_pay_num = _buy_data.get('sixt_pay_num',0),
					sixt_pay_num_rate = '%.2f%%' % (_buy_data.get('sixt_pay_num',0)*100/_total_vip_num if _total_vip_num else 0)
					))
		if len(datas) > 0:
			total_ = yield BuyService.total_select(dict(start_time = start_time, 
				end_time =end_time, server_list = server_list,vip_level = vip_level,channel_list =channel_list))
			_data = dict(d_date='',server='服务器',channel='渠道',vip_level = 'VIP')
			if total_:
				__total_vip_num = int(total_.pop('total_vip_num',0))
				_data['total_vip_num'] = __total_vip_num
				_rate ='_rate'
				for k,v in total_.items():
					_data[k] = int(v)
					_data[k+_rate] = '%.2f%%' % (int(v)*100/__total_vip_num if __total_vip_num else 0)
				datas.insert(0,_data)
		self.finish(dict(code=0,rows=datas,total=buy_datas[0]))
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
				order_by = self.get_argument('order',''),
				vip_level = self.get_argument('vip_level','')
			)
		server_list = self.get_argument('server_list','')
		channel_list = self.get_argument('channel_list','')

		if not server_list:
			server_list = self.server_string
		if not channel_list:
			channel_list = self.channel_string
		if server_list:
			filter_params['server_list'] = server_list
		filter_params['channel_list'] = channel_list
		list_data = yield BuyService.GetByFilter(0,10000000,filter_params)
		if list_data[0]<1:
			self.finish(dict(code=2,msg="没有数据"))
			return
		titles = ['日期','渠道','服务器','VIP等级','VIP总人数','1次购买人数','1次比例',
		'2次购买人数','2次比例','3次购买人数','3次比例','4次购买人数','4次比例',
		'5次购买人数','5次比例','6次购买人数','6次比例','7次购买人数','7次比例',
		'8次购买人数','8次比例','9次购买人数','9次比例','10购买人数','10次比例',
		'11次购买人数','11次比例','12次购买人数','12次比例','13次购买人数','13次比例',
		'14次购买人数','14次比例','15次购买人数','15次比例','16次购买人数','16次比例']


		rows = [ ','.join(titles) ]


		total_ = yield BuyService.total_select(filter_params)
		if total_:
			__total_vip_num = int(total_.pop('total_vip_num',0))

			rows.append(','.join(['','渠道','服务器','VIP',
								str(__total_vip_num),
								str(total_.get('once_pay_num',0)),
								'%.2f%%' % (int(total_.get('once_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('twice_pay_num',0)),
								'%.2f%%' % (int(total_.get('twice_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('three_pay_num',0)),
								'%.2f%%' % (int(total_.get('three_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('four_pay_num',0)),
								'%.2f%%' % (int(total_.get('four_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('five_pay_num',0)),
								'%.2f%%' % (int(total_.get('five_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('six_pay_num',0)),
								'%.2f%%' % (int(total_.get('six_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('seven_pay_num',0)),
								'%.2f%%' % (int(total_.get('seven_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('eight_pay_num',0)),
								'%.2f%%' % (int(total_.get('eight_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('nine_pay_num',0)),
								'%.2f%%' % (int(total_.get('nine_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('ten_pay_num',0)),
								'%.2f%%' % (int(total_.get('ten_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('eleven_pay_num',0)),
								'%.2f%%' % (int(total_.get('eleven_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('twelve_pay_num',0)),
								'%.2f%%' % (int(total_.get('twelve_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('thirt_pay_num',0)),
								'%.2f%%' % (int(total_.get('thirt_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('fourt_pay_num',0)),
								'%.2f%%' % (int(total_.get('fourt_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('fift_pay_num',0)),
								'%.2f%%' % (int(total_.get('fift_pay_num',0))*100/__total_vip_num if __total_vip_num else 0),
								str(total_.get('sixt_pay_num',0)),
								'%.2f%%' % (int(total_.get('sixt_pay_num',0))*100/__total_vip_num if __total_vip_num else 0)

								]))
		srv_datas = yield  self.get_server_data()
		for item_data in list_data[1]:
			d_date = item_data.get('d_date')
			create_time_date = item_data.get('create_time',datetime.datetime.now())
			if int((create_time_date + datetime.timedelta(days = -1)).strftime('%Y%m%d')) ==d_date:
				create_time_date =create_time_date + datetime.timedelta(days = -1)
			s_uid = str(item_data.get('s_uid',''))
			_total_vip_num = item_data.get('total_vip_num',0)
			rows.append(','.join([
			create_time_date.strftime('%Y/%m/%d'),
			item_data.get('channel_name',''),
			srv_datas.get(s_uid,s_uid),
			item_data.get('vip_level','')[3:],
			str(_total_vip_num),
			str(item_data.get('once_pay_num',0)),
			'%.2f%%' % (item_data.get('once_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('twice_pay_num',0)),
			'%.2f%%' % (item_data.get('twice_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('three_pay_num',0)),
			'%.2f%%' % (item_data.get('three_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('four_pay_num',0)),
			'%.2f%%' % (item_data.get('four_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('five_pay_num',0)),
			'%.2f%%' % (item_data.get('five_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('six_pay_num',0)),
			'%.2f%%' % (item_data.get('six_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('seven_pay_num',0)),
			'%.2f%%' % (item_data.get('seven_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('eight_pay_num',0)),
			'%.2f%%' % (item_data.get('eight_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('nine_pay_num',0)),
			'%.2f%%' % (item_data.get('nine_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('ten_pay_num',0)),
			'%.2f%%' % (item_data.get('ten_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('eleven_pay_num',0)),
			'%.2f%%' % (item_data.get('eleven_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('twelve_pay_num',0)),
			'%.2f%%' % (item_data.get('twelve_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('thirt_pay_num',0)),
			'%.2f%%' % (item_data.get('thirt_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('fourt_pay_num',0)),
			'%.2f%%' % (item_data.get('fourt_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('fift_pay_num',0)),
			'%.2f%%' % (item_data.get('fift_pay_num',0)*100/_total_vip_num if _total_vip_num else 0),
			str(item_data.get('sixt_pay_num',0)),
			'%.2f%%' % (item_data.get('sixt_pay_num',0)*100/_total_vip_num if _total_vip_num else 0)
			]))


		responseData = '\n'.join(rows).encode()

		self.set_header('Content-Disposition','attachment; filename="%s.csv"' % ( utils.EncodeURIComponent('体力购买次数') + timenow.strftime('%Y%m%d_%H%M%S')))
		self.set_header('Content-Type','application/octet-stream')

		self.write(b'\xef\xbb\xbf')
		self.write(responseData)
		return
