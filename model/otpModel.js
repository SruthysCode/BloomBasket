

const mongoose= require('mongoose')

const otpSchema= mongoose.Schema({
	user_id:{ 
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User'
    },
    email: {
        type: String,
    },
    otp:{
        type: String,
    },
    createdAt:{
        type: Date
    },
    expiresAt: {
        type: Date
    }
})

module.exports= mongoose.model("Otp",otpSchema )
