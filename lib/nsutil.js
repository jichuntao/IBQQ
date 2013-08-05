/**
 * Created with JetBrains WebStorm.
 * User: jichuntao
 * Date: 13-7-20
 * Time: 下午8:29
 * 封装常用方法
 */

var http = require('http');
var fs = require('fs');

exports.randomNum = randomNum;
exports.MD5 = MD5;
exports.PostData = PostData;
exports.SendData = SendData;
exports.GetFile = GetFile;
exports.clone = clone;
exports.merge = merge;

/**
 * 产生随机数
 * @param under 最小值
 * @param over  最大值
 * @returns {*}
 */
function randomNum(under, over) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * under + 1);
        case 2:
            return parseInt(Math.random() * (over - under + 1) + under);
        default:
            return 0;
    }
}

/**
 * MD5
 * @param strs
 * @returns {string}
 */
function MD5(strs) {
    var crypto = require('crypto');
    var md5 = crypto.createHash('md5');
    md5.update(strs);
    var result = md5.digest('hex');
    return result.toUpperCase();
}

/**
 * Post请求
 * @param opt
 * @param post_data
 * @param callback [err,data,cookies]
 */
function PostData(opt, post_data, callback) {
    var timeout = opt['timeout'] ? opt['timeout'] : 30000;
    opt.headers['Content-Length'] = post_data.length;
    var req = http.request(opt, function (res) {
        res.setEncoding('utf8');
        var chunks = "";
        res.on('data', function (chunk) {
            chunks += chunk;
        });
        res.on('end', function () {
            return callback(null, chunks, res.headers['set-cookie']);
        });
    });
    req.setTimeout(timeout, function () {
        req.abort();
    });
    req.on('error', function (e) {
        return callback(e);
    });
    req.write(post_data);
    req.end();
}

/**
 * 发送GET
 * @param opt
 * @param callback
 */
function SendData(opt, callback) {
    var timeout = opt['timeout'] ? opt['timeout'] : 30000;
    var req = http.request(opt, function (res) {
        res.setEncoding('utf8');
        var chunks = "";
        res.on('data', function (chunk) {
            chunks += chunk;
        });
        res.on('end', function () {
            return callback(null, chunks, res.headers['set-cookie']);
        });
    });
    req.setTimeout(timeout, function () {
        req.abort();
    });
    req.on('error', function (e) {
        return callback(e);
    });
    req.end();
}


/**
 * 下载文件
 * @param opt
 * @param filename
 * @param callback
 */
function GetFile(opt, filename, callback) {
    var file_name = filename;
    var file = fs.createWriteStream(file_name);
    var timeout = opt['timeout'] ? opt['timeout'] : 30000;
    var req = http.request(opt, function (res) {
        res.on('data', function (data) {
            file.write(data);
        });
        res.on('end', function () {
            file.end();
            return callback(null, file_name, res.headers['set-cookie']);
        });
    });
    req.setTimeout(timeout, function () {
        req.abort();
    });
    req.on('error', function (e) {
        return callback(e);
    });
    req.end();
}

/**
 * 克隆一个对象
 * @param obj
 * @returns {*}
 */
function clone(obj) {
    if (!obj)return{};
    var str = JSON.stringify(obj);
    return JSON.parse(str);
}

/**
 * 以source合并一个对象
 * @param source    源
 * @param target    目标
 */
function merge(source, target) {
    for (var key in source) {
        target[key] = source[key];
    }
    return target;
}