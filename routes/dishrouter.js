const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var passport = require('passport')
const dishes = require('../models/dishes');
const util = require('util')
const cors = require('./cors')

var authenticate = require('../authenticate');
const app = express();
const dishRouter = express.Router();

app.use(bodyParser.json);

dishRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next)=>{
    dishes.find(req.query)
    .populate('comments.author')
    .then((dish)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    }, (err)=> next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser ,authenticate.verifyAdmin , (req,res,next) =>{
    dishes.create(req.body)
        .then((dish)=>{
            console.log('Dish Created ',dish);
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(dish);
            })
        .catch((err)=>{
            next(err);
        }, (err)=> console.log("not an admin user  "))
})
.put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin , (req,res,next) =>{
    res.statusCode =403;
    res.end('PUT not allowed');
})
.delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next) =>{
    dishes.remove({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dishes);
    })
    .catch((err)=>{
        next(err);
    })
});


// dish router for perticular dishID
dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors , (req,res,next) => {
    dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        console.log("getting in dishId")
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    })
    .catch((err)=> {
        return next(err)
    });
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) =>{
    res.end('Post not supported');
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) =>{
    dishes.findByIdAndUpdate(req.params.dishId,{
        $set:req.body
    },{new: true})
    .then((dish)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    })
    .catch((err)=>next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) =>{
    dishes.findByIdAndRemove(req.params.dishId)
    .then((dish)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    })
    .catch((err)=>next(err));
});

// for comments and comment id

dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next)=>{
    dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        if(dish!=null){
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish.comments);
        }
        else{
            // res.text("Dish doesnot exist");
            err = new Error(err + "  " + req.params.dishId + "Not found");
            err.statusCode = 404;
            return next(err);
        }
    })
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser, (req,res,next) =>{
    // res.end('this is name of dish'+req.body.name + 'this is descp' + req.body.descp);
    dishes.findById(req.params.dishId)
    // dishes.create(req.body)
    .then((dish)=>{
        if(dish!=null){
        req.body.author = req.user._id;    
        dish.comments.push(req.body);
        dish.save()
        .then((dish) =>{
            dishes.findById(dish._id)
            .populate('comments.author')
            .then((dish)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(dish);
            })
        }, (err) => next(err))
        
    }
    else{
        err = new Error("Dish not found");
        return next(err);
    }
    })
    .catch((err)=>{
        next(err);
    })
})
.put(cors.corsWithOptions,authenticate.verifyUser, (req,res,next) =>{
    // res.statusCode =403;
     res.end('PUT not allowed');
    
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) =>{
    dishes.findById(req.params.dishId)
    .then((resp)=>{
        if(resp != null){
            for(var i = (resp.comments.length)-1 ; i>=0 ; i--){
                resp.comments.id(dish.comments[i]._id).remove();    
            }
        dish.save()
        .then((dish) =>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(dish);
        }, (err) => next(err))
        }
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dishes);
    })
    .catch((err)=>{
        next(err);
    })
});


// dish router for perticular dishID
dishRouter.route('/:dishId/comments/:commentsId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        if(dish!=null && dish.comments.id(req.params.commentsId) !=null){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments.id(req.params.commentsId));
            }
            else if(dish == null){
                // res.text("Dish doesnot exist");
                err = new Error(err + "  " + req.params.dishId + "Not found");
                err.statusCode = 404;
                return next(err);
            }
            else{
                err = new Error("Comment id not found" + req.params.commentsId)
                return next(err);
            }
    })
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser, (req,res,next) =>{
    res.end('Post not supported for commentID  ' + req.params.commentsId);
})
.put(cors.corsWithOptions,authenticate.verifyUser, (req,res,next) =>{
    dishes.findById(req.params.dishId)
    .then((dish)=>{
        // console.log("in put operation" + " " + req.user._id + " this is comment  " + dish.comments.id(req.params.commentsId));
        if(dish!=null && dish.comments.id(req.params.commentsId)!=null){
            if(req.user._id.equals(dish.comments.id(req.params.commentsId).author)){
            if(req.body.ratting){
                dish.comments.id(req.params.commentsId).ratting = req.body.ratting;
            }
            if(req.body.comment){
                dish.comments.id(req.params.commentsId).comment = req.body.comment;
            }
            dish.save()
            .then((dish) =>{
                dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(dish); 
                } , (err)=> next(err))
                
            }) 
            }
            else{
                err = new Error("User dont have permission to edit dish");
                err.statusCode = 404;
                return next(err);
            }
        }
        else if(dish == null){
            err = new Error(err + "  " + req.params.dishId + "Not found");
            err.statusCode = 404;
            return next(err);
        }
        else{
            err = new Error("Comment id not found" + req.params.commentsId)
            return next(err);
        }
    })
    .catch((err)=>{
        console.log("Error while updating comment");
        return next(err);
    })
})
.delete(cors.corsWithOptions,authenticate.verifyUser, (req,res,next) =>{
    dishes.findById(req.params.dishId)
    .then((dish)=>{
    if(dish!=null && dish.comments.id(req.params.commentsId)!=null){
        if(req.user._id.equals(dish.comments.id(req.params.commentsId).author)){ 
        dish.comments.id(req.params.commentsId).remove();
        dish.save()
        .then((dish) =>{
            dishes.findById(dish._id)
            .populate('comments.author')
            .then(()=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(dish);
            }, (err)=> next(err))
        }, (err) => next(err))   
    }
        else{
            err = new Error(err + "  " +" User dont have permission to delete dish");
            err.statusCode = 404;
            return next(err);
        }
    }
    else if(dish == null){
        err = new Error(err + "  " + req.params.dishId + "Not found");
        err.statusCode = 404;
        return next(err);
    }
    else{
        err = new Error("Comment id not found" + req.params.commentsId)
        return next(err);
    }
})
    .catch((err)=>next(err));
});

module.exports = dishRouter;