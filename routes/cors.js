const express = require('express');
const cors = require('cors');
const app = express();

const whiteList = ['http://localhost:3000', 'http://localhost:4200', 'https://localhost:3443'];

var corsOptionsDelegate = (req,callback) => {
    var corsOptions;
    console.log(req.header('Origin'));

    if(whiteList.indexOf(req.header('Origin')) !== -1){
        console.log("inside true  ")
        corsOptions = {origin : true};
    }
    else{
        console.log("inside false  ")
        corsOptions = {origin: false};
    }
    callback(null,corsOptions);
};


exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);