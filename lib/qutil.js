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
exports.getHash = function (b, i) {
    for (var a = [], s = 0; s < b.length; s++) a[s] = b.charAt(s) - 0;
    for (var j = 0,
             d = -1,
             s = 0; s < a.length; s++) {
        j += a[s];
        j %= i.length;
        var c = 0;
        if (j + 4 > i.length) for (var l = 4 + j - i.length,
                                       x = 0; x < 4; x++) c |= x < l ? (i.charCodeAt(j + x) & 255) << (3 - x) * 8 : (i.charCodeAt(x - l) & 255) << (3 - x) * 8;
        else for (x = 0; x < 4; x++) c |= (i.charCodeAt(j + x) & 255) << (3 - x) * 8;
        d ^= c
    }
    a = [];
    a[0] = d >> 24 & 255;
    a[1] = d >> 16 & 255;
    a[2] = d >> 8 & 255;
    a[3] = d & 255;
    d = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    s = "";
    for (j = 0; j < a.length; j++) s += d[a[j] >> 4 & 15],
        s += d[a[j] & 15];
    return s
};