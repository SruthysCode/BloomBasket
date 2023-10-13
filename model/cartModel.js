

const mongoose=require("mongoose")

const cartSchema=mongoose.Schema({

    user_id:{
        type: String        
    },
    product:[{
        item: {
            type: String 
        },
        qty: {
            type: Number 
        }

       }]
})


module.exports=mongoose.model('Cart',cartSchema)