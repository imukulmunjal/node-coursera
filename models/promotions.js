const mongoose = require('mongoose');
const schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);

const Currency = mongoose.Types.Currency;

const promotionSchema = new schema({
    name : {
        type: String,
        required : true,
        unique : true
    },
    image: {
        type: String,
        required : true
    },
    label:{
        type: String,
        default: '',
        required : true
    },
    price:{
        type : Currency,
        required : true
    },
    description:{
        type: String,
        required: true
    },
    featured:{
        type: Boolean,
        required: true,
        default: false
    }   
} , {
    timestamps: true
})

var promotions = mongoose.model('promotion', promotionSchema);

module.exports = promotions;