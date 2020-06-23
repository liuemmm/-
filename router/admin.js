const express = require('express'),
    {user, essay} = require('../model/sch'),
    crypto = require('crypto'),
    router = express.Router();

router.use((req, res, next) => {
    if (req.session.login) {
        if (req.session.user.level >= 1) {
            return next()
        }
        return res.send('没有权限')
    }
    res.send('请先 <a href="/login">登录</a>')
});

//发布文章
router.get('/task/addtask', (req, res) => {
    res.render('admin/addtask', {
        user: req.session.user
    });
});

//文章管理
router.get('/task/all', (req, res) => {
    res.render('admin/taskall', {
        user: req.session.user
    })
}).post('/task/all', (req, res) => {
    Promise.all([
        essay.find({author: req.session.user._id}).sort({_id: -1}).skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
        essay.find({author: req.session.user._id}).countDocuments()
    ]).then(function (data) {
        res.send({code: 0, data: data[0], count: data[1]})
    });
});
//删除文章
router.post('/task/del', function (req, res) {
    Promise.all([
        essay.deleteOne({_id: req.body._id}),
        user.updateMany(
            {$or: [{'essay.publish': req.body._id}, {'essay.collection': req.body._id}]},
            {$pull: {'essay.publish': req.body._id, 'essay.collection': req.body._id}}
        )
    ]).then()
});

//接收文章
router.post('/task/add', (req, res) => {
    const data = req.body;
    data.author = req.session.user._id;
    essay.create(data, (err, data) => {
        if (err) {
            return res.send({code: 1, msg: '发布失败'})
        }
        user.updateOne({_id: req.session.user._id}, {$push: {'essay.publish': data._id}}, function () {

        });
        res.send({code: 0, msg: '发布成功'})
    })
});

//用户管理
router.get('/user', (req, res) => {
    res.render('admin/user', {
        user: req.session.user,
    })
}).post('/user', (req, res) => {
    Promise.all([
        user.find().sort({_id: -1}).skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
        user.countDocuments()
    ]).then(function (data) {
        res.send({code: 0, data: data[0], count: data[1]})
    });
});
//删除用户
router.post('/user/del', function (req, res) {
    //console.log(req.body._id);
    if (req.session.user.level * 1 > Number(req.body.level)) {
        essay.deleteMany({'author': req.body._id}, function (err) {
        });
        user.deleteOne({_id: req.body._id}, function (err) {
        });
        return res.send({code: 0, msg: '删除成功'});
    }
    return res.send({code: 1, msg: '权限不够'})
});
//更改用户权限
router.post('/user/relevel', function (req, res) {
    //console.log(req.session.user.level, req.body.num);
    if (req.session.user.level == 999 && req.body.num * 1 < 999) {
        user.updateOne({_id: req.body._id}, {$set: {level: req.body.num}}, function () {

        });
        return res.send({code: 0, msg: '更改成功'});
    }
    return res.send({code: 1, msg: '权限不够'})
});

module.exports = router;