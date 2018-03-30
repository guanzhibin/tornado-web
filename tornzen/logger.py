#coding:utf-8
import datetime
import sys


def _get_time_str():
	n = datetime.datetime.now()
	return n.strftime('[%Y-%m-%d %H:%M:%S]')


class ConsoleLogger(object):

	def __init__(self,**kw):
		self.name = kw.get('name')
		self.logLevel = kw.get('logLevel')

	def info(self,*k):
		if self.logLevel and not ('INFO' in self.logLevel):
			return
		print(_get_time_str(),'[INFO]',*k)


	def error(self,*k):

		if self.logLevel and not ('ERROR' in self.logLevel):
			return
		print(_get_time_str(),'[ERROR]',*k,file=sys.stderr)

	def debug(self,*k):

		if self.logLevel and not ('DEBUG' in self.logLevel):
			return
		print(_get_time_str(),'[DEBUG]',*k)

	def warn(self,*k):

		if self.logLevel and not ('WARN' in self.logLevel):
			return
		print(_get_time_str(),'[WARN]',*k)

def error(*k):
	_logger.error(*k)

def warn(*k):
	_logger.warn(*k)


def info(*k):

	_logger.info(*k)

def debug(*k):
	_logger.debug(*k)


def create(**kw):
	return ConsoleLogger( name = kw.get('name'))

def _get_logger(a):
	return ConsoleLogger( name = 'tornzen.app')


def register(loggingClass):

	pass

_logger = _get_logger('')
