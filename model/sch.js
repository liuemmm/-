const mongoose = require('mongoose');
//用户详情
const userSchema = new mongoose.Schema({
        username: {type: String, required: true},
        password: {type: String, required: true},
        //用户级别 普通用户 1 管理员 10 超级管理 999
        level: {type: Number, required: true, default: 1},
        //用户自定义的文章目录
        userdir: {type: [{type: String}]},
        //文章
        essay: {
            //发布的文章
            publish: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'essay'}]},
            //未发表的草稿
            draft: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'essay'}]},
            //收藏的文章
            collection: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'essay'}]}
        }
    }, {versionKey: false}//不需要版本号
);
//文章详情
const essaySchema = new mongoose.Schema({
        title: {type: String, required: true},    //文章标题
        dir: {type: String, required: true},    //文章所属目录
        class: {type: String, required: true},  //文章类型
        content: {type: String, required: true},  //内容
        author: {type: mongoose.Schema.Types.ObjectId, ref: 'user'}, //作者
        time: {type: String, required: true}, //发布时间
        reply: [{
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
            text: {type: String}
        }],  //回复
        likes: {type: Number, required: true, default: 0},  //点赞数
        favorites: {type: Number, required: true, default: 0},   //收藏数
        forward: {type: Number, required: true, default: 0},   //分享数
    }, {versionKey: false}//不需要版本号
);

//创建表
const user = mongoose.model('user', userSchema);
const essay = mongoose.model('essay', essaySchema);

module.exports = {
    user,
    essay
};
