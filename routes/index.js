var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'LES MILLS On Demand Visual Gamification x AUT R&D 2020' });
});

module.exports = router;
