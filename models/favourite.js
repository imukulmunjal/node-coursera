var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const favdishSchema = new Schema({
    dishId: {
        type : String,
        unique: true,
        required : true
    }
});

const favorite = new Schema({
    facebookId : {
        type: String
    },
    author:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    favdishes : [favdishSchema]
}, {
    timestamps : true
});

var favorites = mongoose.model('favorite', favorite);

module.exports = favorites ;
