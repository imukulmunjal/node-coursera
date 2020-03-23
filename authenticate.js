var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const user = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var FacebookTokenStrategy = require('passport-facebook-token');
var jwt = require('jsonwebtoken');
const util = require('util')


var config = require('./config');

exports.local = passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

exports.getToken = function(user){
    return jwt.sign(user , config.secretKey, {expiresIn:3600})
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts , (jwt_payload , done)=>{
    // obj = jwt_payload;
    // console.log("inside jwt passport",util.inspect(obj, {depth: null}));

    user.findOne({_id: jwt_payload._id}, (err,resp)=>{
        if(resp){
            console.log("User found in db" + resp);
            return done(null,resp)
        }
        else if(err){
            console.log("its in err "+ err);
            return done(err,false)
        }
        else{
            console.log("user doesnot found");
            return done(null,false)
        }
    })
}));

exports.verifyUser = passport.authenticate('jwt', {session:false});

exports.verifyAdmin = (req, res,next)=> {
    if(req.user.admin == true){
        // console.log("fun verifyadmin  "+req.user.admin)
        next()
    }
    else{
        // console.log("in else part")
         err = new Error("Not admin user");
         next(err);
    }
}

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID:config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken,profile,done)=>{
    console.log("in fb login start  ");
    user.findOne({facebookId: profile.id}, (err,user)=>{
        if(err){
            return done(err,false);
        }
        if(!err && user!=null){
            return(null,user);
        }
        else{
            user = new User({username:profile.displayName})
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err,user)=>{
                if(err) return done(err,false);
                else
                return done(null,user);
            })
        }
    })
}
));
