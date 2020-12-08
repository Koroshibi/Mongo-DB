const express = require('express');
const router = express.Router();
const path = require('path');
const airbnbModel = require('../models/airbnb')

router.get('/', async (req , res) => {
  const { sort, filter, field, page } = req.query

  const total = await airbnbModel.count();

  airbnbModel
    .find(filter ? { last_scraped: filter } : {})
    .limit(10)
    .skip(page ? page * 10 : 0)
    .sort([field && sort ? [field, sort === 'ASC' ? 1 : -1] : []])
  .then(data => {
    res.render(path.join(__dirname+'//..//views//index.ejs'), { data, total, page: req.query.page });
  });
});

router.get('/airbnb/create', (req , res) => {
  res.render(path.join(__dirname+'//..//views//edit.ejs'), { data: {} });
});

router.get('/airbnb/:id', (req , res) => {
  airbnbModel.findOne({ id: req.params.id }).then(data => {
    res.render(path.join(__dirname+'//..//views//details.ejs'), { data });
  });
});

router.get('/airbnb/:id/edit', (req , res) => {
  airbnbModel.findOne({ id: req.params.id }).then(data => {
    res.render(path.join(__dirname+'//..//views//edit.ejs'), { data });
  });
});

router.get('/airbnb/:id/delete', (req , res) => {
  airbnbModel.deleteOne({ id: req.params.id }).then(() => {
    airbnbModel.findOne({}).then(data => {
      res.redirect('/')
    });
  })
});

router.post('/airbnb/:id/validate', (req , res) => {
  airbnbModel.updateOne({ id: req.params.id }, { ...req.body }).then(() => {
    res.redirect('/')
  });
});

router.post('/airbnb/validate', (req , res) => {
  airbnbModel.findOneAndUpdate({ id: req.params.id }, { ...req.body }, { upsert: true }).then(() => {
    res.redirect('/')
  });
});

module.exports = router;