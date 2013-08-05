/**
 * Created with JetBrains WebStorm.
 * User: jichuntao
 * Date: 13-7-20
 * Time: 下午3:31 2190422776
 * QQ登陆模块
 */
var util = require("util");
var EventEmitter = require("events").EventEmitter;
var CookiesManager = require('./cookiesManager').CookiesManager;
var nsutil = require('./nsutil');
var qutil = require('./qutil');
var url = require('url');

/*继承事件类*/
util.inherits(LoginQQ, EventEmitter);

/**
 * QQ登陆类
 * @constructor LoginQQ
 */
function LoginQQ() {
    var options, cookies , qqnum, qqpw , clientid, vcode, ptuin , hashpw;
    var thiss = this;
    var appid = 1003903;

    /**
     * 设置登陆信息
     * @param obj
     */
    this.setLoginInfo = function (obj) {
        this.destory();
        options = {hostname: 'qq.com', port: 80, path: '/', method: 'GET'};
        cookies = new CookiesManager();
        qqnum = obj.qqnum;
        qqpw = obj.qqpw;
        clientid = obj.clientid;
        throwLog({'type': '设置登陆信息', 'msg': 'qqnum:' + qqnum + ' qqpw:' + qqpw + ' :clientid:' + clientid});
    };

    /**
     * 开始登陆
     */
    this.startLogin = function () {
        throwLog({'type': '开始登陆', 'msg': 'startlogin'});
        step1();
    };

    /**
     * 清理数据
     */
    this.destory = function () {
        cookies = null;
        options = null;
        qqnum = '';
        qqpw = '';
        clientid = '';
        vcode = '';
        ptuin = '';
        hashpw = '';
    };

    /**
     * 检测QQ是否用验证码
     */
    var step1 = function () {
        options.hostname = 'check.ptlogin2.qq.com';
        options.path = '/check?' + encodeURI('uin=' + qqnum + '&appid=' + appid + '&' + 'r=' + Math.random());
        nsutil.SendData(options, function (err, chunks, pcookies) {
            if (err) {
                throwErr({'type': '检测QQ是否用验证码', 'msg': err});
                return;
            }
            cookies.fill(pcookies);
            eval(chunks);
        });
        throwLog({'type': '检测QQ是否用验证码', 'msg': 'path:' + options.path});
    };

    /**
     * 下载验证码
     */
    var step2 = function () {
        options.hostname = 'captcha.qq.com';
        options.path = '/getimage?' + encodeURI('uin=' + qqnum + '&aid=' + appid + '&' + 'r=' + Math.random());
        var filename = new Date().getTime().toString() + '.jpg';
        nsutil.GetFile(options, filename, function (err, filename, pcookies) {
            if (err) {
                throwErr({'type': '下载验证码', 'msg': err});
                return;
            }
            cookies.fill(pcookies);
            throwLog({'type': '请输入验证码', 'msg': filename});
            thiss.emit('vcode', filename);
        });
        throwLog({'type': '下载验证码', 'msg': 'path:' + options.path});
    };

    /**
     * 输入验证码
     * @param vc
     */
    this.inputVcode = function (vc) {
        throwLog({'type': '输入验证码', 'msg': vc});
        vcode = vc.trim();
        step3();
    };

    /**
     * 换算密码
     */
    var step3 = function () {
        cookies.setCookies('chkuin', qqnum);
        cookies.setCookies('confirmuin', qqnum);
        hashpw = nsutil.MD5(nsutil.MD5(qutil.hexchar2bin(nsutil.MD5(qqpw)) + ptuin) + vcode.toUpperCase());
        throwLog({'type': '换算密码', 'msg': 'hashpw:' + hashpw});
        step4();
    };

    /**
     * check回调
     * @param status
     * @param vcodes
     * @param ptuins
     */
    var ptui_checkVC = function (status, vcodes, ptuins) {
        ptuin = ptuins;
        if (status == 1) {
            step2();
        } else {
            vcode = vcodes;
            step3();
        }
    };

    /**
     * 第一次登陆
     */
    var step4 = function () {
        options.hostname = 'ptlogin2.qq.com';
        var path = '/login?';
        var query = 'u=' + qqnum + '&p=' + hashpw + '&verifycode=' + vcode;
        // query += '&webqq_type=10&remember_uin=1&login2qq=1&aid=' + appid + '&u1=http%3A%2F%2Fweb.qq.com%2Floginproxy.html%3Flogin2qq%3D1%26webqq_type%3D10&h=1&ptredirect=0&ptlang=2052&from_ui=1&pttype=1&dumy=&fp=loginerroralert&action=4-12-13960&mibao_css=m_webqq&t=1&g=1&js_type=0&js_ver=10034&login_sig=dBurvw1Jd9taW08ya2TrRuJPAjdn*OKSfikidTKxXJ4AtGcNpzvfCy6S0ShBhvPm';
        query += '&webqq_type=10&remember_uin=1&login2qq=1&aid=' + appid + '&u1=http%3A%2F%2Fweb2.qq.com%2Floginproxy.html%3Flogin2qq%3D1%26webqq_type%3D10&h=1&ptredirect=0&ptlang=2052&daid=164&from_ui=1&pttype=1&dumy=&fp=loginerroralert&action=3-14-69272&mibao_css=m_webqq&t=undefined&g=1&js_type=0&js_ver=10038&login_sig=ntukT*vZY*wL-F8fXBMiFQVl2StE*tDiTg-IgxjqOt6JguHCOWJR6JeSawrm9BoZ';
        options.path = path + query;
        options.headers = getDefaultHeader();
        options.headers['Accept'] = '*/*';
        options.headers['Referer'] = 'http://ui.ptlogin2.qq.com/cgi-bin/login?target=self&style=5&mibao_css=m_webqq&appid=' + appid + '&enable_qlogin=0&no_verifyimg=1&s_url=http%3A%2F%2Fweb.qq.com%2Floginproxy.html&f_url=loginerroralert&strong_login=1&login_state=10&t=20130516001';
        options.headers['Cookie'] = cookies.getCookiesByAll();
        nsutil.SendData(options, function (err, chunks, pcookies) {
            if (err) {
                throwErr({'type': '第一次登陆', 'msg': err});
                return;
            }
            cookies.fill(pcookies);
            eval(chunks);
        });
        throwLog({'type': '第一次登陆', 'msg': 'path:' + options.path});
    };

    /**
     * 第一次登陆回调 ptuiCB
     * @param status
     * @param a
     * @param b
     * @param c
     * @param d
     * @param e
     */
    var ptuiCB = function (status, a, b, c, d, e) {
        if (status == 0) {//成功
            throwLog({'type': '登陆成功', 'msg': [status, a, b, c, d, e]});
            step5(b);
        } else if (status == 4) {
            throwLog({'type': '验证码不对', 'msg': [status, a, b, c, d, e]});
            step2();
        } else {
            throwLog({'type': '登陆失败', 'msg': [status, a, b, c, d, e]});
        }
    };

    /**
     * Check sig
     * @param check_sig
     */
    var step5 = function (check_sig) {
        var urlObj = url.parse(check_sig);
        options.hostname = urlObj.hostname;
        options.path = urlObj.path;
        options.headers = getDefaultHeader();
        options.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
        options.headers['Cookie'] = cookies.getCookiesByAll();
        nsutil.SendData(options, function (err, chunks, pcookies) {
            if (err) {
                throwErr({'type': '检测sig', 'msg': err});
                return;
            }
            cookies.fill(pcookies);
            step6();
        });
        throwLog({'type': '检测sig', 'msg': 'path:' + options.path});
    };

    /**
     * 第二次登陆
     */
    var step6 = function () {
        options.hostname = 'd.web2.qq.com';
        options.method = 'POST';
        var path = '/channel/login2';
        var r = {};
        r['status'] = 'online';
        r['ptwebqq'] = cookies.getCookies('ptwebqq');
        r['clientid'] = clientid;
        r['psessionid'] = 'null';
        var data = '';
        data += 'r=' + JSON.stringify(r);
        data += '&clientid=' + clientid;
        data += '&psessionid=null';
        cookies.setCookies('ptui_loginuin', qqnum);
        var headers = getDefaultHeader();
        headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
        headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        headers['Referer'] = 'http://d.web2.qq.com/proxy.html?v=20110331002&callback=1&id=2';
        headers['Pragma'] = 'no-cache';
        headers['Cache-Control'] = 'no-cache';
        headers['Cookie'] = cookies.getCookiesByAll();
        options.path = path;
        options.headers = headers;
        nsutil.PostData(options, encodeURI(data), function (err, chunks, pcookies) {
            if (err) {
                throwErr({'type': '第二次登陆', 'msg': err});
                return;
            }
            var ret;
            try {
                ret = JSON.parse(chunks);
            } catch (e) {
                throwErr({'type': 'nojson', 'msg': chk});
            }
            if (!ret || ret.retcode != 0) {
                throwLog({'type': '第二次邓登陆失败', 'msg': chunks});
                return;
            }
            throwLog({'type': '上线', 'msg': chunks});
            cookies.fill(pcookies);
            thiss.emit('online', ret, cookies.getCookiesByAll());
        });
        throwLog({'type': '第二次邓登陆', 'msg': 'data:' + data});
    };

    /**
     * 获取默认http头
     * @returns {{}}
     */
    var getDefaultHeader = function () {
        var ret = {};
        ret['Accept-Language'] = 'zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3';
        ret['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:23.0) Gecko/20100101 Firefox/23.0';
        ret['Connection'] = 'keep-alive';
        return ret;
    };

    /**
     * 抛错误
     * @param obj
     */
    var throwErr = function (obj) {
        thiss.emit('err', 'LoginQQ', obj);
    };

    /**
     * 抛日志
     * @param obj
     */
    var throwLog = function (obj) {
        thiss.emit('log', 'LoginQQ', obj);
    };

}

/**
 * 创建
 */
function create() {
    return new LoginQQ();
}

exports.create = create;
