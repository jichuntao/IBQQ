/**
 * Created with JetBrains WebStorm.
 * User: jichuntao
 * Date: 13-7-22
 * Time: 上午12:18
 * 长轮询类
 */
var util = require("util");
var EventEmitter = require("events").EventEmitter;
var CookiesManager = require('./cookiesManager').CookiesManager;
var nsutil = require('./nsutil');

/*继承事件类*/
util.inherits(PollingProxy, EventEmitter);

/**
 * 长轮询
 */
function PollingProxy() {
    var thiss = this;
    var cookies = new CookiesManager();
    var options = {};
    var pdata = '';
    var isStop = false;
    /**
     * 设置登陆session
     * @param obj
     */
    this.setLoginSession = function (obj) {
        cookies.parseStr(obj.cookies);
        options.hostname = 'd.web2.qq.com';
        options.method = 'POST';
        options.timeout = 90000;
        var path = '/channel/poll';
        var r = {'key': 0, 'ids': [], 'clientid': obj['clientid'], 'psessionid': obj['psessionid']};
        var data = 'r=' + JSON.stringify(r) + '&clientid=' + obj['clientid'] + '&psessionid=' + obj['psessionid'];
        var headers = getDefaultHeader();
        headers['Cookie'] = cookies.getCookiesByAll();
        options.path = path;
        options.headers = headers;
        pdata = encodeURI(data);
        isStop = false;
    };

    /**
     * 开始长轮询
     */
    this.startPoll = function () {
        poll();
    };

    /**
     * 停止轮询
     */
    this.stopPoll = function (value) {
        throwLog({'type': 'stop poll', 'msg':JSON.stringify(value)});
        isStop = true;
    };

    /**
     * 轮询
     */
    var poll = function () {
        if (isStop)return;
        throwLog({'type': 'start poll', 'msg': new Date().getTime()});
        nsutil.PostData(options, pdata, function (err, chk) {
            if (err) {
                throwErr({'type': 'poll', 'msg': err});
            }
            throwLog({'type': 'poll', 'msg': chk});
            process.nextTick(function () {
                poll();
            });
            try {
                ret = JSON.parse(chk);
                throwMsg(ret);
            } catch (e) {
                throwErr({'type': 'nojson', 'msg': chk});
            }
        });
    };

    /**
     * 获取默认http头
     */
    var getDefaultHeader = function () {
        var ret = {};
        ret['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
        ret['Accept-Language'] = 'zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3';
        ret['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:23.0) Gecko/20100101 Firefox/23.0';
        ret['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        ret['Referer'] = 'http://d.web2.qq.com/proxy.html?v=20110331002&callback=1&id=2';
        ret['Connection'] = 'keep-alive';
        ret['Pragma'] = 'no-cache';
        ret['Cache-Control'] = 'no-cache';
        return ret;
    };

    /**
     * 抛错误
     * @param obj
     */
    var throwErr = function (obj) {
        thiss.emit('err', 'PollingProxy', obj);
    };

    /**
     * 抛日志
     * @param obj
     */
    var throwLog = function (obj) {
        thiss.emit('log', 'PollingProxy', obj);
    };

    /**
     * 抛消息
     * @param obj
     */
    var throwMsg = function (obj) {
        thiss.emit('msg', obj);
    }

}

/**
 * 创建
 */
function create() {
    return new PollingProxy();
}

exports.create = create;