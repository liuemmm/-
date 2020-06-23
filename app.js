const express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    session = require('express-session'),
    Mongosession = require('connect-mongo')(session);

//连接数据库
mongoose.connect('mongodb://localhost/MyBlog', {useNewUrlParser: true});

//使用req.session.xxx
app.use(session({
    secret: 'emm',  //密钥
    rolling: true,  //每次操作重置cookie时间
    resave: false,  //是否每次请求都重新保存数据
    cookie: {maxAge: 1000 * 60 * 60}, //有效时间
    store: new Mongosession({
        url: 'mongodb://localhost/MyBlog'
    })
}));

//获取post参数
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//静态资源目录
app.use(express.static(__dirname + "/public"));

//模板引擎
app.set('views', __dirname + '/view');
app.set('view engine', 'ejs');

//路由
app.use('/', require('./router/index'));
app.use('/api',require('./router/api'));
app.use('/admin',require('./router/admin'));
app.listen(233);
