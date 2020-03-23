const express = require('express');
const favoriteRouter = express.Router();
const bodyParser = require('body-parser');
const favoritesmodel = require('../models/favourite');
const dish = require('../models/dishes')
var authenticate = require('../authenticate')
const cors = require('./cors')
const app = express();

app.use(bodyParser.json);

// router.use(bodyParser.json());

favoriteRouter.route('/')
.get(authenticate.verifyUser, (req,res,next) => {
    favoritesmodel.findById(req.user._id)
    .populate('author')
    .then((fvtDishes)=>{
        if(fvtDishes){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(fvtDishes);
        }
        else{
            err = new Error("No dish is marked as fvt");
            next(err)
        }
    })
    .catch((err)=> next(err))
})
.post(authenticate.verifyUser,(req,res,next)=>{
    console.log(req.user._id);
    favoritesmodel.findById(req.user._id)
    .populate('author')
    .then((fvtUser)=>{
        console.log("fvt user in " + fvtUser + "req body  "+ req.body);
        if(fvtUser){
            fvtUserDishes = fvtUser.favdishes ; 
            for(let i=0 ; i < fvtUserDishes.length ; i++){
                if(fvtUserDishes[i].dishId == req.body.dishId){
                    err = new Error("Dish is already marked as fvt");
                    next(err) ;
                }
            }
                fvtUser.favdishes.push(req.body)
                fvtUser.save()
                .then((fav)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(fav);
                })
                .catch((err)=> next(err))
        }
        else {
            console.log("in else statement  ")
            favoritesmodel.create({_id:req.user._id})
            .then((fvtUser)=>{
                fvtUser.favdishes.push(req.body)
                fvtUser.save()
                .then((fvtdish)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(fvtdish);
                    })
                .catch((err)=>next(err))
            })
            .catch((err)=>next(err));
        }
    })
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser , (req,user,next) => {
    favoritesmodel.removeById(req.user._id)
    .then((remDishes)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(remDishes);
    })
    .catch((err)=> next(err))
})

favoriteRouter.route('/:dishId')
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    favoritesmodel.findById(req.user._id)
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})

.post(authenticate.verifyUser , (req,res,next)=>{
    favoritesmodel.findById(req.user._id)
    .then((fvtDishes)=>{
        req.body.dishId = req.params.dishId
        fvtDishes.favdishes.push(req.body)
        fvtDishes.save()
        .then((fvtdish)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(fvtdish);
            })
        .catch((err)=>next(err))

        })
    .catch((err) => {next(err)})
})
.delete(authenticate.verifyUser , (req,res,next)=>{
    favoritesmodel.findById(req.user)
    .then((fvtDishes)=>{
        fvtUserDishes = fvtDishes.favdishes
        for(let i=0 ; i<fvtUserDishes.length ; i++){
            // console.log("fvtUserDishes[i].dishId  "+ fvtUserDishes[i].dishId);
            if(fvtUserDishes[i].dishId == req.params.dishId){
                // console.log("fvtUserDishes[i]._id " + fvtUserDishes[i]._id);
                favoritesmodel.update({_id : req.user } , {$pull : {favdishes : {_id : fvtUserDishes[i]._id}}})
                .then((fvtDishes)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(fvtDishes);
                })
                .catch((err)=>{next(err)})
            }
        }
    })
    .catch((err)=>next(err))
})

module.exports = favoriteRouter;