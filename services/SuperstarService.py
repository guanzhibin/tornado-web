#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
superstarweekdb = DbAccessor('default',('superstarweek'))
superstarymdb = DbAccessor('default',('superstarym'))
#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params):
	sql = '''select * from  (SELECT count(distinct nodeid,pid)unlock_num,fname,fid,count(1)total_attr_num ,s_uid FROM superstars 
		%s group by fid order by unlock_num desc, total_attr_num desc, id desc)a %s '''

	t_sql = '''select count(1)count from  (SELECT count(distinct nodeid,pid)unlock_num,fname,fid,count(1)total_attr_num FROM superstars
 		%s group by fid order by unlock_num desc, total_attr_num desc)a '''
	text_array = []
	val_array = []

	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get('s_uid'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	_limit = ''
	count = 0
	if limit:
		_limit = ' limit %s , %s ' %(offset, limit)
		t_sql = t_sql % whereString
		counts = yield DbAccessor.Select('default',t_sql,tuple(val_array))
		count = counts[0]['count']
	sql = sql % (whereString, _limit)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return count,list_data


@tornado.gen.coroutine
def getdatabysuidfid(params):

	text_array = []
	val_array = []
	sql ='''
	SELECT count(1)count,attr_type FROM superstars %s group by attr_type

	'''

	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get('s_uid'))
	if params.get('fid'):
		text_array.append('`fid` = %s ')
		val_array.append(params.get('fid'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	sql = sql % whereString
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data


@tornado.gen.coroutine
def getdataking(params):

	text_array = []
	val_array = []
	sql ='''
	SELECT count(1)count FROM superstars %s

	'''

	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get('s_uid'))
	if params.get('fid'):
		text_array.append('`fid` = %s ')
		val_array.append(params.get('fid'))

	if params.get('quality'):
		text_array.append('`quality` = %s')
		val_array.append(params.get('quality'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	sql = sql % whereString
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data





@tornado.gen.coroutine
def dataofplayer(offset,limit,params):

	text_array = []
	val_array = []
	sql ='''
	select * from ( SELECT * FROM superstartoplayer %s order by ak_num desc, king_num desc, reset_num desc)a %s;

	'''
	t_sql = '''
	select count(1)count from ( SELECT * FROM superstartoplayer  %s order by ak_num desc, king_num desc, reset_num desc)a ;
	'''
	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get('s_uid'))
	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	_limit = ''
	count = 0
	if limit:
		_limit = ' limit %s , %s ' %(offset, limit)
		t_sql = t_sql % whereString
		counts = yield DbAccessor.Select('default',t_sql,tuple(val_array))
		count = counts[0]['count']
	sql = sql % (whereString, _limit)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return count,list_data

@tornado.gen.coroutine
def dataofsuper(offset,limit,params):
	table_name = 'superstarym'
	text_array = []
	val_array = []

	gt_text_array = []
	gt_val_array = []

	lt_text_array = []
	lt_val_array = []

	sql ='''
	SELECT * FROM %s %s

	'''
	sqlw ='''
	SELECT * FROM %s %s order by %s %s limit 5

	'''

	order_c = ''
	if params.get('s_uid'):
		s_uid = params.get('s_uid')
		text_array.append('`s_uid` = %s')
		val_array.append(s_uid)
		gt_text_array.append('`s_uid` =%s ')
		gt_val_array.append(s_uid)
		lt_text_array.append('`s_uid` = %s ')
		lt_val_array.append(s_uid)

	if params.get('month') and params.get('year'):

		_year = params.get('year')
		_month = params.get('month')
		_month = int(str(_year)  + str(_month))
		text_array.append('`month` = %s')
		val_array.append(_month)
		gt_text_array.append('`month` > %s')
		gt_val_array.append(_month)
		lt_text_array.append('`month` < %s')
		lt_val_array.append(_month)
		order_c = ' month '

	if params.get('week') and params.get('year'):
		table_name = 'superstarweek'
		_year = params.get('year')
		_week  = params.get('week')
		_week = int(str(_year) + str(_week))
		text_array.append('`week` = %s')
		val_array.append(_week)
		gt_text_array.append('`week` > %s')
		gt_val_array.append(_week)
		lt_text_array.append('`week` < %s')
		lt_val_array.append(_week)		
		order_c = ' week '

	elif params.get('d_date'):
		table_name = 'superstardatagram'
		d_date  = params.get('d_date')
		text_array.append('`d_date` = %s')
		val_array.append(d_date)
		gt_text_array.append('`d_date` > %s')
		gt_val_array.append(d_date)
		lt_text_array.append('`d_date` < %s') 
		lt_val_array.append(d_date)
		order_c = ' d_date '


	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString

	gt_whereString = ' and '.join(gt_text_array)
	if gt_whereString:
		gt_whereString = ' where ' + gt_whereString


	lt_whereString = ' and '.join(lt_text_array)
	if lt_whereString:
		lt_whereString = ' where ' + lt_whereString

	sql = sql % (table_name,whereString)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))

	gt_sql = sqlw % (table_name, gt_whereString,order_c,' desc ')
	lt_sql  = sqlw % (table_name, lt_whereString,order_c, ' desc ')

	gt_data = yield DbAccessor.Select('default',gt_sql,tuple(gt_val_array))
	lt_data = yield DbAccessor.Select('default',lt_sql,tuple(lt_val_array))


	ret_data = gt_data + list_data +lt_data
	count = 0
	if len(list_data):
		count = len(gt_data) +len(list_data)
	return count,ret_data

@tornado.gen.coroutine
def dataofsuperbywm(params):

	sql ='''SELECT * FROM %s %s limit 1'''

	table_name = 'superstarym'
	text_array = []
	val_array = []

	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get('s_uid'))

	if params.get('week'):
		table_name = 'superstarweek'
		text_array.append('`week`= %s')
		val_array.append(params.get('week'))
	elif params.get('month'):
		text_array.append('`month` = %s')
		val_array.append(params.get('month'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	sql = sql % (table_name,whereString)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data

@tornado.gen.coroutine
def dataofsupers(params):

	sql ='''
	SELECT count(distinct pid)st_p_num FROM superstars  %s

	'''

	text_array = []
	val_array = []


	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get("s_uid"))
	if params.get('d_date'):
		text_array.append('`d_date` = %s')
		val_array.append(params.get('d_date'))

	if params.get('year'):
		text_array.append('`year` = %s')
		val_array.append(params.get('year'))

	if params.get('month'):
		text_array.append('`month` = %s')
		val_array.append(params.get('month'))

	if params.get('week'):
		text_array.append('`week` = %s')
		val_array.append(params.get('week'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	sql = sql % (whereString)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data

@tornado.gen.coroutine
def dataofsupersgeam(params):
	sql ='''
	SELECT sum(ak_num)ak_num, sum(reset_num)reset_num,sum(ldiamond)ldiamond,
	sum(oneattr_reset)oneattr_reset,sum(oneuserld)oneuserld,sum(twoattr_reste)twoattr_reste
	,sum(twouser_ld)twouser_ld FROM superstardatagram %s; 

	'''

	text_array = []
	val_array = []


	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get("s_uid"))


	if params.get('year'):
		text_array.append('`year` = %s')
		val_array.append(params.get('year'))

	if params.get('month'):
		text_array.append('`month` = %s')
		val_array.append(params.get('month'))

	if params.get('week'):
		text_array.append('`week` = %s')
		val_array.append(params.get('week'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	sql = sql % (whereString)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data

@tornado.gen.coroutine
def Add(item,flag):
	if flag=='week':
		yield superstarweekdb.Insert(item)
	elif flag =='month':
		yield superstarymdb.Insert(item)




@tornado.gen.coroutine
def getdatayearmw(params):

	text_array = []
	val_array = []
	sql ='''
	SELECT count(distinct pid)st_p_num FROM superstars %s

	'''

	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get('s_uid'))


	if params.get('month'):

		month_sql = "(`year` = %s and `month` = %s)"
		__server_list = []
		for __month in params.get('month'):
			for k,v in __month.items():
				__server_list.append(month_sql)
				val_array.append(k)
				val_array.append(v)
		text_array.append(' (' + (' or '.join(__server_list)) + ') ')

	if params.get('week'):

		month_sql = "(`year` = %s and `week` = %s)"
		__server_list = []
		for __month in params.get('week'):
			for k,v in __month.items():
				__server_list.append(month_sql)
				val_array.append(k)
				val_array.append(v)
		text_array.append(' (' + (' or '.join(__server_list)) + ') ')		

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	sql = sql % whereString
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data

@tornado.gen.coroutine
def supattrsts(offset,limit,params):
	text_array = []
	val_array = []

	sql ='''

	select s_uid,id,fid,fname,count(distinct pid,fid,nodeid)unlock_num,count(1)total_attr_num from 
	( SELECT * FROM superstardetail %s order by id desc)a group by fid order by unlock_num desc,
	total_attr_num desc,id desc %s;

	'''
	t_sql = '''
	select count(1)total from (select id from 
	( SELECT * FROM superstardetail %s order by id desc)a group by fid)b;

	'''

	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get('s_uid'))

	if params.get('op_type'):
		text_array.append('`op_type` = %s')
		val_array.append(params.get('op_type'))

	if params.get('end_time'):
		text_array.append('`time` <= %s')
		val_array.append(params.get('end_time'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString

	t_sql = t_sql % whereString
	__limit = " limit %s, %s " %(offset, limit)
	sql = sql % (whereString,__limit)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	count_data = yield DbAccessor.Select('default',t_sql,tuple(val_array))
	return count_data[0].get('total',0),list_data

@tornado.gen.coroutine
def supking(params):
	text_array = []
	val_array = []
	sql ='''
	select count(1)count from (select quality from 
	( SELECT * FROM superstardetail %s order by id desc)a group by pid, nodeid,nodeseat)a where quality = 6;

	'''

	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get('s_uid'))

	if params.get('op_type'):
		text_array.append('`op_type` in%s')
		val_array.append(params.get('op_type'))

	if params.get('end_time'):
		text_array.append('`time` <= %s')
		val_array.append(params.get('end_time'))
	if params.get('fid'):
		text_array.append('`fid` = %s ')
		val_array.append(params.get('fid'))

	if params.get('pid'):
		text_array.append('`pid`  = %s')
		val_array.append(params.get('pid'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	sql = sql % (whereString)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data

@tornado.gen.coroutine
def supattrtype(params):
	text_array = []
	val_array  = []

	sql = '''
		select count(1)count,attr_type  from (select attr_type from 
		( SELECT * FROM superstardetail %s order by id desc)a group by pid,nodeid,nodeseat)a group by attr_type;

	'''

	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get('s_uid'))

	if params.get('op_type'):
		text_array.append('`op_type` in%s')
		val_array.append(params.get('op_type'))

	if params.get('end_time'):
		text_array.append('`time` <= %s')
		val_array.append(params.get('end_time'))
	if params.get('fid'):
		text_array.append('`fid` = %s ')
		val_array.append(params.get('fid'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	sql = sql % (whereString)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data



@tornado.gen.coroutine
def playerdata(offset,limit,params):

	text_array = []
	val_array = []

	sql ='''

	select s_uid,pid,pname,count(distinct pid,fid,nodeid)ak_num,count(1)total_attr_num from
	( SELECT * FROM superstardetail %s order by id desc)a group by pid order by ak_num desc,
	total_attr_num desc,id desc %s;

	'''
	t_sql = '''
	select count(1)count from (  select id from
	( SELECT * FROM superstardetail %s )a group by pid)b;

	'''

	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get('s_uid'))

	if params.get('op_type'):
		text_array.append('`op_type` = %s')
		val_array.append(params.get('op_type'))

	if params.get('end_time'):
		text_array.append('`time` <= %s')
		val_array.append(params.get('end_time'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString

	t_sql = t_sql % whereString
	__limit = " limit %s, %s " %(offset, limit)
	sql = sql % (whereString,__limit)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	count_data = yield DbAccessor.Select('default',t_sql,tuple(val_array))
	return count_data[0].get('count',0),list_data

@tornado.gen.coroutine
def playerdatareset(params):

	text_array = []
	val_array = []

	sql ='''
		SELECT sum(basediamond)basediamond,sum(lock_user_diamond)lock_user_diamond,lock_type,count(1)lock_num FROM 
		superstardetail %s group by lock_type;
	'''


	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get('s_uid'))

	if params.get('op_type'):
		text_array.append('`op_type` = %s')
		val_array.append(params.get('op_type'))

	if params.get('pid'):
		text_array.append('`pid` = %s')
		val_array.append(params.get('pid'))

	if params.get('end_time'):
		text_array.append('`time` <= %s')
		val_array.append(params.get('end_time'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString

	sql = sql % (whereString)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data



@tornado.gen.coroutine
def sup_p_numdata(params):

	text_array = []
	val_array = []

	sql ='''
		SELECT count(distinct pid)sup_p_num FROM superstardetail %s
	'''


	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get('s_uid'))

	if params.get('op_type'):
		text_array.append('`op_type` = %s')
		val_array.append(params.get('op_type'))

	if params.get('fid'):
		text_array.append('`fid` = %s')
		val_array.append(params.get('fid'))

	if params.get('end_time'):
		text_array.append('`time` <= %s')
		val_array.append(params.get('end_time'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString

	sql = sql % (whereString)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data[0].get('sup_p_num',0)

@tornado.gen.coroutine
def all_suppdata(params):

	text_array = []
	val_array = []

	sql ='''
		select count(1)count from 
		( SELECT count(distinct nodeid)node_count,pid FROM superstardetail %s group by pid)a where node_count =35; 
	'''


	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get('s_uid'))

	if params.get('op_type'):
		text_array.append('`op_type` = %s')
		val_array.append(params.get('op_type'))

	if params.get('fid'):
		text_array.append('`fid` = %s')
		val_array.append(params.get('fid'))

	if params.get('end_time'):
		text_array.append('`time` <= %s')
		val_array.append(params.get('end_time'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString

	sql = sql % (whereString)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data[0].get('count',0)

@tornado.gen.coroutine
def player_role_all_sup(params):

	text_array = []
	val_array = []

	sql ='''
		select count(1)count from (SELECT count(distinct nodeid)node_count FROM superstardetail %s group by fid)a where  node_count = 35
	'''


	if params.get('s_uid'):
		text_array.append('`s_uid` = %s')
		val_array.append(params.get('s_uid'))

	if params.get('op_type'):
		text_array.append('`op_type` = %s')
		val_array.append(params.get('op_type'))

	if params.get('pid'):
		text_array.append('`pid` = %s')
		val_array.append(params.get('pid'))

	if params.get('end_time'):
		text_array.append('`time` <= %s')
		val_array.append(params.get('end_time'))

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString

	sql = sql % (whereString)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array))
	return list_data[0].get('count',0)