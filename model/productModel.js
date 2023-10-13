
const mongoose=require("mongoose")

const productSchema=mongoose.Schema({

    name:{
        type: String,       
    },
    price:{
        type: Number,
    },
     category:{
        type: String,  
        ref: 'Category'
    },
    description:{
        type: String, 
    },
    image:{
        type: Array,
    },
    stock:{
        type: Number
    }
   
})


module.exports=mongoose.model('Product',productSchema)