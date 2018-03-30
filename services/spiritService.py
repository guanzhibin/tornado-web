#coding:utf8
import tornado.web
from tornzen.database import DbAccessor
from configs.app_code import *
import datetime
db = DbAccessor('default',('spirit_level'))

#----------------------------------------------
# 查找数据
#--------------------------------------------
@tornado.gen.coroutine
def GetByFilter(offset,limit,params, count = False):


	# sql = '''SELECT sl.*,a.t_num_owner FROM 
	# 		(select s_uid, channel_name, server_name, level,num_owner, name from (select * from spirit_level %s order by d_date desc)b group by s_uid, channel_name, level %s %s) as sl left join

	# 		(select d_date,s_uid, channel_name, sum(num_owner)t_num_owner from 
	# 		(select * from  (select * from spirit_level %s  order by d_date desc)d group by s_uid, channel_name,level)c 
 #            group by s_uid, channel_name)a 
	# 		on sl.channel_name=a.channel_name and sl.s_uid= a.s_uid;'''

	sql = '''select sl.*,v.t_num_owner from (select count(*)num_owner,level,s_uid,ch,name from 
			(select * from
			(SELECT * FROM player_own %s order by d_date desc)a group by uid)b group by level,s_uid,ch %s)as sl left join
			(select sum(count)t_num_owner,s_uid,ch from (select count(*)count,s_uid,ch from 
			(select * from
			(SELECT * FROM player_own %s order by d_date desc)a group by uid)b group by level,s_uid,ch)c group by s_uid, ch)v on 
			sl.ch=v.ch and sl.s_uid=v.s_uid %s %s'''

	# t_sql = '''select count(1)total from (select id from spirit_level %s group by s_uid, channel_name, level)t'''

	t_sql = '''select count(*)total from (select count(*)num_owner,level,s_uid,ch,name from 
		(select * from
		(SELECT * FROM player_own %s order by d_date desc)a group by uid)b group by level,s_uid,ch
		order by level asc)as sl'''
	text_array = []
	val_array = []
	channel_list = params.get('channel_list','')
	server_list = params.get('server_list','')
	if params.get('name'):
		text_array.append("`name` = %s")
		val_array.append(params.get('name'))

	if params.get('start_time'):
		text_array.append("`time` >= %s")
		val_array.append(datetime.datetime.strptime(params.get('start_time'), "%Y-%m-%d %H:%M:%S"))
	if params.get('end_time'):
		text_array.append("`time` <= %s")
		val_array.append(datetime.datetime.strptime(params.get('end_time'), "%Y-%m-%d %H:%M:%S"))
	l_list = []

	# if params.get('server_list'):
	# 	_sql = "(`ch` = %s and `s_uid` in%s)"
	# 	__server_list = []
	# 	for _server_list in params.get('server_list'):
	# 		_server_list = _server_list.split(',')
	# 		channel_name = _server_list[0]
	# 		del _server_list[0]
	# 		l_list = l_list + _server_list
	# 		__server_list.append(_sql)
	# 		val_array.append(channel_name)
	# 		val_array.append(tuple(_server_list))
	# 	text_array.append(' (' + (' or '.join(__server_list)) + ') ')
	if server_list and channel_list:

		_sql = "(`ch` = %s and `s_uid` in%s)"
		server_list = tuple(server_list.split(','))
		__server_list = []
		for channel_name in tuple(channel_list.split(',')):
			__server_list.append(_sql)
			val_array.append(channel_name)
			val_array.append(tuple(server_list))
		text_array.append(' (' + (' or '.join(__server_list)) + ') ')

	elif server_list:
		text_array.append("`s_uid` in%s")
		val_array.append(tuple(server_list.split(',')))
	elif channel_list:
		text_array.append("`ch` in%s")
		val_array.append(tuple(channel_list.split(',')))	

	whereString = ' and '.join(text_array)
	if whereString:
		whereString = ' where ' + whereString
	if params.get('onclick'):
		order_by = 'desc' if not params.get('order_by') else params.get('order_by')
		orderString = ' order by s_uid  ' + order_by
		orderString2= '  order by s_uid ' 
	else:
		orderString = '  order by level asc,id asc '
		orderString2= '  order by level ' 
	_limit = ''
	result = []
	if count:
		_limit = ' limit %s, %s' % (offset, limit)
		t_sql = t_sql % whereString
		t_data = yield DbAccessor.Select('default',t_sql,tuple(val_array))
		result.append(int(t_data[0]['total']))
	sql = sql % (whereString, orderString, whereString, orderString2, _limit)
	list_data = yield DbAccessor.Select('default',sql,tuple(val_array + val_array))
	l_sql = ''' select uid as s_uid,name from servers_data ''' 
	if l_list:
		whereStringUid = ' where uid in(%s) '%' ,'.join(set(l_list))
		l_sql +=whereStringUid
	l_data = yield DbAccessor.Select('default',l_sql,())
	result.append(list_data)
	result.append(l_data)
	return result
