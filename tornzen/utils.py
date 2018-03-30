
import urllib


def Params(params):
	data = {}
	for x in params:
		if params[x] != None:
			data[x] = params[x] 
			
	return urllib.parse.urlencode(data)

def BuildUrl(url,params):

	returnUrl = None
	# 删除None
	data = {}
	for x in params:
		if params[x] != None:
			data[x] = params[x] 

	if(url.find('?') > -1):
		returnUrl = url + urllib.parse.urlencode(data)
	else:
		returnUrl = url+ '?' + urllib.parse.urlencode(data)

	return returnUrl

def EncodeURIComponent (str):
	return urllib.parse.quote(str, safe='~()*!.\'')


def toBase64(text):
	pass

def base64toStr(text):
	pass

def fmt_time(dtime,fmt = 'F'):
	'''
		F : yyyy-MM-dd HH:mm:ss
		H : yyyy-MM-dd
		M : HH:mm:ss
		
	'''
	pass