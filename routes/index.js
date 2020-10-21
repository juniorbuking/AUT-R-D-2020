var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'LES MILLS On Demand x AUT R&D Visual Gamification Project 2020',

    instructTitle: 'INSTRUCTIONS: ',
    instruct1: '1. Stand back so that the majority of your body is in the frame',
    instruct2: '2. Try to perform the same pose as the instructor model in the frame',
    instruct3: '3. Watch as the pose estimation software shows how close you are to the model',

    keyTitle: 'KEYS:',
    key1: 'Yellow = Instructor Model a.k.a the pose you are trying to replicate',
    key2: 'Green = When a part of your body is in the correct position',
    key3: 'Red = When a part of your body is NOT in the correct position'
  });
});

module.exports = router;
