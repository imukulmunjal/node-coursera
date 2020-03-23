var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstname :{
        type : String,
        default: ""
    },
    lastname :{
        type : String,
        default : ""
    },
    facebookId : {
        type: String
    },
    admin: {
        type : Boolean,
        default: false
    }
})


User.plugin(passportLocalMongoose);

var users = mongoose.model('user', User);

module.exports = users