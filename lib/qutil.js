/**
 * Created with JetBrains WebStorm.
 * User: jichuntao
 * Date: 13-7-28
 * Time: 下午3:08
 * QQ提供的一些加密方法
 */

/**
 * uin2hex
 * @param str
 * @returns {string}
 */
exports.uin2hex = function (str) {
    var maxLength = 16;
    str = parseInt(str);
    var hex = str.toString(16);
    var len = hex.length;
    for (var i = len; i < maxLength; i++) {
        hex = "0" + hex
    }
    var arr = [];
    for (var j = 0; j < maxLength; j += 2) {
        arr.push("\\x" + hex.substr(j, 2))
    }
    var result = arr.join("");
    eval('result="' + result + '"');
    return result;
};

/**
 * hexchar2bin
 * @param str
 * @returns {*}
 */
exports.hexchar2bin = function (str) {
    var arr = [];
    for (var i = 0; i < str.length; i = i + 2) {
        arr.push("\\x" + str.substr(i, 2))
    }
    arr = arr.join("");
    eval("var temp = '" + arr + "'");
    return temp;
};

/**
 * 获取朋友的哈希
 * @param b
 * @param i
 * @returns {number}
 */
//2015-03-17更新
exports.getHash = function (b, j) {
    for (var a = [], i = 0; i < j.length; i++)
        a[i % 4] ^= j.charCodeAt(i);
    var w = ["EC", "OK"], d = [];
    d[0] = b >> 24 & 255 ^ w[0].charCodeAt(0);
    d[1] = b >> 16 & 255 ^ w[0].charCodeAt(1);
    d[2] = b >> 8 & 255 ^ w[1].charCodeAt(0);
    d[3] = b & 255 ^ w[1].charCodeAt(1);
    w = [];
    for (i = 0; i < 8; i++)
        w[i] = i % 2 == 0 ? a[i >> 1] : d[i >> 1];
    a = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    d = "";
    for (i = 0; i < w.length; i++)
        d += a[w[i] >> 4 & 15], d += a[w[i] & 15];
    return d;
};

