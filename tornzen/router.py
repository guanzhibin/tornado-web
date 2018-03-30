#coding: utf-8

import sys
import os
import pkgutil
import inspect



class Tool(object):


	@staticmethod
	def path_to_namespace(path):

		module_path = path.replace('.','').replace('/','.')
		
		return module_path[1:]

	@staticmethod
	def routes_by_multi_controllers(controller_path_tuples):

		routes = [] 
		for controller_path in controller_path_tuples:

			routes.extend(
					Tool.routes_by_controllers( controller_path[0],controller_path[1] )
				)
		return routes

		
	@staticmethod
	def routes_by_controllers(path_prefix,controllers_path):

		controllers_path = controllers_path + '/controllers'
		routes = []


		for importer, name, ispkg in pkgutil.iter_modules([controllers_path]):
			namespace = Tool.path_to_namespace(controllers_path)


			action_routes = Tool.routes_by_actions(name,namespace)

			controller_name = name[:-10]

			for action in action_routes:
				url_path = path_prefix + controller_name.lower() + '/' + action[0].lower()
				if(action[0].lower() == 'index'):
					routes.append((path_prefix + controller_name.lower() + '/',action[1]))

				routes.append((url_path,action[1]))
		return routes

	@staticmethod
	def routes_by_actions(module_name,namespace):

		module = __import__(namespace + '.' + module_name, fromlist = [module_name])
		return inspect.getmembers(module, inspect.isclass)



	@staticmethod
	def routes_by_web_api(channel_dirs):

		root_app_path = os.path.dirname(__file__).replace('\\','/')
		apps_paths = []

		channel_names = {}
		for channel_dir in channel_dirs:
			c_path = root_app_path + channel_dir
			c_path = c_path.replace('\\','/')

			apps_paths.append(c_path)
			channel_names[c_path + '/controllers'] = channel_dir[1:]

			if not os.path.exists(c_path):
				raise IOError('folder "'+ channel_dir +'" not exist' )
		routes = []
		for app_path in apps_paths:
			controller_path = app_path + '/controllers'

			for importer, name, ispkg in pkgutil.iter_modules([controller_path]):
				channel_name = channel_names[controller_path]
				action_routes = Tool.routes_by_api_actions(channel_name,name)

				routes.extend(action_routes)
		return routes


