const express = require('express'),
    {user, essay} = require('../model/sch'),
    crypto = require('crypto'),
    router = express.Router(),
    url = require('url');

router.post('/reg', (req, res) => {
    user.findOne({username: req.body.username}).then((data) => {
        if (data) {
            return res.send({code: 2, msg: '用户已存在'});
        }
        //指定加密方法
        const c = crypto.createHash('sha256');
        //加密
        const password = c.update(req.body.password).digest('hex');
        //向数据库中添加用户
        user.create({
            username: req.body.username,
            password: password
        }).then((data) => {
            res.send({code: 1, msg: '注册成功'})
        })
    });
});

router.get('/login', (req, res) => {
    if (req.session.login) return res.redirect('/user/'+req.session.user.username);
    // res.render('login', {
    //     login: req.session.login
    // })
}).post('/login', (req, res) => {
    user.findOne({username: req.body.username}, (err, data) => {
        //如果用户名存在
        if (data) {
            //指定加密方法
            const c = crypto.createHash('sha256');
            //加密
            const password = c.update(req.body.password).digest('hex');
            if (data.password === password) {
                req.session.login = true;   //保存cookie
                req.session.user = data;
                return res.send({code: 1, msg: '登录成功'})
            } else {
                return res.send({code: 2, msg: '密码错误'})
            }
        }
        res.send({code: 2, msg: '用户名不存在'})
    })
});

//注销
router.get('/logout', (req, res) => {
    req.session.destroy(); //清除session
    res.redirect('/login'); //重定向到登录页面
});
//用户主页
router.get('/user/:name', (req, res) => {
    user.findOne({username: req.params.name}, (err, data) => {
        //用户存在
        if (data) {
            return res.render('home', {
                //数据发给前端
                login: req.session.login,
                user: req.session.user, //登录用户的
                name: data.username,        //当前页面的
            })
        }
        return res.send("该用户不存在");
    })
});
//获取文章
router.post('/user/essay', (req, res) => {
    user.findOne({username: req.body.username}, {_id: 1}, (err, data) => {
        if (err) return res.send({code: 1, data: '数据库错误'});
        Promise.all([
            essay.find({author: data._id}, {reply: false}).sort({_id: -1}).skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
            essay.find({author: data._id}).countDocuments()
        ]).then((data) => {
            res.send({code: 0, data: data[0], count: data[1]});
        });
    })
});
//文章详情
router.get('/user/:name/essay/:_id', (req, res) => {
    essay.findOne({_id: req.params._id}, (err, data) => {
        //文章存在
        if (data) {
            return res.render('details', {
                //数据发给前端
                login: req.session.login,
                user: req.session.user, //登录用户的
                name: req.params.name,        //当前页面的
                essay: data
            })
        }
        return res.send("文章不存在");
    })
});
//检索
router.get('/search?', (req, res) => {
    let keyword = url.parse(req.url, true).query;
    const reg = new RegExp(keyword.word, 'i');
    //console.log(keyword,reg);
    essay.find({
        $or: [ //多条件，数组
            {title: {$regex: reg}},
            {content: {$regex: reg}},
            {'author.username': {$regex: reg}}
        ]
    }).populate('author').sort({_id: -1}).then(data => {
        res.render('search',{
            login: req.session.login,
            user: req.session.user, //登录用户的
            essay: data
        });
    });
});

module.exports = router;