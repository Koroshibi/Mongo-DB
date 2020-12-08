const express = require('express');
const router = express.Router();
const path = require('path');
const airbnbModel = require('../models/airbnb')


router.get('/', async (req , res) => {
  await airbnbModel.find({}).limit(10).then(data => {
    res.render(path.join(__dirname+'//..//views//index.ejs'), { data });
  });
});

router.get('/airbnb/:id', async (req , res) => {
  await airbnbModel.findOne({ id: req.params.id }).then(data => {
    res.render(path.join(__dirname+'//..//views//details.ejs'), { data });
  });
});

router.get('/airbnb/:id/edit', async (req , res) => {
  await airbnbModel.findOne({ id: req.params.id }).then(data => {
    res.render(path.join(__dirname+'//..//views//details.ejs'), { data });
  });
});

router.get('/airbnb/:id/delete', async (req , res) => {
  await airbnbModel.findOne({ id: req.params.id }).then(data => {
    res.render(path.join(__dirname+'//..//views//details.ejs'), { data });
  });
});

module.exports = router;