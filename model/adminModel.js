
const mongoose=require("mongoose")

const adminSchema=mongoose.Schema({

    name:{
        type: String,       
    },
    email:{
        type: String,
        unique:true
    },
     password:{
        type: String  
    }
})

module.exports=mongoose.model('Admin',adminSchema)