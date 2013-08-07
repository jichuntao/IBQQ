/**
 * Created with JetBrains WebStorm.
 * User: jichuntao
 * Date: 13-8-1
 * Time: 上午12:43
 * To change this template use File | Settings | File Templates.
 */

var util = require("util");
var EventEmitter = require("events").EventEmitter;
var nsutil = require('./nsutil');

util.inherits(UserDataProxy, EventEmitter);

function UserDataProxy() {
    var thiss = this;
    var friends , groupList, loadFriendRetry;

    /**
     * 初始化基本的数据
     */
    this.initBaseInfo = function () {
        throwLog({'type': '初始化朋友及群信息', 'msg': ''});
        loadFriendRetry = 0;
        loadFriends();
        loadGroupList();
    };

    /**
     * 加载朋友数据
     */
    var loadFriends = function () {
        thiss.getFriends([], function (err, data) {
            if (err) {
                loadFriendRetry++;
                if (loadFriendRetry > 3)return;
                throwLog({'type': '加载朋友数据失败 '+(1000 * loadFriendRetry)+'ms后重试', 'msg': ''});
                setTimeout(loadFriends, 1000 * loadFriendRetry);
                return;
            }
            checkInitData();
        });
    };

    /**
     * 加载群消息
     */

    var loadGroupList = function () {
        thiss.getGroupList([], function (err, data) {
            checkInitData();
        });
    };

    /**
     * 检测数据是否加载完成
     */
    var checkInitData = function () {
        if (friends && groupList) {
            throwLog({'type': '初始化数据完成', 'msg': new Date().getTime()});
            thiss.emit('initdata');
        }
    };

    /**
     * 获取所有好友列表
     * @param args []
     * @param callback
     * @returns {*}
     */
    this.getFriends = function (args, callback) {
        if (friends) {
            return callback(null, friends);
        }
        command('api', 'get_user_friends', [], function (err, chk) {
            if (err) {
                throwErr({'type': 'getFriendArr', 'msg': err});
                return callback(err);
            }
            if (chk.retcode != 0) {
                throwErr({'type': 'getFriendArr', 'msg': 'retcode:' + chk.retcode});
                return callback(chk);
            }
            friends = friendsDataHandler(chk);
            return callback(null, friends);
        });
    };

    /**
     * 根据uin获取朋友信息
     * @param args [uin]
     * @returns {*}
     */
    this.getFriendInfoByUin = function (args) {
        var uin = args[0];
        if (friends && friends[uin]) {
            return  friends[uin];
        }
        return null;
    };

    /**
     * 根据uin获取朋友QQ号
     * @param args [uin]
     * @param callback
     * @returns {*}
     */
    this.getFriendQQNumByUin = function (args, callback) {
        var uin = args[0];
        if (friends && friends[uin]) {
            if (friends[uin].qqnum) {
                return callback(null, friends[uin].qqnum);
            }
            else {
                command('api', 'get_friend_uin', [uin, 1], function (err, chk) {
                    if (err) {
                        throwErr({'type': 'getQQNumByUin', 'msg': err});
                        return chk(err);
                    }
                    if (chk && chk.result && chk.result.account) {
                        friends[uin].qqnum = chk.result.account;
                        return callback(null, friends[uin].qqnum);
                    } else {
                        throwErr({'type': 'getQQNumByUin', 'msg': JSON.stringify(chk)});
                        return callback('nofound:' + uin);
                    }
                });
            }
        } else {
            return callback('nofound:' + uin);
        }
    };

    /**
     * 依据名字获取好友信息
     * @param args  [nick,[markname]]
     * @returns {Array}
     */
    this.getFriendInfoByName = function (args) {
        var i, nick, markname;
        var ret = [];
        nick = args[0];
        if (args.length > 1) {
            markname = args[1];
        }
        for (var key in friends) {
            var friend = friends[key];
            if (friend.nick.trim() == nick || (markname && friend.markname && friend.markname.trim() == markname )) {
                ret.push(key);
            }
        }
        return ret;
    };

    /**
     * 获取群列表
     * @param args []
     * @param callback
     * @returns {*}
     */
    this.getGroupList = function (args, callback) {
        if (groupList) {
            return callback(null, groupList);
        }
        command('api', 'get_group_name_list_mask', [], function (err, chk) {
            if (err) {
                throwErr({'type': 'getGroupList', 'msg': err});
                return callback(err);
            }
            if (chk.retcode != 0) {
                throwErr({'type': 'getFriendArr', 'msg': 'retcode:' + retcode});
                return callback(chk);
            }
            groupList = groupListDataHandler(chk);
            return callback(null, groupList);
        });
    };

    /**
     * 依据uin获取群信息
     * @param args [uin]
     * @returns {*}
     */
    this.getGroupInfoByUin = function (args) {
        var code = args[0];
        if (groupList && groupList[code]) {
            return groupList[code];
        }
        return null;
    };

    /**
     * 根据uin获取群号
     * @param args  [uin]
     * @param callback
     * @returns {*}
     */
    this.getGroupNumByUin = function (args, callback) {
        var code = args[0];
        if (groupList && groupList[code]) {
            if (groupList[code].num) {
                return callback(null, groupList[code].num);
            }
            else {
                command('api', 'get_friend_uin', [code, 4], function (err, chk) {
                    if (err) {
                        throwErr({'type': 'getGroupNumByUin', 'msg': err});
                        return chk(err);
                    }
                    if (chk && chk.result && chk.result.account) {
                        groupList[code].num = chk.result.account;
                        return callback(null, groupList[code].num);
                    } else {
                        throwErr({'type': 'getGroupNumByUin', 'msg': JSON.stringify(chk)});
                        return callback('nofound:' + code);
                    }
                });
            }
        } else {
            return callback('nofound:' + code);
        }
    };

    /**
     * 依据名字返回群uin
     * @param args
     * @returns {Array}
     */
    this.getGroupUinByName = function (args) {
        var name = args[0];
        var ret = [];
        for (var key in groupList) {
            var group = groupList[key];
            if (group.name.trim() == name) {
                ret.push(key);
            }
        }
        return ret;
    };

    /**
     * 处理朋友数据
     * @param data
     * @returns {{}}
     */
    var friendsDataHandler = function (data) {
        var ret = {};
        var categories = ['我的好友'];
        var i = 0;
        var obj = data.result;

        if (obj.categories) {
            for (i = 0; i < obj.categories.length; i++) {
                categories.push(obj.categories[i].name);
            }
        }
        if (obj.friends) {
            for (i = 0; i < obj.friends.length; i++) {
                var friend = obj.friends[i];
                if (friend.uin) {
                    ret[friend.uin] = {};
                    ret[friend.uin].uin = friend.uin;
                    ret[friend.uin].categories = friend.categories;
                    ret[friend.uin].categoriesName = categories[friend.categories];
                }
            }
        }
        if (obj.info) {
            for (i = 0; i < obj.info.length; i++) {
                var info = obj.info[i];
                if (info.uin && ret[info.uin]) {
                    ret[info.uin].face = info.face;
                    ret[info.uin].nick = info.nick;
                    ret[info.uin].flag = info.flag;
                }
            }
        }
        if (obj.vipinfo) {
            for (i = 0; i < obj.vipinfo.length; i++) {
                var vipinfo = obj.vipinfo[i];
                if (vipinfo.u && ret[vipinfo.u]) {
                    ret[vipinfo.u].vip_level = vipinfo.vip_level;
                    ret[vipinfo.u].is_vip = info.is_vip;
                }
            }
        }
        if (obj.marknames) {
            for (i = 0; i < obj.marknames.length; i++) {
                var markname = obj.marknames[i];
                if (markname.uin && ret[markname.uin]) {
                    ret[markname.uin].markname = markname.markname;
                    ret[markname.uin].type = markname.type;
                }
            }
        }
        return ret;
    };

    /**
     * 处理群列表
     * @param data
     * @returns {{}}
     */
    var groupListDataHandler = function (data) {
        var ret = {};
        var obj = data.result;
        var i = 0;
        if (obj.gnamelist) {
            for (i = 0; i < obj.gnamelist.length; i++) {
                var gname = obj.gnamelist[i];
                if (gname.gid) {
                    ret[gname.gid] = {};
                    ret[gname.gid].name = gname['name'];
                    ret[gname.gid].flag = gname['flag'];
                    ret[gname.gid].gid = gname['gid'];
                    ret[gname.gid].code = gname['code'];
                }
            }
        }
        return ret;
    };

    /**
     * 调用command
     * @param modules
     * @param command
     * @param args
     * @param callback
     */
    var command = function (modules, command, args, callback) {
        thiss.emit('command', modules, command, args, callback);
    };

    /**
     * 抛错误
     * @param obj
     */
    var throwErr = function (obj) {
        thiss.emit('err', 'UserDataProxy', obj);

    };

    /**
     * 抛日志
     * @param obj
     */
    var throwLog = function (obj) {
        thiss.emit('log', 'UserDataProxy', obj);
    };

}

/**
 * 创建
 */
function create() {
    return new UserDataProxy();
}

exports.create = create;
