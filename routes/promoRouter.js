const express = require('express');
const bodyParser = require('body-parser');
const promotion = require('../models/promotions')
const cors = require('./cors')
var authenticate = require('../authenticate')
const app = express();
const promoRouter = express.Router();

app.use(bodyParser.json);

promoRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    promotion.find(req.query)
    .then((promo)=>{
        res.statusCode = 200;
        res.setHeader('Context-Type','text/json')
        res.json(promo)
    })
    .catch((err)=>{
        console.log("cannot get promotion data "+ err);
        return next(err);
    })
})
.post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next) =>{
    promotion.create(req.body)
    .then((promo)=>{
        console.log("Dish created " + promo); 
        res.statusCode = 200;
        res.setHeader('Context-Type','text/json')
        res.json(promo)
    })
    .catch((err)=>{
        // return console.log("coming in catch   ")
        return next(err);
    })
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) =>{
    res.statusCode =403;
    res.end('PUT not allowed for all promos');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) =>{
    // res.statusCode =403;
    promotion.remove({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Context-Type','text/json')
        res.json(resp)        
    })
    .catch((err)=>{
        return console.log(err);
    })
});


// Promo router for perticular promoID
promoRouter.route('/:promoId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    promotion.findById(req.params.promoId)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Context-Type','text/json')
        res.json(resp)
    })
    .catch((err)=>{
        return next(err)
    })
    // res.end("get this promo id" + req.params.promoId);
})
.post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next) =>{
    res.end('adding promoId '+req.body.promoName + 'this is promo descp ' + req.body.descp);
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) =>{
    promotion.findByIdAndUpdate(req.params.promoId , {
        $set : req.body
    }, {new:true})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Context-Type','text/json')
        res.json(resp)
    })
    .catch((err)=>{
        console.log("Problem in put operation "+ next(err));
    })
})
.delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next) =>{
    promotion.findByIdAndRemove(req.params.promoId)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Context-Type','text/json')
        res.json(resp)
    })
    // res.statusCode =403;
    .catch((err)=>{
        console.log("Issue in deleting "+ next(err));
    })
});

module.exports = promoRouter;