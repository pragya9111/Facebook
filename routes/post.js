const mongoose=require('mongoose')
const postschema=mongoose.Schema({
image:String,
caption:String,
createdat:{
    type:Date,
    default:Date.now()
},
username:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users'
},
likes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users'
}]

})
module.exports=mongoose.model('post',postschema)
