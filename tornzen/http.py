#coding:utf-8

import tornado.web
from tornado.httpclient import AsyncHTTPClient
from tornzen import utils
from tornzen.config import *
import json

class TextParser():

	def decode(self,data):
		return data.decode()
	def encode(slef,data):
		return data.encode()


class JsonParser():
	def decode(self,data):
		return json.loads(data.decode())

	def encode(self,data):
		return json.dumps(data).encode()


@tornado.gen.coroutine
def get(url,parserClass = JsonParser,**kwags):
	'''
		http get 请求 ,non-blocking
		返回 dict
	'''
	text = None
	response = None
	http_client = AsyncHTTPClient()
	kwags['request_timeout'] = HTTP_REQUET_TIMEOUT
	response = yield http_client.fetch(url,**kwags)
	if parserClass:
		parser = parserClass()
		return parser.decode(response.body)
	else:
		return response.body


@tornado.gen.coroutine
def post(url,params,parserClass = JsonParser,**kwags):
	'''
		http post 请求 ,non-blocking
		返回 dict
	'''
	http_client = AsyncHTTPClient()
	
	body = utils.Params(params)
	
	kwags['request_timeout'] = HTTP_REQUET_TIMEOUT
	kwags['method'] = 'POST'
	kwags['body'] = body
	print(kwags)
	response = yield http_client.fetch(url,**kwags)
	if parserClass:
		parser = parserClass()
		return parser.decode(response.body)
	else:
		return response.body
	


@tornado.gen.coroutine
def raw_post(url,request_body,parserClass = JsonParser,**kwags):
	'''
		http post 请求 ,non-blocking
		返回 dict
	'''
	http_client = AsyncHTTPClient()
	
	response = yield http_client.fetch(url,method='POST',body= request_body,request_timeout =  HTTP_REQUET_TIMEOUT,headers = kwags.get('headers'))
	if parserClass:
		parser = parserClass()
		return parser.decode(response.body)
	else:
		return response.body

##  异步带header json
@tornado.gen.coroutine
def as_post_json(url,request_body,headers):
	## headers = {'content-type': 'application/json','Cookie': 'log_user_id="2|1:0|10:1496632559|11:log_user_id|4:MQ==|3cea6c4f7503607876a6aedd10b177ecec5097e34ce6c9b03ca77b55ce710b4e";' }
	## request_body = {'name': 'rsj217','password':'kjhkj','test':'kjhkjh'}
	body = json.dumps(request_body)
	http_client = tornado.httpclient.AsyncHTTPClient()
	resp = yield tornado.gen.Task(
		http_client.fetch, 
		url,
		method="POST", 
		headers=headers,
		body=body)
	return resp.body.decode()