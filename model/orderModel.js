

const mongoose=require("mongoose")

const orderSchema=mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref:'User'             
    },
    address:{   type: String,  },
    amount: { type: Number },
    orderstatus:{ type: String,   },
    paymentmethod:  {type: String },
    date:{ type:Date,
            default: Date.now },
    discountAmt :{type: Number},
    amtAftrDiscount  : {type: Number},
    coupon : {type: String},
    product:[{
                pro_id: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Product'
                    },
                name:{ type: String},    
                qty: { type: Number },
                price:{type:Number },
                image:{type:String}
    }]
})


module.exports=mongoose.model('Order',orderSchema)