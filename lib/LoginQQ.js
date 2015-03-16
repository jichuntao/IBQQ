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
var url = require('url');
var querystring = require('querystring');

var qqPwdEncode = require('./QQbase');

/*继承事件类*/
util.inherits(LoginQQ, EventEmitter);

/**
 * QQ登陆类
 * @constructor LoginQQ
 */
function LoginQQ() {
    var options, cookies, qqnum, qqpwd, clientid, vcode, ptuin, hashpw, vcff;
    var m_pt_verifysession_v1, m_pt_vcode_v1, login_sig;
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
        qqpwd = obj.qqpwd;
        clientid = obj.clientid;
        vcff = obj.vcff;
        throwLog({'type': '设置登陆信息', 'msg': 'qqnum:' + qqnum + ' qqpwd:' + qqpwd + ' :clientid:' + clientid});
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
        qqpwd = '';
        clientid = '';
        vcode = '';
        ptuin = '';
        hashpw = '';
        m_pt_verifysession_v1 = '';
        m_pt_vcode_v1 = '';
        login_sig = '';
    };

    /**
     * 检测QQ是否用验证码
     */
    var step1 = function () {
        var getLoginSigParams = {
            daid: 164,
            target: 'self',
            style: 5,
            mibao_css: 'm_webqq',
            appid: 1003903,
            enable_qlogin: 0,
            no_verifyimg: 1,
            s_url: 'http://web2.qq.com/loginproxy.html',
            f_url: 'loginerroralert',
            strong_login: 1,
            login_state: 10,
            t: 20150211001
        };
        nsutil.SendData({
            hostname: 'ui.ptlogin2.qq.com',
            path: '/cgi-bin/login?' + querystring.stringify(getLoginSigParams)
        }, function (err, uiPTlogin2chunks) {
            var login_sigIndex = uiPTlogin2chunks.indexOf('login_sig');
            if (login_sigIndex == -1) {
                return throwLog({type: '获取login_sig失败', msg: ''});
            }
            var startQuotaIndex = uiPTlogin2chunks.indexOf('"', login_sigIndex) + 1;
            var endQuotaIndex = uiPTlogin2chunks.indexOf('"', startQuotaIndex + 1);
            login_sig = uiPTlogin2chunks.substring(startQuotaIndex, endQuotaIndex);
            var checkParams = {
                login_sig: login_sig,
                pt_tea: 1,
                js_ver: 10114,
                js_type: 0,
                u1: 'http://web2.qq.com/loginproxy.html',
                uin: qqnum,
                appid: appid,
                r: Math.random()
            };
            options.hostname = 'check.ptlogin2.qq.com';
            options.path = '/check?' + querystring.stringify(checkParams);
            nsutil.SendData(options, function (err, chunks, pcookies) {
                if (err) {
                    throwErr({'type': '检测QQ是否用验证码', 'msg': err});
                    return;
                }
                cookies.fill(pcookies);
                eval(chunks);
            });
            throwLog({'type': '检测QQ是否用验证码', 'msg': 'path:' + options.path});
        });


    };

    /**
     * 下载验证码
     */
    var step2 = function () {
        var captchaParams = {
            uin: qqnum,
            aid: appid,
            r: Math.random()
        };
        options.hostname = 'captcha.qq.com';
        options.path = '/getimage?' + querystring.stringify(captchaParams);
        var filename = new Date().getTime().toString() + '.jpg';
        if (vcff) {
            filename = vcff();
        }
        nsutil.GetFile(options, filename, function (err, filename, pcookies) {
            if (err) {
                throwErr({'type': '下载验证码', 'msg': err});
                return;
            }
            cookies.fill(pcookies);
            m_pt_verifysession_v1 = cookies.getCookies('verifysession');
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
        //hashpw = nsutil.MD5(nsutil.MD5(qutil.hexchar2bin(nsutil.MD5(qqpwd)) + ptuin) + vcode.toUpperCase());
        hashpw = qqPwdEncode(qqpwd, ptuin, vcode);
        throwLog({'type': '换算密码', 'msg': 'hashpw:' + hashpw});
        step4();
    };

    /**
     * check回调
     * @param isverified
     * @param vcodes
     * @param salt
     * @param pt_verifysession_v1
     * @param pt_vcode_v1
     */
    var ptui_checkVC = function (isverified, vcodes, salt, pt_verifysession_v1, pt_vcode_v1) {
        throwLog({
            type: 'ptui_checkVC',
            msg: 'isverified = ' + isverified + ' vcodes = ' + vcodes + ' salt = ' + salt + ' pt_verifysession_v1 = ' + pt_verifysession_v1 + ' pt_vcode_v1 = ' + pt_vcode_v1
        });
        ptuin = salt;
        m_pt_verifysession_v1 = pt_verifysession_v1;
        m_pt_vcode_v1 = pt_vcode_v1;
        if (isverified == 1) {
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
        var loginParams = {
            u: qqnum,
            p: hashpw,
            verifycode: vcode,
            webqq_type: 10,
            remember_uin: 1,
            login2qq: 1,
            aid: appid,
            u1: 'http://web2.qq.com/loginproxy.html?login2qq=1&webqq_type=40',
            h: 1,
            ptredirect: 0,
            ptlang: 2052,
            daid: 164,
            from_ui: 1,
            pttype: 1,
            dumy: '',
            fp: 'loginerroralert',
            action: '3-14-69272',
            mibao_css: 'm_webqq',
            t: 1,
            g: 1,
            js_type: 0,
            js_ver: 10114,
            login_sig: login_sig,
            pt_uistyle: 5,
            pt_randsalt: 0,
            pt_vcode_v1: 0,
            pt_verifysession_v1: m_pt_verifysession_v1
        };
        options.hostname = 'ptlogin2.qq.com';
        options.path = '/login?' + querystring.stringify(loginParams);
        options.headers = getDefaultHeader();
        options.headers['Accept'] = '*/*';
        var loginRefererParams = {
            target: 'self',
            style: 5,
            mibao_css: 'm_webqq',
            appid: appid,
            enable_qlogin: 0,
            no_verifyimg: 1,
            s_url: 'http://web.qq.com/loginproxy.html',
            f_url: 'loginerroralert',
            strong_login: 1,
            login_state: 10,
            t: 20130516001
        };
        options.headers['Referer'] = 'http://ui.ptlogin2.qq.com/cgi-bin/login?' + querystring.stringify(loginRefererParams);
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
        var data = {
            r: JSON.stringify(r),
            clientid: clientid,
            psessionid: 'null'
        };
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
        nsutil.PostData(options, querystring.stringify(data), function (err, chunks, pcookies) {
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
