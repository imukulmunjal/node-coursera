var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var user = require('../models/user');
var passport = require('passport')

const cors = require('./cors')
var authenticate = require('../authenticate')

router.use(bodyParser.json());

/* GET users listing. */
router.options('*',cors.corsWithOptions , (req,res,next)=> {
    res.sendStatus(200);
})

router.route('/')
.get(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,function(req, res, next) {
  user.find({})
  .then((users)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json(users)
  })
  .catch((err)=>{
    next(err);
  })
});

router.route('/signup')
.post(cors.corsWithOptions,(req,res,next) => {
  console.log(req.body.username + " " + req.body.password);
  user.register(new user({username : req.body.username}),req.body.password ,(err,user)=>{
    if(err){
      err.status = 403;
      next(err);
    }
    else{
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;
        user.save((err,user)=>{
          if(err){
            err.status = 403;
            next(err);
          }
        })
      passport.authenticate('local')(req,res , ()=>{
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json({status: 'Registration Sucessfull', user : user})
      });
    }
  });
})
router.route('/login')
.post(cors.corsWithOptions,(req,res,next) => {
  passport.authenticate('local' , (err,user,info)=>{
    if(err) return next(err)

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, status: 'Login Unsuccessful!', err: info});
    }
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});          
      }
      var token = authenticate.getToken({_id:req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json({status: 'Login Succesfull', token:token, user:user})
    })
  })(req,res,next)
})
router.route('/logout')
.get((req,res)=>{
  if(req.session){
    console.log("in login session")
    req.session.destroy();
    res.clearCookie('session-id');
    res.end("Succefully loged out!! ")
    res.redirect('/');
  }
  else {
    var err = new Error("You are not logged in");
    err.status = 403;
    next(err);
  }
})

router.route('/facebook/token')
.get(passport.authenticate('facebook-token'),(req,res)=>{
  if(req.user){
    var token = authenticate.getToken({_id:req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json({status: 'Login Succesfull', token:token, user:user})
  }
})
router.get('/checkJWTtoken', cors.corsWithOptions, (req, res) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err)
      return next(err);
    
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT invalid!', success: false, err: info});
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT valid!', success: true, user: user});

    }
  }) (req, res);
});

module.exports = router;
