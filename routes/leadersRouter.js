const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors')
var authenticate = require('../authenticate')
const leader = require('../models/leaders');

const app = express();
const leadersRouter = express.Router();

app.use(bodyParser.json);

leadersRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    leader.find(req.query)
    .then((resp) => {
        res.statusCode = 200
        res.setHeader('Context-Type', 'text/json')
        res.json(resp);
    })
    .catch((err)=>{
        console.log("Error in get "+ next(err));
    })
})
.post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next) =>{
    leader.create(req.body)
    .then((resp)=>{
        res.statusCode = 200
        res.setHeader('Context-Type', 'text/html')
        res.json(resp);
    })
    .catch((err)=>{
        console.log("Error in post  "+ next(err));
    })
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) =>{
    res.statusCode =403;
    res.end('PUT not allowed for all leaders');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) =>{
    // res.statusCode =403;
    leader.remove({})
    .then((resp)=>{
        res.statusCode = 200
        res.setHeader('Context-Type', 'text/html')
        res.json(resp);
    })
    .catch((err)=>{
        console.log("error in delete "+ next(err));
    })
});


// leaders router for perticular leaderID
leadersRouter.route('/:leadersId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    leader.findById(req.params.leadersId)
    .then((resp)=>{
        res.statusCode = 200
        res.setHeader('Context-Type', 'text/html')
        res.json(resp);
    })
    .catch((err)=>{
        console.log( req.params.leadersId + "Not found" + next(err));
    })
})
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) =>{
    res.end('adding leaders '+req.params.leadersId + 'this is leaders descp ' + req.body.leadersId);
})
.put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next) =>{
    leader.findByIdAndUpdate(req.params.leadersId , {
        $set: req.body
    }, {new : true})
    .then((resp)=>{
        res.statusCode = 200
        res.setHeader('Context-Type', 'text/html')
        res.json(resp);
    })
    .catch((err)=>{
        console.log("error in put operation "+ next(err));
    })
        

})
.delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next) =>{
    // res.statusCode =403;
    leader.findByIdAndRemove(req.params.leadersId)
    .then((resp)=>{
        res.statusCode = 200
        res.setHeader('Context-Type', 'text/html')
        res.json(resp);
    })
    .catch((err)=>{
        console.log("error in del operaton "+ next(err));
    })
});

module.exports = leadersRouter;