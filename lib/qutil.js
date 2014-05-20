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
exports.getHash = function (i, a) {
    var j = [];
    j[0] = i >> 24 & 255;
    j[1] = i >> 16 & 255;
    j[2] = i >> 8 & 255;
    j[3] = i & 255;
    for (var s = [], e = 0; e < a.length; ++e) s.push(a.charCodeAt(e));
    e = [];
    for (e.push(new b(0, s.length - 1)); e.length > 0;) {
        var c = e.pop();
        if (!(c.s >= c.e || c.s < 0 || c.e >= s.length))
            if (c.s + 1 == c.e) {
                if (s[c.s] > s[c.e]) {
                    var J = s[c.s];
                    s[c.s] = s[c.e];
                    s[c.e] = J
                }
            } else {
                for (var J = c.s, l = c.e, f = s[c.s]; c.s < c.e;) {
                    for (; c.s < c.e && s[c.e] >= f;) c.e--, j[0] = j[0] + 3 & 255;
                    c.s < c.e && (s[c.s] = s[c.e], c.s++, j[1] = j[1] * 13 + 43 & 255);
                    for (; c.s < c.e && s[c.s] <= f;) c.s++, j[2] = j[2] - 3 & 255;
                    c.s < c.e && (s[c.e] = s[c.s], c.e--, j[3] = (j[0] ^ j[1] ^ j[2] ^ j[3] + 1) & 255)
                }
                s[c.s] = f;
                e.push(new b(J, c.s - 1));
                e.push(new b(c.s + 1, l))
            }
    }
    s = ["0", "1", "2", "3", "4",
        "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"
    ];
    e = "";
    for (c = 0; c < j.length; c++) e += s[j[c] >> 4 & 15], e += s[j[c] & 15];
    return e;
};

/*
 Hash2函数
 */
b = function (b, i) {
    this.s = b || 0;
    this.e = i || 0;
};
