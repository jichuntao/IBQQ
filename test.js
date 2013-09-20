/**
 * Created with JetBrains WebStorm.
 * User: jichuntao
 * Date: 13-8-3
 * Time: 下午11:53
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs');
var IBQQ = require('./IBQQ');

var ibqq = IBQQ.create();
var qqnum = '1234';
var qqpw = 'xxxxxxx';
var vcff = function () {
    return './' + new Date().getTime().toString() + '.jpg';
};
ibqq.on('group_message', function (value) {
    var from_uin = value.from_uin;
    if (value.content.length == 2 && typeof(value.content[1]) == 'string') {
        ibqq.command('channel', 'sendqunmsg', [from_uin, value.content[1]], function (err, chk) {
            console.log(chk);
        });
    }
});

ibqq.on('log', function (data) {
    console.log(data);
});

ibqq.on('err', function (data) {
    console.log(data);
});

ibqq.on('vcode', function (vr) {
    fs.watchFile('./vcode', function (curr, prev) {
        var strs = fs.readFileSync('./vcode', 'utf8');
        fs.unwatchFile('./vcode');
        ibqq.inputVcode(strs);
    });
});


ibqq.start(qqnum, qqpw, vcff);