#coding:utf-8

import tornado_mysql
from tornado_mysql import pools
import tornado.web
from  tornado.util import ObjectDict
from configs import *
import time
_db_settings = db_setting.DB_CONNECTIONS
def inject_setting(db_settings):
	global _db_settings
	_db_settings = db_settings
USE_POOL = True

class Row(dict):
	"""A dict that allows for object-like property access syntax."""
	def __getattr__(self, name):
		try:
			return self[name]
		except KeyError:
			raise AttributeError(name)

	def __setattr__(self, name, value):
		self[name] = value


class DbMeta():
	def __init__(self,tableName,fields):
		self.tableName = tableName
		self.fields = fields

_db_meta_sets = dict()

def inject_model(**kwargs):

	model_setting = ObjectDict(kwargs)
	
	# console.log('model_setting.alias',model_setting.alias)
	if _db_meta_sets.get(model_setting.alias):
		raise Exception(model_setting.alias + ' 已存在，不能重复添加')

	_db_meta_sets[model_setting.alias] = DbMeta(model_setting.table_name,model_setting.fields)

def get_model(alias):
	if not _db_meta_sets.get(alias):
		raise Exception("model alias :\"" + alias +"\" 不存在")

	return _db_meta_sets.get(alias)


class DbAccessor():
	def __init__(self,target,meta_alias):
		self.target = target

		self.meta  = get_model(meta_alias)

	@tornado.gen.coroutine
	def _get_connection(self):
		setting = _db_settings.get(self.target)
		conn = None
		if not USE_POOL:
			conn = yield tornado_mysql.connect(host=setting.get('host'), port=setting.get('port'), user=setting.get('user'), passwd=setting.get('password'), db=setting.get('db'),charset=setting.get('charset'))
		else:
			conn = pools.Pool(dict(host=setting.get('host'), port=setting.get('port'), user=setting.get('user'), passwd=setting.get('password'), db=setting.get('db'),charset=setting.get('charset')),
				max_idle_connections=1,
				max_recycle_sec=3)
		return conn

	@staticmethod
	@tornado.gen.coroutine
	def Execute(target,sql,params):
		setting = _db_settings.get(target)
		conn = None
		if not USE_POOL:
			conn = yield tornado_mysql.connect(host=setting.get('host'), port=setting.get('port'), user=setting.get('user'), passwd=setting.get('password'), db=setting.get('db'),charset=setting.get('charset'))
		else:
			conn = pools.Pool(dict(host=setting.get('host'), port=setting.get('port'), user=setting.get('user'), passwd=setting.get('password'), db=setting.get('db'),charset=setting.get('charset')),
				max_idle_connections=1,
			    max_recycle_sec=3)

		result = 0
		if USE_POOL:
			cur = yield conn.execute(sql,params)
			result = cur.rowcount
		else:
			cur = conn.cursor()
			try:
				result = yield cur.execute(sql,params)
				
				yield conn.commit()
			except:
				raise
			finally:
				cur.close()
				conn.close()

		return result


	@staticmethod
	@tornado.gen.coroutine
	def Select(target,sql,params):
		setting = _db_settings.get(target)
		conn = None
		if not USE_POOL:
			conn = yield tornado_mysql.connect(host=setting.get('host'), port=setting.get('port'), user=setting.get('user'), passwd=setting.get('password'), db=setting.get('db'),charset=setting.get('charset'))
		else:
			conn = pools.Pool(dict(host=setting.get('host'), port=setting.get('port'), user=setting.get('user'), passwd=setting.get('password'), db=setting.get('db'),charset=setting.get('charset')),
				max_idle_connections=1,
			    max_recycle_sec=3)
		if USE_POOL:
			cur = yield conn.execute(sql,params)
		else:
			cur = conn.cursor()
			try:
				yield cur.execute(sql,params)
			except:
				raise
			finally:
				cur.close()
				conn.close()

		rows = cur.fetchall()
		column_names = [d[0] for d in cur.description]
		result = [Row(zip(column_names, row)) for row in rows]

		return result


	@tornado.gen.coroutine
	def Insert(self,value):
		
		meta = self.meta
		fields2 = filter(lambda x:(x[0] == 0 or x[0] == 2),meta.fields)
		fields = []
		keys = value.keys()
		for f in fields2:
			if (f[0] == 0 or f[0] == 2) and f[1] in keys:
				fields.append((0,f[1]))

		sql = 'insert into `%s` (%s) values(%s) '%(meta.tableName,
				','.join([ '`%s`'%(f[1],) for f in fields]) ,
				 ','.join(['%s']*len(fields))
				)



		conn = yield self._get_connection()
		result = None
		if USE_POOL:
			cur = yield conn.execute(sql,
			tuple([ value.get(f[1]) for f in fields]))
			result = cur.lastrowid 
		else:
			result = cur.fetchone()
			cur = conn.cursor()
			try:
				result = yield cur.execute(sql,
					tuple([ value.get(f[1]) for f in fields]))
				yield conn.commit()
			except:
				raise
			finally:
				cur.close()
				conn.close()

		return result

	@tornado.gen.coroutine
	def Update(self,value):
		

		meta = self.meta

		conn = yield self._get_connection()

		identiy_field = list(filter(lambda x:x[0] > 0,meta.fields))[0]

		fields2 = filter(lambda x:x[0] == 0,meta.fields)

		fields = []
		keys = value.keys()
		for f in fields2:
			if f[0] == 0 and f[1] in keys:
				fields.append((0,f[1]))

		sql = 'update `%s` set %s where `%s` = %%s'%(meta.tableName,
				','.join([ '`%s` = %%s '%(f[1],) for f in fields]),identiy_field[1]
				)
		
		result = None
		if USE_POOL:
			cur = yield conn.execute(sql,
				tuple([ value.get(f[1]) for f in fields]+[value.get(identiy_field[1])]))
			result = cur.rowcount
		else:
			cur = conn.cursor()

			try:
				result = yield cur.execute(sql,
					tuple([ value.get(f[1]) for f in fields]+[value.get(identiy_field[1])]))
				
				yield conn.commit()
			except:
				raise
			finally:
				cur.close()
				conn.close()
		return result


	@tornado.gen.coroutine
	def Delete(self,identity_value):

		meta = self.meta

		conn = yield self._get_connection()

		identiy_field = list(filter(lambda x:x[0] > 0,meta.fields))[0]

		
		sql = 'DELETE FROM `%s` where `%s` = %%s'%(meta.tableName,
					identiy_field[1])

		result = None
		if USE_POOL:
			cur = yield conn.execute(sql,(identity_value,))
			result = cur.rowcount
			
		else:
			cur = conn.cursor()
			try:
				result = yield cur.execute(sql,(identity_value,))
				yield conn.commit()
			except:
				raise
			finally:
				cur.close()
				conn.close()
		return result

	@tornado.gen.coroutine
	def DeleteBy(self,whereString):

		meta = self.meta

		conn = yield self._get_connection()

		sql = 'DELETE FROM `%s` where %s '%(meta.tableName,whereString)

		result = None
		if USE_POOL:
			cur = yield conn.execute(sql)
			result = cur.rowcount
		else:
			cur = conn.cursor()
			try:
				result = yield cur.execute(sql)
				yield conn.commit()
			except:
				raise
			finally:
				cur.close()
				conn.close()
		return result
		


	@tornado.gen.coroutine
	def FindAll(self,whereString = None,orderString  = None,params = None):
		''' 查询所有记录 '''
		meta = self.meta

		if whereString:
			whereString = ' WHERE ' + whereString
		else:
			whereString = ''

		if orderString:
			orderString = ' ORDER BY ' + orderString
		else:
			orderString = ''


		conn = yield self._get_connection()
		cur = None
		rows = None
		sql = 'SELECT * FROM `%s` %s %s'%(meta.tableName,whereString,orderString)
		# print(sql)
		
		if USE_POOL:
			cur = yield conn.execute(sql,params)
		else:
			cur = conn.cursor()
			try:
				yield cur.execute(sql,params)
			except:
				raise
			finally:
				cur.close()
				conn.close()

		rows = cur.fetchall()
		column_names = [d[0] for d in cur.description]
		result = [Row(zip(column_names, row)) for row in rows]


		return result

	@tornado.gen.coroutine
	def Find(self,offset,num,whereString = None,orderString  = None,params = None):
		''' 查询所有记录,返回数据和列表 '''
		meta = self.meta
		if whereString:
			whereString = ' WHERE ' + whereString
		else:
			whereString = ''

		if orderString:
			orderString = ' ORDER BY ' + orderString
		else:
			orderString = ''

		conn = yield self._get_connection()
		cur = None
		rows = None

		sql_c = 'SELECT COUNT(*) FROM `%s` %s' %(meta.tableName,whereString)
		sql_q = 'SELECT * FROM `%s` %s %s limit %d,%d'%(meta.tableName,whereString,orderString,offset,num)
		if USE_POOL:
			t = time.time()
			cur = yield conn.execute(sql_c,params)
			num  = cur.fetchone()[0]
			if not num:
				return (num,[])
			cur = yield conn.execute(sql_q,params)
		else:
			cur = conn.cursor()
			try:
				yield conn.execute(sql_c,params)
				num  = cur.fetchone()[0]
				if not num:
					return (num,[])

				yield cur.execute(sql_q,params)
			except:
				raise
			finally:
				cur.close()
				conn.close()
		rows = cur.fetchall()
		column_names = [d[0] for d in cur.description]
		result = [Row(zip(column_names, row)) for row in rows]
		return (num,result)



	@tornado.gen.coroutine
	def FindByOffset(self,offset,num,whereString = None,orderString  = None,params = None):
		''' 查询所有记录 '''
		meta = self.meta

		if whereString:
			whereString = ' WHERE ' + whereString
		else:
			whereString = ''

		if orderString:
			orderString = ' ORDER BY ' + orderString
		else:
			orderString = ''

		conn = yield self._get_connection()
		cur = None
		rows = None

		sql_q = 'SELECT * FROM `%s` %s %s limit %d,%d'%(meta.tableName,whereString,orderString,offset,num)
		if USE_POOL:
			cur = yield conn.execute(sql_q,params)
		else:
			cur = conn.cursor()
			try:
				yield cur.execute(sql_q,params)
			except:
				raise
			finally:
				cur.close()
				conn.close()

		rows = cur.fetchall()
		column_names = [d[0] for d in cur.description]
		result = [Row(zip(column_names, row)) for row in rows]
	
		return result


	@tornado.gen.coroutine
	def Get(self,identity_value):
		'''  '''
		meta = self.meta

		identiy_field = list(filter(lambda x:x[0] > 0,meta.fields))[0]
		sql = 'SELECT * FROM `%s` where `%s` = %%s limit 1'%(meta.tableName,
					identiy_field[1])

		conn = yield self._get_connection()
		cur = None
		rows = None
		if USE_POOL:
			cur = yield conn.execute(sql,(identity_value,))

		else:
			cur = conn.cursor()
			try:
				yield cur.execute(sql,(identity_value,))
			except:
				raise
			finally:
				cur.close()
				conn.close()

		rows = cur.fetchall()
		column_names = [d[0] for d in cur.description]
		result = [Row(zip(column_names, row)) for row in rows]
	
		return result[0] if len(result) > 0 else None
		
		

