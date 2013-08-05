/**
 * Created with JetBrains WebStorm.
 * User: jichuntao
 * Date: 13-7-29
 * Time: 下午11:42
 * 涛哥封装的 Install_B QQ
 */

var util = require("util");
var EventEmitter = require("events").EventEmitter;
var loginQQ = require('./LoginQQ');
var PollingProxy = require('./PollingProxy');
var ChannelQQ = require('./ChannelQQ');
var ApiQQ = require('./ApiQQ');
var UserDataProxy = require('./UserDataProxy');
var nsutil = require('./nsutil');

util.inherits(IBQQ, EventEmitter);

/*InstallB QQ*/
function IBQQ() {
    var thiss = this;
    var qqnum, qqpw, clientid, modules_map, lqq, poll, channel, api, userData;

    /**
     * 开始登陆
     * @param tqqnum
     * @param tqqpw
     */
    this.start = function (tqqnum, tqqpw) {
        qqnum = tqqnum;
        qqpw = tqqpw;
        clientid = nsutil.randomNum(10000000, 99999999);
        modules_map = {};
        InitModules();
        InitEvent();
        login();
    };

    /**
     * 登陆
     */
    var login = function () {
        lqq.setLoginInfo({'qqnum': qqnum, 'qqpw': qqpw, clientid: clientid});
        lqq.startLogin();
    };

    /**
     * 初始化模块
     */
    var InitModules = function () {
        lqq = loginQQ.create();
        poll = PollingProxy.create();
        channel = ChannelQQ.create();
        api = ApiQQ.create();
        userData = UserDataProxy.create();
        modules_map['lqq'] = lqq;
        modules_map['poll'] = poll;
        modules_map['channel'] = channel;
        modules_map['api'] = api;
        modules_map['userData'] = userData;
    };

    /**
     * 给各个模块加监听
     */
    var InitEvent = function () {
        lqq.on('log', logHandler);
        lqq.on('err', errHandler);
        lqq.on('vcode', loginVcode);
        lqq.on('online', online);
        poll.on('log', logHandler);
        poll.on('msg', onPollMsgFun);
        poll.on('err', errHandler);
        channel.on('log', logHandler);
        channel.on('err', errHandler);
        api.on('log', logHandler);
        api.on('err', errHandler);
        userData.on('command', thiss.command);
        userData.on('log', logHandler);
        userData.on('err', errHandler);
        userData.on('initdata', initDataOver);
    };

    /**
     * 登陆成功
     * @param ret
     * @param cookies
     */
    var online = function (ret, cookies) {
        var psessionid = ret.result.psessionid;
        var vfwebqq = ret.result.vfwebqq;
        poll.setLoginSession({cookies: cookies, clientid: clientid, psessionid: psessionid});
        poll.startPoll();
        channel.setLoginSession({cookies: cookies, clientid: clientid, psessionid: psessionid});
        api.setLoginSession({cookies: cookies, clientid: clientid, vfwebqq: vfwebqq, uin: qqnum, psessionid: psessionid});
        userData.initBaseInfo();
    };

    /**
     * 输入验证码
     * @param strs
     */
    this.inputVcode = function (strs) {
        lqq.inputVcode(strs);
    };

    /**
     * login 验证码
     * @param vc
     */
    var loginVcode = function (vc) {
        thiss.emit('vcode', vc);
    };

    /**
     * 数据加载完成 发送online
     */
    var initDataOver = function () {
        thiss.emit('online');
    };

    /**
     * poll消息
     * @param obj
     */
    var onPollMsgFun = function (obj) {
        if (obj.retcode == 0 && obj.result) {
            var result = obj.result;
            result.sort(function (a, c) {
                return (a.value && a.value.time || 0) < (c.value && c.value.time || 0) ? 1 : -1
            });
            for (var i = result.length - 1; i >= 0; i--) {
                var item = result[i];
                var poll_type = item.poll_type ? item.poll_type : 'none';
                var value = nsutil.clone(item.value);
                thiss.emit(poll_type, value);
            }
        }

        /*
         case "message":
         case "shake_message":
         case "sess_message":
         case "group_message":
         case "kick_message":
         case "file_message":
         case "system_message":
         case "filesrv_transfer":
         case "tips":
         case "sys_g_msg":
         case "av_request":
         case "discu_message":
         case "push_offfile":
         case "notify_offfile":
         case "input_notify":
         */
    };

    /**
     * 调用函数
     * @param modules
     * @param command
     * @param args
     * @param callback
     * @returns {*}
     */
    this.command = function (modules, command, args, callback) {
        callback = callback || function () {
        };
        if (modules_map[modules]) {
            return modules_map[modules][command](args, callback);
        } else {
            return errHandler('command', {'type': 'no found handle', 'msg': modules + '.' + command});
        }
    };

    /**
     * log
     * @param modules
     * @param obj
     */
    var logHandler = function (modules, obj) {
        thiss.emit('log', modules + ':' + JSON.stringify(obj));
    };

    /**
     * err
     * @param modules
     * @param obj
     */
    var errHandler = function (modules, obj) {
        thiss.emit('err', modules + ':' + JSON.stringify(obj));
    };
}


/**
 * 创建
 */
function create() {
    return new IBQQ();
}
exports.create = create;