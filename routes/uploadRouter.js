const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer')

var authenticate = require('../authenticate');
const app = express();
const dishRouter = express.Router();

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, 'public/images')
    },
    filename: (req,file,cb) =>{
        cb(null, file.originalname)
    }
});

const imageFileFilter = (req,file,cb) =>{
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
        return cb(new Error("You can upload only images") , false);
    }
    cb(null,true);
}

const upload = multer({storage: storage, fileFilter: imageFileFilter});

app.use(bodyParser.json);

const uploadRouter = express.Router();


uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    console.log("Going in post  ")
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter ;