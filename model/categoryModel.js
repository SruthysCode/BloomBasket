const mongoose=require("mongoose")

const categorySchema=mongoose.Schema({

    name:{
        type: String,
        unique:true,        
    },
    description:{
        type: String,  
    }
})

module.exports=mongoose.model('Categorie',categorySchema)