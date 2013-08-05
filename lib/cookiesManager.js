/**
 * Created with JetBrains WebStorm.
 * User: jichuntao
 * Date: 13-7-17
 * Time: 下午6:06
 * Cookies管理    类
 */
function CookiesManager() {
    var cookies = {};

    /*填充cookie*/
    this.fill = function (arr) {
        if (!arr)return;
        arr.forEach(function (cookie) {
            cookie.split(';').forEach(function (args) {
                arg = args.split('=');
                if (arg[0].trim() && arg[0].trim() !== 'PATH' && arg[0].trim() !== 'DOMAIN' && arg[0].trim() !== 'EXPIRES') {
                    if (!cookies[arg[0].trim()]) {
                        cookies[arg[0].trim()] = (arg[1] || '').trim();
                    }
                }
            });
        });
    };

    /*转换*/
    this.parseStr = function (str) {
        if (!str.length)return;
        str.split(';').forEach(function (args) {
            arg = args.split('=');
            if (arg[0].trim() && arg[0].trim() !== 'PATH' && arg[0].trim() !== 'DOMAIN' && arg[0].trim() !== 'EXPIRES') {
                cookies[arg[0].trim()] = (arg[1] || '').trim();
            }
        });
    };

    /*获取单个cookie*/
    this.getCookies = function (key) {
        return cookies[key];
    };

    /*设置单个cookie*/
    this.setCookies = function (key, val) {
        cookies[key] = val.trim();
    };

    /*返回数组中的cookie*/
    this.getCookiesByArr = function (arr) {
        var cook = [];
        arr.forEach(function (key) {
            if (getCookies(key)) {
                cook.push(key + '=' + getCookies(key));
            }
        });
        return cook.join('; ');
    };

    /*返回所有cookie*/
    this.getCookiesByAll = function () {
        var cook = [];
        for (var key in cookies) {
            cook.push(key + '=' + cookies[key]);
        }
        return cook.join('; ');
    };
}
exports.CookiesManager = CookiesManager;