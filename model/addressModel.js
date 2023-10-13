const mongoose=require("mongoose")
const addressSchema=mongoose.Schema({

    user_id:{
        type: String,   
        ref:'User'    
    },
    address:{
        type: [String]        
    }
})

module.exports=mongoose.model('Address',addressSchema)