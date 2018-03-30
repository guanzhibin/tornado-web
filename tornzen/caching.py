
import time

# 本地变量
_cache_data = {}

class CacheObject:
	def __init__(self, value,expires_time):


		self.expires_time = expires_time
		self.value = value


def set(key,value,timeoutSecond = 1):
		
	global _cache_data
	_cache_data[key] = CacheObject(value,int(time.time()) + timeoutSecond)


def get(key):

	global _cache_data
	cache_item = _cache_data.get(key)
	if not cache_item:
		return None

	if cache_item.expires_time < int(time.time()):
		remove(key)
		return None
	return cache_item.value


def remove(key):
	global _cache_data
	_cache_data.pop(key, None)

