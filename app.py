#coding:utf-8
import tornzen.app
from models import MetaInit
from tornzen import config,router,database
from configs import *
import os,sys
port = 9055
__path = os.path.dirname(__file__)
settings = dict(
		debug = app_setting.DEBUG_MODE,
		cookie_secret = app_setting.COOKIE_SECRET,
		template_path = os.path.join(os.getcwd(), __path),
		static_path = os.path.join(__path, "static"),
		login_url='/login/'
	)

def alias(source,r1,r2):
	for route in source:
		if route[0] == r1:
			source.append((r2,route[1]))

if __name__ == "__main__":
	if len(sys.argv) > 1:
		port = int(sys.argv[1])
	routes = []
	

	handlers_paths = [
		#( 路径前缀, handler 目录 )
		('/','./web_p')


	]
	# 目录生成路由
	routes.extend(router.Tool.routes_by_multi_controllers(handlers_paths))
	
	# database.inject_setting(db_setting.DB_CONNECTIONS)

	tornzen.app.Application(settings,routes).run(port)



