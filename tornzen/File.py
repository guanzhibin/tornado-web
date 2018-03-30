import io
import re
import os
import json

__regPath = re.compile("(.*[\\/])")


# BOM 头
BOM_UTF8 = b'\xef\xbb\xbf'
BOM_UTF16_BE = b'\xfe\xff'
BOM_UTF16_LE = b'\xff\xfe'
BOM_UTF32_LE = b'\x00\x00\xff\xfe'
BOM_UTF32_BE = b'\xff\xfe\x00\x00'

def IsUTF8(text):
	return BOM_UTF8 == text[:1].encode()

# read the binary data
def Read(path,buffer=-1):
    f = open(path,"br",buffer,None)
    bData = f.read()
    f.close()
    return bData
	
def ReadText(path,encoding='utf-8'):
    text = None
    bData = Read(path)
    if encoding == 'utf-8':
        if bData[:3] == BOM_UTF8:
            text = bData[3:].decode()
        else:
            text = bData.decode()
    elif encoding.startWith('utf-16'):
        if bData[:2] == BOM_UTF16_BE:
            text = bData[2:].decode('utf-16be')   
        elif bData[:2] == BOM_UTF16_LE:
            text = bData[2:].decode('utf-16le')
    elif encoding.startWith('utf-32'):
        if bData[:2] == BOM_UTF32_BE:
            text = bData[2:].decode('utf-32be')   
        elif bData[:2] == BOM_UTF32_LE:
            text = bData[2:].decode('utf-32le')
    else:
        text = bData.decode(encoding)
    return text

def ReadLines(path,encoding="utf-8",splitChar = '\r\n'):
    return ReadText(path).split(splitChar)
	
def Save(path,data):
    f = open(path,"bw")
    f.write(data)
    f.close()

	
def SaveText(path,text,buffer=-1,encoding='utf8'):
    f = open(path,"w",buffer,encoding)
    f.write(text)
    f.close()
	
def AppendText(path,text,buffer=-1,encoding='utf8'):
    f = open(path,"a",buffer,encoding)
    f.write(text)
    f.close()

def SaveJson(path,data):
    text = json.dumps(data)
    SaveText(path,text)

def ReadJson(path):
    text = ReadText(path)
    data = json.loads(text)
    return data
	
def CreateDir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def GetPath(url):
    data = None
    data =  __regPath.match(url).group(1)
    return data

def GetFileName(path):
	idx = path.rfind("\\")
	if idx  <  0: idx = 0
	else :idx = idx +1
	return path[idx:]

def Exist(path):
	return os.path.exists(path)
