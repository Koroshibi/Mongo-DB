const express = require('express');
const router = express.Router();
const path = require('path');
const airbnbModel = require('../models/airbnb')

router.get('/', async (req , res) => {
  const { sort, filter, field } = req.query

  await airbnbModel.find(filter ? { last_scraped: filter } : {}).limit(10).sort([[field, sort === 'ASC' ? 1 : -1]]).then(data => {
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
    res.render(path.join(__dirname+'//..//views//edit.ejs'), { data });
  });
});

router.get('/airbnb/:id/delete', async (req , res) => {
  await airbnbModel.deleteOne({ id: req.params.id }).then(async () => {
    await airbnbModel.findOne({}).then(data => {
      res.redirect('/')
    });
  })
});

router.post('/airbnb/:id/validate', async (req , res) => {
  await airbnbModel.updateOne({ id: req.params.id }, { ...req.body }).then(() => {
    res.redirect('/')
  });
});

module.exports = router;