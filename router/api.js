const exprees = require('express'),
    router = exprees.Router(),
    path = require('path'),
    multer = require('multer');

const storage = multer.diskStorage({
    destination: path.join(process.cwd(), 'public/upload'),//node运行目录下
    filename: function (req, file, callback) {
        const h = file.originalname.split('.');
        const filename = `${req.session.user.username}${Date.now()}.${h[h.length - 1]}`;
        callback(null, filename);
    }
});
const upload = multer({
    storage
});
router.post('/upload', (req, res) => {
    //指定保存目录
    upload.single('file')(req, res, err => {
        //console.log(req.file);
        if (err) {
            return res.send({code: 1})
        }
        res.send({
            code: 0,
            data: {
                src: `/upload/${req.file.filename}`
            }
        })
    })
});

module.exports = router;