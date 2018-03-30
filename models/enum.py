from  tornado.util import ObjectDict

# 订单表 字段status_flag
GOODS_STATUS = ObjectDict(dict(
		Empty = 0, # 
		Valid = 1, # 有效订单
		Invalid = 2 # 无效订单
	))

# 订单表 字段state_flag
GOODS_STATE = ObjectDict(dict(
		state1 = 1, # 待审核订单
		state2 = 2, # 待跟进订单
		state3 = 3, # 待配货订单
		state4 = 4, # 配货中订单
		state5 = 5, # 已签收订单
		state6 = 6, # 已拒收订单
		state7 = 7, # 已退货订单
		state8 = 8, # 已取消订单
		state9 = 9, # 发货中订单

	))
ORDER_LOCKING = ObjectDict(dict( 
		Unlock = 0, # 未锁定   
		Inlock = 1 # 已锁定
	))
ORDER_SETTLE = ObjectDict(dict(
		Empty = 0, # 未结算   订单记录settle——flag
		Wait = 1, # 待结算
		Complete = 2 # 已结算
	))
SETTLE_STATUS = ObjectDict(dict(
		Unsettle = 0, # 未结算 订单结算记录 settle——flag
		Insettle = 1 # 已结算
	))

SETTLE_TYPE = ObjectDict(dict(
		Normal = 1, # 正常结算
		Upper = 2, # 返还上线分成结算 1级
		Upper2 = 3, # 二级返现
		Upper3 = 4, # 三级返现
	))

APPLY_STATUS = ObjectDict(dict(
		status1 = 0, # 正在处理
		status2 = 1, # 已通过处理
		status3 = 2 # 未通过
	))
