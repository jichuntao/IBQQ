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
//2014/05/20更新
exports.getHash = function (b, j) {
    for (var a = j + "password error", i = "", E = []; ;)if (i.length <= a.length) {
        if (i += b, i.length == a.length)break
    } else {
        i =
            i.slice(0, a.length);
        break
    }
    for (var c = 0; c < i.length; c++)E[c] = i.charCodeAt(c) ^ a.charCodeAt(c);
    a = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    i = "";
    for (c = 0; c < E.length; c++)i += a[E[c] >> 4 & 15], i += a[E[c] & 15];
    return i
};

