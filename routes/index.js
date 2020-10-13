var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'LES MILLS On Demand x AUT R&D Visual Gamification Project 2020' });
});

module.exports = router;
