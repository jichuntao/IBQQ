/**
 * Created with JetBrains WebStorm.
 * User: jichuntao
 * Date: 13-7-23
 * Time: 上午1:08
 * To change this template use File | Settings | File Templates.
 */

var util = require("util");
var EventEmitter = require("events").EventEmitter;
var CookiesManager = require('./cookiesManager').CookiesManager;
var querystring = require('querystring');
var qutil = require('./qutil');
var nsutil = require('./nsutil');

util.inherits(ApiQQ, EventEmitter);

function ApiQQ() {
    var thiss = this;
    var cookies = new CookiesManager();
    var clientid, vfwebqq, uin, psessionid;

    /**
     * 设置登陆session
     * @param obj
     */
    this.setLoginSession = function (obj) {
        cookies.parseStr(obj.cookies);
        clientid = obj['clientid'];
        vfwebqq = obj['vfwebqq'];
        uin = obj['uin'];
        psessionid = obj['psessionid'];
    };

    /**
     * 获取朋友列表
     * @param args []
     * @param callback
     */
    this.get_user_friends = function (args, callback) {
        var options = getDefaultOption('POST');
        options.path = '/api/get_user_friends2';
        var ptwebqq = cookies.getCookies('ptwebqq');
        var hash = qutil.getHash(uin, ptwebqq);
        var r = {'h': 'hello', 'hash': hash, 'vfwebqq': vfwebqq};
        var data = 'r=' + encodeURIComponent(JSON.stringify(r));
        throwLog({'type': 'start_get_user_friends_callback', 'msg': data});
        nsutil.PostData(options, data, function (err, chunks) {
            throwLog({'type': 'get_user_friends_callback', 'msg': chunks});
            if (err) {
                throwErr({'type': 'get_user_friends', 'msg': err});
                return callback(err);
            }
            var ret = {};
            try {
                ret = JSON.parse(chunks);
                return callback(null, ret);
            } catch (e) {
                throwErr({'type': 'nojson', 'msg': e});
                return callback(e, chunks);
            }
        });
    };

    /**
     * 获取群列表
     * @param args []
     * @param callback
     */
    this.get_group_name_list_mask = function (args, callback) {
        var options = getDefaultOption('POST');
        options.path = '/api/get_group_name_list_mask2';
        var r = {'vfwebqq': vfwebqq};
        var data = 'r=' + encodeURIComponent(JSON.stringify(r));
        throwLog({'type': 'start_get_group_name_list_mask', 'msg': data});
        nsutil.PostData(options, data, function (err, chunks) {
            throwLog({'type': 'get_group_name_list_mask_callback', 'msg': chunks});
            if (err) {
                throwErr({'type': 'get_group_name_list_mask', 'msg': err});
                return callback(err);
            }
            var ret = {};
            try {
                ret = JSON.parse(chunks);
                return callback(null, ret);
            } catch (e) {
               throwErr({'type': 'nojson', 'msg': e});
               return callback(e, chunks);
            }
        });
    };

    /**
     *  获取讨论组列表
     * @param args []
     * @param callback
     */
    this.get_discus_list = function (args, callback) {
        var options = getDefaultOption('GET');
        var qo = {'vfwebqq': vfwebqq, 'psessionid': psessionid, 'clientid': clientid, 't': new Date().getTime()};
        var query = querystring.stringify(qo);
        options.path = '/api/get_discus_list?' + query;
        throwLog({'type': 'start_get_discus_list_callback', 'msg': options.path});
        nsutil.SendData(options, function (err, chunks) {
            throwLog({'type': 'get_discus_list_callback', 'msg': chunks});
            if (err) {
                throwErr({'type': 'get_discus_list', 'msg': err});
                return callback(err);
            }
            var ret = {};
            try {
                ret = JSON.parse(chunks);
                return callback(null, ret);
            } catch (e) {
                throwErr({'type': 'nojson', 'msg': e});
                return callback(e, chunks);
            }
        });
    };

    /**
     * 获取QQ号码或者群号
     * @param args [tuin,type] 1_好友 4_群
     * @param callback 回调
     */
    this.get_friend_uin = function (args, callback) {
        var tuin = args[0];
        var type = args[1];
        var options = getDefaultOption('GET');
        var qo = {'vfwebqq': vfwebqq, 'tuin': tuin, 'verifysession': '', 'code': '', 'type': type, 't': new Date().getTime()};
        var query = querystring.stringify(qo);
        options.path = '/api/get_friend_uin2?' + query;
        throwLog({'type': 'start_get_friend_uin', 'msg': options.path});
        nsutil.SendData(options, function (err, chunks) {
            throwLog({'type': 'get_friend_uin_callback', 'msg': chunks});
            if (err) {
                throwErr({'type': 'get_friend_uin', 'msg': err});
                return callback(err);
            }
            var ret = {};
            try {
                ret = JSON.parse(chunks);
                return callback(null, ret);
            } catch (e) {
                throwErr({'type': 'nojson', 'msg': e});
                return callback(e, chunks);
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
        ret['Referer'] = 'http://s.web2.qq.com/proxy.html?v=20110331002&callback=1&id=2';
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
        options.hostname = 's.web2.qq.com';
        options.method = method;
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
        thiss.emit('err', 'ApiQQ', obj);

    };

    /**
     * 抛日志
     * @param obj
     */
    var throwLog = function (obj) {
        thiss.emit('log', 'ApiQQ', obj);
    };
}

/**
 * 创建
 */
function create() {
    return new ApiQQ();
}

exports.create = create;
