const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/Mongo-training', {useNewUrlParser: true, useUnifiedTopology: true}).
then(()=>{
  console.log("Noicely connected")
}).
catch((error)=> {
  console.log(error)
})
