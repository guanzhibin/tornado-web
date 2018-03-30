#coding:utf-8


HTTP_CLIENT_TYPE = None

try:
	import pycurl
	HTTP_CLIENT_TYPE = 'tornado.curl_httpclient.CurlAsyncHTTPClient'
except ImportError:
	pass


HTTP_REQUET_TIMEOUT  = 30			# HTTP 请求超时时间