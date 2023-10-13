const mongoose=require("mongoose")

const userSchema=mongoose.Schema({

    name:{
        type: String,       
    },
    email:{
        type: String,
        unique: true  
    },
    mobile:{
        type: Number,     
    },
     password:{
        type: String,  
    },
    blocked:{
        type: Boolean,
    },
    is_verified:{
        type: Boolean,
    },
    wallet:{
            type:Number,
    },
    cart:[{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Product'
        },
        qty: {
            type: Number,
            default:1 

        }
    }

    ]

})


module.exports=mongoose.model('User',userSchema)