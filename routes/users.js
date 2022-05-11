const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fbkdb');
const plm = require('passport-local-mongoose');
const userSchema = mongoose.Schema({
  username:String,
  name:String,
  email:String,
  password:String,
  post:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post'
  }]
})
userSchema.plugin(plm)
module.exports = mongoose.model('users',userSchema)

