/**
 * Created with JetBrains WebStorm.
 * User: jichuntao
 * Date: 13-7-23
 * Time: 上午1:07
 * To change this template use File | Settings | File Templates.
 */

var util = require("util");
var EventEmitter = require("events").EventEmitter;
var CookiesManager = require('./cookiesManager').CookiesManager;
var nsutil = require('./nsutil');
var querystring = require('querystring');

util.inherits(ChannelQQ, EventEmitter);

function ChannelQQ() {
    var thiss = this;
    var cookies = new CookiesManager();
    var msg_id = 0;
    var clientid, psessionid;
    var msgqueue = [];
    var isbusy = false;

    /**
     * 设置登陆session
     * @param obj
     */
    this.setLoginSession = function (obj) {
        msg_id = nsutil.randomNum(2000, 5000) * 10000;
        cookies.parseStr(obj.cookies);
        clientid = obj['clientid'];
        psessionid = obj['psessionid'];
        setInterval(checkMsgQueue, 1000);
    };

    /**
     * 发送朋友消息
     * @param args [uin,content_str]
     * @param callback
     */
    this.sendBuddyMsg = function (args, callback) {
        var uin = args[0];
        var content_str = args[1];
        msg_id++;
        var options = getDefaultOption('POST');
        options.path = '/channel/send_buddy_msg2';
        var content = [content_str, ["font", {"name": "宋体", "size": "10", "style": [0, 0, 0], "color": "000000"}]];
        var r = {'to': uin, 'face': 543, 'content': JSON.stringify(content), 'msg_id': msg_id, 'clientid': clientid, 'psessionid': psessionid};
        var data = 'r=' + encodeURIComponent(JSON.stringify(r)) + '&clientid=' + clientid + '&psessionid=' + psessionid;
        pushMsg(options, 'sendBuddyMsg', data, callback);
    };

    /**
     * 发送群消息
     * @param args [group_uin,msg]
     * @param callback
     */
    this.sendqunmsg = function (args, callback) {
        var group_uin = args[0];
        var msg = args[1];
        msg_id++;
        var options = getDefaultOption('POST');
        options.path = '/channel/send_qun_msg2';
        var content = [msg, ["font", {"name": "宋体", "size": "10", "style": [0, 0, 0], "color": "000000"}]];
        var r = {'group_uin': group_uin, 'content': JSON.stringify(content), 'msg_id': msg_id, 'clientid': clientid, 'psessionid': psessionid};
        var data = 'r=' + encodeURIComponent(JSON.stringify(r)) + '&clientid=' + clientid + '&psessionid=' + psessionid;
        pushMsg(options, 'sendqunmsg', data, callback);
    };

    /**
     * 接受加入群 验证
     * @param args
     * @param callback
     */
    this.op_group_join_req = function (args, callback) {
        var group_uin = args[0];
        var req_uin = args[1];
        var op_type = args[2];
        var msg = args[3];
        var options = getDefaultOption('GET');
        var qo = {'clientid': clientid, 'psessionid': psessionid, 't': new Date().getTime()};
        qo['group_uin'] = group_uin;
        qo['req_uin'] = req_uin;
        qo['op_type'] = op_type;
        qo['msg'] = msg;
        var query = querystring.stringify(qo);
        options.path = '/channel/op_group_join_req?' + query;
        throwLog({'type': 'op_group_join_req', 'msg': options.path});
        nsutil.SendData(options, function (err, chunks) {
            throwLog({'type': 'op_group_join_req_callback', 'msg': chunks});
            if (err) {
                throwErr({'type': 'op_group_join_req', 'msg': err});
                return callback(err);
            }
            var ret = {};
            try {
                ret = JSON.parse(chunks);
            } catch (e) {
                throwErr({'type': 'nojson', 'msg': e});
                err = e;
            }
            return callback(err, ret);
        });
    };

    /**
     * 进入消息队列
     * @param option
     * @param type
     * @param pdata
     * @param callback
     */
    var pushMsg = function (option, type, pdata, callback) {
        msgqueue.push({'option': option, 'type': type, 'pdata': pdata, 'callback': callback});
        checkMsgQueue();
    };

    /**
     * 检查队列是否有请求可以发送如果有将其发送
     */
    var checkMsgQueue = function () {
        if (isbusy || msgqueue.length < 1) {
            return;
        }
        isbusy = true;
        var obj = msgqueue.shift();
        throwLog({'type': obj.type, 'msg': obj.pdata});
        nsutil.PostData(obj.option, obj.pdata, function (err, chk) {
            isbusy = false;
            throwLog({'type': obj.type, 'msg': chk});
            if (err) {
                throwErr({'type': obj.type, 'msg': err});
                return  obj.callback(err);
            }
            var ret = {};
            try {
                ret = JSON.parse(chk);
                return  obj.callback(null, ret);
            } catch (e) {
                throwErr({'type': 'nojsonaa', 'msg': e});
                return obj.callback(e, chk);
            }
        });
    };

    /**
     * 获取默认http头
     */
    var getDefaultHeader = function (method) {
        var ret = {};
        ret['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
        ret['Accept-Language'] = 'zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3';
        ret['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:23.0) Gecko/20100101 Firefox/23.0';
        if (method == 'POST') {
            ret['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
            ret['Pragma'] = 'no-cache';
            ret['Cache-Control'] = 'no-cache';
        } else {
            ret['Content-Type'] = 'utf-8';
        }
        ret['Referer'] = 'http://d.web2.qq.com/proxy.html?v=20110331002&callback=1&id=2';
        ret['Connection'] = 'keep-alive';

        return ret;
    };

    /**
     * 创建新的请求参数
     * @param method
     * @returns {{}}
     */
    var getDefaultOption = function (method) {
        var options = {};
        options.hostname = 'd.web2.qq.com';
        options.method = method;
        options.timeout = 24000;
        var headers = getDefaultHeader(method);
        headers['Cookie'] = cookies.getCookiesByAll();
        options.headers = headers;
        return options;
    };
    /**
     * 抛错误
     * @param obj
     */
    var throwErr = function (obj) {
        thiss.emit('err', 'ChannelQQ', obj);

    };

    /**
     * 抛日志
     * @param obj
     */
    var throwLog = function (obj) {
        thiss.emit('log', 'ChannelQQ', obj);
    };
}

/**
 * 创建
 */
function create() {
    return new ChannelQQ();
}

exports.create = create;