
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

const airbnbRoutes = require('./routes/airbnb');

mongoose.connect('mongodb://localhost:27017/Mongo-training', {useNewUrlParser: true, useUnifiedTopology: true}).then(async () => {
  console.log('Connected to Mongo-training')
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs');
app.use('/', airbnbRoutes);

module.exports = app;