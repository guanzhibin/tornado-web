from tornzen import database


# 用户登录
database.inject_model(
	alias = 'users',
	table_name = 'users',
	fields = [
		(1,'id'),
		(0,'login_name'),
		(0,'password'),
		(0,'phone'),
		(0,'email'),
		(0,'create_time'),
		(0,'last_login_time'),
		(0,'login_num'),
		(0,'phone'),
		(0,'email')
	]
)

#  权限列表
database.inject_model(
	alias = 'dc-privilege',
	table_name = 'mg_privilege',
	fields  = [
		(1,'id'),
		(0,'privilege_name'),
		(0,'code'),
		(0,'update_time'),
		(0,'create_time')
	]
)


#  权限列表
database.inject_model(
	alias = 'dc-secontrol',
	table_name = 'mg_secontrol',
	fields  = [
		(1,'id'),
		(0,'role_id'),
		(0,'privilege_id'),
		(0,'create_time')
	]
)

#  用户角色配置
database.inject_model(
	alias = 'user-role',
	table_name = 'mg_user_role',
	fields  = [
		(1,'id'),
		(0,'role_id'),
		(0,'u_id'),
	]
)

#  角色
database.inject_model(
	alias = 'roles',
	table_name = 'mg_roles',
	fields  = [
		(1,'id'),
		(0,'role_name'),
		(0,'role_describe'),
		(0,'create_time'),
		(0,'update_time'),
		(0,'status_flag'),
		(0,'delete_flag')
	]
)


#  后台管理菜单
database.inject_model(
	alias = 'menus',
	table_name = 'mg_menus',
	fields  = [
		(1,'id'),
		(0,'name'),
		(0,'create_time'),
		(0,'pid'),
		(0,'icon_class'),
		(0,'link'),
		(0,'target'),
		(0,'update_time'),
		(0,'delete_flag'),
		(0,'icon'),
		(0,'priority')
	]
)

#  菜单访问权限
database.inject_model(
	alias = 'menu-access',
	table_name = 'mg_menus_access',
	fields  = [
		(1,'id'),
		(0,'role_id'),
		(0,'menu_id')
	]
)


## 记录用户登录判断是否在有效时间内
## 可能此表不创建
database.inject_model(
	alias = 'login-token',
	table_name = 'mg_login_token',
	fields  = [
		(2,'access_code'),
		(0,'userid'),
		(0,'expire_time'),
		(0,'p_id')
	]
)


### 分服日报表

database.inject_model(
		alias = 'daily_newspaper',
		table_name = 'mg_daily_newspaper',
		fields=  [
			(1,'id'),
			(0,'server_name'),
			(0,'d_date'),
			(0,'channel_name'),
			(0,'new_sign_accont'),
			(0,'sign_account'),
			(0,'pay_account_num'),
			(0,'income'),
			(0,'first_pay_account'),
			(0,'first_pay_account_income'),
			(0,'new_sign_pay_num')
		]

	)






##  数据
database.inject_model(
		alias = 'addOperationData',
		table_name = 'addOperationData',
		fields=  [
			(1,'id'),
			(0,'gaDateTime'),
			(0,'gameServerIp'),
			(0,'userToken'),
			(0,'gaPlatform'),
			(0,'gaRegisterAccountNum'),
			(0,'gaLoginAccountNum'),
			(0,'gaFirstLoginAccountNum'),
			(0,'gaPayAccountNum'),
			(0,'ga_income'),
			(0,'gaFirstLoginPayAccountIncome'),
			(0,'gaFirstLoginPayAccountNum'),
			(0,'gaAccountPayPercent'),
			(0,'gaFirstLoginAccountPayPercent'),
			(0,'gaFirstLoginAccountPayArpu'),
			(0,'gaAcu'),
			(0,'gaPcu'),
			(0,'gaPcuTimeInterval'),
			(0,'gaAccountAverageOnlineTime'),
			(0,'gaYesterdayAccountRetention'),
			(0,'gaThreeAccountRetention'),
			(0,'gaFourAccountRetention'),
			(0,'gaFiveAccountRetention'),

		]

	)

### ltv 数据表


database.inject_model(
		alias = 'ltv-value',
		table_name = 'ltv_value',
		fields=  [
			(1,'id'),
			(0,'create_time'),
			(0,'d_date'),
			(0,'server_name'),
			(0,'s_uid'),
			(0,'channel_name'),
			(0,'new_account_num'),
			(0,'three_days_ltv'),
			(0,'three_days_income'),
			(0,'seven_days_ltv'),
			(0,'seven_days_income'),
			(0,'half_moon_ltv'),
			(0,'half_moon_income'),
			(0,'one_month_ltv'),
			(0,'one_month_income')

		]

	)

## 用户存留表
database.inject_model(
		alias = 'player-retain',
		table_name = 'player_retain',
		fields=  [
			(1,'id'),
			(0,'create_time'),
			(0,'d_date'),
			(0,'server_name'),
			(0,'s_uid'),
			(0,'channel_name'),
			(0,'new_login_accont'),
			(0,'once_retain'),
			(0,'three_retain'),
			(0,'four_retain'),
			(0,'five_retain'),
			(0,'six_retain'),
			(0,'seven_retain'),
			(0,'fifteen_retain'),
			(0,'thirty_retain'),
			(0,'sixty_retain'),
			(0,'ninety_retain')
		]

	)


## 角色存留表
database.inject_model(
		alias = 'role-retain',
		table_name = 'role_retain',
		fields=  [
			(1,'id'),
			(0,'create_time'),
			(0,'d_date'),
			(0,'server_name'),
			(0,'s_uid'),
			(0,'channel_name'),
			(0,'new_login_accont'),
			(0,'role_login_accont'),
			(0,'create_role_accont'),
			(0,'once_retain'),
			(0,'three_retain'),
			(0,'four_retain'),
			(0,'five_retain'),
			(0,'six_retain'),
			(0,'seven_retain'),
			(0,'fifteen_retain'),
			(0,'thirty_retain'),
			(0,'sixty_retain'),
			(0,'ninety_retain')
		]

	)


## 设备存留表
database.inject_model(
		alias = 'equipment-retain',
		table_name = 'equipment_retain',
		fields=  [
			(1,'id'),
			(0,'create_time'),
			(0,'d_date'),
			(0,'server_name'),
			(0,'s_uid'),
			(0,'channel_name'),
			(0,'new_equipment'),
			(0,'equipment_login_accont'),
			(0,'new_start_login_accont'),
			(0,'once_retain'),
			(0,'three_retain'),
			(0,'four_retain'),
			(0,'five_retain'),
			(0,'six_retain'),
			(0,'seven_retain'),
			(0,'fifteen_retain'),
			(0,'thirty_retain'),
			(0,'sixty_retain'),
			(0,'ninety_retain')
		]

	)
## 金币钻石产出消耗表
database.inject_model(
		alias = 'output-drain',
		table_name = 'output_drain',
		fields=  [
			(1,'id'),
			(0,'uid'),
			(0,'pid'),
			(0,'type'),
			(0,'s_uid'),
			(0,'have'),
			(0,'diff'),
			(0,'time'),
			(0,'d_date')
		]

	)

## 出处菜单


database.inject_model(
		alias = 'cons-mode',
		table_name = 'cons_mode',
		fields=  [
			(1,'id'),
			(0,'create_time'),
			(0,'pid'),
			(0,'name')
		]

	)

##  渠道表
database.inject_model(
		alias = 'channels',
		table_name = 'channels',
		fields=  [
			(1,'id'),
			(0,'name')
		]

	)

##  服务器表
database.inject_model(
		alias = 'servers_data',
		table_name = 'servers_data',
		fields=  [
			(1,'id'),
			(0,'name'),
			(0,'uid'),
			(0,'create_time'),
			(0,'update_time')
		]

	)

## 付费点表

database.inject_model(
		alias = 'pay-points',
		table_name = 'pay_points',
		fields=  [
			(1,'id'),
			(0,'pay_points'),
			(0,'pay_num'),
			(0,'amount_of_recharge'),
			(0,'pay_time')
		]

	)



## 玩家体力购买次数表
database.inject_model(
		alias = 'num_of_phy_pur',
		table_name = 'num_of_phy_pur',
		fields=  [
			(1,'id'),
			(0,'create_time'),
			(0,'d_date'),
			(0,'server_name'),
			(0,'s_uid'),
			(0,'channel_name'),
			(0,'vip_level'),
			(0,'total_vip_num'),
			(0,'once_pay_num'),
			(0,'twice_pay_num'),
			(0,'three_pay_num'),
			(0,'four_pay_num'),
			(0,'five_pay_num'),
			(0,'six_pay_num'),
			(0,'seven_pay_num'),
			(0,'eight_pay_num'),
			(0,'nine_pay_num'),
			(0,'ten_pay_num'),
			(0,'eleven_pay_num'),
			(0,'twelve_pay_num'),
			(0,'thirt_pay_num'),
			(0,'fourt_pay_num'),
			(0,'fift_pay_num'),
			(0,'sixt_pay_num')

		]

	)

## 分渠道日报

database.inject_model(
		alias = 'mg_daily_chs',
		table_name = 'mg_daily_chs',
		fields=  [
			(1,'id'),
			(0,'create_time'),
			(0,'d_date'),
			(0,'server_name'),
			(0,'channel_name'),
			(0,'new_login_accont'),
			(0,'login_account'),
			(0,'pay_account_num'),
			(0,'income'),
			(0,'first_pay_account'),
			(0,'first_pay_account_income'),
			(0,'new_login_pay_num'),
			(0,'new_login_pay_income'),
			(0,'one_retain_days'),
			(0,'three_retain_days'),
			(0,'seven_retain_days'),
			(0,'average_number_online'),
			(0,'highest_online'),
			(0,'new_equipment'),
			(0,'valid_e_num')

		]

	)

## 活跃用户

database.inject_model(
		alias = 'action_player',
		table_name = 'action_player',
		fields=  [
			(1,'id'),
			(0,'create_time'),
			(0,'d_date'),
			(0,'server_name'),
			(0,'channel_name'),
			(0,'s_uid'),
			(0,'td_ac_num'),
			(0,'th_ac_num'),
			(0,'w_ac_num'),
			(0,'mth_ac_num'),
			(0,'dw_ac'),
			(0,'dm_ac')

		]

	)
## 在线峰值表
database.inject_model(
		alias = 'daily_online',
		table_name = 'daily_online',
		fields=  [
			(1,'id'),
			(0,'os'),
			(0,'d_date'),
			(0,'num'),
			(0,'start_time'),
			(0,'s_uid'),
			(0,'end_time'),
			(0,'avg')
		]

	)

## 每小时实时数据

database.inject_model(
		alias = 'hours_statistics',
		table_name = 'hours_statistics',
		fields=  [
			(1,'id'),
			(0,'create_time'),
			(0,'d_date'),
			(0,'hours'),
			(0,'channel_name'),
			(0,'s_uid'),
			(0,'new_equip'),
			(0,'new_account'),
			(0,'action'),
			(0,'pay_account'),
			(0,'pay_income')
		]

	)

## 货币进毁存

database.inject_model(
		alias = 'currency_cond',
		table_name = 'currency_cond',
		fields=  [
			(1,'id'),
			(0,'create_time'),
			(0,'d_date'),
			(0,'channel_name'),
			(0,'server_name'),
			(0,'s_uid'),
			(0,'start_inventory'),
			(0,'atm_get'),
			(0,'system_output'),
			(0,'total_get'),
			(0,'total_drain'),
			(0,'c_type')
		]

	)

## 产出消耗分布

database.inject_model(
		alias = 'OD_distributoin',
		table_name = 'OD_distributoin',
		fields=  [
			(1,'id'),
			(0,'create_time'),
			(0,'d_date'),
			(0,'channel_name'),
			(0,'s_uid'),
			(0,'server_name'),
			(0,'type'),
			(0,'diff'),
			(0,'p_num'),
			(0,'num'),
			(0,'status_flag'),
			(0,'c_type')
		]

	)



## 概况表

database.inject_model(
		alias = 'overview',
		table_name = 'overview',
		fields=  [
			(1,'id'),
			(0,'create_time'),
			(0,'d_date'),
			(0,'channel_name'),
			(0,'new_equipment'),
			(0,'new_login_account'),
			(0,'login_account'),
			(0,'pay_account'),
			(0,'pay_income'),
			(0,'new_equip_login'),
			(0,'start_equip')
		]

	)

## 鲸鱼用户

database.inject_model(
		alias = 'whale_player',
		table_name = 'whale_player',
		fields=  [
			(1,'id'),
			(0,'create_time'),
			(0,'channel_name'),
			(0,'s_uid'),
			(0,'server_name'),
			(0,'last_pay_time'),
			(0,'player'),
			(0,'uid'),
			(0,'pid'),
			(0,'rechargemoney'),
			(0,'fp_level'),
			(0,'ac_level'),
			(0,'reg_time'),
			(0,'fp_time'),
			(0,'llogin_time'),
			(0,'has_diamond'),
			(0,'cons_diamond')
		]

	)


## 冒险团情况表

database.inject_model(
		alias = 'ad_datas',
		table_name = 'ad_datas',
		fields=  [
			(1, 'id'), 
			(0, 'd_date'), 
			(0, 's_uid'), 
			(0, 'server_name'), 
			(0, 'channel_name'), 
			(0, 'ad_num'),
			(0, 'ad_dis_num'), 
			(0, 'ad_player_num'), 
			(0, 'residual_con'), 
			(0, 'diam_donation'), 
			(0, 'logging_camp'), 
			(0, 'mine_num'), 
			(0, 'open_boss'), 
			(0, 'kill_boss'), 
			(0, 'surplus_funds'), 
			(0, 'surplus_woods'),
			(0, 'surplus_stones'), 
			(0, 'sur_ori_stone'), 
			(0, 'create_time')
		]

	)


## 冒险团情况表

database.inject_model(
		alias = 'spirit_level',
		table_name = 'spirit_level',
		fields=  [
			(1, 'id'), 
			(0, 'd_date'), 
			(0, 's_uid'), 
			(0, 'server_name'), 
			(0, 'channel_name'), 
			(0, 'create_time'),
			(0, 'name'),
			(0, 'level'),
			(0, 'num_owner')
		]

	)



## 用户权限

database.inject_model(
		alias = 'user_secontrol',
		table_name = 'user_secontrol',
		fields=  [
			(1, 'id'), 
			(0, 'secontrol'),
			(0, 'create_time'),
			(0, 'update_time'),
			(0, 'u_id')
		]

	)

## 冒险团boss记录

database.inject_model(
		alias = 'guild_boss_record',
		table_name = 'guild_boss_record',
		fields = [
			(1, 'id'),
			(0, 'create_time'),
			(0, 'guild_name'),
			(0, 'guild_id'),
			(0, 'boss_id'),
			(0, 'boss_starttime'),
			(0, 'boss_endtime'),
			(0, 'result'),
			(0, 's_uid'),
			(0, 'server_name')
		]

	)


## boss奖励表
database.inject_model(
		alias = 'guild_boss_reward',
		table_name = 'guild_boss_reward',
		fields = [
			(1, 'id'),
			(0, 'create_time'),
			(0, 'pid'),
			(0, 'num'),
			(0, 'player_id'),
			(0, 'total_damage'),
			(0, 'bonus_grant'),
			(0, 'bonus_grant_time'),
			(0, 'bonus_id')
		]

	)



## boss奖励表
database.inject_model(
		alias = 'guild_production_cost_msg',
		table_name = 'guild_production_cost_msg',
		fields = [
			(1, 'id'),
			(0, 'create_time'),
			(0, 'guild_id'),
			(0, 'guild_name'),
			(0, 'r_type'),
			(0, 'r_change'),
			(0, 'r_total'),
			(0, 'way'),
			(0, 'operator'),
			(0, 'operate_time'),
			(0, 'd_date')
		]

	)

## 金币
database.inject_model(
		alias = 'lgold',
		table_name = 'lgold',
		fields = [
			(1, 'id'),
			(0, 'uid'),
			(0, 'pid'),
			(0, 'type'),
			(0, 'have'),
			(0, 'diff'),
			(0, 'time'),
			(0, 's_uid'),
			(0, 'd_date'),
			(0, 'status_flag'),
			(0, 'unique_id'),
			(0, 'ch'),
			(0, 'chmc'),
			(0, 'chsc')
		]

	)

## 钻石
database.inject_model(
		alias = 'ldiamond',
		table_name = 'ldiamond',
		fields = [
			(1, 'id'),
			(0, 'uid'),
			(0, 'pid'),
			(0, 'type'),
			(0, 'have'),
			(0, 'diff'),
			(0, 'time'),
			(0, 's_uid'),
			(0, 'd_date'),
			(0, 'status_flag'),
			(0, 'unique_id'),
			(0, 'ch'),
			(0, 'chmc'),
			(0, 'chsc')
		]

	)
## 物品
database.inject_model(
		alias = 'litems',
		table_name = 'litems',
		fields = [
			(1, 'id'),
			(0, 'uid'),
			(0, 'pid'),
			(0, 'type'),
			(0, 'time'),
			(0, 's_uid'),
			(0, 'd_date'),
			(0, 'status_flag'),
			(0, 'unique_id'),
			(0, 'ch'),
			(0, 'chmc'),
			(0, 'chsc'),
			(0, 'item_desc'),
			(0, 'goods_id')
		]

	)

## 装备
database.inject_model(
		alias = 'lequipments',
		table_name = 'lequipments',
		fields = [
			(1, 'id'),
			(0, 'uid'),
			(0, 'pid'),
			(0, 'type'),
			(0, 'time'),
			(0, 's_uid'),
			(0, 'd_date'),
			(0, 'status_flag'),
			(0, 'unique_id'),
			(0, 'ch'),
			(0, 'chmc'),
			(0, 'chsc'),
			(0, 'item_desc'),
			(0, 'goods_id')
		]

	)

## 探索值
database.inject_model(
		alias = 'lexplore',
		table_name = 'lexplore',
		fields = [
			(1, 'id'),
			(0, 'uid'),
			(0, 'pid'),
			(0, 'type'),
			(0, 'have'),
			(0, 'diff'),
			(0, 'time'),
			(0, 's_uid'),
			(0, 'd_date'),
			(0, 'item_desc'),
			(0, 'status_flag'),
			(0, 'unique_id'),
			(0, 'ch'),
			(0, 'chmc'),
			(0, 'chsc'),
			(0, 'goods_id')
		]

	)


## 探索值
database.inject_model(
		alias = 'lcontribute',
		table_name = 'lcontribute',
		fields = [
			(1, 'id'),
			(0, 'uid'),
			(0, 'pid'),
			(0, 'type'),
			(0, 'have'),
			(0, 'diff'),
			(0, 'time'),
			(0, 's_uid'),
			(0, 'd_date'),
			(0, 'status_flag'),
			(0, 'unique_id'),
			(0, 'ch'),
			(0, 'chmc'),
			(0, 'chsc'),
			(0, 'guild_id')
		]

	)

## 探索值
database.inject_model(
		alias = 'mg_daily_serverspaper',
		table_name = 'mg_daily_serverspaper',
		fields = [
			(1, 'id'),
			(0, 's_uid'),
			(0, 'create_time'),
			(0, 'd_date'),
			(0, 'new_login_accont'),
			(0, 'login_account'),
			(0, 'pay_account_num'),
			(0, 'income'),
			(0, 'first_pay_account'),
			(0, 'first_pay_account_income'),
			(0, 'new_login_pay_num'),
			(0, 'new_login_pay_income'),
			(0, 'once_retain'),
			(0, 'three_retain'),
			(0, 'four_retain'),
			(0, 'five_retain'),
			(0, 'six_retain'),
			(0, 'seven_retain')
		]

	)

## 皮肤购买记录
database.inject_model(
		alias = 'buy_skin',
		table_name = 'buy_skin',
		fields = [
			(1, 'id'),
			(0, 'uid'),
			(0, 'pid'),
			(0, 'type'),
			(0, 'create_time'),
			(0, 's_uid'),
			(0, 'd_date'),
			(0, 'ch'),
			(0, 'chmc'),
			(0, 'chsc'),
			(0, 'cost'),
			(0, 'skinid'),
			(0, 'unique_id')
		]

	)

## 
database.inject_model(
		alias = 'player_get',
		table_name = 'player_get',
		fields = [
			(1, 'id'),
			(0, 'uid'),
			(0, 'pid'),
			(0, 'type'),
			(0, 'time'),
			(0, 's_uid'),
			(0, 'd_date'),
			(0, 'ch'),
			(0, 'chmc'),
			(0, 'chsc'),
			(0, 'Path'),
			(0, 'os'),
			(0, 'new'),
			(0, 'old'),
			(0, 'unique_id')
		]

	)

## 
database.inject_model(
		alias = 'cstory_adventure',
		table_name = 'cstory_adventure',
		fields = [
			(1, 'id'),
			(0, 'uid'),
			(0, 'pid'),
			(0, 's_uid'),
			(0, 'd_date'),
			(0, 'deal_flag'),
			(0, 'ch'),
			(0, 'chmc'),
			(0, 'chsc'),
			(0, 'time'),
			(0, 'event_id'),
			(0, 'finish_time'),
			(0, 'medal'),
			(0, 'name'),
			(0, 'onece'),
			(0, 'player_lv'),
			(0, 'unique_id')
		]

	)
## 
database.inject_model(
		alias = 'cstory_adventure_medal',
		table_name = 'cstory_adventure_medal',
		fields = [
			(1, 'id'),
			(0, 's_uid'),
			(0, 'd_date'),
			(0, 'ch'),
			(0, 'create_time'),
			(0, 'event_id'),
			(0, 'zero_medal'),
			(0, 'one_medal'),
			(0, 'two_medal'),
			(0, 'three_medal'),
			(0, 'name'),
			(0, 'onece'),
			(0, 'sweepnum')
		]

	)

## 
database.inject_model(
		alias = 'cstory_adventure_playerlv',
		table_name = 'cstory_adventure_playerlv',
		fields = [
			(1, 'id'),
			(0, 's_uid'),
			(0, 'd_date'),
			(0, 'ch'),
			(0, 'create_time'),
			(0, 'event_id'),
			(0, 'name'),
			(0, 'onece'),
			(0, 'player_lvs')
		]

	)

database.inject_model(
		alias = 'superstarweek',
		table_name = 'superstarweek',
		fields = [
			(1, 'id'),
			(0, 's_uid'),
			(0, 'st_p_num'),
			(0, 'ak_num'),
			(0, 'reset_num'),
			(0, 'ldiamond'),
			(0, 'oneattr_reset'),
			(0, 'oneuserld'),
			(0, 'twoattr_reste'),
			(0, 'twouser_ld'),
			(0, 'year'),
			(0, 'week'),
			(0, 'week_date')
		]

	)



database.inject_model(
		alias = 'superstarym',
		table_name = 'superstarym',
		fields = [
			(1, 'id'),
			(0, 's_uid'),
			(0, 'st_p_num'),
			(0, 'ak_num'),
			(0, 'reset_num'),
			(0, 'ldiamond'),
			(0, 'oneattr_reset'),
			(0, 'oneuserld'),
			(0, 'twoattr_reste'),
			(0, 'twouser_ld'),
			(0, 'year'),
			(0, 'month')
		]

	)

