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
exports.getHash = function (i, a) {
    var r = [];
    r[0] = i >> 24 & 255;
    r[1] = i >> 16 & 255;
    r[2] = i >> 8 & 255;
    r[3] = i & 255;
    for (var j = [], e = 0; e < a.length; ++e) j.push(a.charCodeAt(e));
    e = [];
    for (e.push(new b(0, j.length - 1)); e.length > 0;) {
        var c = e.pop();
        if (!(c.s >= c.e || c.s < 0 || c.e >= j.length)) if (c.s + 1 == c.e) {
            if (j[c.s] > j[c.e]) {
                var l = j[c.s];
                j[c.s] = j[c.e];
                j[c.e] = l
            }
        } else {
            for (var l = c.s,
                     J = c.e,
                     f = j[c.s]; c.s < c.e;) {
                for (; c.s < c.e && j[c.e] >= f;) c.e--,
                    r[0] = r[0] + 3 & 255;
                c.s < c.e && (j[c.s] = j[c.e], c.s++, r[1] = r[1] * 13 + 43 & 255);
                for (; c.s < c.e && j[c.s] <= f;) c.s++,
                    r[2] = r[2] - 3 & 255;
                c.s < c.e && (j[c.e] = j[c.s], c.e--, r[3] = (r[0] ^ r[1] ^ r[2] ^ r[3] + 1) & 255)
            }
            j[c.s] = f;
            e.push(new b(l, c.s - 1));
            e.push(new b(c.s + 1, J))
        }
    }
    j = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    e = "";
    for (c = 0; c < r.length; c++) e += j[r[c] >> 4 & 15],
        e += j[r[c] & 15];
    return e
};

/*
 Hash2函数
 */
b = function (b, i) {
    this.s = b || 0;
    this.e = i || 0;
};
